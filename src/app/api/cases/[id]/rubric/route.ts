import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { RubricCriterion } from "@/lib/types";
import { authenticateUser } from "@/lib/session";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await authenticateUser(req);
  if (errorResponse || !user) {
    return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: caseId } = await context.params;
  const rubric = mockStore.getRubric(caseId);
  return NextResponse.json({ rubric: rubric || null });
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
    const body = await req.json().catch(() => ({}));
    const criteria: RubricCriterion[] = body.criteria;

    if (!Array.isArray(criteria) || criteria.length === 0) {
      return NextResponse.json(
        { error: "At least one evaluation criterion is required in the rubric." },
        { status: 400 }
      );
    }

    // Validate criteria
    for (const c of criteria) {
      if (!c.name || typeof c.max_marks !== "number" || c.max_marks <= 0) {
        return NextResponse.json(
          { error: "Each criterion must have a valid name and positive max marks." },
          { status: 400 }
        );
      }
    }

    const saved = mockStore.saveRubric(caseId, criteria);
    return NextResponse.json({ success: true, rubric: saved });
  } catch (err: unknown) {
    console.error("Save rubric error:", err);
    return NextResponse.json(
      { error: "Failed to persist evaluation rubric." },
      { status: 500 }
    );
  }
}
