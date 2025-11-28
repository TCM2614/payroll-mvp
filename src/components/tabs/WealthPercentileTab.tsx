"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import type { TooltipProps } from "recharts";
import {
  getIncomePercentileForAge,
  type IncomePercentileResult,
} from "@/lib/getIncomePercentileForAge";
import { incomePercentilesByAge } from "@/data/incomePercentilesByAge";
import { trackEvent } from "@/lib/analytics";
import { formatGBP, formatGBPShort } from "@/lib/format";
import { WealthDistributionChart } from "@/components/WealthDistributionChart";
import { LifestyleComparison } from "@/components/LifestyleComparison";

type ComparisonMode = "gross" | "net";

type WealthPercentileTabProps = {
  defaultAge?: number;
  defaultAnnualIncome?: number;
  defaultNetAnnualIncome?: number;
  defaultComparisonMode?: ComparisonMode;
};

const INCOME_COMPARISON_COLORS = {
  you: "#10b981", // emerald-500
  median: "#64748b", // slate-500
  top: "#6366f1", // indigo-500
} as const;

const PERCENTILE_SEGMENTS = [
  { key: "p0_25", label: "0–25%", start: 0, end: 25, color: "#0f172a" },
  { key: "p25_50", label: "25–50%", start: 25, end: 50, color: "#172554" },
  { key: "p50_75", label: "50–75%", start: 50, end: 75, color: "#1e3a8a" },
  { key: "p75_85", label: "75–85%", start: 75, end: 85, color: "#3730a3" },
  { key: "p85_95", label: "85–95%", start: 85, end: 95, color: "#4338ca" },
  { key: "top5", label: "Top 5%", start: 95, end: 96, color: "#4c1d95" },
  { key: "top4", label: "Top 4%", start: 96, end: 97, color: "#5b21b6" },
  { key: "top3", label: "Top 3%", start: 97, end: 98, color: "#6d28d9" },
  { key: "top2", label: "Top 2%", start: 98, end: 99, color: "#7c3aed" },
  { key: "top1", label: "Top 1%", start: 99, end: 100, color: "#8b5cf6" },
] as const;

type IncomeTooltipPayload = { name: string; value: number };

function IncomeComparisonTooltip(
  props: TooltipProps<any, any> & { payload?: unknown[] },
) {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;
  const first = payload[0] as { payload?: IncomeTooltipPayload };
  if (!first.payload) return null;
  const p = first.payload;
  return (
    <div className="rounded-lg border border-brand-border/60 bg-brand-bg/95 px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-brand-text">{p.name}</p>
      <p className="mt-1 font-medium text-brand-text">{formatGBP(p.value)}</p>
    </div>
  );
}

type PercentileTooltipProps = TooltipProps<number, string> & {
  payload?: readonly unknown[];
  ageBand?: IncomePercentileResult["ageBand"];
  clampedPercentile?: number | null;
};

function PercentileBreakdownTooltip(props: PercentileTooltipProps) {
  const { active, payload, ageBand, clampedPercentile } = props;
  if (!active || !payload || payload.length === 0 || !ageBand) return null;
  const first = payload[0] as { dataKey?: string };
  const key = first.dataKey;
  const seg = key ? PERCENTILE_SEGMENTS.find((s) => s.key === key) : undefined;
  if (!seg) return null;

  const minIncome = estimateIncomeForPercentile(ageBand, seg.start);
  const maxIncome = estimateIncomeForPercentile(ageBand, seg.end);
  let incomeText: string | null = null;
  if (minIncome != null && maxIncome != null && maxIncome > minIncome) {
    incomeText = `${formatGBP(minIncome)}–${formatGBP(maxIncome)} per year`;
  } else if (minIncome != null) {
    incomeText = `From about ${formatGBP(minIncome)} per year`;
  }

  const isUserBand =
    clampedPercentile != null &&
    clampedPercentile >= seg.start &&
    clampedPercentile <= seg.end;

  return (
    <div className="rounded-lg border border-brand-border/60 bg-brand-bg/95 px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-brand-text">{seg.label}</p>
      <p className="mt-1 font-medium text-brand-text">
        Range {seg.start.toFixed(1)}–{seg.end.toFixed(1)} percentile
      </p>
      {incomeText && (
        <p className="mt-1 text-brand-textMuted">
          {incomeText}
        </p>
      )}
      {isUserBand && clampedPercentile != null && (
        <p className="mt-1 font-semibold text-brand-text">
          You: {formatPercentile(clampedPercentile)} ({formatTopShare(clampedPercentile)})
        </p>
      )}
    </div>
  );
}

