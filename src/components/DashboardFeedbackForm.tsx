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
          className={`block text-sm font-medium ${isLight ? "text-slate-700" : "text-navy-100"}`}
        >
          Email address (optional but helpful)
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          className={`w-full rounded-xl border px-4 py-3 text-sm placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-brilliant-400/30 focus:border-transparent ${
            isLight
              ? "border-slate-300 bg-white text-slate-900 focus:border-brilliant-400"
              : "border-sea-jet-600/40 bg-sea-jet-800/60 text-navy-50 focus:border-brilliant-400"
          }`}
        />
        <p className={`text-xs ${isLight ? "text-slate-500" : "text-navy-200"}`}>
          We&apos;ll only use this to send you updates about the dashboard and calculator.
        </p>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="feedback"
          className={`block text-sm font-medium ${isLight ? "text-slate-700" : "text-navy-100"}`}
        >
          What would you like this dashboard to do?
        </label>
        <textarea
          id="feedback"
          name="feedback"
          rows={4}
          placeholder="For example: compare two salaries, track my PAYE over the year, export a PDF for my accountant..."
          className={`w-full rounded-xl border px-4 py-3 text-sm placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-brilliant-400/30 focus:border-transparent resize-none ${
            isLight
              ? "border-slate-300 bg-white text-slate-900 focus:border-brilliant-400"
              : "border-sea-jet-600/40 bg-sea-jet-800/60 text-navy-50 focus:border-brilliant-400"
          }`}
          required
        />
        <p className={`text-xs ${isLight ? "text-slate-500" : "text-navy-200"}`}>
          The more specific you can be, the better we can design it.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "submitting"}
          className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold shadow-lg transition focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isLight
              ? "bg-brilliant-500 text-white shadow-brilliant-500/30 hover:bg-brilliant-600 focus:ring-brilliant-400"
              : "bg-brilliant-500 text-white shadow-brilliant-500/30 hover:bg-brilliant-600 focus:ring-brilliant-400"
          }`}
        >
          {status === "submitting" ? "Submitting..." : "Submit feedback"}
        </button>
        {showLinkToCalculator && (
          <p className={`text-xs ${isLight ? "text-slate-500" : "text-navy-300"}`}>
            Or go back to the{" "}
            <Link
              href="/calc"
              className={`underline transition-colors ${isLight ? "text-brilliant-600 hover:text-brilliant-700" : "text-ethereal-300 hover:text-ethereal-200"}`}
            >
              main calculator
            </Link>
            .
          </p>
        )}
      </div>

      {/* Status messages */}
      {status === "success" && (
        <p className={`text-[11px] ${isLight ? "text-brilliant-600" : "text-ethereal-300"}`}>
          Thanks — your feedback has been sent.
        </p>
      )}
      {status === "error" && (
        <p className={`text-[11px] ${isLight ? "text-rose-600" : "text-aqua-300"}`}>
          Something went wrong sending your feedback. Please try again later.
        </p>
      )}
    </form>
  );
}

