import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/session";
import { mockStore } from "@/lib/mock-db";

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    const body = await req.json().catch(() => ({}));
    const targetUserId = auth.user?.id || body.userId;

    if (!targetUserId) {
      return NextResponse.json({ error: "Unauthorized or missing user identification." }, { status: 401 });
    }

    const profile = mockStore.getProfile(targetUserId);
    if (!profile) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const withdrawnAt = new Date().toISOString();
    mockStore.updateProfile(profile.id, {
      dpdp_consent: false,
      consent_withdrawn_at: withdrawnAt,
    });

    mockStore.logAudit(
      profile.id,
      profile.email,
      "data_erasure",
      profile.id,
      "user",
      {
        action: "consent_withdrawn",
        statutory_basis: "DPDP Act 2023 Section 6(6)",
        timestamp: withdrawnAt,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Statutory consent under DPDP Act 2023 has been withdrawn. Active data processing is suspended.",
      consent_withdrawn_at: withdrawnAt,
    });
  } catch (err) {
    console.error("Consent withdrawal error:", err);
    return NextResponse.json({ error: "Failed to process consent withdrawal." }, { status: 500 });
  }
}
