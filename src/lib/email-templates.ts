/**
 * TypeScript-safe email templates
 * Centralized email content for consistency and type safety
 */

export interface EmailTemplateData {
  email: string;
  source?: string;
}

export interface WelcomeEmailData extends EmailTemplateData {
  name?: string;
}

export interface NotificationEmailData {
  signupEmail: string;
  source?: string;
}

/**
 * Welcome email template for early access signups
 */
export function getWelcomeEmailTemplate(data: WelcomeEmailData): {
  subject: string;
  text: string;
  html: string;
} {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
  const businessEmail = process.env.BUSINESS_EMAIL || "uktakehomecalculator.proton.me";

  const subject = "Welcome to UK Take-Home Calculator Early Access";

  const text = [
    "Thanks for joining the early access list.",
    "",
    "We'll email you when new features go live, including dashboards, multi-scenario comparisons, and expense tracking.",
    "",
    "You can unsubscribe at any time from any email we send.",
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
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

  return { subject, text, html };
}

/**
 * Notification email template for business owner
 */
export function getNotificationEmailTemplate(data: NotificationEmailData): {
  subject: string;
  text: string;
} {
  const subject = "New early access signup";
  const text = `New early access signup: ${data.signupEmail}${data.source ? `\nSource: ${data.source}` : ""}`;

  return { subject, text };
}

/**
 * Simple welcome email template (for /api/early-access)
 */
export function getSimpleWelcomeEmailTemplate(): {
  subject: string;
  text: string;
} {
  const subject = "Welcome to UK Take-Home Calculator Early Access";
  const text = [
    "Thanks for joining the early access list.",
    "",
    "We'll email you when new features go live, including dashboards, multi-scenario comparisons, and expense tracking.",
    "",
    "You can unsubscribe at any time from any email we send.",
  ].join("\n");

  return { subject, text };
}

