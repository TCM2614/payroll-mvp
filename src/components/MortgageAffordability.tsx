'use client';

import { useMemo } from 'react';
import { formatGBP } from '@/lib/format';

type MortgageAffordabilityProps = {
  annualSalary: number;
};

export default function MortgageAffordability({ annualSalary }: MortgageAffordabilityProps) {
  const { borrowingPower, totalBudget } = useMemo(() => {
    const safeSalary = Number.isFinite(annualSalary) ? Math.max(0, annualSalary) : 0;
    const borrowing = safeSalary * 4.5;
    const budget = borrowing / 0.9;
    return {
      borrowingPower: borrowing,
      totalBudget: budget,
    };
  }, [annualSalary]);

  return (
    <section id="mortgage-section" className="w-full py-12">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-white">Home buying power</h2>
        <p className="mt-2 text-sm text-white/70">
          Estimate your mortgage potential instantly and understand how deposit size affects your total budget.
        </p>
      </div>

      <div className="mt-8 bg-slate-800 border border-slate-700 rounded-2xl shadow-lg shadow-black/20 p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">House price potential</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Estimated borrowing power</h3>
          <p className="mt-4 text-5xl font-bold text-emerald-500">{formatGBP(borrowingPower)}</p>
          <p className="mt-2 text-sm text-slate-300">
            Based on a 4.5x income multiple. Lending criteria may vary by bank and risk profile.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-slate-800/50 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Annual salary</p>
            <p className="mt-3 text-2xl font-semibold text-white">{formatGBP(annualSalary)}</p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Potential house price (incl. 10% deposit)</p>
            <p className="mt-3 text-2xl font-semibold text-white">{formatGBP(totalBudget)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
