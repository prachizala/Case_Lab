import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateUser(req);
  if (errorResponse || !user) {
    return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const caseId = searchParams.get("caseId");
  const studentId = searchParams.get("studentId");

  // 1. If caseId is provided
  if (caseId) {
    const caseStudy = mockStore.getCase(caseId);
    if (!caseStudy) {
      return NextResponse.json({ error: "Case study not found." }, { status: 404 });
    }

    if (user.role === "admin") {
      const answers = mockStore.getAnswersForCase(caseId);
      return NextResponse.json({ answers });
    }

    if (user.role === "faculty") {
      // Faculty can ONLY read answers for cases in their own department
      if (caseStudy.department_id && caseStudy.department_id !== user.department_id) {
        return NextResponse.json(
          { error: "Forbidden. Faculty may only view answers for cases within their own department." },
          { status: 403 }
        );
      }
      const answers = mockStore.getAnswersForCase(caseId);
      return NextResponse.json({ answers });
    }

    // Student only sees their own answer for this case
    const answer = mockStore.getAnswerByStudentAndCase(user.id, caseId);
    return NextResponse.json({ answer: answer || null });
  }

  // 2. If studentId is provided
  if (studentId) {
    if (user.role === "student" && studentId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. Students cannot inspect peer submissions." },
        { status: 403 }
      );
    }

    if (user.role === "faculty") {
      const targetStudent = mockStore.getProfile(studentId);
      if (targetStudent?.department_id && targetStudent.department_id !== user.department_id) {
        return NextResponse.json(
          { error: "Forbidden. Faculty may only view answers for students in their own department." },
          { status: 403 }
        );
      }
    }

    const answers = mockStore.getAnswersForStudent(studentId);
    return NextResponse.json({ answers });
  }

  // 3. Generic query without parameters
  if (user.role === "student") {
    const answers = mockStore.getAnswersForStudent(user.id);
    return NextResponse.json({ answers });
  }

  if (user.role === "faculty") {
    // Only return answers for cases in faculty's department
    const deptCases = mockStore.getCases().filter((c) => c.department_id === user.department_id);
    const deptCaseIds = new Set(deptCases.map((c) => c.id));
    const answers = mockStore.getAnswers().filter((a) => deptCaseIds.has(a.case_id));
    return NextResponse.json({ answers });
  }

  // Admin sees all
  const answers = mockStore.getAnswers();
  return NextResponse.json({ answers });
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, caseId, text = "", answerId } = body;

    // Student can only write/submit their own answer
    const studentId = user.id;

    if (action === "draft") {
      if (!caseId) {
        return NextResponse.json({ error: "caseId is required for drafts." }, { status: 400 });
      }

      const result = mockStore.saveAnswerDraft(caseId, studentId, text);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, answer: result.answer });
    }

    if (action === "submit") {
      let targetAnswerId = answerId;
      if (!targetAnswerId && caseId) {
        const existing = mockStore.getAnswerByStudentAndCase(studentId, caseId);
        if (existing) {
          targetAnswerId = existing.id;
        } else {
          const draft = mockStore.saveAnswerDraft(caseId, studentId, text);
          if (draft.answer) targetAnswerId = draft.answer.id;
        }
      }

      if (!targetAnswerId) {
        return NextResponse.json(
          { error: "answerId or caseId is required to submit." },
          { status: 400 }
        );
      }

      const result = mockStore.submitAnswer(targetAnswerId, studentId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: "Analysis officially submitted and locked.",
        answer: result.answer,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("Save answer error:", err);
    return NextResponse.json(
      { error: "Failed to persist student answer." },
      { status: 500 }
    );
  }
}
