"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { calculateSalary, convertToAnnual, type PayFrequency, type Region } from "@/lib/tax";
import { salaryBand } from "@/lib/analytics";
import { trackEvent } from "@/lib/analytics";
import { encodeShareState } from "@/lib/share";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const gbp2 = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 2,
});

export interface CalculatorProps {
  initialGross?: number;
  initialFrequency?: PayFrequency;
  initialRegion?: Region;
  compact?: boolean;
  /** Called when a calculation resolves, with the annual gross. Useful for
   * parent components on salary pages that want to react to user changes. */
  onChange?: (annualGross: number) => void;
}

export function Calculator({
  initialGross = 35_000,
  initialFrequency = "annual",
  initialRegion = "england-wales-ni",
  compact = false,
  onChange,
}: CalculatorProps) {
  const [gross, setGross] = useState(initialGross);
  const [frequency, setFrequency] = useState<PayFrequency>(initialFrequency);
  const [region, setRegion] = useState<Region>(initialRegion);
  const [pensionPct, setPensionPct] = useState(0);
  const [studentLoan, setStudentLoan] = useState<"none" | "plan1" | "plan2" | "plan4" | "plan5" | "postgrad">("none");
  const started = useRef(false);

  const annualGross = useMemo(() => convertToAnnual(gross, frequency), [gross, frequency]);

  const result = useMemo(
    () =>
      calculateSalary(annualGross, {
        region,
        pensionSalarySacrifice: pensionPct / 100,
        studentLoanPlans: studentLoan === "none" ? undefined : [studentLoan],
      }),
    [annualGross, region, pensionPct, studentLoan],
  );

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      trackEvent("calculator_started", {
        calculator_type: "paye",
        region,
        salary_band: salaryBand(annualGross),
      });
    } else {
      trackEvent("calculation_completed", {
        calculator_type: "paye",
        region,
        salary_band: salaryBand(annualGross),
        has_student_loan: studentLoan !== "none",
        has_pension_contribution: pensionPct > 0,
      });
    }
    onChange?.(annualGross);
  }, [annualGross, region, pensionPct, studentLoan, onChange]);

  const shareUrl = useMemo(() => {
    const params = encodeShareState({ gross: annualGross, region });
    return `/calculator?${params}`;
  }, [annualGross, region]);

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <form
        className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        aria-label="Salary calculator"
        onSubmit={(e) => e.preventDefault()}
      >
        <fieldset className="grid gap-4">
          <legend className="sr-only">Salary details</legend>
          <label className="block">
            <span className="text-sm font-medium">Gross pay</span>
            <div className="mt-1 flex gap-2">
              <div className="relative flex-1">
                <span
                  className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500"
                  aria-hidden
                >
                  £
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={100}
                  value={gross}
                  onChange={(e) => setGross(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-lg border border-zinc-300 py-2 pl-7 pr-3 text-lg font-semibold dark:border-zinc-700 dark:bg-zinc-900"
                  aria-label="Gross pay amount"
                />
              </div>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as PayFrequency)}
                className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                aria-label="Pay frequency"
              >
                <option value="annual">per year</option>
                <option value="monthly">per month</option>
                <option value="four-weekly">every 4 weeks</option>
                <option value="fortnightly">fortnightly</option>
                <option value="weekly">per week</option>
                <option value="daily">per day</option>
                <option value="hourly">per hour</option>
              </select>
            </div>
          </label>
          {!compact && (
            <>
              <label className="block">
                <span className="text-sm font-medium">Region</span>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="england-wales-ni">England, Wales & NI</option>
                  <option value="scotland">Scotland</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">
                  Pension (salary sacrifice) — {pensionPct}%
                </span>
                <input
                  type="range"
                  min={0}
                  max={25}
                  step={1}
                  value={pensionPct}
                  onChange={(e) => setPensionPct(Number(e.target.value))}
                  className="mt-1 w-full accent-emerald-600"
                  aria-valuemin={0}
                  aria-valuemax={25}
                  aria-valuenow={pensionPct}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Student loan</span>
                <select
                  value={studentLoan}
                  onChange={(e) => setStudentLoan(e.target.value as typeof studentLoan)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="none">No student loan</option>
                  <option value="plan1">Plan 1</option>
                  <option value="plan2">Plan 2</option>
                  <option value="plan4">Plan 4 (Scotland)</option>
                  <option value="plan5">Plan 5</option>
                  <option value="postgrad">Postgraduate loan</option>
                </select>
              </label>
            </>
          )}
        </fieldset>
      </form>
      <div
        className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm dark:border-zinc-800 dark:from-emerald-950/40 dark:to-zinc-950"
        aria-live="polite"
      >
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Take‑home pay from {gbp.format(annualGross)} gross
        </p>
        <p className="mt-1 text-4xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
          {gbp.format(result.netAnnual)}
          <span className="ml-2 text-base font-normal text-zinc-500 dark:text-zinc-400">/ year</span>
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <ResultRow label="Monthly take‑home" value={gbp.format(result.netMonthly)} />
          <ResultRow label="Weekly take‑home" value={gbp.format(result.netWeekly)} />
          <ResultRow label="Income Tax" value={gbp.format(result.incomeTax)} tone="negative" />
          <ResultRow label="National Insurance" value={gbp.format(result.nationalInsurance)} tone="negative" />
          {result.studentLoan > 0 && (
            <ResultRow label="Student loan" value={gbp.format(result.studentLoan)} tone="negative" />
          )}
          {result.pension.salarySacrifice > 0 && (
            <ResultRow label="Pension (sacrificed)" value={gbp.format(result.pension.salarySacrifice)} />
          )}
          <ResultRow
            label="Effective rate"
            value={`${(result.effectiveRate * 100).toFixed(1)}%`}
          />
          <ResultRow
            label="Hourly (37.5h/wk)"
            value={gbp2.format(result.netHourly)}
          />
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/salary/${annualGross}-after-tax`}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Explore {gbp.format(annualGross)}
          </Link>
          <Link
            href={`/pay-rise?from=${annualGross}&to=${annualGross + 5_000}`}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            What if I earned £5k more?
          </Link>
          <Link
            href="/salary-percentile"
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            How does this rank?
          </Link>
        </div>
        <p className="sr-only" data-shareable-url={shareUrl}>
          Shareable link for this calculation.
        </p>
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "negative";
}) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd
        className={`text-lg font-semibold tabular-nums ${
          tone === "negative" ? "text-rose-600 dark:text-rose-400" : "text-zinc-900 dark:text-zinc-100"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
