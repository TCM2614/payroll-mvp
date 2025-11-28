"use client";

import { formatGBP } from "@/lib/format";

type StickySummaryProps = {
  annualNet: number;
  monthlyNet: number;
  weeklyNet: number;
  onSeeBreakdown?: () => void;
  className?: string;
};

export function StickySummary({
  annualNet,
  monthlyNet,
  weeklyNet,
  onSeeBreakdown,
  className,
}: StickySummaryProps) {
  const metrics = [
    { label: "Annual Net Pay", value: formatGBP(annualNet) },
    { label: "Monthly Net Pay", value: formatGBP(monthlyNet) },
    { label: "Weekly Net Pay", value: formatGBP(weeklyNet) },
  ];

  const handleMortgageProof = () => {
    if (typeof window !== "undefined") {
      document
        .getElementById("mortgage-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      aria-live="polite"
      className={`fixed top-4 left-1/2 z-50 w-[min(560px,calc(100%-1.5rem))] -translate-x-1/2 rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-950 via-emerald-900 to-emerald-800 px-5 py-4 text-white shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:static lg:top-auto lg:left-auto lg:right-auto lg:w-full lg:translate-x-0 lg:border-emerald-400/20 lg:px-8 lg:py-6 lg:shadow-lg ${className ?? ""}`}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3 text-left">
          {metrics.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200/80 sm:text-xs lg:text-[11px]">
                {metric.label}
              </p>
              <p className="text-xl font-bold leading-tight text-white sm:text-2xl lg:text-3xl">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => onSeeBreakdown?.()}
            className="btn-primary w-full text-sm lg:text-base"
          >
            See Full Breakdown
          </button>
          <button
            type="button"
            onClick={handleMortgageProof}
            className="btn-primary w-full text-sm lg:text-base"
          >
            Explore Mortgage Insights
          </button>
        </div>
      </div>
    </div>
  );
}

export default StickySummary;

