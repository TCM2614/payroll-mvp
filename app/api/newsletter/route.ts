import { NextResponse } from "next/server";

/**
 * Newsletter signup endpoint.
 *
 * This deliberately does not integrate with a specific ESP. When credentials
 * for a real provider are configured (e.g. `RESEND_API_KEY`, `LOOPS_API_KEY`,
 * `MAILERLITE_API_KEY`), swap the body of this handler.
 *
 * Until then the endpoint accepts submissions and returns 200 so front‑end
 * signup UX works out of the box; captured emails are logged (at info level)
 * so operators can see interest without any PII leaving the box.
 *
 * See docs/growth/manual-actions.md for the checklist.
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: { email?: string; source?: string };
  try {
    body = (await request.json()) as { email?: string; source?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const source = String(body.source ?? "unknown");
  if (!emailRegex.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  // Storage is intentionally out‑of‑band. Once an ESP is wired, call it here.
  // For now we emit a structured log so the server operator can audit demand
  // without persisting PII in application state.
  console.info("[newsletter] pending_signup", {
    // Never log the raw email in production analytics; a hash keeps signals
    // useful for de‑duplication without leaking PII.
    email_hash: await sha256(email),
    source,
    ts: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
