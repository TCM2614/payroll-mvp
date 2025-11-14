import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { getSimpleWelcomeEmailTemplate, getNotificationEmailTemplate } from "@/lib/email-templates";
import { logError, logInfo, logWarn } from "@/lib/logger";

export const runtime = "nodejs"; // keep this

const bodySchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
});

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logWarn("Resend API key missing", { endpoint: "/api/early-access" });
    return NextResponse.json({ ok: false, error: "Email config missing" });
  }

  const resend = new Resend(apiKey);

  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const businessEmail = process.env.BUSINESS_EMAIL;

  if (!fromEmail) {
    logWarn("Resend FROM email missing", { endpoint: "/api/early-access" });
    return NextResponse.json({ ok: false, error: "Email config missing" });
  }

  try {
    const json = await req.json();
    const { email, source } = bodySchema.parse(json);

    logInfo("Early access signup request", { email, source: source || "unknown" });

    // 1) Notify you
    if (businessEmail) {
      try {
        const notificationTemplate = getNotificationEmailTemplate({ signupEmail: email, source });
        await resend.emails.send({
          from: fromEmail,
          to: businessEmail,
          subject: notificationTemplate.subject,
          text: notificationTemplate.text,
        });
        logInfo("Notification email sent", { to: businessEmail });
      } catch (emailError) {
        logError("Failed to send notification email", emailError, { to: businessEmail });
        // Don't fail the request if notification fails
      }
    }

    // 2) Welcome email to user
    try {
      const welcomeTemplate = getSimpleWelcomeEmailTemplate();
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: welcomeTemplate.subject,
        text: welcomeTemplate.text,
      });
      logInfo("Welcome email sent", { to: email });
    } catch (emailError) {
      logError("Failed to send welcome email", emailError, { to: email });
      // Don't fail the request if welcome email fails
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    logError("Early access signup error", err, { endpoint: "/api/early-access" });
    const message =
      err?.issues?.[0]?.message ??
      err?.message ??
      "Something went wrong. Please try again.";

    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
