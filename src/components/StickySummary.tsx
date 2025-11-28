"use client";

import { formatGBP } from "@/lib/format";

type StickySummaryProps = {
  annualNet: number;
  monthlyNet: number;
  className?: string;
};

export function StickySummary({
  annualNet,
  monthlyNet,
  className,
}: StickySummaryProps) {
  const handleMortgageProof = () => {
    if (typeof window !== "undefined") {
      window.alert("Mortgage proof letter is coming soon.");
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-4 bottom-4 z-50 rounded-3xl border border-white/10 bg-slate-900/95 px-5 py-5 text-white shadow-2xl shadow-slate-900/40 backdrop-blur lg:sticky lg:inset-auto lg:top-6 lg:w-full lg:px-6 lg:py-6 ${className ?? ""}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
        Monthly take home
      </p>
      <p className="mt-1 text-3xl font-semibold leading-tight sm:text-4xl">
        {formatGBP(monthlyNet)}
      </p>
      <p className="mt-1 text-sm text-slate-300">
        Yearly {formatGBP(annualNet)}
      </p>

      <button
        type="button"
        onClick={handleMortgageProof}
        className="mt-4 w-full rounded-2xl bg-white/95 px-4 py-3 text-center text-sm font-semibold text-slate-900 shadow-lg transition hover:translate-y-[1px] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
      >
        Get Mortgage Proof
      </button>
    </div>
  );
}

export default StickySummary;

