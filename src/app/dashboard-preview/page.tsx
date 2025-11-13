"use client";

import * as React from "react";
import Link from "next/link";

export default function DashboardPreviewPage() {
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const feedback = String(formData.get("feedback") || "");

    if (!feedback.trim()) {
      // require at least some feedback text
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

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 relative overflow-hidden">
      {/* Background blur / gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-indigo-500/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />
      </div>

      {/* Content wrapper */}
      <div className="flex items-center justify-center px-3 py-10 sm:px-4 md:px-6">
        <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md shadow-xl space-y-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-50">
            Dashboard coming soon
          </h1>
          <p className="text-sm text-slate-200/80">
            We&apos;re building a dashboard to let you compare scenarios, track your take-home
            over time and spot tax changes at a glance. Tell us what you&apos;d like to see and
            we&apos;ll use your feedback to shape the roadmap.
          </p>
          <p className="text-[11px] text-slate-400">
            You can already use the calculator tabs to explore Standard PAYE, Umbrella,
            Limited and Periodic analysis. The dashboard will bring these together into a
            single, visual view.
          </p>

          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-medium text-slate-200">
                Email address (optional but helpful)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                className="w-full h-10 rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-[11px] text-slate-400">
                We&apos;ll only use this to send you updates about the dashboard and calculator.
              </p>
            </div>

            <div className="space-y-1">
              <label htmlFor="feedback" className="text-xs font-medium text-slate-200">
                What would you like this dashboard to do?
              </label>
              <textarea
                id="feedback"
                name="feedback"
                rows={4}
                placeholder="For example: compare two salaries, track my PAYE over the year, export a PDF for my accountant..."
                className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-[11px] text-slate-400">
                The more specific you can be, the better we can design it.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? "Submitting..." : "Submit feedback"}
              </button>
              <p className="text-[11px] text-slate-400">
                Or go back to the{" "}
                <Link href="/calc" className="underline decoration-indigo-400 text-indigo-400 hover:text-indigo-300">
                  main calculator
                </Link>
                .
              </p>
            </div>
          </form>

          {/* Status messages */}
          {status === "success" && (
            <p className="text-[11px] text-emerald-400">
              Thanks — your feedback has been sent.
            </p>
          )}
          {status === "error" && (
            <p className="text-[11px] text-rose-400">
              Something went wrong sending your feedback. Please try again later.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
