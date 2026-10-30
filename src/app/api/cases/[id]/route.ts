import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { CaseStudy } from "@/lib/types";
import { authenticateUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await authenticateUser(req);
  if (errorResponse || !user) {
    return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: caseId } = await context.params;

  const foundCase = mockStore.getCase(caseId);
  if (!foundCase) {
    return NextResponse.json({ error: "Case study not found" }, { status: 404 });
  }

  // Student permission check: students cannot view draft, in_review, changes_requested, archived, or private cases!
  if (user.role === "student") {
    const isLive = foundCase.status === "published" || foundCase.status === "approved";
    if (!isLive) {
      return NextResponse.json(
        { error: "Access denied. Students are only permitted to view published curriculum cases." },
        { status: 403 }
      );
    }
    if (foundCase.visibility === "private") {
      return NextResponse.json(
        { error: "Access denied. This case study is marked private by the author." },
        { status: 403 }
      );
    }
  }


  // Academic confidentiality safeguard: strictly strip teaching note from student response
  let caseToReturn = { ...foundCase };
  if (user.role === "student") {
    if (caseToReturn.content && caseToReturn.content.teaching_note) {
      const sanitizedContent = { ...caseToReturn.content };
      delete sanitizedContent.teaching_note;
      caseToReturn.content = sanitizedContent;
    }
  }

  return NextResponse.json({ caseStudy: caseToReturn });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await authenticateUser(req, ["faculty", "admin"]);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId } = await context.params;

    const existing = mockStore.getCase(caseId);
    if (!existing) {
      return NextResponse.json({ error: "Case study not found" }, { status: 404 });
    }

    const updates: Partial<CaseStudy> & { change_summary?: string } = await req.json().catch(() => ({}));

    let updatedCase: CaseStudy | null;

    // Requirement: Edit after approval/publishing creates a new version, old one stays viewable!
    if (existing.status === "approved" || existing.status === "published") {
      updatedCase = mockStore.updateCaseWithVersion(
        caseId,
        updates,
        user.id,
        updates.change_summary || "Curriculum edits following institutional approval."
      );
    } else {
      updatedCase = {
        ...existing,
        ...updates,
        id: caseId,
        updated_at: new Date().toISOString(),
      };
      mockStore.saveCase(updatedCase);
    }

    return NextResponse.json({ success: true, caseStudy: updatedCase });
  } catch (err: unknown) {
    console.error("Update case error:", err);
    return NextResponse.json(
      { error: "Failed to update case study draft." },
      { status: 500 }
    );
  }
}
