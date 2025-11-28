'use client';

import AppShell from '@/components/layout/AppShell';

export default function BusinessTaxClient() {
  return (
    <AppShell>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-700 bg-slate-800/80 p-8 text-white shadow-soft-xl">
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-400">
            Business Tax Calculator
          </h1>
          <p className="mt-3 text-sm text-white/70">
            A full Sole Trader vs Limited Company comparison experience will live on
            this page. The placeholder ensures navigation and metadata resolve while
            we implement the new calculators.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
