import Anthropic from "@anthropic-ai/sdk";
import {
  CaseBloomsLevel,
  CaseContent,
  CaseDifficulty,
  CaseDomain,
  CaseExhibit,
  CaseFormat,
  CaseLanguage,
  CaseTargetAudience,
  CaseTone,
  CaseType,
} from "./types";
import { COLLEGE_NAME_WITH_SHORT } from "@/config/college";
import {
  getDomainAgent,
  enhancePromptWithDomainAgent,
} from "@/lib/agents/domain-agents";

export interface GenerateCaseParams {
  type: CaseType; // 'short' | 'full' | 'research' | 'flash'
  format: CaseFormat; // 'hypothetical' | 'real_signal'
  industry: string;
  functionalFocus: string;
  domain?: CaseDomain;
  difficulty?: CaseDifficulty;
  targetAudience?: CaseTargetAudience;
  primaryCompany?: string;
  locationMarket?: string;
  centralDilemma?: string;
  keyDecisionMaker?: string;
  protagonists?: string;
  learningObjectives?: string[];
  tone?: CaseTone;
  includeExhibits?: ("financials" | "org_chart" | "market_data")[];
  includeTeachingNote?: boolean;
  bloomsLevel?: string;
  courseName?: string;
  semester?: string;
  level?: string;
  learningOutcomes?: string;
  contextRegion: string;
  language?: string; // Optional for backward compatibility; generation is always English
  complexity: number; // 1 - 10
  targetLength?: "short" | "medium" | "comprehensive";
  sourceNotes?: string;
  regenerateSection?: "exhibits" | "dilemma" | "teaching_note" | "questions";
}

export interface GenerationResult {
  content: CaseContent;
  tokensUsed: number;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
}

