"use client";

import { useEffect, useMemo, useState } from "react";
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
  UK_AVERAGE_SALARY,
  useWealthPercentile,
} from "@/utils/wealthData";
import { formatGBPShort } from "@/lib/format";

type WealthDistributionChartProps = {
  currentSalary?: number | null;
  ageGroupLabel?: string;
};

type DistributionDatum = {
  income: number;
  density: number;
  percentile: number;
};

const DEFAULT_MAX_PERCENTILE = 99;
const GAUSSIAN_CENTER = 55;
const GAUSSIAN_SPREAD = 14;
const AGE_LABEL_FALLBACK = "all working age adults";

function gaussian(percentile: number): number {
  const exponent = -0.5 * Math.pow((percentile - GAUSSIAN_CENTER) / GAUSSIAN_SPREAD, 2);
  return Math.exp(exponent);
}

function formatTopShare(percentile: number | null): string | null {
  if (percentile == null) return null;
  const topShare = Math.max(0, 100 - percentile);
  if (topShare <= 0.1) return "Top 0.1%";
  return `Top ${topShare.toFixed(1)}%`;
}

function DistributionTooltip(props: any) {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;

  const entries = payload
    .map((item: any) => item?.payload as DistributionDatum | undefined)
    .filter(
      (entry: DistributionDatum | undefined): entry is DistributionDatum =>
        Boolean(entry),
    );

  if (!entries.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      {entries.map((entry: DistributionDatum, index: number) => {
        const topShare = formatTopShare(entry.percentile);
        return (
          <div key={`distribution-tooltip-${index}`} className="space-y-1">
            <p className="font-semibold text-slate-900">
              {formatGBPShort(entry.income)}
            </p>
            {topShare && <p className="text-slate-500">{topShare} of earners</p>}
          </div>
        );
      })}
    </div>
  );
}

export function WealthDistributionChart({
  currentSalary,
  ageGroupLabel,
}: WealthDistributionChartProps) {
  const [debouncedSalary, setDebouncedSalary] = useState<number>(
    typeof currentSalary === "number" ? currentSalary : 0,
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSalary(typeof currentSalary === "number" ? currentSalary : 0);
    }, 300);
    return () => clearTimeout(timeout);
  }, [currentSalary]);

  const { percentile, comparisonText } = useWealthPercentile(debouncedSalary);

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

  const topShareDisplay = formatTopShare(percentile);
  const comparisonLabel = ageGroupLabel?.trim() || AGE_LABEL_FALLBACK;
  const headline = topShareDisplay ? (
    <span className="font-semibold text-slate-50">{topShareDisplay}</span>
  ) : (
    <span className="text-slate-400">Enter your income to see where you rank</span>
  );
  const comparisonLine =
    comparisonText ??
    (topShareDisplay
      ? ageGroupLabel
        ? `Compared to ${comparisonLabel}`
        : `Across ${AGE_LABEL_FALLBACK}`
      : undefined);

  const xDomain: [number, number] = useMemo(() => {
    const incomes = chartData.map((d) => d.income);
    if (incomes.length === 0) return [0, 200000];
    return [Math.min(...incomes), Math.max(...incomes)];
  }, [chartData]);

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-inner shadow-black/30">
      <div className="mb-3 text-sm text-slate-200 space-y-0.5">
        <span>You are in the {headline} of UK earners.</span>
        {comparisonLine && (
          <p className="text-xs text-slate-400">{comparisonLine}</p>
        )}
      </div>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="wealthCurveGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#312e81" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.2)" vertical={false} />
            <XAxis
              type="number"
              dataKey="income"
              domain={xDomain}
              tickFormatter={(value) => formatGBPShort(Number(value))}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="density"
              domain={[0, 1]}
              tickFormatter={(value) => `${Math.round(Number(value) * 100)}%`}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              content={<DistributionTooltip />}
              cursor={{ stroke: "rgba(16,185,129,0.3)" }}
            />
            <Area
              type="monotone"
              dataKey="density"
              stroke="#818cf8"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#wealthCurveGradient)"
              isAnimationActive
            />
            {debouncedSalary > 0 && (
              <ReferenceLine
                x={debouncedSalary}
                stroke="#34d399"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  position: "top",
                  value: "You",
                  fill: "#34d399",
                  fontSize: 12,
                }}
              />
            )}
            <ReferenceLine
              x={UK_AVERAGE_SALARY}
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="6 4"
              label={{
                position: "top",
                value: "UK Avg",
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