function formatPercentile(value: number): string {
  const clamped = Math.min(100, Math.max(0, value));
  if (clamped >= 99.995) {
    return "100%";
  }
  return `${clamped.toFixed(2)}%`;
}

function formatTopShare(value: number): string {
  const clamped = Math.min(100, Math.max(0, value));
  const distanceFromTop = 100 - clamped;

  // Very high percentiles: snap to simple labels
  if (clamped >= 99.5) {
    return "top 1%";
  }
  if (clamped >= 99) {
    return "top 2%";
  }

  const topShare = Math.max(0.01, Number(distanceFromTop.toFixed(2)));

  // Safety net: never say top 0%
  if (topShare <= 0) {
    return "top 1%";
  }

  return `top ${topShare.toFixed(2)}%`;
}

function estimateIncomeForPercentile(
  ageBand: IncomePercentileResult["ageBand"],
  percentile: number,
): number | null {
  const rows = incomePercentilesByAge.filter(
    (row) => row.ageMin === ageBand.ageMin && row.ageMax === ageBand.ageMax,
  );
  if (rows.length === 0) return null;

  const sorted = [...rows].sort((a, b) => a.percentile - b.percentile);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  if (percentile <= first.percentile) return first.income;
  if (percentile >= last.percentile) return last.income;

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (percentile >= a.percentile && percentile <= b.percentile) {
      if (b.percentile === a.percentile) return a.income;
      const ratio = (percentile - a.percentile) / (b.percentile - a.percentile);
      return a.income + ratio * (b.income - a.income);
    }
  }

  return last.income;
}