export function buildSystemPrompt(params: {
  language?: string;
  format: CaseFormat;
  type: CaseType;
  tone?: CaseTone;
  bloomsLevel?: string;
  includeTeachingNote?: boolean;
  includeExhibits?: ("financials" | "org_chart" | "market_data")[];
  domain?: CaseDomain;
}): string {
  const basePrompt = `You are a distinguished Professor of Business Administration and Master Case Writer at ${COLLEGE_NAME_WITH_SHORT}.
Your mission is to write an original, authentic, publication-grade pedagogical teaching case study conforming to the gold standard of Harvard Business School (HBS), Stanford GSB, and Ivey Publishing.

CRITICAL PEDAGOGICAL & NARRATIVE ARCHITECTURE:
1. OUTPUT LANGUAGE: Write in clear, professional English only. Use Indian business context, INR figures and Indian examples where relevant. Names of Indian people, places and companies stay as they are.
2. HARVARD / IVEY CASE STRUCTURE:
   - "background": MUST NOT be a brief generic summary. It must be a multi-paragraph, immersive academic narrative divided into structured sections:
     * ### The Opening Hook: Ground the scene in an exact date, time, and location (e.g. corporate headquarters in Ahmedabad, Mumbai, or Bengaluru). Introduce the key protagonist sitting at their desk or heading into an emergency executive committee meeting with a ticking clock (e.g. 72 hours until the Board of Directors convenes).
     * ### Enterprise Genesis & Core Capabilities: Chronicling the company's historical origins, early entrepreneurial vision, foundational competitive moats (VRIO framework), and operating model.
     * ### Macro-Environment & Industry Upheaval: The structural market shifts, regulatory developments, technological disruption (e.g. D2C platforms, automation, inflation), and shifting consumer behaviors straining historical margins.
   - "challenge": MUST provide deep operational drama and rigorous managerial trade-offs:
     * ### Conflicting Boardroom Perspectives: Include direct, realistic stakeholder dialogue quoting the Chief Financial Officer (advocating risk-averse cash preservation), the Head of Strategy/Growth (urging aggressive disruption), and the Chief Operating Officer (concerned about operational execution and frontline capacity).
     * ### Strategic Crossroads (The Three Mutually Exclusive Alternatives):
       - Alternative 1 (Aggressive In-House Expansion / Heavy CAPEX): Specific capital requirement, upside growth potential, balance sheet risk, and ROCE dilution.
       - Alternative 2 (Strategic Alliance / Joint Venture / M&A): Capital requirement, speed-to-market advantage, cultural friction, and governance integration risks.
       - Alternative 3 (Defensive Consolidation & Margin Protection): Focus on core profitability, SKU rationalization, free cash flow preservation, and the long-term risk of market obsolescence.
   - "key_data": Provide 8 to 12 comprehensive financial and operating metrics (e.g., Revenue, COGS, Gross Margin %, EBITDA, EBITDA Margin %, Net Profit, Free Cash Flow, Debt-to-Equity, Working Capital Cycle, CAC, LTV) with realistic units (₹ Crores, percentage points, ratios).
   - "decision_point": A high-stakes, urgent decision dilemma framing the Monday morning executive choice.
   - "discussion_questions": Exactly 5 Bloom's taxonomy calibrated questions (1: Root Cause Diagnosis, 2: Quantitative Exhibit Dissection, 3: Strategic Trade-off Analysis, 4: Organizational Implementation, 5: Boardroom Action Plan).
   - "exhibits": Comprehensive multi-year audited financial tables with CAGR, percentage margins, and realistic explanatory footnotes citing corporate filings.
   - "teaching_note":
     * Explicit pedagogical objectives aligned with ${params.bloomsLevel || "Apply & Analyze"}.
     * 90-minute 4-phase classroom flow (Cold call, small-group quantitative stress test, boardroom debate, plenary synthesis).
     * Recommended 3-Board Classroom Blackboard Plan (Board 1: Issues & Diagnosis, Board 2: Strategic Trade-offs & Frameworks, Board 3: Action Plan & Governance Milestones).
     * 3 academic management frameworks (e.g. Porter's Five Forces, VRIO, DuPont Decomposition) with concrete case application.
3. TEACHING INTEGRITY:
   - Mark all quantitative figures as illustrative pedagogical models.
   - Never fabricate real living person quotes; attribute statements to organizational titles or realistic personas.
   ${
     params.format === "real_signal"
       ? '- REAL SIGNAL MODE: Set "verify_facts_flag: true". Ground the case in observable Indian/global corporate realities.'
       : '- HYPOTHETICAL MODE: Set "verify_facts_flag: false". Create plausible fictionalized enterprise scenarios.'
   }

SCHEMA (Return pure valid JSON):
{
  "title": "Compelling, formal case study title in English",
  "summary": "Executive abstract (120-180 words) summarizing the protagonist, company, industry dilemma, and pedagogical focus",
  "background": "Deep multi-section narrative with ### The Opening Hook, ### Enterprise Genesis & Core Capabilities, and ### Macro-Environment & Industry Upheaval",
  "challenge": "Deep operational challenge with ### Conflicting Boardroom Perspectives (stakeholder quotes) and ### Strategic Crossroads (The Three Mutually Exclusive Alternatives)",
  "key_data": [
    { "metric": "Gross Revenue", "value": "₹1,850 Cr", "period": "FY25 (Audited)", "notes": "+11.2% YoY" },
    { "metric": "Cost of Goods Sold (COGS)", "value": "₹1,185 Cr", "period": "FY25", "notes": "64.1% of revenue" },
    { "metric": "Operating EBITDA", "value": "₹218 Cr", "period": "FY25", "notes": "11.8% EBITDA margin" },
    { "metric": "Free Cash Flow (FCF)", "value": "₹64 Cr", "period": "FY25", "notes": "-28.4% YoY contraction" },
    { "metric": "Debt-to-Equity Ratio", "value": "0.78x", "period": "Trailing 12M", "notes": "Covenant ceiling at 1.0x" },
    { "metric": "Customer Acquisition Cost", "value": "₹680", "period": "FY25", "notes": "+24.5% inflation" },
    { "metric": "Working Capital Cycle", "value": "58 Days", "period": "FY25", "notes": "Up from 42 days in FY23" },
    { "metric": "Proposed CAPEX Outlay", "value": "₹140 Cr", "period": "FY26-FY28 Plan", "notes": "Central investment dilemma" }
  ],
  "decision_point": "The exact high-stakes crossroads question the protagonist must present to the Board of Directors",
  "discussion_questions": [
    "Question 1 (Diagnosis)",
    "Question 2 (Quantitative Analysis)",
    "Question 3 (Strategic Trade-offs)",
    "Question 4 (Implementation & Risk)",
    "Question 5 (Board Action Plan)"
  ],
  "exhibits": [
    {
      "id": "exhibit-1",
      "title": "Exhibit 1: 3-Year Audited Financial Performance & Unit Economics",
      "type": "financials",
      "description": "Multi-year audited income statement, operating margins, and unit economics (all figures in ₹ Crores)",
      "data": [
        { "metric": "Gross Revenue", "y2023": "₹1,480 Cr", "y2024": "₹1,660 Cr", "y2025": "₹1,850 Cr", "y2026_proj": "₹1,940 Cr", "cagr": "+7.7%" }
      ]
    }
  ],
  ${
    params.includeTeachingNote !== false
      ? `"teaching_note": {
    "objectives": ["Objective 1", "Objective 2", "Objective 3"],
    "class_flow": [
      { "phase": "Opening Cold Call & Dilemma Framing", "duration_minutes": 15, "activity": "Challenge protagonist assumptions", "expected_response": "Model diagnostic takeaway distinguishing symptoms from root causes" },
      { "phase": "Quantitative Stress-Testing", "duration_minutes": 30, "activity": "Dissect exhibits and balance sheet covenants", "expected_response": "Specific numerical calculations of debt headroom and sensitivity" },
      { "phase": "Boardroom Alternative Debate", "duration_minutes": 30, "activity": "Weigh Alternative 1 vs 2 vs 3", "expected_response": "Consensus trade-off analysis balancing solvency against digital growth" },
      { "phase": "Plenary Synthesis & Takeaways", "duration_minutes": 15, "activity": "Consolidate 3-Board layout", "expected_response": "Final 3-Board takeaway summarizing diagnosis, frameworks, and milestones" }
    ],
    "frameworks": [
      { "name": "Porter's Five Forces", "application": "Assess supplier concentration and competitive rivalry", "key_takeaway": "Price competition erodes industry profitability without digital moats" },
      { "name": "DuPont ROE Decomposition", "application": "Deconstruct net profit margin, asset turnover, and leverage", "key_takeaway": "Asset-heavy expansion dilutes return on equity unless turnover accelerates" },
      { "name": "VRIO Framework", "application": "Audit proprietary distribution and supply relationships", "key_takeaway": "Physical logistics network is valuable and rare, but vulnerable to digital substitution" }
    ]
  },`
      : ""
  }
  "verify_facts_flag": ${params.format === "real_signal" ? "true" : "false"},
  "figures_disclaimer": "All specific metrics, financial line items, and organizational names are pedagogical models designed for classroom case analysis."
}`;

  return enhancePromptWithDomainAgent(basePrompt, params.domain);
}

