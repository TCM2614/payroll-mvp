"use client";

import { formatGBP } from "@/lib/format";

type MortgageAffordabilityProps = {
  salary?: number | null;
  multiplier?: number;
  onGenerateReport?: () => void;
};

const DEFAULT_MULTIPLIER = 4.5;

export function MortgageAffordability({
  salary,
  multiplier = DEFAULT_MULTIPLIER,
}: MortgageAffordabilityProps) {
  const safeSalary = typeof salary === "number" && salary > 0 ? salary : 0;
  const estimate = safeSalary * multiplier;
  const withDeposit = estimate > 0 ? estimate / 0.9 : 0;

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-white shadow-[0_20px_45px_rgba(2,6,23,0.6)] sm:p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200/80">
          House price potential
        </p>
        <h2 className="text-3xl font-semibold sm:text-4xl">Estimated borrowing power</h2>
        <p className="text-4xl font-bold text-emerald-400 tracking-tight">
          {estimate > 0 ? formatGBP(estimate) : "Add your income"}
        </p>
        <p className="text-sm text-slate-200">
          Based on a {multiplier.toFixed(1)}× income multiple from mainstream UK lenders.
        </p>
      </div>

      {estimate > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Annual salary</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatGBP(safeSalary)}</p>
            <p className="text-sm text-slate-400">Change your income above to update this figure.</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              With 10% deposit (budget)
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatGBP(withDeposit)}
            </p>
            <p className="text-sm text-slate-400">
              Approximate purchase price assuming a 10% deposit alongside this mortgage.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
