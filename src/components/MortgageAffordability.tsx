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
  onGenerateReport,
}: MortgageAffordabilityProps) {
  const safeSalary = typeof salary === "number" && salary > 0 ? salary : 0;
  const estimate = safeSalary * multiplier;

  const handleGenerate = () => {
    onGenerateReport?.();
    if (typeof window !== "undefined") {
      console.log("Generate PDF Report clicked");
    }
  };

  return (
    <section className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-900 via-slate-900 to-indigo-900 p-6 text-white shadow-lg sm:p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200/80">
          House price potential
        </p>
        <h2 className="text-3xl font-semibold sm:text-4xl">
          You could borrow ~{formatGBP(estimate)}
        </h2>
        <p className="text-sm text-emerald-100/80">
          Based on a {multiplier.toFixed(1)}× income multiple commonly offered by mainstream UK lenders.
          Adjust your salary to see how your ceiling shifts.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-wide text-emerald-200/70">Projected mortgage</p>
          <p className="mt-2 text-3xl font-semibold">{formatGBP(estimate)}</p>
          <p className="mt-1 text-sm text-emerald-100/80">
            Assumes strong credit, standard affordability checks and no other large debts.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-wide text-emerald-200/70">Your salary</p>
          <p className="mt-2 text-2xl font-semibold">
            {safeSalary > 0 ? formatGBP(safeSalary) : "Add your income"}
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Generate PDF Report
          </button>
        </div>
      </div>
    </section>
  );
}