export async function generateCaseWithClaude(
  params: GenerateCaseParams
): Promise<GenerationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey && apiKey.trim() !== "" && !apiKey.includes("placeholder")) {
    try {
      const anthropic = new Anthropic({ apiKey });
      const systemPrompt = buildSystemPrompt({
        language: params.language,
        format: params.format,
        type: params.type,
        tone: params.tone,
        bloomsLevel: params.bloomsLevel,
        includeTeachingNote: params.includeTeachingNote,
        includeExhibits: params.includeExhibits,
        domain: params.domain,
      });

      const userPrompt = `Generate a ${params.type.toUpperCase()} case study with the following specifications:
- Industry: ${params.industry}
- Functional Focus: ${params.functionalFocus}
- Academic Level: ${params.level}
- Target Course: ${params.courseName || "General Management & Strategy"} (Semester: ${params.semester || "Current"})
- Regional Context: ${params.contextRegion}
- Language: English (en)
- Complexity Index (1-10): ${params.complexity}
- Target Scope: ${params.targetLength}
${params.learningOutcomes ? `- Course Outcomes / Program Outcomes (CO/PO): ${params.learningOutcomes}` : ""}
${params.sourceNotes ? `\nSOURCE NOTES & RAW SIGNALS:\n${params.sourceNotes}` : ""}

Please generate the complete, production-grade JSON case study now.`;

      const selectedModel = (params.type === "short" || params.type === "flash")
        ? (process.env.FAST_MODEL || "claude-3-5-haiku-20241022")
        : (process.env.QUALITY_MODEL || "claude-3-5-sonnet-20241022");

      const response = await anthropic.messages.create({
        model: selectedModel,
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const contentBlock = response.content[0];
      if (contentBlock.type !== "text") {
        throw new Error("Claude returned non-text response.");
      }

      let rawText = contentBlock.text.trim();
      // Remove any markdown wrapper if Claude added it
      if (rawText.startsWith("```json")) {
        rawText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (rawText.startsWith("```")) {
        rawText = rawText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed: CaseContent = JSON.parse(rawText);

      return {
        content: parsed,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        model: selectedModel,
      };
    } catch (err: unknown) {
      console.error("AI API call or parsing error:", err);
      // If error is JSON parse failure, rethrow so caller shows retry button
      if (err instanceof SyntaxError) {
        throw new Error("AI_JSON_PARSE_ERROR: Failed to parse structured JSON from AI response.");
      }
      throw err;
    }
  }

  // Graceful high-fidelity pedagogical generation fallback when API key is not present
  return generateHighFidelityMockCase(params);
}

/**
 * High-fidelity fallback generating authentic teaching cases in professional English
 */
function generateHighFidelityMockCase(params: GenerateCaseParams): GenerationResult {
  const isShort = params.type === "short" || params.type === "flash";
  const isResearch = params.type === "research";
  const isReal = params.format === "real_signal";
  const ind = params.industry || "Fintech & Banking";
  const domain = params.domain || "Strategy";
  const company = params.primaryCompany?.trim() || (isReal ? "Gujarat Co-operative Milk Marketing Federation (Amul)" : "Apex Strategic Enterprises Ltd");
  const region = params.locationMarket?.trim() || params.contextRegion || "Gujarat, India";
  const dilemma = params.centralDilemma?.trim() || "Whether to allocate ₹140 Cr toward an aggressive in-house digital supply chain overhaul, acquire a venture-backed tech challenger, or defend operating margins through premium consolidation.";
  const bloomsLevel = params.bloomsLevel || "Apply & Analyze";

  // Specialized Domain Agent Engine
  const domainAgent = getDomainAgent(domain);
  const domainContent = domainAgent.generateDomainContent({
    company,
    region,
    dilemma,
    isReal,
    isShort,
    bloomsLevel,
  });

  const decisionMaker = params.keyDecisionMaker?.trim() || domainAgent.decisionMaker;
  const protagonists = params.protagonists?.trim() || domainAgent.cSuiteStakeholders.join(", ");
  const targetAudience = params.targetAudience || "MBA";
  const tone = params.tone || "Academic";

  const title = isResearch
    ? `Case Research: ${company} vs. Emerging Challengers — ${domainAgent.agentName} in ${ind} (${region})`
    : isShort
    ? `Short Case: ${domainAgent.badge} — Crossroad Dilemma at ${company} (${region})`
    : `${domainAgent.agentName}: ${company} and the Transformation of ${ind} in ${region}`;

  const summary = domainContent.summary;
  const background = domainContent.background;
  const challenge = domainContent.challenge;
  const decisionPoint = domainContent.decisionPoint;
  const questions: string[] = domainContent.questions;
  const objectives: string[] = params.learningObjectives && params.learningObjectives.length > 0
    ? [...params.learningObjectives]
    : domainContent.objectives;
  const frameworks = domainContent.frameworks;
  const exhibits: CaseExhibit[] = [...domainContent.exhibits];

  // Also include requested exhibits if missing (org_chart, market_data)
  const requestedExhibits = params.includeExhibits || ["financials", "market_data", "org_chart"];
  if (requestedExhibits.includes("org_chart") && !exhibits.some((e) => e.type === "org_chart")) {
    exhibits.push({
      id: "exhibit-org",
      title: "Exhibit: Organizational Governance & C-Suite Decision Matrix",
      type: "org_chart",
      description: "Executive hierarchy and domain responsibilities",
      data: domainAgent.cSuiteStakeholders.map((s, idx) => ({
        role: `Executive Stakeholder ${idx + 1}`,
        occupant: s.split("(")[0].trim(),
        mandate: s.includes("(") ? s.slice(s.indexOf("(") + 1, s.lastIndexOf(")")) : "Strategic domain leadership",
      })),
    });
  }
  if (requestedExhibits.includes("market_data") && !exhibits.some((e) => e.type === "market_data")) {
    exhibits.push({
      id: "exhibit-market",
      title: `Exhibit: Competitive Benchmark & ${domainAgent.domain} Industry Data in ${region}`,
      type: "market_data",
      description: `Market dynamics and ${domainAgent.domain} benchmarks`,
      data: [
        { firm: company, market_share: "34.2%", yoy_growth: "+4.1%", benchmark: "100 (Index Base)" },
        { firm: "Challenger A", market_share: "22.8%", yoy_growth: "+32.4%", benchmark: "118 (+18%)" },
        { firm: "Conglomerate Division B", market_share: "19.5%", yoy_growth: "+14.8%", benchmark: "94 (-6%)" },
      ],
    });
  }

  const content: CaseContent = {
    title,
    summary,
    background,
    challenge,
    key_data: domainContent.keyData,
    decision_point: decisionPoint,
    discussion_questions: questions,
    exhibits,
    primary_company: company,
    location_market: region,
    central_dilemma: dilemma,
    key_decision_maker: decisionMaker,
    protagonists,
    learning_objectives: objectives,
    domain: domainAgent.domain as CaseDomain,
    difficulty: params.difficulty || "Intermediate",
    target_audience: targetAudience,
    tone,
    blooms_level: bloomsLevel,
    verify_facts_flag: isReal,
    figures_disclaimer: `All specific operational metrics, financial line items, and organizational details are pedagogical models calibrated by the ${domainAgent.agentName} for rigorous classroom case analysis at ${COLLEGE_NAME_WITH_SHORT}.`,
  };

  if (params.includeTeachingNote !== false) {
    content.teaching_note = {
      objectives,
      class_flow: domainContent.classFlow,
      frameworks,
    };
  }

  const baseTokens = isResearch ? 5400 : isShort ? 2200 : 4600;
  const exhibitBonus = exhibits.length * 400;
  const tokensUsed = baseTokens + exhibitBonus;

  return {
    content,
    tokensUsed,
    promptTokens: 640,
    completionTokens: tokensUsed - 640,
    model: (isShort || params.type === "flash")
      ? (process.env.FAST_MODEL || "ai-case-engine-fast (simulated)")
      : (process.env.QUALITY_MODEL || "ai-case-engine-quality (simulated)"),
  };
}
