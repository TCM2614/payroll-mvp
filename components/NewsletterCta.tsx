"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface NewsletterProps {
  source: string;
  headline?: string;
  sub?: string;
}

export function NewsletterCta({
  source,
  headline = "Get the UK Money Brief",
  sub = "Tax changes, salary insights and simple ways to understand more of your income. No spam.",
}: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (!res.ok) throw new Error("Signup failed");
      trackEvent("newsletter_signup", { newsletter_source: source });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100">
        <p className="font-semibold">You&apos;re on the list.</p>
        <p className="mt-1 text-sm">
          We&apos;ll only email you when we have something worth reading — tax
          changes, salary insights, and better ways to understand your money.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
      aria-label="Newsletter signup"
    >
      <p className="text-lg font-semibold">{headline}</p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{sub}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Email address</span>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {status === "submitting" ? "Adding…" : "Get the brief"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        We&apos;ll never sell your email. Unsubscribe any time.
      </p>
    </form>
  );
}
