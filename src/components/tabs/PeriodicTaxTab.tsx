"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import {
  calculatePeriodTax,
  aggregatePeriodRange,
  createUK2025Config,
  type PeriodTaxInput,
  type PeriodTaxResult,
  type TaxWarning,
} from "@/domain/tax/periodTax";
import { formatGBP } from "@/lib/format";

type PayFrequency = "monthly" | "weekly" | "four-weekly";

type PeriodRow = {
  id: string;
  periodIndex: number;
  gross: number;
  pension: number;
  taxCode?: string; // optional override for this period
};

/**
 * Map warning codes to user-friendly messages
 */
function getWarningMessage(warning: TaxWarning): string {
  switch (warning.code) {
    case "potential_overtax_mid_year":
      return "You may be overpaying PAYE tax so far this tax year.";
    case "potential_undertax_mid_year":
      return "You may be underpaying PAYE tax so far this tax year.";
    case "non_cumulative_code_detected":
      return "Your tax code looks non-cumulative (e.g. W1/M1), which can cause higher tax mid-year.";
    case "emergency_tax_code_pattern":
      return "Your tax code looks like an emergency or basic rate code (such as 0T, BR or D0).";
    case "multiple_jobs_or_irregular_income_possible":
      return "Your income pattern looks irregular, which can happen with bonuses, commission or multiple jobs.";
    default:
      return warning.message;
  }
}

/**
 * Get warning severity description
 */
function getWarningSeverityText(severity: string): string {
  switch (severity) {
    case "critical":
      return "Under-taxed, future payslips may be reduced.";
    case "warning":
      return "Over-taxed, you may get a rebate or code change.";
    default:
      return "";
  }
}

