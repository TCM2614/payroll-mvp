"use client";

import { useState } from "react";

interface EmailSignupSectionProps {
  onSuccess?: () => void;
}

export default function EmailSignupSection({
  onSuccess,
}: EmailSignupSectionProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] =
    useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // reset UI state
    setError(null);
    setStatus("submitting");

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, consent: true, source: "landing_page" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sign up");
      }

      // Track email signup goal
      if (typeof window !== "undefined" && (window as any).plausible) {
        (window as any).plausible("email_signup", { props: { source: "landing_page" } });
      }

      setStatus("success");
      setEmail("");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setStatus("idle"); // back to idle, we show error message separately
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <section className="mx-auto mt-10 w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-xl">
      <h2 className="text-lg font-semibold tracking-tight">
        Join the Early Access List
      </h2>

      <p className="mt-1 text-sm text-white/70">
        Get new feature previews, tips and priority access to advanced
        contractor tools.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={status === "submitting"}
          className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-0"
        >
          {status === "submitting" ? "Joining..." : "Join early access"}
        </button>
      </form>

      {status === "success" && (
        <p className="mt-2 text-xs text-emerald-400">
          You&apos;re on the list. We&apos;ll email you when new features go live.
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-rose-400">
          {error}
        </p>
      )}

      <p className="mt-4 text-[11px] text-white/50">
        Unsubscribe anytime. We respect your data.
      </p>
    </section>
  );
}
