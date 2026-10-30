import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (auth.errorResponse || !auth.user) {
      return auth.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = mockStore.getDashboardTelemetry();
    const recentActivity = mockStore.getRecentActivityFeed(8);
    const budget = mockStore.getTokenBudgetInfo();

    // Pending registrations are accessible to admins (and faculty leads for preview)
    const pendingRegistrations =
      auth.user.role === "admin" ? mockStore.getPendingRegistrations() : [];

    return NextResponse.json({
      success: true,
      stats,
      recentActivity,
      budget,
      pendingRegistrations,
    });
  } catch (err: unknown) {
    console.error("Dashboard API GET error:", err);
    return NextResponse.json(
      { error: "Failed to assemble dashboard intelligence." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only Admin can approve or reject institutional user registrations
    const auth = await authenticateUser(req, ["admin"]);
    if (auth.errorResponse || !auth.user) {
      return (
        auth.errorResponse ||
        NextResponse.json({ error: "Unauthorized administrative action." }, { status: 403 })
      );
    }

    const body = await req.json();
    const { action, userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Target userId is required." }, { status: 400 });
    }

    if (action === "approve-registration") {
      const approved = mockStore.approveRegistration(userId, auth.user.id);
      if (!approved) {
        return NextResponse.json({ error: "Pending registration not found." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Registration for ${approved.name} successfully approved.`,
        profile: approved,
        stats: mockStore.getDashboardTelemetry(),
        pendingRegistrations: mockStore.getPendingRegistrations(),
      });
    }

    if (action === "reject-registration") {
      const rejected = mockStore.rejectRegistration(userId, auth.user.id);
      if (!rejected) {
        return NextResponse.json({ error: "Pending registration not found." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: "Registration application rejected.",
        stats: mockStore.getDashboardTelemetry(),
        pendingRegistrations: mockStore.getPendingRegistrations(),
      });
    }

    return NextResponse.json({ error: "Unknown dashboard action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("Dashboard API POST error:", err);
    return NextResponse.json(
      { error: "Failed to execute dashboard operation." },
      { status: 500 }
    );
  }
}
