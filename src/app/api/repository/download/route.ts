import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";
import { checkAccess, canDownload } from "@/lib/access-control";
import { DownloadLogKind } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Access Check: Expired / Inactive users CANNOT download repository items
    const access = checkAccess(user);
    if (access.status === "expired" || access.status === "inactive") {
      return NextResponse.json(
        {
          error: "Access expired or inactive. Expired accounts are blocked from downloading repository items. Renew institutional subscription for full access.",
          status: access.status,
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId") || searchParams.get("item_id");
    const caseId = searchParams.get("caseId") || searchParams.get("case_id");
    const requestedKind = searchParams.get("kind")?.toLowerCase() || "pdf";
    const requestedMode = searchParams.get("mode") || "full";

    if (!itemId && !caseId) {
      return NextResponse.json(
        { error: "Missing required parameter: itemId or caseId must be provided." },
        { status: 400 }
      );
    }

    // 2. Locate Repository Item
    const allItems = mockStore.getRepositoryItems();
    const repoItem = allItems.find(
      (item) => item.id === itemId || (caseId && item.case_id === caseId)
    );

    if (!repoItem) {
      // Check if case is directly approved
      const foundCase = caseId ? mockStore.getCase(caseId) : null;
      if (!foundCase) {
        return NextResponse.json({ error: "Repository item not found." }, { status: 404 });
      }
    }

    // Pre-flight Commercial & Access Download Gate
    const downloadCheck = canDownload(
      user,
      repoItem || { author_id: caseId ? mockStore.getCase(caseId)?.author_id : undefined }
    );
    if (!downloadCheck.allowed) {
      mockStore.logAudit(
        user.id,
        user.email,
        "download_denied",
        itemId || caseId || "unknown",
        "case",
        { kind: requestedKind, reason: downloadCheck.reason }
      );
      return NextResponse.json(
        {
          error: downloadCheck.reason || "Download unauthorized.",
          isPaidRequired: downloadCheck.isPaidRequired,
          priceInr: downloadCheck.priceInr,
        },
        { status: downloadCheck.status || 403 }
      );
    }

    const targetCaseId = repoItem ? repoItem.case_id : caseId!;

    // 3. Confidential Asset Protection: Force student mode for student role
    const mode = user.role === "student" ? "student" : requestedMode;
    const kind = requestedKind === "docx" ? "docx" : "pdf";

    // 4. Inscribe Audit & Download Log
    const loggedItemId = repoItem ? repoItem.id : `repo-${targetCaseId}`;
    const logKind: DownloadLogKind = kind === "docx" ? "docx" : "pdf";
    const downloadLog = mockStore.logDownload(loggedItemId, user.id, logKind);

    mockStore.logAudit(
      user.id,
      user.email,
      "case_downloaded",
      targetCaseId,
      "case",
      {
        item_id: loggedItemId,
        kind,
        mode,
        download_log_id: downloadLog.id,
      }
    );

    // 5. Redirect to export generator with verified parameters
    const exportPath = `/api/cases/${targetCaseId}/export/${kind}?mode=${mode}`;
    const redirectUrl = new URL(exportPath, req.url);

    return NextResponse.redirect(redirectUrl);
  } catch (err: unknown) {
    console.error("Repository download error:", err);
    return NextResponse.json(
      { error: "Failed to process repository download." },
      { status: 500 }
    );
  }
}
