import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { mockStore } from "@/lib/mock-db";
import { SubscriptionPlan } from "@/lib/types";
import { authenticateUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sub = mockStore.getUserSubscription(user.id);
    return NextResponse.json({
      success: true,
      subscription: sub || null,
    });
  } catch (err: unknown) {
    console.error("Payment status check error:", err);
    return NextResponse.json({ error: "Failed to fetch subscription status." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      orderId,
      paymentId,
      signature,
      plan,
      simulateFailure,
      isDemo,
    } = body;

    if (!orderId || !paymentId || !plan) {
      return NextResponse.json(
        { error: "orderId, paymentId, and plan are mandatory." },
        { status: 400 }
      );
    }

    if (simulateFailure) {
      return NextResponse.json(
        { success: false, error: "Simulated payment failure: Transaction declined by bank." },
        { status: 400 }
      );
    }

    const isDemoAllowed = process.env.DEMO_PAYMENTS === "true" && process.env.NODE_ENV !== "production";

    if (isDemo) {
      if (!isDemoAllowed) {
        return NextResponse.json(
          {
            success: false,
            error: "Demo payments are disabled in this environment. Live payment gateway signature required.",
          },
          { status: 403 }
        );
      }
      // Demo payments allowed in non-production
    } else {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return NextResponse.json(
          {
            success: false,
            error: "Razorpay payment processing is unconfigured on server (missing RAZORPAY_KEY_SECRET).",
          },
          { status: 500 }
        );
      }

      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      // Verify signature
      if (!signature || signature !== generatedSignature) {
        return NextResponse.json(
          {
            success: false,
            error: "Payment verification failed: Cryptographic signature mismatch.",
          },
          { status: 400 }
        );
      }
    }

    // Valid payment - activate subscription idempotently!
    const sub = mockStore.createOrUpdateSubscription(
      user.id,
      plan as SubscriptionPlan,
      paymentId,
      orderId,
      signature || `sig_demo_${Date.now()}`
    );

    return NextResponse.json({
      success: true,
      message: "Subscription successfully verified and activated.",
      subscription: sub,
    });
  } catch (err: unknown) {
    console.error("Payment verification error:", err);
    return NextResponse.json(
      { error: "Payment verification process encountered an internal error." },
      { status: 500 }
    );
  }
}
