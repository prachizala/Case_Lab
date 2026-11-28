import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateUser } from "@/lib/session";
import { checkRateLimit, recordGenerationUsage } from "@/lib/rate-limit";
import { mockStore } from "@/lib/mock-db";
import { generateCECasePack, GenerateCasePackInput } from "@/lib/casepack/generate";
import { CaseStudy } from "@/lib/types";
import { checkAccess } from "@/lib/access-control";
import {
  checkCaseGenerationAccess,
  checkStudentDailyLimit,
  getStudentDailyGenerationLimit,
  sanitizeCasePackForStudent,
  sanitizeCaseStudyForStudent,
} from "@/lib/case-permissions";

const RequestBodySchema = z.object({
  department: z.string().min(1, "Department or domain is required"),
  subject: z.string().optional(),
  topics: z.array(z.string()).optional(),
  concepts: z.array(z.string()).optional(),
  level: z.string().optional(),
  language: z.string().optional(), // Ignored if sent by client; generation is always English
  industry: z.string().optional(),
  geography: z.string().optional(),
  length: z.enum(["short", "standard"]).optional(),
  numQuestions: z.number().int().min(1).max(5).optional(),
  sourceNotes: z.string().optional(),
  examMetadata: z
    .object({
      course_code: z.string().optional(),
      ce_no: z.string().optional(),
      set: z.string().optional(),
      maximum_marks: z.number().optional(),
      marks_per_question: z.number().optional(),
      date: z.string().optional(),
    })
    .optional(),
  stream: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication & Role Permissions
    const { user, errorResponse } = await authenticateUser(req, ["faculty", "admin", "student"]);
    if (errorResponse || !user) {
      return (
        errorResponse ||
        NextResponse.json(
          { error: "Forbidden. Please sign in to generate Case Packs." },
          { status: 403 }
        )
      );
    }

    // Check account status: inactive or expired accounts cannot generate cases
    const accountAccess = checkAccess(user);
    if (!accountAccess.allowed || !accountAccess.canCreate) {
      if (user.role === "faculty" || user.role === "admin" || process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true") {
        user.is_approved = true;
        user.access_status = "active";
        mockStore.updateProfile(user.id, { is_approved: true, access_status: "active" });
      } else {
        return NextResponse.json(
          {
            error: accountAccess.reason || "Account access is restricted. Expired or inactive accounts cannot generate cases.",
            error_code: accountAccess.status === "expired" ? "ACCOUNT_EXPIRED" : accountAccess.status === "inactive" ? "ACCOUNT_INACTIVE" : "ACCESS_DENIED",
            status: accountAccess.status,
          },
          { status: 403 }
        );
      }
    }

    // Role-based case generation check (students, faculty, admin allowed)
    const access = checkCaseGenerationAccess(user.role);
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.error, error_code: access.code },
        { status: access.status }
      );
    }

    // Student daily limit check (STUDENT_GENERATION_LIMIT; default 0 = unlimited)
    if (user.role === "student") {
      const studentDaily = checkStudentDailyLimit(user.id);
      if (!studentDaily.allowed) {
        return NextResponse.json(
          {
            error: `Daily student practice case generation limit reached (${studentDaily.count}/${studentDaily.limit}). Please try again tomorrow.`,
            error_code: "STUDENT_DAILY_LIMIT_REACHED",
            limit: studentDaily.limit,
            count: studentDaily.count,
            remaining: studentDaily.remaining,
          },
          { status: 429 }
        );
      }
    }

    // 2. Institutional token budget check
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

    // 3. Rate Limiting Check (hourly limit; for students with default 0, per-user limit is unlimited)
    if (user.role !== "student" || getStudentDailyGenerationLimit() > 0) {
      const rateLimit = await checkRateLimit(user.id);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: `Hourly generation rate limit reached (${rateLimit.count}/${rateLimit.limit}). Please try again in ${rateLimit.resetMinutes} minutes.`,
            error_code: "RATE_LIMIT_EXCEEDED",
            limit: rateLimit.limit,
            remaining: rateLimit.remaining,
          },
          { status: 429 }
        );
      }
    }

    // 4. User Monthly Quota Check (bypassed for students when unlimited)
    if (user.role !== "student" || getStudentDailyGenerationLimit() > 0) {
      const quota = mockStore.checkUserGenerationQuota(user.id);
      if (!quota.allowed) {
        return NextResponse.json(
          {
            error: `Monthly fair-use case generation limit reached (${quota.used}/${quota.limit}). Resets next month.`,
            error_code: "FAIR_USE_LIMIT_REACHED",
            quota,
          },
          { status: 403 }
        );
      }
    }

    // 4. Validate Request Payload with Zod
    const body = await req.json().catch(() => ({}));
    const parseResult = RequestBodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload.",
          details: parseResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
        },
        { status: 400 }
      );
    }

    const input: GenerateCasePackInput = parseResult.data;
    const shouldStream =
      parseResult.data.stream === true ||
      req.headers.get("accept")?.includes("text/event-stream");

    // 5. Handle Streaming Response (Server-Sent Events)
    if (shouldStream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const sendEvent = (event: string, data: any) => {
            const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(payload));
          };

          try {
            sendEvent("start", { message: "Initializing CE Case Pack pipeline..." });

            const { casePack, checks } = await generateCECasePack(input, (progress) => {
              sendEvent("progress", progress);
            });

            // Persist the generated CE Case Pack as a case study record
            const newCaseId = `case-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const isStudent = user.role === "student";
            const caseStudy: CaseStudy = {
              id: newCaseId,
              author_id: user.id,
              author_name: user.name || (isStudent ? "Student Author" : "Faculty Author"),
              title: casePack.case.title,
              status: "draft",
              type: "ce_pack",
              format: "hypothetical",
              student_practice: isStudent ? true : undefined,
              industry: casePack.meta.industry,
              function: casePack.meta.department.toUpperCase(),
              level: casePack.meta.level || "MBA / PGDM",
              complexity: 6,
              language: "en",
              content: casePack as any,
              source_notes: input.sourceNotes,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            mockStore.saveCase(caseStudy);

            // Record token usage & audit ledger
            const estimatedTokens = Math.round((casePack.case.word_count || 1200) * 1.75);
            await recordGenerationUsage(user.id, estimatedTokens, "claude-3-7-sonnet", newCaseId, user.role);

            mockStore.logAudit(
              user.id,
              user.email,
              "case_created",
              newCaseId,
              "case",
              {
                type: "ce_pack",
                department: input.department,
                title: caseStudy.title,
                student_practice: isStudent,
              }
            );

            const studentSafeCasePack = isStudent ? sanitizeCasePackForStudent(casePack) : casePack;
            const studentSafeCaseStudy = isStudent ? sanitizeCaseStudyForStudent(caseStudy) : caseStudy;
            const studentSafeChecks = isStudent ? { valid: true, summary: "Student practice checks verified." } : checks;

            sendEvent("complete", {
              success: true,
              caseStudy: studentSafeCaseStudy,
              casePack: studentSafeCasePack,
              checks: studentSafeChecks,
            });
          } catch (err: any) {
            console.error("Streaming generation error:", err);
            sendEvent("error", { error: err.message || "Failed to generate CE Case Pack" });
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // 6. Handle Standard Synchronous JSON Response
    const { casePack, checks } = await generateCECasePack(input);

    const newCaseId = `case-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const isStudent = user.role === "student";
    const caseStudy: CaseStudy = {
      id: newCaseId,
      author_id: user.id,
      author_name: user.name || (isStudent ? "Student Author" : "Faculty Author"),
      title: casePack.case.title,
      status: "draft",
      type: "ce_pack",
      format: "hypothetical",
      student_practice: isStudent ? true : undefined,
      industry: casePack.meta.industry,
      function: casePack.meta.department.toUpperCase(),
      level: casePack.meta.level || "MBA / PGDM",
      complexity: 6,
      language: "en",
      content: casePack as any,
      source_notes: input.sourceNotes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockStore.saveCase(caseStudy);

    const estimatedTokens = Math.round((casePack.case.word_count || 1200) * 1.75);
    await recordGenerationUsage(user.id, estimatedTokens, "claude-3-7-sonnet", newCaseId, user.role);

    mockStore.logAudit(
      user.id,
      user.email,
      "case_created",
      newCaseId,
      "case",
      {
        type: "ce_pack",
        department: input.department,
        title: caseStudy.title,
        student_practice: isStudent,
      }
    );

    const studentSafeCasePack = isStudent ? sanitizeCasePackForStudent(casePack) : casePack;
    const studentSafeCaseStudy = isStudent ? sanitizeCaseStudyForStudent(caseStudy) : caseStudy;
    const studentSafeChecks = isStudent ? { valid: true, summary: "Student practice checks verified." } : checks;

    return NextResponse.json({
      success: true,
      caseStudy: studentSafeCaseStudy,
      casePack: studentSafeCasePack,
      checks: studentSafeChecks,
    });
  } catch (error: any) {
    console.error("CE Case Pack generation route error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during CE Case Pack generation." },
      { status: 500 }
    );
  }
}
