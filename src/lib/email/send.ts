/**
 * Email Provider Delivery Wrapper
 * Supports transactional email delivery (e.g. Resend) for OTPs and notifications.
 */

export interface SendOtpEmailParams {
  to: string;
  otp: string;
  userName?: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Checks if a live email delivery provider is configured.
 */
export function isEmailProviderConfigured(): boolean {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY || process.env.RESEND_API_KEY;
  return Boolean(apiKey && apiKey.trim().length > 0 && !apiKey.includes("placeholder"));
}

/**
 * Sends a 6-digit verification code by email.
 * Never logs or prints the OTP in production.
 */
export async function sendOtpEmail({
  to,
  otp,
  userName,
}: SendOtpEmailParams): Promise<EmailDeliveryResult> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY || process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "SBS CaseLab <onboarding@resend.dev>";

  if (!apiKey || apiKey.trim().length === 0 || apiKey.includes("placeholder")) {
    return {
      success: false,
      error: "EMAIL_PROVIDER_NOT_CONFIGURED",
    };
  }

  try {
    const greeting = userName ? `Hello ${userName},` : "Hello,";
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF;">
        <h2 style="color: #0A1128; margin-top: 0;">SBS CaseLab Verification</h2>
        <p style="color: #4A5568; font-size: 14px; line-height: 1.6;">${greeting}</p>
        <p style="color: #4A5568; font-size: 14px; line-height: 1.6;">Please use the 6-digit verification code below to verify your account. This code expires in 10 minutes and is single-use.</p>
        <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
          <span style="font-family: Courier, monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0A1128;">${otp}</span>
        </div>
        <p style="color: #718096; font-size: 12px; line-height: 1.5;">If you did not request this verification code, please ignore this email or contact your institution administrator.</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
        <p style="color: #A0AEC0; font-size: 11px; text-align: center; margin-bottom: 0;">Shanti Business School â€¢ Pedagogical Case Generation Platform</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: "Your SBS CaseLab Verification Code",
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return {
        success: false,
        error: `Provider delivery failed (${res.status}): ${errBody.slice(0, 100)}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      messageId: data?.id,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown email dispatch failure";
    return {
      success: false,
      error: msg,
    };
  }
}
