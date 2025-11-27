"use client";

import { Trophy, Users, Clock } from "lucide-react";

import { useWealthPercentile, UK_MEDIAN_INCOME } from "@/utils/wealthData";
import { formatGBP } from "@/lib/format";

type LifestyleComparisonProps = {
  salary?: number | null;
};

type CardConfig = {
  title: string;
  value: string;
  description: string;
  icon: typeof Trophy;
};

export function LifestyleComparison({ salary }: LifestyleComparisonProps) {
  const { percentile, aboveMedianPercent } = useWealthPercentile(salary);

  const topShare =
    percentile != null ? Math.max(0, 100 - percentile).toFixed(1) : null;

  const averageComparison =
    aboveMedianPercent != null
      ? `${aboveMedianPercent >= 0 ? "+" : ""}${aboveMedianPercent.toFixed(1)}%`
      : "–";

  const hourlyRate =
    typeof salary === "number" && salary > 0 ? salary / 52 / 37.5 : null;

  const baseDescription =
    percentile != null
      ? `You earn more than ${percentile}% of the UK`
      : "Enter your income to compare against the UK population.";

  const cards: CardConfig[] = [
    {
      title: "National Ranking",
      value: topShare ? `Top ${topShare}%` : "Add salary",
      description: baseDescription,
      icon: Trophy,
    },
    {
      title: "Vs Average",
      value: averageComparison,
      description: `Compared to the UK median (£${(UK_MEDIAN_INCOME / 1000).toFixed(0)}k)`,
      icon: Users,
    },
    {
      title: "Real Hourly Rate",
      value: hourlyRate ? formatGBP(hourlyRate) : "–",
      description: "Based on a standard 37.5hr week",
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <Icon className="h-5 w-5 text-emerald-500" strokeWidth={1.75} />
              <span className="text-sm font-semibold text-slate-600">
                {card.title}
              </span>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
            <p className="text-sm text-slate-500">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
}
