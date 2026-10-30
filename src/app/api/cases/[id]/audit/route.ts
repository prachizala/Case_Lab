import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await authenticateUser(req, ["faculty", "admin"]);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId } = await context.params;
    const auditLogs = mockStore.getAuditLogsForCase(caseId);

    return NextResponse.json({
      success: true,
      caseId,
      auditLogs,
    });
  } catch (err: unknown) {
    console.error("Case audit fetch error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve case audit history." },
      { status: 500 }
    );
  }
}
