import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await authenticateUser(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: answerId } = await context.params;

    const answer = mockStore.getAnswer(answerId, user.id, user.role);
    if (!answer) {
      return NextResponse.json({ error: "Answer not found or access denied." }, { status: 404 });
    }

    const report = mockStore.calculateIntegrityReport(
      answer.id,
      answer.case_id,
      answer.student_id,
      answer.text
    );

    return NextResponse.json({ report });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
