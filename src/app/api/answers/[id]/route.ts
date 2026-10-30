import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await authenticateUser(req);
  if (errorResponse || !user) {
    return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: answerId } = await context.params;

  const rawAnswer = mockStore.getAnswers().find((a) => a.id === answerId);
  if (!rawAnswer) {
    return NextResponse.json({ error: "Answer not found." }, { status: 404 });
  }

  const caseStudy = mockStore.getCase(rawAnswer.case_id);

  // Authorization checks
  if (user.role === "student") {
    if (rawAnswer.student_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. Students cannot view peer submissions." },
        { status: 403 }
      );
    }
  } else if (user.role === "faculty") {
    if (caseStudy?.department_id && caseStudy.department_id !== user.department_id) {
      return NextResponse.json(
        { error: "Forbidden. Faculty may only view answers for cases within their own department." },
        { status: 403 }
      );
    }
  }

  const rubric = caseStudy ? mockStore.getRubric(caseStudy.id) : undefined;
  const grade = mockStore.getGradeForAnswer(answerId, user.id, user.role);

  return NextResponse.json({
    answer: rawAnswer,
    caseStudy,
    rubric,
    grade,
  });
}
