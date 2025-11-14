"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    if (!email.trim()) {
      return;
    }

    try {
      setStatus("submitting");
      // TODO: Hook this up to email provider / API
      await fetch("/api/dashboard-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, feedback: message }),
      });
      setStatus("success");
      setEmail("");
      setMessage("");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-8rem)]">
      {/* Blurred dashboard backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Soft gradient (matches welcome page) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(34,197,94,0.16),_transparent_55%)]" />

        {/* Fake realistic dashboard grid - blurred */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 scale-110 blur-3xl sm:block">
          <div className="grid grid-cols-4 gap-4 opacity-30">
            {/* KPI Cards */}
            <div className="h-32 w-48 rounded-3xl border border-brand-border/40 bg-brand-surface/70 p-4">
              <div className="h-2 w-16 rounded-full bg-brand-textMuted/30 mb-3" />
              <div className="h-6 w-24 rounded bg-brand-textMuted/20 mb-2" />
              <div className="h-3 w-32 rounded bg-brand-textMuted/10" />
            </div>
            <div className="h-32 w-48 rounded-3xl border border-brand-border/40 bg-brand-surface/60 p-4">
              <div className="h-2 w-16 rounded-full bg-brand-textMuted/30 mb-3" />
              <div className="h-6 w-24 rounded bg-brand-textMuted/20 mb-2" />
              <div className="h-3 w-32 rounded bg-brand-textMuted/10" />
            </div>
            <div className="h-32 w-48 rounded-3xl border border-brand-border/40 bg-brand-surface/50 p-4">
              <div className="h-2 w-16 rounded-full bg-brand-textMuted/30 mb-3" />
              <div className="h-6 w-24 rounded bg-brand-textMuted/20 mb-2" />
              <div className="h-3 w-32 rounded bg-brand-textMuted/10" />
            </div>
            <div className="h-32 w-48 rounded-3xl border border-brand-border/40 bg-brand-surface/40 p-4">
              <div className="h-2 w-16 rounded-full bg-brand-textMuted/30 mb-3" />
              <div className="h-6 w-24 rounded bg-brand-textMuted/20 mb-2" />
              <div className="h-3 w-32 rounded bg-brand-textMuted/10" />
            </div>

            {/* Chart/Table Card - spans 2 columns */}
            <div className="h-48 w-full col-span-2 rounded-3xl border border-brand-border/40 bg-brand-surface/60 p-4">
              <div className="h-2 w-20 rounded-full bg-brand-textMuted/30 mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-brand-textMuted/20" />
                <div className="h-3 w-5/6 rounded bg-brand-textMuted/20" />
                <div className="h-3 w-4/6 rounded bg-brand-textMuted/20" />
                <div className="h-3 w-3/4 rounded bg-brand-textMuted/20" />
              </div>
            </div>

            {/* Table Card */}
            <div className="h-48 w-full col-span-2 rounded-3xl border border-brand-border/40 bg-brand-surface/50 p-4">
              <div className="h-2 w-24 rounded-full bg-brand-textMuted/30 mb-4" />
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="h-2 w-16 rounded bg-brand-textMuted/20" />
                  <div className="h-2 w-20 rounded bg-brand-textMuted/20" />
                  <div className="h-2 w-12 rounded bg-brand-textMuted/20" />
                </div>
                <div className="flex gap-2">
                  <div className="h-2 w-16 rounded bg-brand-textMuted/15" />
                  <div className="h-2 w-20 rounded bg-brand-textMuted/15" />
                  <div className="h-2 w-12 rounded bg-brand-textMuted/15" />
                </div>
                <div className="flex gap-2">
                  <div className="h-2 w-16 rounded bg-brand-textMuted/15" />
                  <div className="h-2 w-20 rounded bg-brand-textMuted/15" />
                  <div className="h-2 w-12 rounded bg-brand-textMuted/15" />
                </div>
              </div>
            </div>

            {/* Additional smaller cards */}
            <div className="h-24 w-full rounded-3xl border border-brand-border/40 bg-brand-surface/40 p-3">
              <div className="h-2 w-12 rounded-full bg-brand-textMuted/20 mb-2" />
              <div className="h-4 w-20 rounded bg-brand-textMuted/15" />
            </div>
            <div className="h-24 w-full rounded-3xl border border-brand-border/40 bg-brand-surface/35 p-3">
              <div className="h-2 w-12 rounded-full bg-brand-textMuted/20 mb-2" />
              <div className="h-4 w-20 rounded bg-brand-textMuted/15" />
            </div>
            <div className="h-24 w-full rounded-3xl border border-brand-border/40 bg-brand-surface/30 p-3">
              <div className="h-2 w-12 rounded-full bg-brand-textMuted/20 mb-2" />
              <div className="h-4 w-20 rounded bg-brand-textMuted/15" />
            </div>
            <div className="h-24 w-full rounded-3xl border border-brand-border/40 bg-brand-surface/25 p-3">
              <div className="h-2 w-12 rounded-full bg-brand-textMuted/20 mb-2" />
              <div className="h-4 w-20 rounded bg-brand-textMuted/15" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-12 text-center sm:py-20">
        {/* Eyebrow label */}
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-textMuted">
          Insights · Scenarios · History
        </p>

        {/* Hero card with form */}
        <div className="w-full max-w-2xl rounded-3xl border border-brand-border/60 bg-brand-surface/85 p-6 shadow-soft-xl backdrop-blur-xl sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-border/60 bg-brand-bg/80 px-3 py-1 text-[11px] font-medium text-brand-textMuted">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-accent" />
            Dashboard
            <span className="text-brand-text/70">·</span>
            <span className="text-brand-text/80">Coming soon</span>
          </div>

          <header className="space-y-2 mb-6">
            <p className="text-xs uppercase tracking-wide text-brand-textMuted opacity-70">
              Coming soon
            </p>
            <h1 className="text-xl md:text-2xl font-semibold text-brand-text">
              Dashboard: from payslip to plan
            </h1>
            <p className="text-sm md:text-base text-brand-textMuted opacity-80 max-w-2xl">
              A live control panel for your income, expenses and debt – built on the same
              UK take-home engine powering this calculator.
            </p>
          </header>

          <div className="grid gap-4 text-left sm:grid-cols-2 mb-6">
            <section className="rounded-2xl border border-brand-border/60 bg-brand-bg/80 p-4 text-sm space-y-1 shadow-sm">
              <h3 className="font-medium text-brand-text">All your money in one view</h3>
              <p className="text-brand-textMuted opacity-80">
                See PAYE, Umbrella and Limited Company take-home side by side, with clear
                breakdowns for tax, NI, pensions, SIPPs and student loans.
              </p>
            </section>

            <section className="rounded-2xl border border-brand-border/60 bg-brand-bg/80 p-4 text-sm space-y-1 shadow-sm">
              <h3 className="font-medium text-brand-text">Smart expense tracking</h3>
              <ul className="list-disc pl-4 space-y-1 text-brand-textMuted opacity-80">
                <li>Log fixed bills and everyday spending.</li>
                <li>Tag and group categories to see where money leaks.</li>
                <li>Get a "safe to spend" number matched to your net pay.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-brand-border/60 bg-brand-bg/80 p-4 text-sm space-y-1 shadow-sm">
              <h3 className="font-medium text-brand-text">Debt management mode</h3>
              <ul className="list-disc pl-4 space-y-1 text-brand-textMuted opacity-80">
                <li>Add credit cards, loans, overdrafts and BNPL balances.</li>
                <li>Compare Snowball vs Avalanche pay-down strategies.</li>
                <li>See debt-free dates and interest saved based on your income.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-brand-border/60 bg-brand-bg/80 p-4 text-sm space-y-1 shadow-sm">
              <h3 className="font-medium text-brand-text">Strategy engine</h3>
              <ul className="list-disc pl-4 space-y-1 text-brand-textMuted opacity-80">
                <li>Suggests how to adjust expenses, savings and repayments.</li>
                <li>Models changes like new jobs, side income and pension tweaks.</li>
                <li>Turns your payslip into a month-by-month action plan.</li>
              </ul>
            </section>
          </div>

          <p className="text-xs text-brand-textMuted opacity-70 max-w-2xl mb-6">
            This dashboard is built directly on top of the calculator, so your real tax year,
            student loans and pension choices flow into your expense and debt strategy automatically.
          </p>

          {/* Email + Message Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
            <div className="space-y-1">
              <label htmlFor="dashboard-email" className="block text-xs font-medium text-brand-text">
                Email address <span className="text-brand-textMuted">(required)</span>
              </label>
              <input
                type="email"
                id="dashboard-email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-brand-border/60 bg-brand-bg/80 px-3 py-2 text-sm text-brand-text placeholder:text-brand-textMuted focus:outline-none focus:ring-2 focus:ring-brand-primary/70 focus:border-brand-primary/60"
                aria-invalid={status === "error" ? "true" : "false"}
                aria-describedby={status === "error" ? "email-error" : undefined}
              />
              {status === "error" && (
                <p id="email-error" className="text-xs text-brand-danger">
                  Something went wrong. Please try again.
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="dashboard-message" className="block text-xs font-medium text-brand-text">
                Message / feature request <span className="text-brand-textMuted">(optional)</span>
              </label>
              <textarea
                id="dashboard-message"
                name="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What would you like to see in the dashboard?"
                className="w-full rounded-xl border border-brand-border/60 bg-brand-bg/80 px-3 py-2 text-sm text-brand-text placeholder:text-brand-textMuted focus:outline-none focus:ring-2 focus:ring-brand-primary/70 focus:border-brand-primary/60 resize-none"
              />
            </div>

            {/* Submit area */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-brand-textMuted">
                Leave your email to hear when the dashboard goes live or request features.
              </p>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-primarySoft to-brand-primary px-4 py-1.5 text-xs font-medium text-white shadow-soft-xl transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/70 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? "Sending..." : status === "success" ? "Sent!" : "Notify me"}
              </button>
            </div>

            {status === "success" && (
              <p className="text-xs text-brand-accent text-center pt-2">
                Thanks! We&apos;ll keep you updated.
              </p>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-brand-border/60">
            <p className="text-[11px] text-brand-textMuted mb-3">
              Until then, you can keep running calculations from the main calculator page.
            </p>
            <Link
              href="/calc"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-primarySoft to-brand-primary px-4 py-1.5 text-xs font-medium text-white shadow-soft-xl transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/70"
            >
              Back to calculator
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
