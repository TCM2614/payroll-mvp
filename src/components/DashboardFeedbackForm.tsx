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
          className={`text-xs font-medium ${isLight ? "text-slate-700" : "text-slate-200"}`}
        >
          Email address (optional but helpful)
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          className={`w-full h-10 rounded-lg border px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            isLight
              ? "border-slate-300 bg-white text-slate-900"
              : "border-slate-600 bg-slate-900/80 text-slate-50"
          }`}
        />
        <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          We&apos;ll only use this to send you updates about the dashboard and calculator.
        </p>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="feedback"
          className={`text-xs font-medium ${isLight ? "text-slate-700" : "text-slate-200"}`}
        >
          What would you like this dashboard to do?
        </label>
        <textarea
          id="feedback"
          name="feedback"
          rows={4}
          placeholder="For example: compare two salaries, track my PAYE over the year, export a PDF for my accountant..."
          className={`w-full rounded-lg border px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
            isLight
              ? "border-slate-300 bg-white text-slate-900"
              : "border-slate-600 bg-slate-900/80 text-slate-50"
          }`}
          required
        />
        <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          The more specific you can be, the better we can design it.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? "Submitting..." : "Submit feedback"}
        </button>
        {showLinkToCalculator && (
          <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Or go back to the{" "}
            <Link
              href="/calc"
              className={`underline ${isLight ? "text-indigo-600 hover:text-indigo-700" : "decoration-indigo-400 text-indigo-400 hover:text-indigo-300"}`}
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

