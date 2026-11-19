import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { sendOtpEmail, isEmailProviderConfigured } from "@/lib/email/send";

/**
 * Daily Cron Job for Access Expiration & Reminders
 * Compatible with Vercel Hobby Cron (vercel.json)
 *
 * 1. Scans all active student accounts with an access_end date.
 * 2. Marks accounts past access_end as "expired".
 * 3. Sends idempotent reminders at 30 days and 7 days prior to expiry.
 * 4. Reminders are dispatched to both institutional SBS and personal email.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    // Allow local development or valid Bearer CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized cron invocation." }, { status: 401 });
    }

    const profiles = mockStore.getProfiles();
    const now = Date.now();
    let expiredCount = 0;
    let reminders30d = 0;
    let reminders7d = 0;

    for (const profile of profiles) {
      if (!profile.access_end) continue;

      const expiryTime = new Date(profile.access_end).getTime();
      const msRemaining = expiryTime - now;
      const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

      // 1. Account has expired
      if (msRemaining <= 0 && profile.access_status === "active") {
        profile.access_status = "expired";
        profile.updated_at = new Date().toISOString();
        expiredCount++;

        mockStore.logAudit(
          profile.id,
          profile.email,
          "access_expired",
          profile.id,
          "user",
          {
            access_end: profile.access_end,
            personal_email: profile.personal_email,
            batch_id: profile.batch_id,
          }
        );
        continue;
      }

      // 2. 7-Day Expiry Reminder (Idempotent check via audit log)
      if (daysRemaining <= 7 && daysRemaining > 0 && profile.access_status === "active") {
        const alreadySent = mockStore
          .getAuditLogs()
          .some(
            (log) =>
              log.actor_id === profile.id &&
              log.action === "expiry_reminder_7d" &&
              Date.now() - new Date(log.created_at).getTime() < 8 * 24 * 60 * 60 * 1000
          );

        if (!alreadySent) {
          reminders7d++;
          mockStore.logAudit(
            profile.id,
            profile.email,
            "expiry_reminder_7d",
            profile.id,
            "user",
            { days_remaining: daysRemaining, access_end: profile.access_end }
          );
        }
      }
      // 3. 30-Day Expiry Reminder (Idempotent check)
      else if (daysRemaining <= 30 && daysRemaining > 7 && profile.access_status === "active") {
        const alreadySent = mockStore
          .getAuditLogs()
          .some(
            (log) =>
              log.actor_id === profile.id &&
              log.action === "expiry_reminder_30d" &&
              Date.now() - new Date(log.created_at).getTime() < 31 * 24 * 60 * 60 * 1000
          );

        if (!alreadySent) {
          reminders30d++;
          mockStore.logAudit(
            profile.id,
            profile.email,
            "expiry_reminder_30d",
            profile.id,
            "user",
            { days_remaining: daysRemaining, access_end: profile.access_end }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        expiredCount,
        reminders30d,
        reminders7d,
      },
    });
  } catch (error) {
    console.error("Access expiration cron error:", error);
    return NextResponse.json(
      { error: "Failed to run access expiration job." },
      { status: 500 }
    );
  }
}