export function WealthPercentileTab({
  defaultAge,
  defaultAnnualIncome,
  defaultNetAnnualIncome,
  defaultComparisonMode = "gross",
}: WealthPercentileTabProps) {
  const initialSource =
    defaultComparisonMode === "net" ? defaultNetAnnualIncome : defaultAnnualIncome;

  const [ageInput, setAgeInput] = useState<string>(defaultAge ? String(defaultAge) : "");
  const [incomeInput, setIncomeInput] = useState<string>(
    typeof initialSource === "number" && initialSource > 0
      ? String(Math.round(initialSource))
      : "",
  );
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>(defaultComparisonMode);
  const [result, setResult] = useState<IncomePercentileResult | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [lastIncome, setLastIncome] = useState<number | null>(
    typeof initialSource === "number" && initialSource > 0 ? Math.round(initialSource) : null,
  );

  const parsedAge = useMemo(() => {
    const age = parseInt(ageInput, 10);
    return Number.isFinite(age) ? age : NaN;
  }, [ageInput]);

  const parsedIncome = useMemo(() => {
    const numeric = parseFloat(incomeInput.replace(/,/g, ""));
    return Number.isFinite(numeric) ? numeric : NaN;
  }, [incomeInput]);

  const isFormValid =
    Number.isFinite(parsedAge) &&
    parsedAge >= 18 &&
    parsedAge <= 74 &&
    Number.isFinite(parsedIncome) &&
    parsedIncome > 0;

  const handleCompare = () => {
    if (!isFormValid) {
      setResult(null);
      setHasSubmitted(true);
      return;
    }

    const res = getIncomePercentileForAge({
      age: parsedAge,
      income: parsedIncome,
      countryCode: "UK",
    });

    setHasSubmitted(true);
    setResult(res);
    setLastIncome(Math.round(parsedIncome));

    if (res) {
      trackEvent("wealth_compare_run", {
        age: parsedAge,
        annualIncome: parsedIncome,
        comparisonMode,
        percentile: res.percentile,
        band: res.bandLabel,
      });
    }
  };

  const percentileValue = result ? result.percentile : null;
  const clampedPercentile =
    percentileValue != null ? Math.min(100, Math.max(0, percentileValue)) : null;
  const percentileDisplay = clampedPercentile != null ? formatPercentile(clampedPercentile) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-navy-50 sm:text-4xl">
          How rich are you?
        </h2>
        <p className="text-sm text-navy-200">
          Compare your income against other people your age in the UK. We use broad income
          distributions, so treat this as a guide rather than a precise ranking.
        </p>
      </header>

      {/* Input card */}
      <section className="rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-6 sm:p-8 shadow-xl shadow-navy-900/50 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Age */}
          <div className="space-y-1">
            <label htmlFor="wealth-age" className="block text-sm font-medium text-navy-100">
              Your age
            </label>
            <input
              id="wealth-age"
              type="number"
              min={18}
              max={74}
              value={ageInput}
              onChange={(e) => setAgeInput(e.target.value)}
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
              placeholder="e.g. 32"
            />
            <p className="text-xs text-navy-300">
              We currently support income comparisons for ages 18–74.
            </p>
          </div>

          {/* Comparison mode toggle */}
          <div className="space-y-2">
            <span className="block text-sm font-medium text-navy-100">
              What are you comparing?
            </span>
            <div className="inline-flex rounded-full border border-brand-border/70 bg-brand-surface/80 px-1 py-1 text-xs sm:text-sm backdrop-blur">
              <button
                type="button"
                onClick={() => {
                  setComparisonMode("gross");
                  if (typeof defaultAnnualIncome === "number" && defaultAnnualIncome > 0) {
                    setIncomeInput(String(Math.round(defaultAnnualIncome)));
                  }
                }}
                className={
                  "px-3 py-1.5 rounded-full transition-colors " +
                  (comparisonMode === "gross"
                    ? "bg-brand-primary text-white shadow-soft-xl"
                    : "text-brand-textMuted hover:text-brand-text hover:bg-brand-border/40")
                }
              >
                Compare by gross income
              </button>
              <button
                type="button"
                onClick={() => {
                  setComparisonMode("net");
                  if (typeof defaultNetAnnualIncome === "number" && defaultNetAnnualIncome > 0) {
                    setIncomeInput(String(Math.round(defaultNetAnnualIncome)));
                  }
                }}
                className={
                  "px-3 py-1.5 rounded-full transition-colors " +
                  (comparisonMode === "net"
                    ? "bg-brand-primary text-white shadow-soft-xl"
                    : "text-brand-textMuted hover:text-brand-text hover:bg-brand-border/40")
                }
              >
                Compare by take-home (net)
              </button>
            </div>
            <p className="text-xs text-navy-300">
              Gross is your pay before tax. Net is the amount that actually lands in your bank
              account each year.
            </p>
          </div>
        </div>

        {/* Income input */}
        <div className="space-y-1">
          <label
            htmlFor="wealth-income"
            className="block text-sm font-medium text-navy-100"
          >
            Annual income (GBP)
          </label>
          <input
            id="wealth-income"
            type="text"
            inputMode="decimal"
            value={incomeInput}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                setIncomeInput("");
                return;
              }
              const cleaned = raw.replace(/[^0-9.,]/g, "");
              setIncomeInput(cleaned);
            }}
            className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
            placeholder="e.g. 45000"
          />
          <p className="text-xs text-navy-300">
            Prefilled from your latest calculation — you can adjust it.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCompare}
          disabled={!isFormValid}
          className="btn-primary w-full sm:w-auto disabled:bg-slate-500 disabled:text-slate-200 disabled:opacity-60"
        >
          Compare my income
        </button>

        {hasSubmitted && !result && (
          <p className="text-xs text-rose-300">
            Enter a valid age (18–74) and a positive annual income to see your percentile.
          </p>
        )}
      </section>

      {/* Result card */}
      {result && clampedPercentile != null && (
        <section className="rounded-3xl bg-brand-surface/80 border border-brand-border/60 shadow-soft-xl backdrop-blur-xl p-4 sm:p-6 space-y-6">
          <header className="space-y-1">
            <h3 className="text-lg sm:text-xl font-semibold text-brand-text">
              You earn more than {percentileDisplay} of people your age in the UK.
            </h3>
            <p className="text-sm text-brand-textMuted">
              You are in the{" "}
              <span className="font-semibold text-brand-text">
                {result.bandLabel}
              </span>{" "}
              band for the{" "}
              <span className="font-semibold text-brand-text">
                {result.ageGroupLabel}
              </span>
              . For people in this age group, the median income is{" "}
              <span className="font-semibold text-brand-text">
                {formatGBP(result.medianIncomeForAgeGroup)}
              </span>
              , and the top 10% earn at least{" "}
              <span className="font-semibold text-brand-text">
                {formatGBP(result.p90Income)}
              </span>
              .
            </p>
          </header>

          <div className="space-y-4">
            <WealthDistributionChart currentSalary={lastIncome ?? undefined} />
            <LifestyleComparison currentSalary={lastIncome ?? undefined} />
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div
              className="h-2 w-full rounded-full border border-brand-border/60 bg-brand-bg/80 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentileValue ?? undefined}
              aria-label="Income percentile compared with people your age"
            >
              <div
                className="h-full rounded-full bg-brilliant-500 transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, percentileValue ?? 0))}%`,
                }}
              />
            </div>
            <p className="text-xs text-brand-textMuted">
              Percentiles show how you compare with others. Being at{" "}
              <span className="font-semibold text-brand-text">
                {percentileDisplay}
              </span>{" "}
              means you earn more than {percentileDisplay} of people in your age group. That
              places you in the{" "}
              <span className="font-semibold text-brand-text">
                {formatTopShare(clampedPercentile)}
              </span>{" "}
              of earners for your age group.
            </p>
          </div>

          {/* Stats panel */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs sm:text-sm">
            <div className="rounded-xl border border-brand-border/60 bg-brand-bg/60 px-3 py-2">
              <p className="text-xs sm:text-sm font-semibold text-brand-text">
                Your income
              </p>
              <p className="mt-1 text-sm font-medium text-brand-text">
                {lastIncome !== null ? formatGBP(lastIncome) : "–"}
              </p>
            </div>
            <div className="rounded-xl border border-brand-border/60 bg-brand-bg/60 px-3 py-2">
              <p className="text-xs sm:text-sm font-semibold text-brand-text">
                Median ({result.ageGroupLabel})
              </p>
              <p className="mt-1 text-sm font-medium text-brand-text">
                {formatGBP(result.medianIncomeForAgeGroup)}
              </p>
            </div>
            <div className="rounded-xl border border-brand-border/60 bg-brand-bg/60 px-3 py-2">
              <p className="text-xs sm:text-sm font-semibold text-brand-text">
                Top 10% threshold
              </p>
              <p className="mt-1 text-sm font-medium text-brand-text">
                {formatGBP(result.p90Income)}
              </p>
            </div>
            <div className="rounded-xl border border-brand-border/60 bg-brand-bg/60 px-3 py-2">
              <p className="text-xs sm:text-sm font-semibold text-brand-text">
                Exact percentile
              </p>
              <p className="mt-1 text-sm font-medium text-brand-text">
                {percentileDisplay}
              </p>
            </div>
          </div>

          {/* Bar chart: You vs Median vs Top 10% */}
          <div className="mt-2 rounded-2xl border border-slate-800 bg-slate-900/50 px-3 py-3 sm:px-4 sm:py-4">
            <p className="mb-2 text-xs sm:text-sm font-semibold text-brand-text">
              Income comparison ({result.ageGroupLabel})
            </p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "You",
                      value: lastIncome ?? 0,
                      kind: "you",
                    },
                    {
                      name: "Median",
                      value: result.medianIncomeForAgeGroup,
                      kind: "median",
                    },
                    {
                      name: "Top 10%",
                      value: result.p90Income,
                      kind: "top",
                    },
                  ]}
                  margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                >
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis
                    tickFormatter={(v) => formatGBPShort(Number(v))}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <Tooltip content={<IncomeComparisonTooltip />} cursor={{ fill: "transparent" }} />
                  <Bar
                    dataKey="value"
                    radius={[4, 4, 0, 0]}
                    activeBar={{ fillOpacity: 0.9 }}
                  >
                    <Cell key="you" fill={INCOME_COMPARISON_COLORS.you} />
                    <Cell key="median" fill={INCOME_COMPARISON_COLORS.median} />
                    <Cell key="top" fill={INCOME_COMPARISON_COLORS.top} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Percentile breakdown chart */}
          <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-3 py-3 sm:px-4 sm:py-4">
            <p className="mb-2 text-xs sm:text-sm font-semibold text-brand-text">
              Where you sit in the distribution
            </p>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[
                    PERCENTILE_SEGMENTS.reduce(
                      (acc, seg) => ({
                        ...acc,
                        [seg.key]: seg.end - seg.start,
                      }),
                      { name: "Percentiles" } as Record<string, number | string>,
                    ),
                  ]}
                  margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip cursor={{ fill: "transparent" }} content={undefined} />
                  <ReferenceLine
                    x={Math.min(100, Math.max(0, clampedPercentile ?? 0))}
                    stroke={INCOME_COMPARISON_COLORS.you}
                    strokeWidth={2}
                  />
                  {PERCENTILE_SEGMENTS.map((seg, index) => (
                    <Bar
                      key={seg.key}
                      dataKey={seg.key}
                      stackId="range"
                      radius={
                        index === 0
                          ? [4, 0, 0, 4]
                          : index === PERCENTILE_SEGMENTS.length - 1
                          ? [0, 4, 4, 0]
                          : 0
                      }
                      fill={seg.color}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] sm:text-xs">
              {PERCENTILE_SEGMENTS.map((seg) => (
                <div key={seg.key} className="inline-flex items-center gap-1">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="font-medium text-brand-text">{seg.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xxs text-brand-textMuted">
            This is an approximate comparison based on UK income distribution data. It doesn&apos;t
            consider wealth, assets, location or cost of living. Informational use only.
          </p>
        </section>
      )}
    </div>
  );
}


