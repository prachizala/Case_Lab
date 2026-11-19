import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";
import { checkAccess } from "@/lib/access-control";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await authenticateUser(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = checkAccess(user);
    if (!access.canCreate && !access.canSubmit && user.role !== "admin") {
      return NextResponse.json(
        { error: "Access expired or inactive. Cannot perform institutional repository uploads." },
        { status: 403 }
      );
    }

    const { id: caseId } = await context.params;
    const existingCase = mockStore.getCase(caseId);
    if (!existingCase) {
      return NextResponse.json({ error: "Case study not found." }, { status: 404 });
    }

    // Authorization: Author or Admin only
    const isAuthor = existingCase.author_id === user.id;
    const isAdmin = user.role === "admin";
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. Only the case author or administrator can upload this case to the repository." },
        { status: 403 }
      );
    }

    // STRICT UPLOAD GATE: Case MUST be approved before uploading to repository!
    if (existingCase.status !== "approved") {
      return NextResponse.json(
        {
          error: `Upload Gate Locked. Case status is '${existingCase.status}'. Only peer-reviewed and officially approved cases can be published to the institutional repository.`,
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      confirm_consent,
      similarity_score,
      creator_share_pct,
      price_inr,
      author_consent_version = "2026.1",
    } = body;

    // Consent affirmation requirement
    if (confirm_consent !== true) {
      return NextResponse.json(
        { error: "Mandatory author consent affirmation is required before institutional publishing." },
        { status: 400 }
      );
    }

    // Generate frozen file paths for artifacts
    const docxPath = `/api/cases/${caseId}/export/docx`;
    const pdfPath = `/api/cases/${caseId}/export/pdf`;

    // Compute or default similarity score
    const simScore = typeof similarity_score === "number" ? Math.max(0, Math.min(100, similarity_score)) : 8;

    // Create repository_items entry in database/mockStore
    const repoItem = mockStore.uploadToRepository({
      case_id: existingCase.id,
      approved_version_id: `v${existingCase.version || 1}`,
      author_id: existingCase.author_id,
      author_name: existingCase.author_name || user.name,
      reviewer_id: existingCase.reviewer_id || user.id,
      department_id: existingCase.department_id || null,
      course_id: existingCase.course_id || null,
      category_id: existingCase.case_category_id || null,
      keywords: existingCase.keywords || ["Strategy", "Management", "Business"],
      approval_status: "approved",
      submitted_at: existingCase.created_at,
      approved_at: existingCase.updated_at || new Date().toISOString(),
      file_docx_path: docxPath,
      file_pdf_path: pdfPath,
      is_published: true,
      author_consent_at: new Date().toISOString(),
      author_consent_version: String(author_consent_version),
      similarity_score: simScore,
      ai_assisted: true,
      price_inr: price_inr !== undefined && price_inr !== null ? Number(price_inr) : null,
      creator_share_pct: creator_share_pct !== undefined && creator_share_pct !== null ? Number(creator_share_pct) : 70,
    });

    // Inscribe audit log entry
    mockStore.logAudit(
      user.id,
      user.email,
      "case_uploaded",
      existingCase.id,
      "case",
      {
        title: existingCase.title,
        repository_item_id: repoItem.id,
        similarity_score: simScore,
        creator_share_pct: repoItem.creator_share_pct,
        price_inr: repoItem.price_inr,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Case successfully uploaded and permanently archived in the SBS Institutional Repository.",
      repositoryItem: repoItem,
      caseStudy: mockStore.getCase(caseId),
    });
  } catch (err: unknown) {
    console.error("Upload to repository error:", err);
    return NextResponse.json(
      { error: "Failed to upload case to repository." },
      { status: 500 }
    );
  }
}
