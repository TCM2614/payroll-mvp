"use client";

import { Trophy, Users, TrendingUp } from "lucide-react";

import {
  useWealthPercentile,
  getIncomeForPercentile,
} from "@/utils/wealthData";
import { formatGBP } from "@/lib/format";

type LifestyleComparisonProps = {
  currentSalary?: number | null;
};

type CardConfig = {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const WORK_WEEKS_PER_YEAR = 52;
const HOURS_PER_WEEK = 37.5;
const TOP_FIVE_PERCENTILE = 95;

export function LifestyleComparison({ currentSalary }: LifestyleComparisonProps) {
  const salary = currentSalary ?? 0;
  const { percentile } = useWealthPercentile(salary);

  const topShare =
    percentile != null ? Math.max(0, 100 - percentile).toFixed(1) : null;

  const hourlyRate =
    salary > 0 ? salary / WORK_WEEKS_PER_YEAR / HOURS_PER_WEEK : null;

  const topFiveSalary = getIncomeForPercentile(TOP_FIVE_PERCENTILE) ?? 0;
  const gapToTopFive = Math.max(topFiveSalary - salary, 0);

  const cards: CardConfig[] = [
    {
      title: "National Ranking",
      value: topShare ? `Top ${topShare}%` : "–",
      description:
        percentile != null
          ? `You earn more than ${percentile}% of UK workers`
          : "Enter your income to see your rank.",
      icon: Trophy,
    },
    {
      title: "Buying Power",
      value: hourlyRate ? `${formatGBP(hourlyRate)} / hr` : "–",
      description: "Based on a 37.5 hour work week",
      icon: Users,
    },
    {
      title: "Next Level",
      value:
        gapToTopFive === 0
          ? "Already Top 5%"
          : `${formatGBP(gapToTopFive)} more`,
      description:
        "To reach the Top 5% income bracket (≈" +
        `${formatGBP(topFiveSalary)})`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <Icon className="h-5 w-5 text-indigo-500" strokeWidth={1.75} />
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
