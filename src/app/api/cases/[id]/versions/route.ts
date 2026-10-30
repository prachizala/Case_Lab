import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await authenticateUser(req, ["faculty", "admin"]);
  if (errorResponse || !user) {
    return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: caseId } = await context.params;
  const versions = mockStore.getVersions(caseId);
  return NextResponse.json({ versions });
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
    const { action, versionNumber } = body;

    if (action === "restore") {
      if (!versionNumber || typeof versionNumber !== "number") {
        return NextResponse.json(
          { error: "A valid version number is required for restoration." },
          { status: 400 }
        );
      }

      const restoredCase = mockStore.restoreVersion(caseId, versionNumber, user.id);
      if (!restoredCase) {
        return NextResponse.json(
          { error: `Version ${versionNumber} could not be found or restored.` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Case restored to Version ${versionNumber} (saved as active Version ${restoredCase.version}).`,
        caseStudy: restoredCase,
      });
    }

    return NextResponse.json({ error: "Unknown version action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("Version restore error:", err);
    return NextResponse.json(
      { error: "Failed to process version request." },
      { status: 500 }
    );
  }
}
