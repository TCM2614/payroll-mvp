"use client";

import dynamic from "next/dynamic";

const WealthDistributionChart = dynamic(
  () =>
    import("@/components/WealthDistributionChart").then(
      (mod) => mod.WealthDistributionChart,
    ),
  { ssr: false },
);

const LifestyleComparison = dynamic(
  () =>
    import("@/components/LifestyleComparison").then(
      (mod) => mod.LifestyleComparison,
    ),
  { ssr: false },
);

type WealthInsightsProps = {
  salary?: number | null;
  className?: string;
  cardClassName?: string;
  ageGroupLabel?: string;
};

export function WealthInsights({
  salary,
  className,
  cardClassName,
  ageGroupLabel,
}: WealthInsightsProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-[0_20px_45px_rgba(2,6,23,0.6)] ${className ?? ""}`}
    >
      <div
        className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-inner shadow-black/30 ${
          cardClassName ?? ""
        }`}
      >
        <WealthDistributionChart currentSalary={salary} ageGroupLabel={ageGroupLabel} />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <LifestyleComparison currentSalary={salary} />
      </div>
    </div>
  );
}

export default WealthInsights;
