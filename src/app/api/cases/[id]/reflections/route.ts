import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";
import { COLLEGE_NAME_WITH_SHORT } from "@/config/college";

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
    const reflections = mockStore.getPractitionerReflections(caseId);
    return NextResponse.json({ reflections });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await authenticateUser(request);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId } = await params;
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    // Upvote reflection (available to all logged-in community members)
    if (action === "upvote") {
      const { reflectionId } = body;
      if (!reflectionId) {
        return NextResponse.json({ error: "reflectionId is required" }, { status: 400 });
      }

      const res = mockStore.upvotePractitionerReflection(reflectionId, user.id);
      return NextResponse.json(res);
    }

    // Submit new reflection (restricted to faculty, admin)
    const canReflect = user.role === "faculty" || user.role === "admin";
    if (!canReflect) {
      return NextResponse.json(
        { error: "Forbidden. Only faculty and administration can submit practitioner reflections." },
        { status: 403 }
      );
    }

    const { alumni_title, company, reflection_text, practical_takeaway } = body;
    if (!reflection_text || !practical_takeaway) {
      return NextResponse.json(
        { error: "reflection_text and practical_takeaway are required." },
        { status: 400 }
      );
    }

    const created = mockStore.addPractitionerReflection({
      case_id: caseId,
      alumni_id: user.id,
      alumni_name: user.name,
      alumni_title: alumni_title || `Faculty, ${COLLEGE_NAME_WITH_SHORT}`,
      company: company || "Executive Practitioner",
      reflection_text,
      practical_takeaway,
      is_verified_alumni: true,
    });

    return NextResponse.json({ success: true, reflection: created }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
