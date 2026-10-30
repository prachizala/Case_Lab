import { NextRequest, NextResponse } from "next/server";
import { SubscriptionPlan } from "@/lib/types";
import { COLLEGE_NAME_WITH_SHORT } from "@/config/college";
import { authenticateUser } from "@/lib/session";

const PLAN_PRICING: Record<SubscriptionPlan, { amountPaise: number; label: string }> = {
  monthly: { amountPaise: 9900, label: "Continuing Education Monthly (₹99)" },
  yearly: { amountPaise: 60000, label: "Continuing Education Annual (₹600)" },
  lifetime: { amountPaise: 250000, label: "Alumni Lifetime Fellowship (₹2,500)" },
};

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateUser(req);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { plan } = body;

    if (!plan || !PLAN_PRICING[plan as SubscriptionPlan]) {
      return NextResponse.json(
        { error: "Invalid subscription plan selected. Must be monthly, yearly, or lifetime." },
        { status: 400 }
      );
    }

    const planConfig = PLAN_PRICING[plan as SubscriptionPlan];
    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_51H8gAbcDef123";

    return NextResponse.json({
      success: true,
      orderId,
      amount: planConfig.amountPaise,
      currency: "INR",
      plan,
      label: planConfig.label,
      keyId,
      notes: {
        userId: user.id,
        plan,
        institution: COLLEGE_NAME_WITH_SHORT,
      },
    });
  } catch (err: unknown) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { error: "Failed to create payment order." },
      { status: 500 }
    );
  }
}
