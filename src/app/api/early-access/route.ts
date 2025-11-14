// app/api/early-access/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

export const runtime = "nodejs"; // email not latency-critical

const resend = new Resend(process.env.RESEND_API_KEY);

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email } = bodySchema.parse(json);

    // 1) Notify you (so you can track signups)
    if (process.env.BUSINESS_EMAIL && process.env.RESEND_FROM_EMAIL) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: process.env.BUSINESS_EMAIL,
        subject: "New early access signup",
        text: `New early access signup: ${email}`,
      });
    }

    // 2) Send welcome email to the user
    if (process.env.RESEND_FROM_EMAIL) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: email,
        subject: "Welcome to UK Take-Home Calculator Early Access",
        text:
          "Thanks for joining the early access list.\n\n" +
          "We'll email you when new features go live, including dashboards, multi-scenario comparison and expense tracking.\n\n" +
          "You can unsubscribe at any time from any email we send.",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message =
      err?.issues?.[0]?.message ??
      err?.message ??
      "Something went wrong. Please try again.";

    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

