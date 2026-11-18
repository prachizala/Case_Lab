import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/session";
import { mockStore } from "@/lib/mock-db";

export async function GET(req: NextRequest) {
  const auth = await authenticateUser(req, ["admin"]);
  if (auth.errorResponse || !auth.user) {
    return (
      auth.errorResponse ||
      NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 })
    );
  }

  const pending = mockStore.getPendingRegistrations();
  return NextResponse.json({
    success: true,
    pendingUsers: pending,
    count: pending.length,
  });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateUser(req, ["admin"]);
  if (auth.errorResponse || !auth.user) {
    return (
      auth.errorResponse ||
      NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 })
    );
  }

  try {
    const body = await req.json();
    const { userId, action, reason } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: userId and action ('approve' | 'reject')." },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const profile = mockStore.approveRegistration(userId, auth.user.id);
      if (!profile) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: "User registration approved successfully.",
        profile,
      });
    }

    if (action === "reject") {
      const ok = mockStore.rejectRegistration(userId, auth.user.id);
      if (!ok) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: "User registration rejected.",
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Must be 'approve' or 'reject'." },
      { status: 400 }
    );
  } catch (err) {
    console.error("Pending registration action error:", err);
    return NextResponse.json(
      { error: "Failed to process registration approval." },
      { status: 500 }
    );
  }
}
