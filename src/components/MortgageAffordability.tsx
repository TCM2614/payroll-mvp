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
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.5em] text-emerald-500">
          Home buying power
        </p>
        <h2 className="mb-2 text-3xl font-bold text-white">See what you could afford with your current salary</h2>
        <p className="text-sm text-slate-400">
          Estimate your mortgage potential instantly and understand how deposit size affects your total budget.
        </p>
      </div>

      <div className="mt-8 bg-slate-800 border border-slate-700 rounded-2xl shadow-lg shadow-black/20 p-8">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.5em] text-emerald-500">House price potential</p>
          <h3 className="text-2xl font-semibold text-white">Estimated borrowing power</h3>
          <p className="mt-4 text-5xl font-bold text-emerald-400">{formatGBP(borrowingPower)}</p>
          <p className="mt-2 text-sm text-slate-300">
            Based on a 4.5x income multiple. Lending criteria may vary by bank and risk profile.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-inner shadow-black/30">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.4em] text-slate-400">Annual salary</p>
            <p className="text-2xl font-bold text-white">{formatGBP(annualSalary)}</p>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-inner shadow-black/30">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.4em] text-slate-400">Potential house price (incl. 10% deposit)</p>
            <p className="text-2xl font-bold text-white">{formatGBP(totalBudget)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
