"use client";

export function DashboardComingSoon() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-border/60 bg-brand-surface/60">
      {/* Blurred dashboard background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Replace this image path with whatever preview you want */}
        <img
          src="/images/dashboard-preview.png"
          alt="Dashboard preview"
          className="h-full w-full object-cover blur-xl scale-110 opacity-60"
        />
        {/* Darken / unify with theme */}
        <div className="absolute inset-0 bg-brand-surface/70 backdrop-blur-md" />
      </div>

      {/* Foreground content */}
      <div className="relative p-6 md:p-8 space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-brand-textMuted opacity-70">
            Coming soon
          </p>
          <h2 className="text-xl md:text-2xl font-semibold text-brand-text">
            Dashboard: from payslip to plan
          </h2>
          <p className="text-sm md:text-base text-brand-textMuted opacity-80 max-w-2xl">
            A live control panel for your income, expenses and debt – built on
            the same UK take-home engine powering this calculator.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl bg-brand-surface/80 p-4 text-sm space-y-1 shadow-sm border border-brand-border/60">
            <h3 className="font-medium text-brand-text">All your money in one view</h3>
            <p className="text-brand-textMuted opacity-80">
              See PAYE, Umbrella and Limited Company take-home side by side,
              with clear breakdowns for tax, NI, pensions, SIPPs and loans.
            </p>
          </section>

          <section className="rounded-2xl bg-brand-surface/80 p-4 text-sm space-y-1 shadow-sm border border-brand-border/60">
            <h3 className="font-medium text-brand-text">Smart expense tracking</h3>
            <ul className="list-disc pl-4 space-y-1 text-brand-textMuted opacity-80">
              <li>Log fixed bills and everyday spending.</li>
              <li>Tag and group categories to see leaks.</li>
              <li>Get a "safe to spend" figure matched to your net pay.</li>
            </ul>
          </section>

          <section className="rounded-2xl bg-brand-surface/80 p-4 text-sm space-y-1 shadow-sm border border-brand-border/60">
            <h3 className="font-medium text-brand-text">Debt management mode</h3>
            <ul className="list-disc pl-4 space-y-1 text-brand-textMuted opacity-80">
              <li>Add credit cards, loans, overdrafts and BNPL balances.</li>
              <li>Compare Snowball vs Avalanche pay-down strategies.</li>
              <li>See debt-free dates and interest saved based on your income.</li>
            </ul>
          </section>

          <section className="rounded-2xl bg-brand-surface/80 p-4 text-sm space-y-1 shadow-sm border border-brand-border/60">
            <h3 className="font-medium text-brand-text">Strategy engine</h3>
            <ul className="list-disc pl-4 space-y-1 text-brand-textMuted opacity-80">
              <li>Suggests how to adjust expenses, savings and repayments.</li>
              <li>Models changes like new jobs, side income and pension tweaks.</li>
              <li>Turns your payslip into a month-by-month action plan.</li>
            </ul>
          </section>
        </div>

        <p className="text-xs text-brand-textMuted opacity-70 max-w-2xl">
          We&apos;re building this directly on top of the calculator, so your
          real tax year, student loans and pension choices flow into your
          expense and debt strategy automatically.
        </p>
      </div>
    </div>
  );
}

