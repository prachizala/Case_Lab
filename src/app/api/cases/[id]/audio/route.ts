import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await authenticateUser(request);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId } = await params;
    const caseStudy = mockStore.getCase(caseId);
    if (!caseStudy) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    // Students can only access approved cases
    if (user.role === "student" && caseStudy.status !== "approved") {
      return NextResponse.json({ error: "Forbidden. Case not approved." }, { status: 403 });
    }

    const audioBrief = mockStore.createOrGetAudioBrief(caseId);
    return NextResponse.json({ audioBrief });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
