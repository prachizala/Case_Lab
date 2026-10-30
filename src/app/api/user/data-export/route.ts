import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (auth.errorResponse) return auth.errorResponse;
    const sessionUser = auth.user!;

    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get("userId");

    // Only allow querying own data unless admin
    const userId = sessionUser.role === "admin" && requestedUserId ? requestedUserId : sessionUser.id;

    const exportData = mockStore.exportUserData(userId);
    const jsonString = JSON.stringify(exportData, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="sbs-caselab-dpdp-export-${userId}-${Date.now()}.json"`,
      },
    });
  } catch (err: unknown) {
    console.error("DPDP Data Export error:", err);
    return NextResponse.json(
      { error: "Failed to generate DPDP personal data export." },
      { status: 500 }
    );
  }
}
