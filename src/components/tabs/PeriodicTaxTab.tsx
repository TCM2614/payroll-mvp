"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import {
  calculatePeriodTax,
  aggregatePeriodRange,
  createUK2025Config,
  type PeriodTaxInput,
  type PeriodTaxResult,
  type TaxWarning,
} from "@/domain/tax/periodTax";
import {
  analyseActualVsExpectedTax,
  type PeriodActualInput,
} from "@/domain/tax/periodActuals";
import { formatGBP } from "@/lib/format";
import { StudentLoanSelector } from "@/components/StudentLoanSelector";
import type { StudentLoanSelection } from "@/lib/student-loans";
import { studentLoanSelectionToLoanKeys } from "@/lib/student-loans";
import {
  trackCalculatorSubmit,
  trackResultsView,
  trackWarningShown,
  trackPeriodicAnalysisUsed,
  trackCalculatorRun,
  getSalaryBand,
} from "@/lib/analytics";
import { StickySummary } from "@/components/StickySummary";
import type { CalculatorSummary } from "@/types/calculator";

type PayFrequency = "monthly" | "weekly" | "four-weekly";

type PeriodRow = {
  id: string;
  periodIndex: number;
  gross: number;
  pension: number;
  taxCode?: string; // optional override for this period
  actualTaxForPeriod?: number; // actual PAYE tax from payslip
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

type PeriodicTaxTabProps = {
  onSummaryChange?: (summary: CalculatorSummary) => void;
};

export function PeriodicTaxTab({ onSummaryChange }: PeriodicTaxTabProps) {
  const config = createUK2025Config();

  // Input state
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("monthly");
  const [taxCode, setTaxCode] = useState("1257L");
  const [studentLoanSelection, setStudentLoanSelection] = useState<StudentLoanSelection>({
    undergraduatePlan: "none",
    hasPostgraduateLoan: false,
  });

  // Period data: array of PeriodRow
  // If taxCode is not provided for a period, it falls back to the global taxCode
  // Note: Initial periods will use the default "1257L" from taxCode state, but can be overridden per period
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
    
    // Guard: skip calculation if no valid tax code is available
    // The UI will handle showing an error state for invalid tax codes
    if (!effectiveTaxCode || effectiveTaxCode.trim().length === 0) {
      // Push null to indicate invalid period - UI will handle display
      results.push(null as unknown as PeriodTaxResult);
      return; // Skip YTD accumulation for invalid periods
    }
    
    const input: PeriodTaxInput = {
      taxYear: "2024-25",
      payFrequency,
      periodIndex: row.periodIndex,
      totalPeriodsInYear,
      grossForPeriod: row.gross,
      pensionForPeriod: row.pension,
      studentLoanPlans: studentLoanSelectionToLoanKeys(studentLoanSelection),
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

  // Actual tax analysis
  const actualTaxAnalysis = useMemo(() => {
    const periodsWithActualTax: PeriodActualInput[] = periods
      .filter((row) => row.actualTaxForPeriod !== undefined && row.actualTaxForPeriod !== null)
      .map((row) => ({
        periodIndex: row.periodIndex,
        grossForPeriod: row.gross,
        pensionForPeriod: row.pension,
        actualTaxForPeriod: row.actualTaxForPeriod!,
        taxCodeOverride: row.taxCode,
      }));

    if (periodsWithActualTax.length === 0) {
      return null;
    }

    return analyseActualVsExpectedTax(
      {
        taxYear: "2024-25",
        payFrequency,
        totalPeriodsInYear,
        baseTaxCode: taxCode,
        config,
        toleranceAmount: 50,
        tolerancePercent: 0.1,
      },
      periodsWithActualTax
    );
  }, [periods, payFrequency, totalPeriodsInYear, taxCode, config]);

  // Calculate annual gross for analytics
  const annualGross = useMemo(() => {
    if (periods.length === 0) return 0;
    const totalGross = periods.reduce((sum, p) => sum + p.gross, 0);
    if (payFrequency === "monthly") {
      return (totalGross / periods.length) * 12;
    } else if (payFrequency === "weekly") {
      return (totalGross / periods.length) * 52;
    } else {
      return (totalGross / periods.length) * 13;
    }
  }, [periods, payFrequency]);

  // Track calculator submission and calculator_run goal
  useEffect(() => {
    if (periods.length > 0 && annualGross > 0) {
      const hasPension = periods.some((p) => p.pension > 0);
      trackCalculatorSubmit({
        tab: "periodic",
        hasPension,
        hasStudentLoan:
          studentLoanSelection.undergraduatePlan !== "none" ||
          studentLoanSelection.hasPostgraduateLoan,
        salaryBand: getSalaryBand(annualGross),
      });
      // Track calculator_run goal
      trackCalculatorRun("periodic");
    }
  }, [periods.length, annualGross, studentLoanSelection]);

  // Track results view
  useEffect(() => {
    if (results.length > 0 && results[results.length - 1]) {
      trackResultsView();
    }
  }, [results.length]);

  // Track warnings and variance badges
  useEffect(() => {
    results.forEach((result, index) => {
      if (result) {
        // Track domain warnings
        if (result.warnings.length > 0) {
          result.warnings.forEach((warning) => {
            trackWarningShown({
              code: warning.code,
              severity: warning.severity as "info" | "warning" | "critical",
              tab: "periodic",
            });
          });
        }
        
        // Track variance badges when not within tolerance
        if (result.variance.direction !== "withinTolerance") {
          const severity = result.variance.direction === "over" ? "warning" : "critical";
          trackWarningShown({
            code: result.variance.direction === "over" ? "potential_overtax_mid_year" : "potential_undertax_mid_year",
            severity,
            tab: "periodic",
          });
        }
      }
    });
  }, [results]);

  // Track periodic analysis usage
  useEffect(() => {
    if (actualTaxAnalysis && actualTaxAnalysis.items.length > 0) {
      trackPeriodicAnalysisUsed();
    }
  }, [actualTaxAnalysis]);

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

  const latestResult: PeriodTaxResult | null = (() => {
    for (let i = results.length - 1; i >= 0; i--) {
      const candidate = results[i];
      if (candidate) {
        return candidate;
      }
    }
    return null;
  })();

  const currentPeriodNumber = periods[periods.length - 1]?.periodIndex ?? 0;
  const latestActualNet = latestResult?.ytdActual.net ?? 0;
  const projectedAnnualNet =
    latestActualNet > 0 && currentPeriodNumber > 0
      ? (latestActualNet / currentPeriodNumber) * totalPeriodsInYear
      : 0;
  const projectedMonthlyNet = projectedAnnualNet / 12 || 0;
  const projectedWeeklyNet = projectedAnnualNet / 52 || 0;
  const hasSummaryResults = projectedAnnualNet > 0;

  const breakdownRef = useRef<HTMLDivElement | null>(null);
  const handleScrollToBreakdown = () => {
    breakdownRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!hasSummaryResults) return;
    onSummaryChange?.({
      annualNet: projectedAnnualNet,
      monthlyNet: projectedMonthlyNet,
      weeklyNet: projectedWeeklyNet,
    });
  }, [
    hasSummaryResults,
    projectedAnnualNet,
    projectedMonthlyNet,
    projectedWeeklyNet,
    onSummaryChange,
  ]);

  const addPeriod = () => {
    const nextIndex = periods.length + 1;
    const lastPeriod = periods[periods.length - 1];
    const newPeriod: PeriodRow = {
      id: nanoid(),
      periodIndex: nextIndex,
      gross: lastPeriod?.gross || 3000,
      pension: lastPeriod?.pension || 150,
      // Don't set taxCode here - let it fall back to global taxCode
      // User can override per period if needed
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
        return "text-aqua-300 border-red-500/30 bg-red-500/10";
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
    <div className={`space-y-4 sm:space-y-6 ${hasSummaryResults ? "pt-32 lg:pt-0" : ""}`}>
      {/* Header */}
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-navy-50 sm:text-4xl">
          Periodic PAYE Check
        </h2>
        <p className="mt-1 text-sm text-navy-200">
          Analyse your PAYE tax on a period-by-period basis. Enter your actual pay for each period and we&apos;ll compare what you&apos;ve paid so far against what you&apos;d usually expect for this point in the 2024/25 tax year.
        </p>
      </header>

      {hasSummaryResults && (
        <div className="flex justify-center">
          <StickySummary
            annualNet={projectedAnnualNet}
            monthlyNet={projectedMonthlyNet}
            weeklyNet={projectedWeeklyNet}
            onSeeBreakdown={handleScrollToBreakdown}
            className="lg:max-w-4xl"
          />
        </div>
      )}

      {/* Section 1: Configuration */}
      <section className="rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-8 shadow-xl shadow-navy-900/50 shadow-navy-900/50 space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm sm:text-base font-semibold text-navy-100">Configuration</h2>
        </header>
        <p className="text-xs text-navy-200">
          Use this with your payslips to check for possible over-taxation, underpayments or issues with emergency or non-cumulative tax codes.
        </p>
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4">
          <div className="space-y-1">
            <label htmlFor="pay-frequency" className="block text-sm font-medium text-navy-100">
              Pay Frequency
            </label>
            <select
              id="pay-frequency"
              value={payFrequency}
              onChange={(e) =>
                setPayFrequency(e.target.value as PayFrequency)
              }
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
              aria-describedby="pay-frequency-help"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="four-weekly">Four-Weekly</option>
            </select>
            <p id="pay-frequency-help" className="text-xs text-navy-300">
              Choose how often you are paid (monthly, weekly or four-weekly).
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="tax-code" className="block text-sm font-medium text-navy-100">
              Tax Code
            </label>
            <input
              id="tax-code"
              type="text"
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm uppercase text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
              placeholder="1257L"
              aria-describedby="tax-code-help"
            />
            <p id="tax-code-help" className="text-xs text-navy-300">
              This is your default tax code. You can override it per period if your tax code changed mid-year.
            </p>
          </div>

          <div className="md:col-span-2">
            <StudentLoanSelector
              selection={studentLoanSelection}
              onChange={setStudentLoanSelection}
            />
          </div>
        </div>
      </section>

      {/* Section 2: Periods Input */}
      <section
        ref={breakdownRef}
        id="periodic-breakdown"
        className="rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-8 shadow-xl shadow-navy-900/50 space-y-3 scroll-mt-28"
      >
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm sm:text-base font-semibold text-navy-100">Pay Periods</h2>
          <button
            type="button"
            onClick={addPeriod}
            className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
            aria-label="Add another pay period"
          >
            + Add Period
          </button>
        </header>
        <p className="text-xs text-navy-200">
          Enter the gross and pension from your payslip. We&apos;ll calculate the tax, NI and net pay for each period.
        </p>
        
        {/* Banner explaining per-period tax codes */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          <p className="text-xs text-amber-300">
            <span className="font-semibold">Tax codes changed mid-year?</span> Add them per period to see how they affect your PAYE and potential over/under-payment.
          </p>
        </div>

        {/* Mobile: Card layout */}
        <div className="md:hidden space-y-3">
          {periods.map((row, index) => {
            const result = results[index];
            const effectiveTaxCode = (row.taxCode && row.taxCode.trim()) || taxCode;
            const hasValidTaxCode = !!effectiveTaxCode && effectiveTaxCode.trim().length > 0;
            const hasResult = result !== null && result !== undefined;
            const varianceChip = hasResult && hasValidTaxCode ? (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  result.variance.direction === "over"
                    ? "bg-aqua-500/20 text-aqua-300 border border-aqua-500/30"
                    : result.variance.direction === "under"
                    ? "bg-sea-jet-500/20 text-sea-jet-300 border border-sea-jet-500/30"
                    : "bg-ethereal-500/20 text-ethereal-300 border border-ethereal-500/30"
                }`}
              >
                {getVarianceText(result.variance.direction)}
              </span>
            ) : null;

            return (
              <div
                key={row.id}
                className={`rounded-xl border p-3 space-y-2 ${
                  !hasValidTaxCode ? "bg-aqua-500/10 border-aqua-500/30" : "bg-navy-800/40 border-sea-jet-700/30"
                }`}
              >
                {/* Row 1: Period + Variance */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy-50">
                    Period {row.periodIndex} ({payFrequency})
                  </span>
                  {varianceChip}
                </div>

                {/* Row 2: Two-column grid for Gross/Pension and Outputs */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Left: Inputs */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-navy-100 block mb-1">
                        Gross pay
                      </label>
                      <input
                        type="number"
                        value={row.gross}
                        onChange={(e) =>
                          updatePeriod(row.id, { gross: Number(e.target.value) || 0 })
                        }
                        className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-900/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
                        aria-label={`Gross pay for period ${row.periodIndex}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-navy-100 block mb-1">
                        Pension
                      </label>
                      <input
                        type="number"
                        value={row.pension}
                        onChange={(e) =>
                          updatePeriod(row.id, { pension: Number(e.target.value) || 0 })
                        }
                        className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-900/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
                        aria-label={`Pension contribution for period ${row.periodIndex}`}
                      />
                    </div>
                  </div>

                  {/* Right: Outputs */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-navy-100 block mb-1">
                        PAYE
                      </span>
                      <span className="text-sm text-navy-50 font-medium block">
                        {hasResult && hasValidTaxCode ? formatGBP(result.period.paye) : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-navy-100 block mb-1">
                        NI
                      </span>
                      <span className="text-sm text-navy-50 font-medium block">
                        {hasResult && hasValidTaxCode ? formatGBP(result.period.ni) : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-navy-100 block mb-1">
                        Net pay
                      </span>
                      <span className="text-sm font-semibold text-emerald-400 block">
                        {hasResult && hasValidTaxCode ? formatGBP(result.period.net) : "-"}
                      </span>
                    </div>
                    {hasResult && hasValidTaxCode && (
                      <div>
                        <span className="text-xs font-medium text-navy-100 block mb-1">
                          Variance
                        </span>
                        <span
                          className={`text-xs font-medium block ${
                            result.variance.direction === "over"
                              ? "text-amber-300"
                              : result.variance.direction === "under"
                              ? "text-rose-300"
                              : "text-navy-200"
                          }`}
                        >
                          {result.variance.direction === "over" ? "+" : result.variance.direction === "under" ? "-" : ""}
                          {formatGBP(Math.abs(result.variance.amount))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 3: Full-width Actual PAYE tax field */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-navy-200 block">
                    Actual PAYE tax (£)
                  </label>
                  <input
                    type="number"
                    value={row.actualTaxForPeriod ?? ""}
                    onChange={(e) =>
                      updatePeriod(row.id, {
                        actualTaxForPeriod: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-900/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
                    aria-label={`Actual PAYE tax for period ${row.periodIndex}`}
                    placeholder="From payslip"
                  />
                  <p className="text-xs text-navy-200">
                    Use the PAYE tax taken from this payslip.
                  </p>
                </div>

                {/* Row 4: Full-width Tax code field */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-navy-200 block">
                    Tax code
                  </label>
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
                      className={`flex-1 rounded-xl border px-4 py-3 text-sm uppercase text-navy-50 focus:ring-2 focus:ring-emerald-500/40 placeholder:text-navy-400 ${
                        !hasValidTaxCode
                          ? "border-red-500/50 bg-red-500/10 focus:border-red-400"
                          : "border-sea-jet-600/40 bg-sea-jet-900/60 focus:border-emerald-400"
                      }`}
                      aria-label={`Tax code for period ${row.periodIndex}`}
                      aria-invalid={!hasValidTaxCode}
                    />
                    {row.taxCode && row.taxCode.trim() && row.taxCode.trim() !== taxCode && (
                      <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-500/30">
                        Override
                      </span>
                    )}
                  </div>
                </div>

                {/* Remove button */}
                {periods.length > 1 && (
                  <div className="pt-2 border-t border-sea-jet-700/30">
                    <button
                      type="button"
                      onClick={() => removePeriod(row.id)}
                      className="text-xs text-rose-300 hover:text-rose-200 transition-colors"
                      aria-label={`Remove period ${row.periodIndex}`}
                    >
                      Remove period
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden md:block overflow-x-auto">
          <p className="text-xs text-navy-300 mb-2">Scroll sideways to see all columns</p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-sea-jet-700/30">
                <th className="text-left py-2 px-3 text-xs font-semibold text-navy-100">
                  Period
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-navy-100">
                  Gross pay
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-navy-100">
                  Pension
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-navy-100">
                  Tax code (per period)
                </th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-700 min-w-[150px]">
                  Actual PAYE tax (£)
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-700">
                  PAYE (expected)
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-700">
                  NI
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-700">
                  Net pay
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-700">
                  Variance
                </th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-slate-700 w-16">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {periods.map((row, index) => {
                const result = results[index];
                const effectiveTaxCode = (row.taxCode && row.taxCode.trim()) || taxCode;
                const hasValidTaxCode = !!effectiveTaxCode && effectiveTaxCode.trim().length > 0;
                const hasResult = result !== null && result !== undefined;
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-sea-jet-700/30 hover:bg-white/5 transition-colors ${
                      !hasValidTaxCode ? "bg-red-50 border-red-200" : ""
                    }`}
                  >
                    <td className="py-3 px-3 text-xs text-navy-200">
                      {row.periodIndex} ({payFrequency})
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        value={row.gross}
                        onChange={(e) =>
                          updatePeriod(row.id, { gross: Number(e.target.value) || 0 })
                        }
                        className="w-full min-w-[80px] rounded-xl border border-sea-jet-600/40 bg-sea-jet-900/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
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
                        className="w-full min-w-[80px] rounded-xl border border-sea-jet-600/40 bg-sea-jet-900/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
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
                            className={`flex-1 min-w-[100px] rounded-lg border px-2 py-1.5 text-xs uppercase text-navy-50 focus:ring-1 focus:ring-indigo-500/20 placeholder:text-slate-400 ${
                              !hasValidTaxCode
                                ? "border-red-500 bg-red-50 focus:border-red-400"
                                : "border-slate-300 bg-white focus:border-indigo-500"
                            }`}
                            aria-label={`Tax code for period ${row.periodIndex}`}
                            aria-invalid={!hasValidTaxCode}
                          />
                          {row.taxCode && row.taxCode.trim() && row.taxCode.trim() !== taxCode && (
                            <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-500/30">
                              Override
                            </span>
                          )}
                        </div>
                        {!hasValidTaxCode ? (
                          <p className="text-[10px] text-aqua-200">
                            Tax code is required.
                          </p>
                        ) : (
                          <p className="text-[10px] text-navy-200">
                            Optional: leave blank to use default.
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 min-w-[150px]">
                      <label className="text-xs font-medium text-navy-100 block mb-1">
                        Actual PAYE tax (£)
                      </label>
                      <input
                        type="number"
                        value={row.actualTaxForPeriod ?? ""}
                        onChange={(e) =>
                          updatePeriod(row.id, {
                            actualTaxForPeriod: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-900/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
                        aria-label={`Actual PAYE tax for period ${row.periodIndex}`}
                        placeholder="From payslip"
                      />
                      <p className="mt-1 text-xs text-navy-200">
                        Use PAYE tax from payslip.
                      </p>
                    </td>
                    <td className="py-3 px-3 text-right text-xs font-semibold text-navy-50">
                      {hasResult && hasValidTaxCode ? formatGBP(result.period.paye) : "-"}
                    </td>
                    <td className="py-3 px-3 text-right text-xs font-semibold text-navy-50">
                      {hasResult && hasValidTaxCode ? formatGBP(result.period.ni) : "-"}
                    </td>
                    <td className="py-3 px-3 text-right text-xs font-semibold text-emerald-400">
                      {hasResult && hasValidTaxCode ? formatGBP(result.period.net) : "-"}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {hasResult && hasValidTaxCode && (
                        <span
                          className={`text-xs font-semibold ${
                            result.variance.direction === "over"
                              ? "text-amber-300"
                              : result.variance.direction === "under"
                              ? "text-rose-300"
                              : "text-navy-200"
                          }`}
                          aria-label={`Variance: ${getVarianceText(result.variance.direction)}`}
                        >
                          {result.variance.direction === "over" ? "+" : result.variance.direction === "under" ? "-" : ""}
                          {formatGBP(Math.abs(result.variance.amount))}
                          <span className="ml-1 text-[10px] text-navy-200">
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
                          className="text-xs text-rose-300 hover:text-rose-200 transition-colors"
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
          const effectiveTaxCode = (row.taxCode && row.taxCode.trim()) || taxCode;
          const hasValidTaxCode = !!effectiveTaxCode && effectiveTaxCode.trim().length > 0;
          
          // Show error message if tax code is invalid
          if (!hasValidTaxCode) {
            return (
              <div key={`error-${row.id}`} className="mt-2" role="alert">
                <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-sea-jet-500/20 text-sea-jet-300 border border-sea-jet-500/30">
                  <span>⚠</span>
                  <span>Tax code required for period {row.periodIndex}</span>
                </div>
              </div>
            );
          }
          
          if (!result || result.warnings.length === 0) return null;
          return (
            <div key={`warnings-${row.id}`} className="mt-2 flex flex-wrap gap-1.5" role="alert">
              {result.warnings.map((warning, wIdx) => {
                const severityText = getWarningSeverityText(warning.severity);
                const pillColor = warning.severity === "critical" 
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  : warning.severity === "warning"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
                return (
                  <div
                    key={wIdx}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border ${pillColor}`}
                    role="alert"
                    aria-live="polite"
                    title={severityText || getWarningMessage(warning)}
                  >
                    <span>{warning.severity === "critical" ? "⚠" : warning.severity === "warning" ? "⚡" : "ℹ"}</span>
                    <span>{getWarningMessage(warning)}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>

              {/* Section 3.5: Actual Tax Paid Analysis */}
        {actualTaxAnalysis && actualTaxAnalysis.items.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-sea-jet-900/40 p-4 sm:p-5 space-y-3 md:sticky md:top-2 md:z-10">
          <header className="flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-navy-50">
              Actual tax paid vs expected
            </h2>
          </header>
            <p className="text-sm text-navy-200">
            Compare the actual PAYE tax from your payslips against what we&apos;d expect based on your income.
          </p>

          {/* Per-period analysis */}
          <div className="space-y-2">
            {actualTaxAnalysis.items.map((item) => {
              const periodRow = periods.find((p) => p.periodIndex === item.periodIndex);
              if (!periodRow) return null;

              const periodVarianceBadge =
                item.variance.periodDirection === "over"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : item.variance.periodDirection === "under"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-sky-50 text-sky-700 border-sky-200";

              const periodVarianceText =
                item.variance.periodDirection === "over"
                  ? `Over-taxed this period by ${formatGBP(Math.abs(item.variance.periodAmount))}`
                  : item.variance.periodDirection === "under"
                  ? `Under-taxed this period by ${formatGBP(Math.abs(item.variance.periodAmount))}`
                  : "Within normal range";

              return (
                <div
                  key={item.periodIndex}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-2 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-navy-200">
                      Period {item.periodIndex}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${periodVarianceBadge}`}
                    >
                      {periodVarianceText}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                    <div>
                      <span className="text-navy-200">Expected:</span>
                      <span className="ml-1 font-semibold text-navy-50">
                        {formatGBP(item.expected.payeForPeriod)}
                      </span>
                    </div>
                    <div>
                      <span className="text-navy-200">Actual:</span>
                      <span className="ml-1 font-semibold text-navy-50">
                        {formatGBP(item.actual.taxForPeriod)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cumulative summary */}
          <div className="mt-3 pt-3 border-t border-slate-200">
            <h3 className="text-xs font-medium text-navy-200 mb-2">
              Cumulative over/under payment
            </h3>
            <div className="rounded-lg border border-sea-jet-700/30 bg-sea-jet-900/50 p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-700">Cumulative variance:</span>
                <span
                  className={`text-lg font-semibold ${
                    actualTaxAnalysis.finalDirection === "over"
                      ? "text-emerald-700"
                      : actualTaxAnalysis.finalDirection === "under"
                      ? "text-rose-700"
                      : "text-slate-800"
                  }`}
                >
                  {actualTaxAnalysis.finalDirection === "over" ? "+" : actualTaxAnalysis.finalDirection === "under" ? "-" : ""}
                  {formatGBP(Math.abs(actualTaxAnalysis.finalCumulativeAmount))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-700">Status:</span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    actualTaxAnalysis.finalDirection === "over"
                      ? "bg-emerald-100 text-emerald-700"
                      : actualTaxAnalysis.finalDirection === "under"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {actualTaxAnalysis.finalDirection === "over"
                    ? "Estimated overpayment so far"
                    : actualTaxAnalysis.finalDirection === "under"
                    ? "Estimated underpayment so far"
                    : "Your PAYE looks broadly in line with expectations so far"}
                </span>
              </div>

              {/* This month's difference */}
              {actualTaxAnalysis.items.length > 0 && (() => {
                const lastItem = actualTaxAnalysis.items[actualTaxAnalysis.items.length - 1];
                const diffThisMonth = lastItem.actual.taxForPeriod - lastItem.expected.payeForPeriod;
                const absDiff = Math.abs(diffThisMonth);
                if (absDiff > 10) {
                  return (
                    <p className="text-sm text-slate-700 mt-2">
                      This month you paid about {formatGBP(absDiff)}{" "}
                      {diffThisMonth > 0 ? "more" : "less"} tax than expected for this income.
                    </p>
                  );
                }
                return (
                  <p className="text-sm text-slate-700 mt-2">
                    This month&apos;s PAYE looks close to the expected amount.
                  </p>
                );
              })()}

              <p className="text-[11px] text-navy-300 mt-2">
                These figures are estimates based on the 2024/25 UK PAYE rules and your inputs. They are for guidance only and not an official HMRC calculation.
              </p>
            </div>
          </div>
        </section>
      )}

        {/* Section 4: Period Range Aggregation */}
        {results.length > 0 && (
                <section className="rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-8 shadow-xl shadow-navy-900/50 space-y-3">
          <header className="flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-navy-50">
              Totals for selected pay periods
            </h2>
          </header>
          <p className="text-[11px] text-navy-300">
            Choose a start and end period to see total gross, tax, NI, pension and net pay for that block of payslips.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="space-y-1 flex-1">
              <label
                htmlFor="range-from"
                className="text-xs font-medium text-navy-200"
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
                className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-900/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
                aria-label="Starting period index for range aggregation"
              />
            </div>

            <div className="space-y-1 flex-1">
              <label
                htmlFor="range-to"
                className="text-xs font-medium text-navy-200"
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
                className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-900/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
                aria-label="Ending period index for range aggregation"
              />
            </div>
          </div>

          {rangeAggregation && (
            <div className="mt-3 rounded-lg border border-indigo-200 bg-sea-jet-900/40 p-3 space-y-2">
              <div className="text-xs font-medium text-navy-200">
                Totals for Periods {rangeAggregation.fromIndex + 1} to{" "}
                {rangeAggregation.toIndex + 1} ({rangeAggregation.periodsIncluded}{" "}
                periods)
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
                <div>
                  <span className="text-navy-200">Gross:</span>
                  <span className="ml-2 font-semibold text-navy-50">
                    {formatGBP(rangeAggregation.totals.gross)}
                  </span>
                </div>
                <div>
                  <span className="text-navy-200">Tax:</span>
                  <span className="ml-2 font-semibold text-navy-50">
                    {formatGBP(rangeAggregation.totals.tax)}
                  </span>
                </div>
                <div>
                  <span className="text-navy-200">NI:</span>
                  <span className="ml-2 font-semibold text-navy-50">
                    {formatGBP(rangeAggregation.totals.ni)}
                  </span>
                </div>
                <div>
                  <span className="text-navy-200">Student Loan:</span>
                  <span className="ml-2 font-semibold text-navy-50">
                    {formatGBP(rangeAggregation.totals.studentLoan)}
                  </span>
                </div>
                <div>
                  <span className="text-navy-200">Pension:</span>
                  <span className="ml-2 font-semibold text-navy-50">
                    {formatGBP(rangeAggregation.totals.pension)}
                  </span>
                </div>
                <div>
                  <span className="text-navy-200">Net:</span>
                  <span className="ml-2 font-semibold text-indigo-600">
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
