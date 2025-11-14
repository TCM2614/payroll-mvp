import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

export const runtime = "nodejs"; // keep this

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  // ✅ Read env vars at runtime, not build time
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const businessEmail = process.env.BUSINESS_EMAIL;

  if (!apiKey || !fromEmail) {
    console.error("Resend API key or FROM email missing");
    return NextResponse.json(
      { ok: false, error: "Email configuration missing" },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  try {
    const json = await req.json();
    const { email } = bodySchema.parse(json);

    // 1) Notify you
    if (businessEmail) {
      await resend.emails.send({
        from: fromEmail,
        to: businessEmail,
        subject: "New early access signup",
        text: `New early access signup: ${email}`,
      });
    }

    // 2) Welcome email to user
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Welcome to UK Take-Home Calculator Early Access",
      text:
        "Thanks for joining the early access list.\n\n" +
        "We'll email you when new features go live, " +
        "including dashboards, multi-scenario comparisons, and expense tracking.\n\n" +
        "You can unsubscribe at any time from any email we send.",
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("early-access error", err);
    const message =
      err?.issues?.[0]?.message ??
      err?.message ??
      "Something went wrong. Please try again.";

    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
