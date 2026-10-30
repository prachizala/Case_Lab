import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { mockStore } from "@/lib/mock-db";
import { SubscriptionPlan } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header." },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "test_webhook_secret_key";
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    // Cryptographic signature check
    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: "Invalid webhook signature: Cryptographic hash verification failed." },
        { status: 400 }
      );
    }

    // Parse valid payload
    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id || event.payload?.order?.entity?.id;
      const paymentId = payment?.id;
      const notes = payment?.notes || event.payload?.order?.entity?.notes || {};
      const userId = notes.userId;
      const plan = (notes.plan as SubscriptionPlan) || "yearly";

      if (userId) {
        // Idempotent subscription activation
        mockStore.createOrUpdateSubscription(
          userId,
          plan,
          paymentId || `pay_wh_${Date.now()}`,
          orderId || `ord_wh_${Date.now()}`,
          signature
        );
      }
    }

    return NextResponse.json({ status: "ok", received: true });
  } catch (err: unknown) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing failure." },
      { status: 500 }
    );
  }
}
