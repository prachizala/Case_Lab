import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await authenticateUser(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId } = await context.params;
    const existingCase = mockStore.getCase(caseId);
    if (!existingCase) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    const rounds = mockStore.getReviewRounds(caseId);
    const roundIds = rounds.map((r) => r.id);
    const comments = mockStore.getReviewComments().filter((c) => roundIds.includes(c.round_id));

    return NextResponse.json({
      success: true,
      rounds,
      comments,
    });
  } catch (err: unknown) {
    console.error("Fetch review comments error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve review comments." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await authenticateUser(req, ["faculty", "admin"]);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId } = await context.params;
    const existingCase = mockStore.getCase(caseId);
    if (!existingCase) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { round_id, section, text } = body;

    if (!round_id || !section || !text || !text.trim()) {
      return NextResponse.json(
        { error: "Missing required comment parameters: round_id, section, and text." },
        { status: 400 }
      );
    }

    const comment = mockStore.addReviewComment(round_id, section, text.trim(), user.id);

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (err: unknown) {
    console.error("Add review comment error:", err);
    return NextResponse.json(
      { error: "Failed to persist section review comment." },
      { status: 500 }
    );
  }
}
