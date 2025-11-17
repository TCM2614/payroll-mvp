"use client";

import { useEffect, useState } from "react";
import { getIncomePercentileForAge, type IncomePercentileResult } from "@/lib/getIncomePercentileForAge";
import { trackEvent } from "@/lib/analytics";

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
  const [ageInput, setAgeInput] = useState<string>(defaultAge ? String(defaultAge) : "");
  const [incomeInput, setIncomeInput] = useState<string>(
    defaultAnnualIncome ? String(Math.round(defaultAnnualIncome)) : "",
  );
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>(defaultComparisonMode);
  const [result, setResult] = useState<IncomePercentileResult | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Keep income in sync when the calculator updates the defaults or mode changes
  useEffect(() => {
    const source =
      comparisonMode === "net" ? defaultNetAnnualIncome : defaultAnnualIncome;
    if (typeof source === "number" && source > 0) {
      setIncomeInput(String(Math.round(source)));
    }
  }, [defaultAnnualIncome, defaultNetAnnualIncome, comparisonMode]);

  const handleCompare = () => {
    const age = parseInt(ageInput, 10);
    const income = parseFloat(incomeInput.replace(/,/g, ""));

    if (!Number.isFinite(age) || age <= 0 || !Number.isFinite(income) || income <= 0) {
      setResult(null);
      setHasSubmitted(true);
      return;
    }

    const res = getIncomePercentileForAge({
      age,
      income,
      countryCode: "UK",
    });

    setHasSubmitted(true);
    setResult(res);

    if (res) {
      trackEvent("wealth_compare_run", {
        age,
        annualIncome: income,
        comparisonMode,
        percentile: res.percentile,
        band: res.bandLabel,
      });
    }
  };

  const parsedPercentile = result ? Math.round(result.percentile) : null;

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
                onClick={() => setComparisonMode("gross")}
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
                onClick={() => setComparisonMode("net")}
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
          className="inline-flex items-center justify-center rounded-xl bg-brilliant-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brilliant-500/30 transition hover:bg-brilliant-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brilliant-400/70"
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
      {result && parsedPercentile !== null && (
        <section className="rounded-3xl bg-brand-surface/80 border border-brand-border/60 shadow-soft-xl backdrop-blur-xl p-4 sm:p-6 space-y-4">
          <header className="space-y-1">
            <h3 className="text-lg sm:text-xl font-semibold text-brand-text">
              You earn more than {parsedPercentile}% of people your age in the UK.
            </h3>
            <p className="text-sm text-brand-textMuted">
              You are in the{" "}
              <span className="font-semibold text-brand-text">
                {result.bandLabel}
              </span>{" "}
              band for the{" "}
              <span className="font-semibold text-brand-text">
                {result.ageBand.ageMin}
                &ndash;
                {result.ageBand.ageMax}
              </span>{" "}
              age group.
            </p>
          </header>

          {/* Progress bar */}
          <div className="space-y-2">
            <div
              className="h-2 w-full rounded-full border border-brand-border/60 bg-brand-bg/80 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={parsedPercentile}
              aria-label="Income percentile compared with people your age"
            >
              <div
                className="h-full rounded-full bg-brilliant-500 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, parsedPercentile))}%` }}
              />
            </div>
            <p className="text-xs text-brand-textMuted">
              Percentiles show how you compare with others. Being at the{" "}
              <span className="font-semibold text-brand-text">
                {parsedPercentile}th percentile
              </span>{" "}
              means you earn more than {parsedPercentile}% of people in your age group.
            </p>
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


