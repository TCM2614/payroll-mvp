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
};

export function WealthInsights({
  salary,
  className,
  cardClassName,
}: WealthInsightsProps) {
  return (
    <div
      className={`grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] ${className ?? ""}`}
    >
      <div
        className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-6 ${
          cardClassName ?? ""
        }`}
      >
        <WealthDistributionChart currentSalary={salary} />
      </div>
      <div
        className={`rounded-3xl border border-slate-200/70 bg-white/95 p-4 shadow-sm lg:p-6 ${
          cardClassName ?? ""
        }`}
      >
        <LifestyleComparison currentSalary={salary} />
      </div>
    </div>
  );
}

export default WealthInsights;
