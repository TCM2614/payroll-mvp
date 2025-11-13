"use client";

import * as React from "react";
import Link from "next/link";

interface DashboardFeedbackFormProps {
  variant?: "light" | "dark";
  showLinkToCalculator?: boolean;
}

export default function DashboardFeedbackForm({
  variant = "light",
  showLinkToCalculator = false,
}: DashboardFeedbackFormProps) {
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const feedback = String(formData.get("feedback") || "");

    if (!feedback.trim()) {
      setStatus("error");
      return;
    }

    try {
      setStatus("submitting");
      const response = await fetch("/api/dashboard-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, feedback }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setStatus("success");
      event.currentTarget.reset();
    } catch (e) {
      setStatus("error");
    }
  }

  const isLight = variant === "light";

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <label
          htmlFor="email"
          className={`block text-sm font-medium ${isLight ? "text-slate-700" : "text-white/90"}`}
        >
          Email address (optional but helpful)
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          className={`w-full rounded-xl border px-4 py-3 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent ${
            isLight
              ? "border-slate-300 bg-white text-slate-900 focus:border-emerald-400"
              : "border-white/15 bg-black/40 text-white focus:border-emerald-400"
          }`}
        />
        <p className={`text-xs ${isLight ? "text-slate-500" : "text-white/70"}`}>
          We&apos;ll only use this to send you updates about the dashboard and calculator.
        </p>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="feedback"
          className={`block text-sm font-medium ${isLight ? "text-slate-700" : "text-white/90"}`}
        >
          What would you like this dashboard to do?
        </label>
        <textarea
          id="feedback"
          name="feedback"
          rows={4}
          placeholder="For example: compare two salaries, track my PAYE over the year, export a PDF for my accountant..."
          className={`w-full rounded-xl border px-4 py-3 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent resize-none ${
            isLight
              ? "border-slate-300 bg-white text-slate-900 focus:border-emerald-400"
              : "border-white/15 bg-black/40 text-white focus:border-emerald-400"
          }`}
          required
        />
        <p className={`text-xs ${isLight ? "text-slate-500" : "text-white/70"}`}>
          The more specific you can be, the better we can design it.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "submitting"}
          className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold shadow-lg transition focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isLight
              ? "bg-emerald-500 text-black shadow-emerald-500/30 hover:bg-emerald-400 focus:ring-emerald-400"
              : "bg-emerald-500 text-black shadow-emerald-500/30 hover:bg-emerald-400 focus:ring-emerald-400"
          }`}
        >
          {status === "submitting" ? "Submitting..." : "Submit feedback"}
        </button>
        {showLinkToCalculator && (
          <p className={`text-xs ${isLight ? "text-slate-500" : "text-white/60"}`}>
            Or go back to the{" "}
            <Link
              href="/calc"
              className={`underline transition-colors ${isLight ? "text-indigo-600 hover:text-indigo-700" : "text-white/60 hover:text-white/90"}`}
            >
              main calculator
            </Link>
            .
          </p>
        )}
      </div>

      {/* Status messages */}
      {status === "success" && (
        <p className={`text-[11px] ${isLight ? "text-emerald-600" : "text-emerald-400"}`}>
          Thanks — your feedback has been sent.
        </p>
      )}
      {status === "error" && (
        <p className={`text-[11px] ${isLight ? "text-rose-600" : "text-rose-400"}`}>
          Something went wrong sending your feedback. Please try again later.
        </p>
      )}
    </form>
  );
}

