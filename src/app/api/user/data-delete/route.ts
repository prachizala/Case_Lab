import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser, clearSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (auth.errorResponse) return auth.errorResponse;
    const sessionUser = auth.user!;

    const body = await req.json();
    const { confirmErasure } = body;

    if (!confirmErasure) {
      return NextResponse.json(
        {
          error:
            "Data erasure requires explicit confirmation under Section 12 of the DPDP Act 2023.",
        },
        { status: 400 }
      );
    }

    const userId = sessionUser.id;
    const res = mockStore.deleteUserData(
      userId,
      userId,
      sessionUser.email
    );

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      message:
        "Account and associated personal records permanently erased under DPDP Act 2023 compliance.",
    });

    clearSessionCookie(response);
    return response;
  } catch (err: unknown) {
    console.error("DPDP Data Delete error:", err);
    return NextResponse.json(
      { error: "Failed to execute DPDP erasure request." },
      { status: 500 }
    );
  }
}
