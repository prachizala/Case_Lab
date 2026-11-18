/**
 * Thin Groq API Wrapper with Token Usage Tracking
 */

import Groq from "groq-sdk";
import { tokenUsageTracker } from "./tracking";
import { checkBudgetBeforeExecution } from "./enforcement";

export interface GroqExecutionOptions {
  feature?: string;
  userId?: string | null;
  userEmail?: string | null;
  adminOverride?: boolean;
}

export interface GroqCompletionResult {
  text: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawUsage?: any;
}

export async function executeGroqChat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  model = "llama-3.3-70b-versatile",
  options: GroqExecutionOptions = {}
): Promise<GroqCompletionResult> {
  const feature = options.feature || "general_generation";
  const userId = options.userId || null;
  const userEmail = options.userEmail || null;

  // 1. Enforce Budget Check: Block if 100% unless admin override
  checkBudgetBeforeExecution(options.adminOverride);

  const apiKey = process.env.GROQ_API_KEY;

  // Simulated fallback when GROQ_API_KEY is not configured in local environment
  if (!apiKey || apiKey.trim() === "" || apiKey === "gsk_placeholder") {
    // Generate simulated pedagogical response
    const mockPromptTokens = 850;
    const mockCompletionTokens = 350;
    const mockTotalTokens = mockPromptTokens + mockCompletionTokens;

    tokenUsageTracker.recordUsage({
      user_id: userId,
      user_email: userEmail,
      feature,
      model,
      prompt_tokens: mockPromptTokens,
      completion_tokens: mockCompletionTokens,
      total_tokens: mockTotalTokens,
    });

    return {
      text: "Simulated Groq response (Pedagogical analysis and framework mapping complete).",
      model,
      prompt_tokens: mockPromptTokens,
      completion_tokens: mockCompletionTokens,
      total_tokens: mockTotalTokens,
    };
  }

  // 2. Real Groq SDK Call with exponential backoff for rate limits
  const groq = new Groq({ apiKey });

  let attempts = 0;
  const maxAttempts = 3;
  let delay = 1000;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      const chatCompletion = await groq.chat.completions.create({
        messages,
        model,
        temperature: 0.7,
      });

      const responseText = chatCompletion.choices[0]?.message?.content || "";
      const usage = chatCompletion.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      };

      const promptTokens = usage.prompt_tokens || 0;
      const completionTokens = usage.completion_tokens || 0;
      const totalTokens = usage.total_tokens || (promptTokens + completionTokens);

      // Record tracked usage atomically
      tokenUsageTracker.recordUsage({
        user_id: userId,
        user_email: userEmail,
        feature,
        model,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
      });

      return {
        text: responseText,
        model,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        rawUsage: usage,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);

      // Retry on 429 rate limit errors with backoff
      if (errorMsg.includes("429") || errorMsg.includes("rate_limit")) {
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
      }

      console.error("[GROQ_CLIENT_ERROR] Call failed:", errorMsg);
      throw new Error(`Groq API Error: ${errorMsg}`);
    }
  }

  throw new Error("Groq API maximum retry attempts exceeded.");
}
