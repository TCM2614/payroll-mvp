export default function DashboardPage() {
  return (
    <section className="relative">
      {/* Blurred dashboard backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Soft gradient (matches welcome page) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(34,197,94,0.16),_transparent_55%)]" />

        {/* Fake dashboard cards */}
        <div className="absolute left-1/2 top-6 hidden -translate-x-1/2 scale-110 blur-3xl sm:block">
          <div className="grid grid-cols-3 gap-4 opacity-35">
            <div className="h-24 w-40 rounded-3xl bg-brand-surface/70" />
            <div className="h-24 w-40 rounded-3xl bg-brand-surface/60" />
            <div className="h-24 w-40 rounded-3xl bg-brand-surface/40" />
            <div className="h-20 w-60 rounded-3xl bg-brand-surface/40 col-span-2" />
            <div className="h-20 w-40 rounded-3xl bg-brand-surface/50" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-12 text-center sm:py-20">
        {/* Eyebrow label */}
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-textMuted">
          Insights · Scenarios · History
        </p>

        {/* Hero card */}
        <div className="w-full max-w-2xl rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-6 shadow-soft-xl backdrop-blur-xl sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-border/60 bg-brand-bg/80 px-3 py-1 text-[11px] font-medium text-brand-textMuted">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-accent" />
            Dashboard
            <span className="text-brand-text/70">·</span>
            <span className="text-brand-text/80">Coming soon</span>
          </div>

          <h1 className="mb-3 text-2xl font-semibold tracking-tight text-brand-text sm:text-3xl">
            Your take-home insights dashboard is on the way
          </h1>

          <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-brand-textMuted">
            Soon you&apos;ll be able to pin multiple salary and contracting scenarios,
            track changes across tax years, and see how PAYE, NI, pensions and
            student loans shape your take-home pay over time — all in one place.
          </p>

          <div className="grid gap-4 text-left text-xs text-brand-textMuted sm:grid-cols-3">
            <div className="rounded-2xl border border-brand-border/60 bg-brand-bg/60 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-text/70">
                Scenario snapshots
              </p>
              <p className="leading-relaxed">
                Save PAYE, umbrella and limited company setups side by side and
                revisit them instantly.
              </p>
            </div>

            <div className="rounded-2xl border border-brand-border/60 bg-brand-bg/60 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-text/70">
                Period breakdowns
              </p>
              <p className="leading-relaxed">
                See annual, monthly, weekly, daily and hourly take-home in one
                consolidated view.
              </p>
            </div>

            <div className="rounded-2xl border border-brand-border/60 bg-brand-bg/60 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-text/70">
                Change tracking
              </p>
              <p className="leading-relaxed">
                Understand what changed between scenarios — tax bands, pension
                contributions or student loans.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-between">
            <p className="text-[11px] text-brand-textMuted">
              Until then, you can keep running calculations from the main
              calculator page.
            </p>
            <a
              href="/calc"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-primarySoft to-brand-primary px-4 py-1.5 text-xs font-medium text-white shadow-soft-xl transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/70"
            >
              Back to calculator
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

