import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { AuditAction } from "@/lib/types";
import { authenticateUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req, ["admin"]);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const cursor = searchParams.get("cursor");
    const action = searchParams.get("action") as AuditAction | null;
    const search = searchParams.get("search")?.toLowerCase();
    const actor = searchParams.get("actor")?.toLowerCase();

    let logs = mockStore.getAuditLogs(1000);

    if (action && (action as any) !== "all") {
      logs = logs.filter((l) => l.action === action);
    }

    if (actor) {
      logs = logs.filter(
        (l) =>
          l.actor_email.toLowerCase().includes(actor) ||
          l.actor_id.toLowerCase().includes(actor)
      );
    }

    if (search) {
      logs = logs.filter((l) => {
        const metadataStr = l.metadata ? JSON.stringify(l.metadata).toLowerCase() : "";
        return (
          l.target_id.toLowerCase().includes(search) ||
          l.target_type.toLowerCase().includes(search) ||
          l.actor_email.toLowerCase().includes(search) ||
          l.action.toLowerCase().includes(search) ||
          metadataStr.includes(search)
        );
      });
    }

    // Cursor-based pagination
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = logs.findIndex((l) => l.id === cursor);
      if (cursorIndex >= 0) {
        startIndex = cursorIndex + 1;
      }
    }

    const pagedLogs = logs.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < logs.length;
    const nextCursor = hasMore && pagedLogs.length > 0 ? pagedLogs[pagedLogs.length - 1].id : null;

    return NextResponse.json({
      success: true,
      logs: pagedLogs,
      nextCursor,
      hasMore,
      total: logs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("Audit log fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch audit records." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req, ["admin"]);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      action = "admin_action",
      targetId,
      targetType = "user",
      metadata = {},
    } = body;

    if (!targetId) {
      return NextResponse.json(
        { error: "targetId is required to record an audit entry." },
        { status: 400 }
      );
    }

    const log = mockStore.logAudit(
      user.id,
      user.email,
      action as AuditAction,
      targetId,
      targetType,
      metadata
    );

    return NextResponse.json({
      success: true,
      log,
      message: "Audit record securely committed to institutional ledger.",
    });
  } catch (err: unknown) {
    console.error("Audit log post error:", err);
    return NextResponse.json(
      { error: "Failed to record audit entry." },
      { status: 500 }
    );
  }
}
