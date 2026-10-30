import { NextRequest, NextResponse } from "next/server";
import { generateCaseWithClaude, GenerateCaseParams } from "@/lib/claude";
import { checkRateLimit, recordGenerationUsage } from "@/lib/rate-limit";
import { mockStore } from "@/lib/mock-db";
import { CaseBloomsLevel, CaseDifficulty, CaseDomain, CaseFormat, CaseStudy, CaseTargetAudience, CaseTone, CaseType } from "@/lib/types";
import { authenticateUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    // Only faculty and admin can generate cases (students strictly restricted)
    const { user, errorResponse } = await authenticateUser(req, ["faculty", "admin"]);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Forbidden. Only faculty and administrators can generate case studies." }, { status: 403 });
    }

    const body = await req.json();
    const action = body.action || "generate";

    // 1. Authenticated user from verified session
    const userId = user.id;
    const authorName = user.name || "Faculty Author";

    // Handle "save-draft" or "submit-review" for existing generated cases
    if (action === "save-draft" || action === "submit-review") {
      const { caseId, updatedContent } = body;
      if (!caseId) {
        return NextResponse.json({ error: "Case ID required." }, { status: 400 });
      }

      const existing = mockStore.getCase(caseId);
      if (!existing) {
        return NextResponse.json({ error: "Case not found." }, { status: 404 });
      }

      if (updatedContent) {
        existing.content = updatedContent;
        existing.title = updatedContent.title || existing.title;
      }

      if (action === "submit-review") {
        existing.status = "in_review";
        mockStore.logAudit(
          userId,
          user.email,
          "case_submitted",
          existing.id,
          "case",
          { title: existing.title }
        );
      } else {
        existing.status = "draft";
      }

      existing.updated_at = new Date().toISOString();
      mockStore.saveCase(existing);

      return NextResponse.json({
        success: true,
        message: action === "submit-review" ? "Case successfully submitted for institutional review." : "Draft saved successfully.",
        caseStudy: existing,
      });
    }

    // 2. Enforce email verification check for case generation
    if (!user.email_verified_at) {
      return NextResponse.json(
        {
          error: "Email verification required before generating cases. Please verify your email using the OTP code sent to your inbox.",
          error_code: "UNVERIFIED_EMAIL",
          is_verified: false,
        },
        { status: 403 }
      );
    }

    // 2b. Monthly generation quota check per user (enforced strictly by server)
    const quota = mockStore.checkUserGenerationQuota(userId);
    if (!quota.allowed) {
      const isExternal = quota.user_type === "external";
      return NextResponse.json(
        {
          error: isExternal
            ? "Free generation limit reached (3 of 3 used this month). Paid plans coming soon."
            : `Monthly fair-use case generation limit reached (${quota.used}/${quota.limit}). Resets next month.`,
          error_code: quota.error_code || (isExternal ? "LIMIT_REACHED" : "FAIR_USE_LIMIT_REACHED"),
          quota: {
            allowed: false,
            used: quota.used,
            limit: quota.limit,
            remaining: quota.remaining,
            user_type: quota.user_type,
            reset_at: quota.reset_at,
          },
        },
        { status: 403 }
      );
    }

    // 2b. Institutional token budget check
    const tokenBudget = mockStore.getTokenBudgetInfo();
    if (tokenBudget.is_blocked) {
      return NextResponse.json(
        {
          error: `Institutional AI token budget is fully exhausted (100%). Generation is temporarily suspended until monthly reset or budget expansion.`,
          budget: tokenBudget,
        },
        { status: 429 }
      );
    }

    // 2c. Rate limit check (10 generations per user per hour)
    const rateLimit = await checkRateLimit(userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. You have reached the maximum of 10 case generations per hour. Please wait before requesting another case study.",
          rateLimit: {
            allowed: false,
            count: rateLimit.count,
            limit: rateLimit.limit,
            resetMinutes: rateLimit.resetMinutes,
          },
        },
        { status: 429 }
      );
    }

    // 3. Validate input parameters
    const {
      type = "full",
      format = "hypothetical",
      industry = "Fintech & Banking",
      functionalFocus = "Strategic Finance & Capital Allocation",
      domain = "Strategy",
      difficulty = "Intermediate",
      targetAudience = "MBA",
      primaryCompany = "",
      locationMarket = "Gujarat, India",
      centralDilemma = "",
      keyDecisionMaker = "",
      protagonists = "",
      learningObjectives = [],
      tone = "Academic",
      includeExhibits = ["financials", "market_data"],
      includeTeachingNote = true,
      bloomsLevel = "Apply & Analyze",
      courseId,
      courseName,
      semester,
      level = "MBA / Intermediate",
      contextRegion = "Gujarat, India",
      language = "en",
      complexity = 7,
      targetLength = "medium",
      sourceNotes = "",
      sectionToRegenerate,
      simulateBadJson = false, // Testing hook for UI retry verification
    } = body;

    // Validation warnings
    const warnings: string[] = [];

    // Warn if company name is fictional when "Real Signal" is selected
    if (format === "real_signal") {
      const lowerCompany = (primaryCompany || "").toLowerCase().trim();
      const fictionalIndicators = ["acme", "xyz", "abc corp", "sample", "fictional", "fake", "placeholder", "test corp"];
      if (!lowerCompany || fictionalIndicators.some((f) => lowerCompany.includes(f))) {
        warnings.push("Factual Alert: 'Real Signal' is active, but the company name appears fictional or generic. Please ensure entity exists in corporate filings.");
      }
    }

    // Warn if dilemma is too short (< 30 chars)
    if (centralDilemma && centralDilemma.trim().length < 30) {
      warnings.push("Pedagogical Alert: Central dilemma is very brief (< 30 characters). A richer operational conflict yields higher case rigor.");
    }

    // Warn if no learning objectives added
    if (!learningObjectives || (Array.isArray(learningObjectives) && learningObjectives.length === 0)) {
      warnings.push("Curricular Alert: No learning objectives configured. Add at least 1 outcome to align with institutional assessment standards.");
    }

    // Explicit test hook: if client requests bad JSON simulation to test retry state
    if (simulateBadJson) {
      return NextResponse.json(
        {
          error: "CLAUDE_JSON_PARSE_ERROR: AI response was malformed and could not be parsed into a teaching case. Please retry.",
          retryable: true,
        },
        { status: 502 }
      );
    }

    const params: GenerateCaseParams = {
      type: (type as CaseType) || "full",
      format: (format as CaseFormat) || "hypothetical",
      industry: String(industry).trim(),
      functionalFocus: String(functionalFocus).trim(),
      domain: domain as CaseDomain,
      difficulty: difficulty as CaseDifficulty,
      targetAudience: targetAudience as CaseTargetAudience,
      primaryCompany: primaryCompany ? String(primaryCompany).trim() : undefined,
      locationMarket: locationMarket ? String(locationMarket).trim() : undefined,
      centralDilemma: centralDilemma ? String(centralDilemma).trim() : undefined,
      keyDecisionMaker: keyDecisionMaker ? String(keyDecisionMaker).trim() : undefined,
      protagonists: protagonists ? String(protagonists).trim() : undefined,
      learningObjectives: Array.isArray(learningObjectives) ? learningObjectives : [],
      tone: tone as CaseTone,
      includeExhibits: Array.isArray(includeExhibits) ? includeExhibits : ["financials", "market_data"],
      includeTeachingNote: Boolean(includeTeachingNote),
      bloomsLevel: String(bloomsLevel),
      courseName,
      semester,
      level,
      contextRegion: String(locationMarket || contextRegion || "Gujarat, India").trim(),
      language: language as "en" | "hi" | "gu",
      complexity: Math.min(10, Math.max(1, Number(complexity) || 7)),
      targetLength: targetLength as "short" | "medium" | "comprehensive",
      sourceNotes: String(sourceNotes || "").trim(),
      regenerateSection: sectionToRegenerate,
    };

    // 4. Generate Case with Engine (Server Only - API key is never exposed)
    const result = await generateCaseWithClaude(params);

    // If regenerating a section on an existing case
    if (action === "regenerate-section" && body.caseId) {
      const existing = mockStore.getCase(body.caseId);
      if (existing) {
        if (sectionToRegenerate === "exhibits") {
          existing.content.exhibits = result.content.exhibits;
        } else if (sectionToRegenerate === "dilemma") {
          existing.content.challenge = result.content.challenge;
          existing.content.decision_point = result.content.decision_point;
        } else if (sectionToRegenerate === "teaching_note") {
          existing.content.teaching_note = result.content.teaching_note;
        } else if (sectionToRegenerate === "questions") {
          existing.content.discussion_questions = result.content.discussion_questions;
        }
        existing.updated_at = new Date().toISOString();
        mockStore.saveCase(existing);

        return NextResponse.json({
          success: true,
          caseStudy: existing,
          sectionRegenerated: sectionToRegenerate,
          tokensUsed: result.tokensUsed,
          model: result.model,
          warnings,
        });
      }
    }

    // 5. Construct CaseStudy record
    const caseId = `case-${Date.now()}`;
    const newCase: CaseStudy = {
      id: caseId,
      author_id: userId,
      author_name: authorName,
      title: result.content.title,
      status: "draft",
      type: params.type,
      format: params.format,
      industry: params.industry,
      function: params.functionalFocus,
      domain: params.domain,
      difficulty: params.difficulty,
      target_audience: params.targetAudience,
      primary_company: params.primaryCompany,
      location_market: params.locationMarket,
      central_dilemma: params.centralDilemma,
      key_decision_maker: params.keyDecisionMaker,
      protagonists: params.protagonists,
      learning_objectives: params.learningObjectives,
      tone: params.tone,
      blooms_level: params.bloomsLevel,
      course_id: courseId || null,
      course_name: courseName || null,
      level: params.level || "MBA / Intermediate",
      language: params.language,
      complexity: params.complexity,
      content: result.content,
      source_notes: params.sourceNotes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to database / store as draft
    mockStore.saveCase(newCase);

    // Audit log
    mockStore.logAudit(
      userId,
      user.email,
      "case_created",
      newCase.id,
      "case",
      { title: newCase.title, type: newCase.type, format: newCase.format }
    );

    // 6. Record usage log for token accounting & rate limiting
    await recordGenerationUsage(userId, result.tokensUsed, result.model, caseId);
    mockStore.incrementUserGenerationCount(userId);
    const updatedQuota = mockStore.checkUserGenerationQuota(userId);

    // 7. Return safe payload (WITHOUT any API keys)
    return NextResponse.json({
      success: true,
      caseId: newCase.id,
      caseStudy: newCase,
      tokensUsed: result.tokensUsed,
      model: result.model,
      warnings,
      monthlyQuota: updatedQuota,
      rateLimit: {
        used: rateLimit.count + 1,
        remaining: Math.max(0, rateLimit.remaining - 1),
        limit: rateLimit.limit,
      },
    });
  } catch (err: unknown) {
    console.error("API /generate error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to generate case study.";

    if (errorMessage.includes("CLAUDE_JSON_PARSE_ERROR")) {
      return NextResponse.json(
        {
          error: errorMessage,
          retryable: true,
          tip: "Click Retry Generation to resubmit with structured schema repair.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error: errorMessage,
        retryable: true,
      },
      { status: 500 }
    );
  }
}
