import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateUser(req, ["faculty", "admin"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(req.url);
    const thresholdParam = searchParams.get("threshold");
    const targetThreshold = thresholdParam ? Number(thresholdParam) : 60;

    const analytics = mockStore.getFacultyAnalytics();
    const attainment = mockStore.calculateCOPOAttainment(targetThreshold);

    return NextResponse.json({
      success: true,
      analytics,
      attainment,
      targetThreshold,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to assemble faculty analytics." },
      { status: 500 }
    );
  }
}
