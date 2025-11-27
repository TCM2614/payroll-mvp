"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";

import {
  wealthPercentiles,
  getIncomeForPercentile,
  UK_MEDIAN_INCOME,
  UK_AVERAGE_SALARY,
  useWealthPercentile,
} from "@/utils/wealthData";
import { formatGBPShort } from "@/lib/format";

type WealthDistributionChartProps = {
  currentSalary?: number | null;
};

type DistributionDatum = {
  income: number;
  density: number;
  percentile: number;
};

const DEFAULT_MAX_PERCENTILE = 99;
const GAUSSIAN_CENTER = 55;
const GAUSSIAN_SPREAD = 14;

function gaussian(percentile: number): number {
  const exponent = -0.5 * Math.pow((percentile - GAUSSIAN_CENTER) / GAUSSIAN_SPREAD, 2);
  return Math.exp(exponent);
}

function formatTopShare(percentile: number | null): string | null {
  if (percentile == null) return null;
  const topShare = Math.max(0, 100 - percentile);
  if (topShare < 0.1) return "Top 0.1%";
  return `Top ${topShare.toFixed(1)}%`;
}

function DistributionTooltip(props: TooltipProps<number, string>) {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0]?.payload as DistributionDatum | undefined;
  if (!entry) return null;

  const topShare = formatTopShare(entry.percentile);

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-900">{formatGBPShort(entry.income)}</p>
      {topShare && <p className="mt-1 text-slate-500">{topShare} of earners</p>}
    </div>
  );
}

export function WealthDistributionChart({
  currentSalary,
}: WealthDistributionChartProps) {
  const { percentile } = useWealthPercentile(currentSalary);

  const chartData: DistributionDatum[] = useMemo(() => {
    if (!wealthPercentiles.length) return [];
    const steps = 70;
    return Array.from({ length: steps }, (_, index) => {
      const percentilePoint =
        1 + (index / (steps - 1)) * (DEFAULT_MAX_PERCENTILE - 1);
      const income =
        getIncomeForPercentile(percentilePoint) ??
        wealthPercentiles[wealthPercentiles.length - 1]?.income ??
        0;
      return {
        income,
        percentile: percentilePoint,
        density: gaussian(percentilePoint),
      };
    }).sort((a, b) => a.income - b.income);
  }, []);

  const headline = percentile != null ? (
    <span className="font-semibold text-slate-900">
      {formatTopShare(percentile)}
    </span>
  ) : (
    <span className="text-slate-500">Enter your income to see where you rank</span>
  );

  return (
    <div className="flex h-64 w-full flex-col rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm text-slate-600">
        You are in the {headline} of UK earners.
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="wealthCurveGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="income"
              tickFormatter={(value) => formatGBPShort(Number(value))}
              tick={{ fontSize: 11, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="density"
              domain={[0, 1]}
              tickFormatter={(value) => `${Math.round(Number(value) * 100)}%`}
              tick={{ fontSize: 11, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<DistributionTooltip />} cursor={{ stroke: "#c7d2fe" }} />
            <Area
              type="monotone"
              dataKey="density"
              stroke="#4338ca"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#wealthCurveGradient)"
              isAnimationActive
            />
            {currentSalary && currentSalary > 0 && (
              <ReferenceLine
                x={currentSalary}
                stroke="#4338ca"
                strokeWidth={2}
                strokeDasharray="4 2"
                label={{
                  position: "top",
                  value: "You",
                  fill: "#4338ca",
                  fontSize: 12,
                }}
              />
            )}
            <ReferenceLine
              x={UK_AVERAGE_SALARY || UK_MEDIAN_INCOME}
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="6 4"
              label={{
                position: "top",
                value: "Average",
                fill: "#475569",
                fontSize: 12,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