export function PeriodicTaxTab() {
  const config = createUK2025Config();

  // Input state
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("monthly");
  const [taxCode, setTaxCode] = useState("1257L");
  const [studentLoanPlan, setStudentLoanPlan] = useState<
    "none" | "plan1" | "plan2" | "plan4" | "plan5" | "postgrad"
  >("none");

  // Period data: array of PeriodRow
  // If taxCode is not provided for a period, it falls back to the global taxCode
  const [periods, setPeriods] = useState<PeriodRow[]>([
    { id: nanoid(), periodIndex: 1, gross: 3000, pension: 150 },
    { id: nanoid(), periodIndex: 2, gross: 3000, pension: 150 },
    { id: nanoid(), periodIndex: 3, gross: 3000, pension: 150 },
  ]);

  // Calculate results for all periods
  const results: PeriodTaxResult[] = [];
  let ytdGross = 0;
  let ytdTax = 0;
  let ytdNI = 0;
  let ytdStudentLoan = 0;

  const totalPeriodsInYear =
    payFrequency === "monthly" ? 12 : payFrequency === "weekly" ? 52 : 13;

  periods.forEach((row) => {
    // Use per-period tax code if provided and not empty, otherwise fall back to global tax code
    const effectiveTaxCode = (row.taxCode && row.taxCode.trim()) || taxCode;
    
    const input: PeriodTaxInput = {
      taxYear: "2024-25",
      payFrequency,
      periodIndex: row.periodIndex,
      totalPeriodsInYear,
      grossForPeriod: row.gross,
      pensionForPeriod: row.pension,
      studentLoanPlan: studentLoanPlan === "none" ? undefined : studentLoanPlan,
      ytdGrossBeforeThisPeriod: ytdGross,
      ytdTaxBeforeThisPeriod: ytdTax,
      ytdNiBeforeThisPeriod: ytdNI,
      ytdStudentLoanBeforeThisPeriod: ytdStudentLoan,
      taxCode: effectiveTaxCode,
      config,
    };

    const result = calculatePeriodTax(input);
    results.push(result);

    ytdGross = result.ytdActual.gross;
    ytdTax = result.ytdActual.paye;
    ytdNI = result.ytdActual.ni;
    ytdStudentLoan = result.ytdActual.studentLoan;
  });

  // Range aggregation state
  const [rangeFrom, setRangeFrom] = useState(0);
  const [rangeTo, setRangeTo] = useState(Math.min(2, results.length - 1));
  const rangeAggregation =
    results.length > 0 && rangeFrom <= rangeTo && rangeTo < results.length
      ? aggregatePeriodRange({
          periods: results,
          fromIndex: rangeFrom,
          toIndex: rangeTo,
        })
      : null;

  const addPeriod = () => {
    const nextIndex = periods.length + 1;
    const lastPeriod = periods[periods.length - 1];
    const newPeriod: PeriodRow = {
      id: nanoid(),
      periodIndex: nextIndex,
      gross: lastPeriod?.gross || 3000,
      pension: lastPeriod?.pension || 150,
      taxCode: taxCode || "", // default from config, can be overridden
    };
    setPeriods([...periods, newPeriod]);
  };

  const removePeriod = (id: string) => {
    setPeriods(periods.filter((p) => p.id !== id));
  };

  const updatePeriod = (id: string, updates: Partial<PeriodRow>) => {
    setPeriods(
      periods.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const getWarningColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 border-red-500/30 bg-red-500/10";
      case "warning":
        return "text-amber-400 border-amber-500/30 bg-amber-500/10";
      default:
        return "text-blue-400 border-blue-500/30 bg-blue-500/10";
    }
  };

  const getVarianceText = (direction: string): string => {
    switch (direction) {
      case "over":
        return "Over-taxed";
      case "under":
        return "Under-taxed";
      default:
        return "Within tolerance";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h2 className="text-lg font-semibold text-white">
          Periodic PAYE Check
        </h2>
        <p className="mt-1 text-sm text-white/60">
          Analyse your PAYE tax on a period-by-period basis. Enter your actual pay for each period and we&apos;ll compare what you&apos;ve paid so far against what you&apos;d usually expect for this point in the 2024/25 tax year.
        </p>
      </header>

      {/* Configuration */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Configuration</h3>
          <p className="mt-1 text-xs text-white/50">
            Use this with your payslips to check for possible over-taxation, underpayments or issues with emergency or non-cumulative tax codes.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="pay-frequency" className="text-xs font-medium text-white/90">
              Pay Frequency
            </label>
            <select
              id="pay-frequency"
              value={payFrequency}
              onChange={(e) =>
                setPayFrequency(e.target.value as PayFrequency)
              }
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              aria-describedby="pay-frequency-help"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="four-weekly">Four-Weekly</option>
            </select>
            <p id="pay-frequency-help" className="text-xs text-white/50">
              Choose how often you are paid (monthly, weekly or four-weekly).
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="tax-code" className="text-xs font-medium text-white/90">
              Tax Code
            </label>
            <input
              id="tax-code"
              type="text"
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm uppercase text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              placeholder="1257L"
              aria-describedby="tax-code-help"
            />
            <p id="tax-code-help" className="text-xs text-white/50">
              This is your default tax code. You can override it per period if your tax code changed mid-year.
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="student-loan" className="text-xs font-medium text-white/90">
              Student Loan Plan
            </label>
            <select
              id="student-loan"
              value={studentLoanPlan}
              onChange={(e) =>
                setStudentLoanPlan(
                  e.target.value as
                    | "none"
                    | "plan1"
                    | "plan2"
                    | "plan4"
                    | "plan5"
                    | "postgrad"
                )
              }
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              aria-describedby="student-loan-help"
            >
              <option value="none">None</option>
              <option value="plan1">Plan 1</option>
              <option value="plan2">Plan 2</option>
              <option value="plan4">Plan 4</option>
              <option value="plan5">Plan 5</option>
              <option value="postgrad">Postgraduate</option>
            </select>
            <p id="student-loan-help" className="text-xs text-white/50">
              Select your student loan plan if repayments are taken from this income.
            </p>
          </div>
        </div>
      </section>

      {/* Periods Input */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Pay Periods</h3>
            <p className="mt-1 text-xs text-white/50">
              Enter the gross and pension from your payslip. We&apos;ll calculate the tax, NI and net pay for each period.
            </p>
          </div>
          <button
            type="button"
            onClick={addPeriod}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
            aria-label="Add another pay period"
          >
            + Add Period
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-xs font-semibold text-white/90">
                  Period
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-white/90">
                  Gross pay
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-white/90">
                  Pension
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-white/90">
                  Tax code (per period)
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-white/90">
                  PAYE
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-white/90">
                  NI
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-white/90">
                  Net pay
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-white/90">
                  Variance
                </th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-white/90 w-16">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {periods.map((row, index) => {
                const result = results[index];
                const effectiveTaxCode = (row.taxCode && row.taxCode.trim()) || taxCode;
                const hasValidTaxCode = !!effectiveTaxCode && effectiveTaxCode.trim().length > 0;
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      !hasValidTaxCode ? "bg-red-500/10 border-red-500/30" : ""
                    }`}
                  >
                    <td className="py-3 px-3 text-xs text-white/90">
                      {row.periodIndex} ({payFrequency})
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        value={row.gross}
                        onChange={(e) =>
                          updatePeriod(row.id, { gross: Number(e.target.value) || 0 })
                        }
                        className="w-full min-w-[80px] rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-xs text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/40"
                        aria-label={`Gross pay for period ${row.periodIndex}`}
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        value={row.pension}
                        onChange={(e) =>
                          updatePeriod(row.id, { pension: Number(e.target.value) || 0 })
                        }
                        className="w-full min-w-[80px] rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-xs text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/40"
                        aria-label={`Pension contribution for period ${row.periodIndex}`}
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={row.taxCode ?? ""}
                            onChange={(e) =>
                              updatePeriod(row.id, {
                                taxCode: e.target.value.trim().toUpperCase(),
                              })
                            }
                            placeholder={taxCode || "1257L"}
                            className={`flex-1 min-w-[100px] rounded-lg border px-2 py-1.5 text-xs uppercase text-white focus:ring-1 focus:ring-emerald-500/40 placeholder:text-white/40 ${
                              !hasValidTaxCode
                                ? "border-red-500/50 bg-red-500/20 focus:border-red-400"
                                : "border-white/15 bg-black/40 focus:border-emerald-400"
                            }`}
                            aria-label={`Tax code for period ${row.periodIndex}`}
                            aria-invalid={!hasValidTaxCode}
                          />
                          {row.taxCode && row.taxCode.trim() && row.taxCode.trim() !== taxCode && (
                            <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/30">
                              Override
                            </span>
                          )}
                        </div>
                        {!hasValidTaxCode ? (
                          <p className="text-[10px] text-red-400">
                            Tax code is required. Please enter a tax code or set one in the configuration above.
                          </p>
                        ) : (
                          <p className="text-[10px] text-white/50">
                            Optional: enter the tax code used on this payslip. Leave blank to use the default tax code above.
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-xs font-semibold text-white">
                      {result && hasValidTaxCode ? formatGBP(result.period.paye) : "-"}
                    </td>
                    <td className="py-3 px-3 text-right text-xs font-semibold text-white">
                      {result && hasValidTaxCode ? formatGBP(result.period.ni) : "-"}
                    </td>
                    <td className="py-3 px-3 text-right text-xs font-semibold text-emerald-400">
                      {result && hasValidTaxCode ? formatGBP(result.period.net) : "-"}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {result && hasValidTaxCode && (
                        <span
                          className={`text-xs font-semibold ${
                            result.variance.direction === "over"
                              ? "text-amber-400"
                              : result.variance.direction === "under"
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                          aria-label={`Variance: ${getVarianceText(result.variance.direction)}`}
                        >
                          {result.variance.direction === "over" ? "+" : result.variance.direction === "under" ? "-" : ""}
                          {formatGBP(Math.abs(result.variance.amount))}
                          <span className="ml-1 text-[10px] text-white/60">
                            ({getVarianceText(result.variance.direction)})
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {periods.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePeriod(row.id)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          aria-label={`Remove period ${row.periodIndex}`}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Warnings for periods */}
        {periods.map((row, index) => {
          const result = results[index];
          if (!result || result.warnings.length === 0) return null;
          return (
            <div key={`warnings-${row.id}`} className="mt-2 space-y-1" role="alert">
              <div className="text-xs text-white/60 mb-1">
                Period {row.periodIndex} warnings:
              </div>
              {result.warnings.map((warning, wIdx) => {
                const severityText = getWarningSeverityText(warning.severity);
                return (
                  <div
                    key={wIdx}
                    className={`rounded-lg border p-2 text-xs ${getWarningColor(
                      warning.severity
                    )}`}
                    role="alert"
                    aria-live="polite"
                  >
                    <div className="font-medium">{getWarningMessage(warning)}</div>
                    {severityText && (
                      <div className="mt-1 text-[10px] opacity-80">
                        {severityText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>

      {/* YTD Summary */}
      {results.length > 0 && (
        <section className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              Year-to-date PAYE position
            </h2>
            <p className="mt-1 text-xs text-white/50">
              Period {periods[periods.length - 1]?.periodIndex || 0} of{" "}
              {payFrequency === "monthly"
                ? 12
                : payFrequency === "weekly"
                ? 52
                : 13}
            </p>
            <p className="mt-2 text-xs text-white/60">
              We compare your actual PAYE so far with what we&apos;d expect based on your income pattern. A large difference can indicate potential over- or under-taxation.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-white/70">Actual YTD</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Gross Income:</span>
                  <span className="font-semibold text-white">
                    {formatGBP(results[results.length - 1]?.ytdActual.gross || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">PAYE Tax:</span>
                  <span className="font-semibold text-white">
                    {formatGBP(results[results.length - 1]?.ytdActual.paye || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">National Insurance:</span>
                  <span className="font-semibold text-white">
                    {formatGBP(results[results.length - 1]?.ytdActual.ni || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Student Loan:</span>
                  <span className="font-semibold text-white">
                    {formatGBP(
                      results[results.length - 1]?.ytdActual.studentLoan || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="text-white/60">Net Income:</span>
                  <span className="font-semibold text-emerald-400">
                    {formatGBP(results[results.length - 1]?.ytdActual.net || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-medium text-white/70">
                Expected YTD (Projected)
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Gross Income:</span>
                  <span className="font-semibold text-white">
                    {formatGBP(
                      results[results.length - 1]?.ytdExpected.gross || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">PAYE Tax:</span>
                  <span className="font-semibold text-white">
                    {formatGBP(
                      results[results.length - 1]?.ytdExpected.paye || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">National Insurance:</span>
                  <span className="font-semibold text-white">
                    {formatGBP(
                      results[results.length - 1]?.ytdExpected.ni || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Student Loan:</span>
                  <span className="font-semibold text-white">
                    {formatGBP(
                      results[results.length - 1]?.ytdExpected.studentLoan || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="text-white/60">Net Income:</span>
                  <span className="font-semibold text-emerald-400">
                    {formatGBP(
                      results[results.length - 1]?.ytdExpected.net || 0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Variance Summary */}
          {results[results.length - 1] && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h3 className="text-xs font-medium text-white/70 mb-2">
                Tax Variance Analysis
              </h3>
              <div className="rounded-lg border border-white/10 bg-black/20 p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">Variance Amount:</span>
                  <span
                    className={`text-sm font-semibold ${
                      results[results.length - 1].variance.direction === "over"
                        ? "text-amber-400"
                        : results[results.length - 1].variance.direction ===
                          "under"
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                    aria-label={`Tax variance: ${getVarianceText(results[results.length - 1].variance.direction)}`}
                  >
                    {results[results.length - 1].variance.direction === "over"
                      ? "+"
                      : results[results.length - 1].variance.direction ===
                        "under"
                      ? "-"
                      : ""}
                    {formatGBP(
                      Math.abs(results[results.length - 1].variance.amount)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">Status:</span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      results[results.length - 1].variance.direction === "over"
                        ? "bg-amber-500/20 text-amber-400"
                        : results[results.length - 1].variance.direction ===
                          "under"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                    aria-label={`Tax status: ${getVarianceText(results[results.length - 1].variance.direction)}`}
                  >
                    {getVarianceText(results[results.length - 1].variance.direction)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">
                    % of Expected:
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {(
                      results[results.length - 1].variance.percentOfExpected *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                {results[results.length - 1].variance.toleranceBreached && (
                  <div className="mt-2 text-xs text-white/70">
                    We compare your actual PAYE so far with what we&apos;d expect based on your income pattern. A large difference can indicate potential over- or under-taxation.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Period Range Aggregation */}
      {results.length > 0 && (
        <section className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              Totals for selected pay periods
            </h2>
            <p className="mt-1 text-xs text-white/50">
              Choose a start and end period to see total gross, tax, NI, pension and net pay for that block of payslips.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="range-from"
                className="text-xs font-medium text-white/90"
              >
                From Period (0-based index)
              </label>
              <input
                id="range-from"
                type="number"
                min={0}
                max={results.length - 1}
                value={rangeFrom}
                onChange={(e) =>
                  setRangeFrom(
                    Math.max(0, Math.min(results.length - 1, Number(e.target.value) || 0))
                  )
                }
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                aria-label="Starting period index for range aggregation"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="range-to"
                className="text-xs font-medium text-white/90"
              >
                To Period (0-based index)
              </label>
              <input
                id="range-to"
                type="number"
                min={0}
                max={results.length - 1}
                value={rangeTo}
                onChange={(e) =>
                  setRangeTo(
                    Math.max(
                      rangeFrom,
                      Math.min(results.length - 1, Number(e.target.value) || 0)
                    )
                  )
                }
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                aria-label="Ending period index for range aggregation"
              />
            </div>
          </div>

          {rangeAggregation && (
            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
              <div className="text-xs font-medium text-emerald-300">
                Totals for Periods {rangeAggregation.fromIndex + 1} to{" "}
                {rangeAggregation.toIndex + 1} ({rangeAggregation.periodsIncluded}{" "}
                periods)
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div>
                  <span className="text-white/60">Gross:</span>
                  <span className="ml-2 font-semibold text-white">
                    {formatGBP(rangeAggregation.totals.gross)}
                  </span>
                </div>
                <div>
                  <span className="text-white/60">Tax:</span>
                  <span className="ml-2 font-semibold text-white">
                    {formatGBP(rangeAggregation.totals.tax)}
                  </span>
                </div>
                <div>
                  <span className="text-white/60">NI:</span>
                  <span className="ml-2 font-semibold text-white">
                    {formatGBP(rangeAggregation.totals.ni)}
                  </span>
                </div>
                <div>
                  <span className="text-white/60">Student Loan:</span>
                  <span className="ml-2 font-semibold text-white">
                    {formatGBP(rangeAggregation.totals.studentLoan)}
                  </span>
                </div>
                <div>
                  <span className="text-white/60">Pension:</span>
                  <span className="ml-2 font-semibold text-white">
                    {formatGBP(rangeAggregation.totals.pension)}
                  </span>
                </div>
                <div>
                  <span className="text-white/60">Net:</span>
                  <span className="ml-2 font-semibold text-emerald-400">
                    {formatGBP(rangeAggregation.totals.net)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
