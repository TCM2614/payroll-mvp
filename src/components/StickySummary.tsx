"use client";

import { formatGBP } from "@/lib/format";

type StickySummaryProps = {
  annualNet: number;
  monthlyNet: number;
  weeklyNet: number;
  onSeeBreakdown?: () => void;
};

export function StickySummary({
  annualNet,
  monthlyNet,
  weeklyNet,
  onSeeBreakdown,
}: StickySummaryProps) {
  const metrics = [
    { label: "Annual Net Pay", value: formatGBP(annualNet) },
    { label: "Monthly Net Pay", value: formatGBP(monthlyNet) },
    { label: "Weekly Net Pay", value: formatGBP(weeklyNet) },
  ];

  return (
    <div
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-indigo-950 via-emerald-900 to-emerald-800 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-4 text-white shadow-[0_-16px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:sticky lg:top-4 lg:max-w-sm lg:rounded-3xl lg:border lg:border-emerald-500/20 lg:px-6 lg:pb-5 lg:pt-5"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 lg:max-w-none lg:px-0">
        <div className="grid grid-cols-3 gap-3 text-left">
          {metrics.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200/80">
                {metric.label}
              </p>
              <p className="text-lg font-bold leading-tight sm:text-xl">{metric.value}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onSeeBreakdown?.()}
          className="w-full rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-emerald-900 shadow-lg transition hover:translate-y-[1px] hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        >
          See Full Breakdown
        </button>
      </div>
    </div>
  );
}

export default StickySummary;

