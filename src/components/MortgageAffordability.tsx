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
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          House Price Potential
        </p>
        <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          You could borrow ~{formatGBP(estimate)}
        </h2>
        <p className="text-sm text-slate-600">
          We assume a {multiplier.toFixed(1)}× income multiple—common with high street lenders
          for borrowers with good credit. Adjust your salary above to see how your maximum
          mortgage shifts.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Your salary</p>
          <p className="text-lg font-semibold text-slate-900">
            {safeSalary > 0 ? formatGBP(safeSalary) : "Add your income"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          Generate PDF Report
        </button>
      </div>
    </section>
  );
}
