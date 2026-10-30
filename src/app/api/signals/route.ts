import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const industry = searchParams.get("industry") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;

    const signals = mockStore.getSignals(industry, limit);
    const watchIndustries = mockStore.getWatchIndustries(user.id);

    return NextResponse.json(
      {
        success: true,
        signals,
        watchIndustries,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch signals:", error);
    return NextResponse.json(
      { error: "Failed to fetch Case Signals." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { industries } = body;

    if (!Array.isArray(industries)) {
      return NextResponse.json(
        { error: "Industries must be an array of strings (max 8)." },
        { status: 400 }
      );
    }

    const updated = mockStore.setWatchIndustries(user.id, industries);

    return NextResponse.json({
      success: true,
      message: `Watch industries updated (${updated.length}/8).`,
      watchIndustries: updated,
    });
  } catch (error) {
    console.error("Failed to update watch industries:", error);
    return NextResponse.json(
      { error: "Failed to update watch industries." },
      { status: 500 }
    );
  }
}
