 "use client";

import { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { getIncomePercentileForAge, type IncomePercentileResult } from "@/lib/getIncomePercentileForAge";
import { trackEvent } from "@/lib/analytics";
import { formatGBP, formatGBPShort } from "@/lib/format";

type ComparisonMode = "gross" | "net";

type WealthPercentileTabProps = {
  defaultAge?: number;
  defaultAnnualIncome?: number;
  defaultNetAnnualIncome?: number;
  defaultComparisonMode?: ComparisonMode;
};

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
  const percentileDisplay = percentileValue != null ? percentileValue.toFixed(1) : null;

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
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-brilliant-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brilliant-500/30 transition hover:bg-brilliant-600 disabled:bg-sea-jet-700 disabled:text-navy-300 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brilliant-400/70"
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
      {result && percentileValue != null && (
        <section className="rounded-3xl bg-brand-surface/80 border border-brand-border/60 shadow-soft-xl backdrop-blur-xl p-4 sm:p-6 space-y-6">
          <header className="space-y-1">
            <h3 className="text-lg sm:text-xl font-semibold text-brand-text">
              You earn more than {percentileDisplay}% of people your age in the UK.
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
              Percentiles show how you compare with others. Being at the{" "}
              <span className="font-semibold text-brand-text">
                {percentileDisplay}th percentile
              </span>{" "}
              means you earn more than {percentileDisplay}% of people in your age group.
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
                {percentileDisplay}th
              </p>
            </div>
          </div>

          {/* Bar chart: You vs Median vs Top 10% */}
          <div className="mt-2 rounded-2xl border border-brand-border/60 bg-brand-bg/60 px-3 py-3 sm:px-4 sm:py-4">
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
                      kind: "p90",
                    },
                  ]}
                  margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={(v) => formatGBPShort(Number(v))}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    formatter={(v) => formatGBP(Number(v))}
                    contentStyle={{
                      borderRadius: 8,
                      borderColor: "rgba(148, 163, 184, 0.4)",
                    }}
                  />
                  <Bar dataKey="value" radius={4}>
                    <Cell key="you" fill="#38bdf8" />{/* sky-400 for user */}
                    <Cell key="median" fill="#64748b" />{/* slate-500 for median */}
                    <Cell key="p90" fill="#22c55e" />{/* emerald-500 for top 10% */}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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


