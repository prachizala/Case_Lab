import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/session";
import { tokenUsageTracker } from "@/lib/groq/tracking";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Allow all authenticated users (students, faculty, admin) to read breakdown
  const auth = await authenticateUser(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || undefined;

    // Only administrators are authorized to see per-user breakdown
    const isAdmin = auth.user?.role === "admin";

    const breakdown = tokenUsageTracker.getBreakdown(period, isAdmin);

    return NextResponse.json(breakdown, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
