import Link from "next/link";

export default function DashboardPage() {
  return (
    <section className="relative min-h-[calc(100vh-8rem)]">
      {/* Blurred dashboard backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(34,197,94,0.16),_transparent_55%)]" />

        {/* Fake realistic dashboard grid - blurred */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 scale-110 blur-3xl sm:block">
          <div className="grid grid-cols-4 gap-4 opacity-30">
            <div className="h-32 w-48 rounded-3xl border border-brand-border/40 bg-brand-surface/70" />
            <div className="h-32 w-48 rounded-3xl border border-brand-border/40 bg-brand-surface/60" />
            <div className="h-32 w-48 rounded-3xl border border-brand-border/40 bg-brand-surface/50" />
            <div className="h-32 w-48 rounded-3xl border border-brand-border/40 bg-brand-surface/40" />
            <div className="h-48 w-full col-span-2 rounded-3xl border border-brand-border/40 bg-brand-surface/60" />
            <div className="h-48 w-full col-span-2 rounded-3xl border border-brand-border/40 bg-brand-surface/50" />
            <div className="h-24 w-full rounded-3xl border border-brand-border/40 bg-brand-surface/40" />
            <div className="h-24 w-full rounded-3xl border border-brand-border/40 bg-brand-surface/35" />
            <div className="h-24 w-full rounded-3xl border border-brand-border/40 bg-brand-surface/30" />
            <div className="h-24 w-full rounded-3xl border border-brand-border/40 bg-brand-surface/25" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 pt-8 pb-12 text-center sm:pt-12 sm:pb-20">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-textMuted">
          Insights · Scenarios · History
        </p>

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
              Turn your payslip into a financial plan. The dashboard will
              connect your take-home pay calculations to expense tracking, debt
              management, and savings goals — all powered by the same accurate
              UK tax calculator you&apos;re using now.
            </p>
          </header>

          <div className="grid gap-4 text-left sm:grid-cols-2 mb-6">
            <section className="rounded-2xl border border-brand-border/60 bg-brand-bg/80 p-4 text-sm space-y-1 shadow-sm">
              <h3 className="font-medium text-brand-text">
                All your money in one view
              </h3>
              <p className="text-brand-textMuted opacity-80">
                See PAYE, Umbrella and Limited Company take-home side by side,
                with clear breakdowns for tax, NI, pensions, SIPPs and student
                loans.
              </p>
            </section>

            <section className="rounded-2xl border border-brand-border/60 bg-brand-bg/80 p-4 text-sm space-y-1 shadow-sm">
              <h3 className="font-medium text-brand-text">
                Smart expense tracking
              </h3>
              <ul className="list-disc pl-4 space-y-1 text-brand-textMuted opacity-80">
                <li>Log fixed bills and everyday spending.</li>
                <li>Tag and group categories to see where money leaks.</li>
                <li>
                  Get a &quot;safe to spend&quot; number matched to your net
                  pay.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-brand-border/60 bg-brand-bg/80 p-4 text-sm space-y-1 shadow-sm">
              <h3 className="font-medium text-brand-text">
                Debt management mode
              </h3>
              <ul className="list-disc pl-4 space-y-1 text-brand-textMuted opacity-80">
                <li>Add credit cards, loans, overdrafts and BNPL balances.</li>
                <li>Compare Snowball vs Avalanche pay-down strategies.</li>
                <li>
                  See debt-free dates and interest saved based on your income.
                </li>
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
            The dashboard is built directly on top of the calculator, so your
            real tax year, student loans and pension choices will flow into
            your expense and debt strategy automatically.
          </p>

          <div className="pt-6 border-t border-brand-border/60">
            <p className="text-[11px] text-brand-textMuted mb-3">
              In the meantime, keep running scenarios from the calculator.
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
