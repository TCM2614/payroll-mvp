/**
 * Email utilities using Resend
 * Sends welcome emails to new signups
 */

type WelcomeEmailData = {
  to: string;
  name?: string;
  source?: string;
};

/**
 * Send welcome email via Resend
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com";
  const businessEmail = process.env.BUSINESS_EMAIL || "uktakehomecalculator.proton.me";

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Email] Would send welcome email to:", data.to);
      return;
    }
    // In production without API key, fail silently (don't break signup)
    console.warn("[Email] RESEND_API_KEY not configured, skipping email");
    return;
  }

  try {
    // Use Resend API directly via fetch (works in Edge runtime)
    const emailHtml = getWelcomeEmailTemplate(data, businessEmail);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `UK Take-Home Calculator <${fromEmail}>`,
        to: data.to,
        reply_to: businessEmail,
        subject: "Welcome to Early Access – You're on the 50% Lifetime Discount List! 🎉",
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }
  } catch (error) {
    console.error("[Email] Failed to send welcome email:", error);
    // Don't throw - email failure shouldn't break signup
  }
}

/**
 * Welcome email HTML template
 */
function getWelcomeEmailTemplate(data: WelcomeEmailData, businessEmail: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Early Access</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
      Thanks for joining early access! 🎉
    </h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
    <h2 style="color: #111827; margin-top: 0; font-size: 22px; font-weight: 600;">
      Here's what to expect
    </h2>
    <ul style="color: #374151; padding-left: 20px; line-height: 1.8;">
      <li><strong>Early feature previews:</strong> Be the first to test new calculators and dashboard features</li>
      <li><strong>Tax year updates:</strong> Get notified when new tax years (2026/27, etc.) are added</li>
      <li><strong>Product updates:</strong> Occasional emails about new tools and improvements</li>
      <li><strong>No spam:</strong> We only send product-related emails, and you can unsubscribe anytime</li>
    </ul>
  </div>

  <div style="background: #fef3c7; border: 2px solid #fbbf24; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
    <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 600;">
      🎁 You're on the 50% Lifetime Discount List
    </h2>
    <p style="color: #78350f; margin: 0; line-height: 1.7;">
      As an early access member, you'll receive a <strong>50% lifetime discount</strong> on any premium features we launch. 
      This discount code will be sent to you when premium features become available.
    </p>
  </div>

  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 14px; margin: 0;">
      Questions? Reply to this email or contact us at <a href="mailto:${businessEmail}" style="color: #10b981; text-decoration: none;">${businessEmail}</a>
    </p>
    <p style="color: #9ca3af; font-size: 12px; margin-top: 15px;">
      <a href="${siteUrl}/privacy" style="color: #9ca3af; text-decoration: underline;">Privacy Policy</a>
    </p>
  </div>
</body>
</html>
  `.trim();
}

