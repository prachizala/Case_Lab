import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { CaseStudy } from "@/lib/types";
import { authenticateUser } from "@/lib/session";
import { sanitizeCaseStudyForStudent } from "@/lib/case-permissions";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await authenticateUser(req);
  if (errorResponse || !user) {
    return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawId = "";
  try {
    const resolved = await context.params;
    rawId = resolved?.id || "";
  } catch {}
  if (!rawId) {
    const parts = req.nextUrl.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && last !== "cases") rawId = last;
  }

  const caseId = decodeURIComponent(rawId).trim();
  const foundCase = mockStore.getCase(caseId);
  if (!foundCase) {
    return NextResponse.json({ error: "Case study not found", caseId }, { status: 404 });
  }

  // Student permission check: students cannot view draft, in_review, changes_requested, archived, or private cases UNLESS they are the author!
  if (user.role === "student") {
    const isAuthor = foundCase.author_id === user.id;
    const isLive = foundCase.status === "published" || foundCase.status === "approved";
    if (!isLive && !isAuthor) {
      return NextResponse.json(
        { error: "Access denied. Students are only permitted to view published curriculum cases or their own authored cases." },
        { status: 403 }
      );
    }
    if (foundCase.visibility === "private" && !isAuthor) {
      return NextResponse.json(
        { error: "Access denied. This case study is marked private by the author." },
        { status: 403 }
      );
    }
  }

  // Academic confidentiality safeguard: strictly strip answer key, teaching note, quality/checks from student response
  let caseToReturn = { ...foundCase };
  if (user.role === "student") {
    caseToReturn = sanitizeCaseStudyForStudent(foundCase);
  }

  return NextResponse.json({ caseStudy: caseToReturn });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await authenticateUser(req, ["student", "faculty", "admin"]);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId } = await context.params;

    const existing = mockStore.getCase(caseId);
    if (!existing) {
      return NextResponse.json({ error: "Case study not found" }, { status: 404 });
    }

    if (user.role === "student" && existing.author_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. You can only edit your own authored cases." },
        { status: 403 }
      );
    }

    const updates: Partial<CaseStudy> & { change_summary?: string } = await req.json().catch(() => ({}));

    // Prevent student from altering protected fields
    if (user.role === "student") {
      delete updates.author_id;
      delete updates.author_role;
      delete updates.reviewer_id;
      delete updates.reviewer_comment;
      delete updates.review_status;
    }

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

    let returnedCase = updatedCase ? { ...updatedCase } : null;
    if (returnedCase && user.role === "student" && returnedCase.content) {
      const sanitized = { ...returnedCase.content } as Record<string, unknown>;
      delete sanitized.teaching_note;
      delete sanitized.teaching_notes;
      delete sanitized.answers;
      delete sanitized.answer_key;
      delete sanitized.model_answers;
      delete sanitized.solution_keys;
      delete sanitized.pedagogical_checks;
      delete sanitized.rubrics;
      delete sanitized.quality;
      delete sanitized.validation;
      returnedCase.content = sanitized as any;
    }

    return NextResponse.json({ success: true, caseStudy: returnedCase });
  } catch (err: unknown) {
    console.error("Update case error:", err);
    return NextResponse.json(
      { error: "Failed to update case study draft." },
      { status: 500 }
    );
  }
}
