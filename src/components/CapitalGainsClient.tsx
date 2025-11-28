'use client';

import AppShell from '@/components/layout/AppShell';

export default function CapitalGainsClient() {
  return (
    <AppShell>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-700 bg-slate-800/80 p-8 text-white shadow-soft-xl">
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-400">
            Capital Gains Tax Calculator
          </h1>
          <p className="mt-3 text-sm text-white/70">
            The dedicated CGT experience is being scaffolded. This placeholder keeps the
            route live while we wire up the final calculator and Donut chart.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
