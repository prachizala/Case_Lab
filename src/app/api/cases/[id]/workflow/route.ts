import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";
import { CaseVisibility } from "@/lib/types";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await authenticateUser(req, ["student", "faculty", "admin"]);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { action, comment, visibility } = body;

    const existingCase = mockStore.getCase(caseId);
    if (!existingCase) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    // Submit for peer review / curriculum committee approval
    if (action === "submit-approval" || action === "submit-review") {
      if (body.confirm_originality === false || body.confirm_figures === false) {
        return NextResponse.json(
          { error: "Submission requires author confirmation of originality and data accuracy." },
          { status: 400 }
        );
      }

      const updated = mockStore.submitForApproval(caseId, user.id);
      let assignedRound = null;
      try {
        assignedRound = mockStore.assignReviewer(caseId);
      } catch (e) {
        console.warn("Auto reviewer assignment skipped or failed:", e);
      }
      return NextResponse.json({
        success: true,
        message: "Case submitted for curriculum committee review.",
        caseStudy: updated,
        round: assignedRound,
      });
    }

    // Approve case (Admin OR Designated Faculty Reviewer; Author cannot approve own case)
    if (action === "approve") {
      const isReviewer = user.role === "faculty" && Boolean(user.is_reviewer);
      if (user.role !== "admin" && !isReviewer) {
        return NextResponse.json(
          { error: "Forbidden. Only designated faculty reviewers and administrators can approve case studies." },
          { status: 403 }
        );
      }

      if (existingCase.author_id === user.id && user.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden. Case authors cannot approve their own submissions." },
          { status: 403 }
        );
      }

      const updated = mockStore.approveCase(caseId, user.id, comment);
      return NextResponse.json({
        success: true,
        message: "Case officially approved by institutional administration.",
        caseStudy: updated,
      });
    }

    // Request revisions / changes
    if (action === "request-changes") {
      const isReviewer = user.role === "faculty" && Boolean(user.is_reviewer);
      if (user.role !== "admin" && !isReviewer) {
        return NextResponse.json(
          { error: "Forbidden. Only designated reviewers and administrators can request revisions." },
          { status: 403 }
        );
      }

      if (!comment || typeof comment !== "string" || !comment.trim()) {
        return NextResponse.json(
          { error: "Reviewer feedback comment is required when requesting revisions." },
          { status: 400 }
        );
      }

      const updated = mockStore.requestChanges(caseId, user.id, comment.trim());
      return NextResponse.json({
        success: true,
        message: "Changes requested. Returned to author with reviewer comments.",
        caseStudy: updated,
      });
    }

    // Reject case
    if (action === "reject") {
      const isReviewer = user.role === "faculty" && Boolean(user.is_reviewer);
      if (user.role !== "admin" && !isReviewer) {
        return NextResponse.json(
          { error: "Forbidden. Only designated reviewers and administrators can reject cases." },
          { status: 403 }
        );
      }

      if (!comment || typeof comment !== "string" || !comment.trim()) {
        return NextResponse.json(
          { error: "Explanation comment is required when rejecting a case." },
          { status: 400 }
        );
      }

      const updated = mockStore.rejectCase(caseId, user.id, comment.trim());
      return NextResponse.json({
        success: true,
        message: "Case submission rejected with reviewer feedback.",
        caseStudy: updated,
      });
    }

    // Publish case to student / institution directory
    if (action === "publish") {
      const vis = (visibility as CaseVisibility) || existingCase.visibility || "sbs_only";
      const updated = mockStore.publishCase(caseId, user.id, vis);
      return NextResponse.json({
        success: true,
        message: `Case published to ${vis === "public" ? "public repository" : "SBS student directory"}.`,
        caseStudy: updated,
      });
    }

    // Archive case
    if (action === "archive") {
      const updated = mockStore.archiveCase(caseId, user.id);
      return NextResponse.json({
        success: true,
        message: "Case moved to institutional archive.",
        caseStudy: updated,
      });
    }

    // Set Visibility
    if (action === "set-visibility") {
      if (!visibility || !["private", "sbs_only", "public"].includes(visibility)) {
        return NextResponse.json({ error: "Invalid visibility option." }, { status: 400 });
      }
      const updated = mockStore.setVisibility(caseId, user.id, visibility as CaseVisibility);
      return NextResponse.json({
        success: true,
        message: `Visibility set to ${visibility}.`,
        caseStudy: updated,
      });
    }

    return NextResponse.json({ error: "Unknown workflow action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("Workflow error:", err);
    return NextResponse.json(
      { error: "Workflow operation failed." },
      { status: 500 }
    );
  }
}
