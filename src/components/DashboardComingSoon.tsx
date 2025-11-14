"use client";

import { useState, FormEvent } from "react";

export function DashboardComingSoon() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    if (!feedback.trim()) {
      setStatus("error");
      return;
    }

    try {
      setStatus("submitting");
      const endpoint = process.env.NEXT_PUBLIC_SIGNUP_SHEET_ENDPOINT;
      
      if (!endpoint) {
        throw new Error("Sheet endpoint not configured");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: [
            [
              new Date().toISOString(),
              email || "",
              feedback.trim(),
              "Dashboard",
            ],
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setStatus("success");
      setEmail("");
      setFeedback("");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-border/60 bg-brand-surface/80">
      {/* Blurred dashboard-style background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-surface via-brand-surface/80 to-brand-surface/60" />
        
        {/* Fake dashboard header */}
        <div className="absolute top-6 left-8 right-8 flex items-center justify-between gap-4 opacity-80">
          <div className="h-4 w-32 rounded-full bg-brand-textMuted/60" />
          <div className="flex gap-2">
            <div className="h-4 w-12 rounded-full bg-brand-textMuted/60" />
            <div className="h-4 w-20 rounded-full bg-brand-textMuted/60" />
            <div className="h-8 w-8 rounded-full bg-brand-textMuted/50" />
          </div>
        </div>

        {/* Fake dashboard cards */}
        <div className="absolute left-8 right-8 top-16 flex flex-wrap gap-4">
          <div className="h-24 flex-1 min-w-[140px] rounded-2xl bg-brand-textMuted/60" />
          <div className="h-24 flex-1 min-w-[140px] rounded-2xl bg-brand-textMuted/50" />
          <div className="h-24 flex-1 min-w-[140px] rounded-2xl bg-brand-textMuted/40" />
        </div>

        {/* Fake chart */}
        <div className="absolute left-8 right-8 bottom-8 h-32 rounded-2xl bg-brand-textMuted/40 overflow-hidden">
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_0,rgba(255,255,255,0.12),transparent_40%),radial-gradient(circle_at_80%_100%,rgba(255,255,255,0.08),transparent_40%)]" />
        </div>

        {/* Apply blur over the whole "dashboard" */}
        <div className="absolute inset-0 backdrop-blur-2xl opacity-80" />
      </div>

      {/* Foreground content */}
      <div className="relative p-6 md:p-8 space-y-6 max-w-3xl">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-brand-textMuted opacity-70">
            Coming soon
          </p>
          <h2 className="text-xl md:text-2xl font-semibold text-brand-text">
            Dashboard: from payslip to plan
          </h2>
          <p className="text-sm md:text-base text-brand-textMuted opacity-80">
            A live control panel for your income, expenses and debt – built on
            the same UK take-home engine powering this calculator.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-brand-border/60 bg-brand-surface/85 p-4 text-sm space-y-1 shadow-sm">
            <h3 className="font-medium text-brand-text">All your money in one view</h3>
            <p className="text-brand-textMuted opacity-80">
              See PAYE, Umbrella and Limited Company take-home side by side,
              with clear breakdowns for tax, NI, pensions, SIPPs and student
              loans.
            </p>
          </section>

          <section className="rounded-2xl border border-brand-border/60 bg-brand-surface/85 p-4 text-sm space-y-1 shadow-sm">
            <h3 className="font-medium text-brand-text">Smart expense tracking</h3>
            <ul className="list-disc pl-4 space-y-1 text-brand-textMuted opacity-80">
              <li>Log fixed bills and everyday spending.</li>
              <li>Tag and group categories to see where money leaks.</li>
              <li>Get a "safe to spend" number matched to your net pay.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-brand-border/60 bg-brand-surface/85 p-4 text-sm space-y-1 shadow-sm">
            <h3 className="font-medium text-brand-text">Debt management mode</h3>
            <ul className="list-disc pl-4 space-y-1 text-brand-textMuted opacity-80">
              <li>Add credit cards, loans, overdrafts and BNPL balances.</li>
              <li>Compare Snowball vs Avalanche pay-down strategies.</li>
              <li>
                See debt-free dates and interest saved based on your income.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-brand-border/60 bg-brand-surface/85 p-4 text-sm space-y-1 shadow-sm">
            <h3 className="font-medium text-brand-text">Strategy engine</h3>
            <ul className="list-disc pl-4 space-y-1 text-brand-textMuted opacity-80">
              <li>Suggests how to adjust expenses, savings and repayments.</li>
              <li>Models new jobs, side income and pension tweaks.</li>
              <li>Turns your payslip into a month-by-month action plan.</li>
            </ul>
          </section>
        </div>

        <p className="text-xs text-brand-textMuted opacity-70">
          This dashboard is built directly on top of the calculator, so your
          real tax year, student loans and pension choices flow into your
          expense and debt strategy automatically.
        </p>

        {/* Feedback form */}
        <div className="rounded-xl border border-brand-border/60 bg-brand-surface/80 p-4 space-y-3 text-sm">
          <h3 className="text-sm font-medium text-brand-text">
            Tell us what you&apos;d like to see
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="dashboard-email" className="block text-xs font-medium text-brand-text">
                Email
              </label>
              <input
                type="email"
                id="dashboard-email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-brand-border/60 bg-brand-bg/80 px-3 py-2 text-sm text-brand-text placeholder:text-brand-textMuted focus:outline-none focus:ring-2 focus:ring-brand-primary/70 focus:border-brand-primary/60"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="dashboard-feedback" className="block text-xs font-medium text-brand-text">
                Message
              </label>
              <textarea
                id="dashboard-feedback"
                name="feedback"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What features would you like in the dashboard?"
                className="w-full rounded-xl border border-brand-border/60 bg-brand-bg/80 px-3 py-2 text-sm text-brand-text placeholder:text-brand-textMuted focus:outline-none focus:ring-2 focus:ring-brand-primary/70 focus:border-brand-primary/60 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex items-center justify-center rounded-xl border border-brand-border/60 bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/70 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? "Submitting..." : "Send feedback"}
            </button>

            {status === "success" && (
              <p className="text-xs text-brand-accent">
                Thanks — your feedback is saved.
              </p>
            )}
            {status === "error" && (
              <p className="text-xs text-brand-danger">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

