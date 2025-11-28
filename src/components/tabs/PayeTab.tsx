"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import SIPPAndSalarySacrifice from "@/components/SIPPAndSalarySacrifice";
import { StudentLoanSelector } from "@/components/StudentLoanSelector";
import { TaxYearToggle } from "@/components/TaxYearToggle";
import { TaxBreakdownChart } from "@/components/TaxBreakdownChart";
import { StickySummary } from "@/components/StickySummary";
import type { StudentLoanSelection } from "@/lib/student-loans";
import { studentLoanSelectionToLoanKeys } from "@/lib/student-loans";
import { calcPAYECombined } from "@/lib/calculators/paye";
import { formatGBP } from "@/lib/format";
import type { CalculatorSummary } from "@/types/calculator";
import { LoanKey } from "@/lib/tax/uk2025";
import type { TaxYearLabel } from "@/lib/taxYear";
import {
  trackCalculatorSubmit,
  trackResultsView,
  trackCalculatorRun,
  getSalaryBand,
} from "@/lib/analytics";



type EmploymentKind = "main" | "additional";

type JobInput = {
  id: number;
  name: string;
  kind: EmploymentKind;
  grossMonthly: number;
  taxCode: string;
};

// Per-job breakdown from calculation
type JobBreakdown = {
  id: string;
  label: string;
  kind: EmploymentKind;
  grossAnnual: number;
  annualPAYE: number;
  annualNI: number;
  annualPensionEmployee: number;
  netAnnual: number;
  // Period splits
  monthly: number;
  weekly: number;
};

// Combined breakdown across all jobs
type CombinedJobsBreakdown = {
  grossAnnual: number;
  annualPAYE: number;
  annualNI: number;
  annualPensionEmployee: number;
  annualStudentLoan: number;
  studentLoanBreakdown: Array<{ plan: LoanKey; label: string; amount: number }>;
  netAnnual: number;
  monthly: number;
  weekly: number;
};

type PayeTabProps = {
  onAnnualGrossChange?: (value: number) => void;
  onNetAnnualChange?: (value: number) => void;
  onSummaryChange?: (summary: CalculatorSummary) => void;
  onShowWealthTab?: () => void;
};



export function PayeTab({
  onAnnualGrossChange,
  onNetAnnualChange,
  onSummaryChange,
  onShowWealthTab,
}: PayeTabProps) {
  const [primaryIncome, setPrimaryIncome] = useState("6000");

  const [primaryFrequency, setPrimaryFrequency] = useState<

    "monthly" | "annual" | "weekly" | "daily" | "hourly"

  >("monthly");

  // Hourly mode inputs (for calculations when frequency is hourly)
  const [hoursPerWeek, setHoursPerWeek] = useState(37.5);
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  // Optional UX input for hourly context (always available, not used in calculations)
  const [optionalHoursPerWeek, setOptionalHoursPerWeek] = useState<string>("");

  function toMonthly(value: string | number, freq: typeof primaryFrequency): number {
    const numericValue = typeof value === "string" 
      ? parseFloat(value.replace(/,/g, "")) || 0 
      : value;
    
    switch (freq) {
      case "annual":
        return numericValue / 12;

      case "weekly":
        return (numericValue * 52) / 12;

      case "daily":
        // assume 5 working days per week
        return (numericValue * 5 * 52) / 12;

      case "hourly": {
        // weeklyIncome = hourlyRate * hoursPerWeek
        // annualIncome = weeklyIncome * 52
        // monthlyIncome = annualIncome / 12
        const weeklyIncome = numericValue * hoursPerWeek;
        const annualIncome = weeklyIncome * 52;
        return annualIncome / 12;
      }

      case "monthly":
      default:
        return numericValue;
    }
  }



  const [primaryTaxCode, setPrimaryTaxCode] = useState("1257L");



  const [jobs, setJobs] = useState<JobInput[]>([]);
  const [nextJobId, setNextJobId] = useState(1);

  const [studentLoanSelection, setStudentLoanSelection] = useState<StudentLoanSelection>({
    undergraduatePlan: "none",
    hasPostgraduateLoan: false,
  });

  // UI-level tax year selection (kept separate from postgrad schema)
  const [taxYear, setTaxYear] = useState<TaxYearLabel>("2025-26");

  const [pensionPct, setPensionPct] = useState(5);

  const [salarySacrificeFixed, setSalarySacrificeFixed] = useState(0);

  const [sippPersonal, setSippPersonal] = useState(0);



  const [cgtGains, setCgtGains] = useState(0);

  const [cgtAllowance, setCgtAllowance] = useState(3000);

  const [cgtRate, setCgtRate] = useState(20);



  const [debtPrincipal, setDebtPrincipal] = useState(0);

  const [debtRate, setDebtRate] = useState(10);



  const primaryGrossMonthly = toMonthly(primaryIncome, primaryFrequency);

  const annualGross = primaryGrossMonthly * 12;

  const weeklyGross = annualGross / 52;

  // Calculate hourly rate for display (only when not in hourly mode)
  const numericPrimaryIncome = parseFloat(primaryIncome.replace(/,/g, "")) || 0;
  const hourlyRate = primaryFrequency === "hourly" 
    ? numericPrimaryIncome 
    : weeklyGross / (hoursPerWeek || 37.5);



  const allJobs: JobInput[] = [
    { id: 0, name: "Primary job", kind: "main", grossMonthly: primaryGrossMonthly, taxCode: primaryTaxCode },
    ...jobs.map(job => ({ ...job, kind: "additional" as const })),
  ];



  // Calculate multi-job scenario with per-job and combined breakdowns
  // Use calcPAYECombined for proper multi-job handling with shared PA allocation
  const calculationResult = useMemo(() => {
    const loans = studentLoanSelectionToLoanKeys(studentLoanSelection);
    
    const result = calcPAYECombined({
      streams: allJobs.map((job) => ({
        id: job.id === 0 ? "primary" : `job-${job.id}`,
        label: job.name,
        frequency: "monthly" as const,
        amount: job.grossMonthly,
        taxCode: job.taxCode,
        salarySacrificePct: job.id === 0 ? (pensionPct > 0 ? pensionPct : undefined) : undefined,
      })),
      sippPersonal,
      loans,
      taxYear,
    });

    // Extract per-job breakdowns from stream results
    const jobBreakdowns: JobBreakdown[] = result.streams.map((stream) => {
      const job = allJobs.find(j => (j.id === 0 ? "primary" : `job-${j.id}`) === stream.id);
      const kind = job?.kind || (stream.id === "primary" ? "main" : "additional");
      
      // Calculate net for this job (gross - tax - NI - pension)
      // Note: Student loans are calculated on combined gross, so they appear only in combined summary
      const annualPensionEmployee = stream.salarySacrifice || 0;
      const netAnnual = stream.annualisedGross - stream.incomeTax - stream.employeeNI - annualPensionEmployee;

      return {
        id: stream.id,
        label: stream.label,
        kind,
        grossAnnual: stream.annualisedGross,
        annualPAYE: stream.incomeTax,
        annualNI: stream.employeeNI,
        annualPensionEmployee,
        netAnnual,
        monthly: netAnnual / 12,
        weekly: netAnnual / 52,
      };
    });

    // Combined breakdown (sums across all jobs + student loans)
    const combined: CombinedJobsBreakdown = {
      grossAnnual: result.totalGrossAnnual,
      annualPAYE: result.totalIncomeTax,
      annualNI: result.totalEmployeeNI,
      annualPensionEmployee: result.streams.reduce((sum, s) => sum + (s.salarySacrifice || 0), 0),
      annualStudentLoan: result.totalStudentLoans,
      studentLoanBreakdown: result.studentLoanBreakdown,
      netAnnual: result.totalTakeHomeAnnual,
      monthly: result.totalTakeHomeAnnual / 12,
      weekly: result.totalTakeHomeAnnual / 52,
    };

    return {
      jobs: jobBreakdowns,
      combined,
    };
  }, [studentLoanSelection, allJobs, pensionPct, sippPersonal, hoursPerWeek]);

  const breakdownRef = useRef<HTMLDivElement | null>(null);
  const hasResults = calculationResult.combined.netAnnual > 0;

  const handleScrollToBreakdown = () => {
    breakdownRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Expose combined gross/net up to the parent for use in other tabs (e.g. wealth percentile)
  useEffect(() => {
    if (calculationResult.combined.grossAnnual > 0) {
      onAnnualGrossChange?.(calculationResult.combined.grossAnnual);
    }
    if (calculationResult.combined.netAnnual > 0) {
      onNetAnnualChange?.(calculationResult.combined.netAnnual);
    }
  }, [calculationResult.combined.grossAnnual, calculationResult.combined.netAnnual, onAnnualGrossChange, onNetAnnualChange]);

  useEffect(() => {
    if (!hasResults) return;
    onSummaryChange?.({
      annualNet: calculationResult.combined.netAnnual,
      monthlyNet: calculationResult.combined.monthly,
      weeklyNet: calculationResult.combined.weekly,
      annualGross: calculationResult.combined.grossAnnual,
    });
  }, [
    hasResults,
    calculationResult.combined.netAnnual,
    calculationResult.combined.monthly,
    calculationResult.combined.weekly,
    calculationResult.combined.grossAnnual,
    onSummaryChange,
  ]);

  // Track calculator submission and calculator_run goal
  useEffect(() => {
    const totalGross = calculationResult.combined.grossAnnual;
    if (totalGross > 0) {
      const hasStudentLoan =
        studentLoanSelection.undergraduatePlan !== "none" ||
        studentLoanSelection.hasPostgraduateLoan;
      trackCalculatorSubmit({
        tab: "standard",
        hasPension: pensionPct > 0 || salarySacrificeFixed > 0 || sippPersonal > 0,
        hasStudentLoan,
        salaryBand: getSalaryBand(totalGross),
      });
      // Track calculator_run goal
      trackCalculatorRun("standard");
    }
  }, [calculationResult, pensionPct, salarySacrificeFixed, sippPersonal, studentLoanSelection]);

  // Track results view
  useEffect(() => {
    if (calculationResult.combined.netAnnual > 0) {
      trackResultsView();
    }
  }, [calculationResult]);



  const yearlyDebtInterest = (debtPrincipal * debtRate) / 100;

  const monthlyDebtInterest = yearlyDebtInterest / 12;



  const cgtTaxable = Math.max(cgtGains - cgtAllowance, 0);

  const cgtDue = (cgtTaxable * cgtRate) / 100;



  function addJob() {

    setJobs((prev) => [

      ...prev,

      { id: nextJobId, name: `Job ${nextJobId}`, kind: "additional", grossMonthly: 0, taxCode: "BR" },

    ]);

    setNextJobId((id) => id + 1);

  }



  function updateJob(id: number, field: keyof JobInput, value: string | number) {

    setJobs((prev) =>

      prev.map((job) => (job.id === id ? { ...job, [field]: value } : job)),

    );

  }



  function removeJob(id: number) {

    setJobs((prev) => prev.filter((job) => job.id !== id));

  }



  return (
    <div className={`space-y-4 sm:space-y-6 ${hasResults ? "pt-32 lg:pt-0" : ""}`}>

      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-navy-50 sm:text-4xl">
            Standard PAYE salary calculator
          </h2>
          <p className="mt-1 text-sm text-navy-200">
            Use this tab if you&apos;re a UK employee paid through PAYE. For payslip-by-payslip checks, use the &apos;Periodic tax check&apos; tab.
          </p>
        </div>
        <TaxYearToggle value={taxYear} onChange={setTaxYear} />
      </header>

      {hasResults && (
        <div className="flex justify-center">
          <StickySummary
            annualNet={calculationResult.combined.netAnnual}
            monthlyNet={calculationResult.combined.monthly}
            weeklyNet={calculationResult.combined.weekly}
            onSeeBreakdown={handleScrollToBreakdown}
            className="lg:mt-2 lg:max-w-4xl"
          />
        </div>
      )}

      {/* Section 1: Primary job inputs */}
      <section className="rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-8 shadow-xl shadow-navy-900/50 space-y-3">

        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-navy-100 sm:text-base">Primary job</h2>
        </header>
        <p className="text-xs text-navy-200">
          Enter your main employment income details
        </p>

        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4">

          {/* Income input with frequency selector */}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-navy-100">
              {primaryFrequency === "hourly" ? "Hourly rate" : "Income"}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={primaryIncome}
                onChange={(e) => {
                  const raw = e.target.value;

                  // Allow empty string
                  if (raw === "") {
                    setPrimaryIncome("");
                    return;
                  }

                  // Allow only numbers + decimals + commas
                  const cleaned = raw.replace(/[^0-9.,]/g, "");
                  setPrimaryIncome(cleaned);
                }}
                placeholder="Enter your income"
                className="flex-1 rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
              />
              <select
                value={primaryFrequency}
                onChange={(e) =>
                  setPrimaryFrequency(e.target.value as typeof primaryFrequency)
                }
                className="rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
              >
                <option value="monthly">per month</option>
                <option value="annual">per year</option>
                <option value="weekly">per week</option>
                <option value="daily">per day</option>
                <option value="hourly">per hour</option>
              </select>
            </div>
            {primaryFrequency === "hourly" ? (
              <p className="text-xs text-navy-300">
                Annual: {formatGBP(annualGross)} | Monthly: {formatGBP(primaryGrossMonthly)}
              </p>
            ) : (
              <p className="text-xs text-navy-300">
                Annual: {formatGBP(annualGross)} | Hourly (est.): £{hourlyRate.toFixed(2)}
              </p>
            )}
          </div>

          {/* Optional Hours per week (always visible, UX only) */}
          <div className="mt-3 md:col-span-2">
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-navy-100">
                Hours per week (optional)
              </label>
              <input
                type="text"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={optionalHoursPerWeek}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setOptionalHoursPerWeek("");
                    return;
                  }
                  const cleaned = raw.replace(/[^0-9.,]/g, "");
                  setOptionalHoursPerWeek(cleaned);
                }}
                placeholder="e.g. 37.5"
                className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
              />
              <p className="text-xs text-navy-300">
                Used to derive hourly breakdown from your results
              </p>
            </div>
          </div>

          {/* Hours and Days inputs (only when hourly) */}
          {primaryFrequency === "hourly" && (
            <>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-navy-100">
                  Hours worked per week
                </label>
                <input
                  type="number"
                  min="1"
                  max="80"
                  step="0.5"
                  value={hoursPerWeek}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (isNaN(val) || val < 1) {
                      setHoursPerWeek(1);
                    } else if (val > 80) {
                      setHoursPerWeek(80);
                    } else {
                      setHoursPerWeek(val);
                    }
                  }}
                  onBlur={(e) => {
                    const val = Number(e.target.value);
                    if (isNaN(val) || val < 1) {
                      setHoursPerWeek(1);
                    } else if (val > 80) {
                      setHoursPerWeek(80);
                    }
                  }}
                  required={primaryFrequency === "hourly"}
                  className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
                />
                <p className="text-xs text-navy-300">
                  Min: 1, Max: 80
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-navy-100">
                  Days worked per week
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  step="1"
                  value={daysPerWeek}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (isNaN(val) || val < 1) {
                      setDaysPerWeek(1);
                    } else if (val > 7) {
                      setDaysPerWeek(7);
                    } else {
                      setDaysPerWeek(Math.floor(val));
                    }
                  }}
                  onBlur={(e) => {
                    const val = Number(e.target.value);
                    if (isNaN(val) || val < 1) {
                      setDaysPerWeek(1);
                    } else if (val > 7) {
                      setDaysPerWeek(7);
                    } else {
                      setDaysPerWeek(Math.floor(val));
                    }
                  }}
                  required={primaryFrequency === "hourly"}
                  className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
                />
                <p className="text-xs text-navy-300">
                  Min: 1, Max: 7
                </p>
              </div>

              {/* Validation error message */}
              {primaryFrequency === "hourly" && (hoursPerWeek < 1 || hoursPerWeek > 80 || daysPerWeek < 1 || daysPerWeek > 7) && (
                <div className="md:col-span-2">
                  <p className="text-xs text-rose-400">
                    Please enter valid hours (1-80) and days (1-7) worked per week for accurate calculations.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Tax code */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-navy-100">Tax code</label>
            <input
              type="text"
              value={primaryTaxCode}
              onChange={(e) => setPrimaryTaxCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm uppercase text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
            />
            <p className="text-xs text-navy-300">
              Your default tax code (e.g. 1257L)
            </p>
          </div>

          {/* Student loans */}
          <div className="md:col-span-2">
            <StudentLoanSelector
              selection={studentLoanSelection}
              onChange={setStudentLoanSelection}
            />
          </div>

        </div>

      </section>



      {/* Section 2: Pension & SIPP */}
      <section className="rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-8 shadow-xl shadow-navy-900/50 space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-navy-100 sm:text-base">Pension & SIPP</h2>
        </header>
        <SIPPAndSalarySacrifice
          salarySacrificePct={pensionPct}
          setSalarySacrificePct={setPensionPct}
          salarySacrificeFixed={salarySacrificeFixed}
          setSalarySacrificeFixed={setSalarySacrificeFixed}
          sippPersonal={sippPersonal}
          setSippPersonal={setSippPersonal}
        />
      </section>

      {/* Section 3: Additional jobs */}
      <section className="rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-8 shadow-xl shadow-navy-900/50 space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-navy-100 sm:text-base">Additional jobs</h2>
          <button
            type="button"
            onClick={addJob}
            className="rounded-xl bg-brilliant-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brilliant-500/30 transition hover:bg-brilliant-600"
          >
            + Add job
          </button>
        </header>

        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-sea-jet-700/20 bg-navy-800/40 p-3 space-y-2"
            >
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-navy-100">Name</label>
                  <input
                    value={job.name}
                    onChange={(e) => updateJob(job.id, "name", e.target.value)}
                    className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-3 py-2 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-navy-100">Gross / month (£)</label>
                  <input
                    type="number"
                    value={job.grossMonthly}
                    onChange={(e) =>
                      updateJob(job.id, "grossMonthly", Number(e.target.value) || 0)
                    }
                    className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-3 py-2 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-navy-100">Tax code</label>
                  <input
                    value={job.taxCode}
                    onChange={(e) =>
                      updateJob(job.id, "taxCode", e.target.value.toUpperCase())
                    }
                    className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-3 py-2 text-sm uppercase text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeJob(job.id)}
                className="text-xs text-aqua-300 hover:text-aqua-200 transition-colors"
              >
                Remove job
              </button>
            </div>
          ))}
          {jobs.length === 0 && (
            <p className="text-xs text-navy-300">
              No extra jobs added yet. Click &quot;+ Add job&quot; to include more employment.
            </p>
          )}
        </div>
      </section>

      {/* Section 4: Results */}
      <section
        ref={breakdownRef}
        id="takehome-breakdown"
        className="space-y-4 scroll-mt-28"
      >
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-brand-text sm:text-base">
            Take-home pay breakdown
          </h2>
        </header>

        {/* Per-job breakdowns */}
        <div className="space-y-4">
          {calculationResult.jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-3xl bg-brand-surface/80 border border-brand-border/60 shadow-soft-xl backdrop-blur-xl p-4 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-brand-text">
                    {job.kind === "main" ? "Main job" : "Additional job"} – {job.label}
                  </h3>
                  <p className="mt-1 text-xs text-brand-textMuted">
                    Headline net take-home:{" "}
                    <span className="font-semibold text-brand-text">
                      {formatGBP(job.netAnnual)} / year
                    </span>{" "}
                    ({formatGBP(job.monthly)} / month)
                  </p>
                </div>
                {job.kind === "additional" && (
                  <button
                    type="button"
                    onClick={() => {
                      const jobId = job.id === "primary" ? 0 : Number(job.id.replace("job-", ""));
                      if (!isNaN(jobId) && jobId > 0) {
                        removeJob(jobId);
                      }
                    }}
                    className="text-xs text-brand-textMuted hover:text-brand-text transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-brand-textMuted">Gross pay (annual)</dt>
                  <dd className="text-right font-medium text-brand-text">
                    {formatGBP(job.grossAnnual)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-brand-textMuted">Gross pay (monthly)</dt>
                  <dd className="text-right font-medium text-brand-text">
                    {formatGBP(job.grossAnnual / 12)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-brand-textMuted">PAYE income tax</dt>
                  <dd className="text-right font-medium text-brand-text">
                    {formatGBP(job.annualPAYE)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-brand-textMuted">National Insurance</dt>
                  <dd className="text-right font-medium text-brand-text">
                    {formatGBP(job.annualNI)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-brand-textMuted">Workplace pension (employee)</dt>
                  <dd className="text-right font-medium text-brand-text">
                    {formatGBP(job.annualPensionEmployee)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-brand-textMuted">Student loans</dt>
                  <dd className="text-right text-xs text-brand-textMuted">
                    Included in combined totals below
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-brand-border/40 pt-2">
                  <dt className="text-brand-text font-medium">Net take-home (annual)</dt>
                  <dd className="text-right font-semibold text-brand-accent">
                    {formatGBP(job.netAnnual)}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        {/* Combined summary */}
        <div className="rounded-3xl bg-brand-surface/80 border border-brand-border/60 shadow-soft-xl backdrop-blur-xl p-4 sm:p-6 space-y-4">
          <header className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-brand-text">
                Combined across all jobs
              </h3>
              <p className="mt-1 text-xs text-brand-textMuted">
                Estimated PAYE take-home after income tax, NI, pension and SIPP.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xxs text-brand-textMuted">Net take-home (monthly)</p>
              <p className="text-2xl font-bold text-brand-text">
                {formatGBP(calculationResult.combined.monthly)}
              </p>
            </div>
          </header>

          {calculationResult.combined.grossAnnual > 0 ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
              <div className="h-64 lg:h-72">
                <TaxBreakdownChart
                  netPay={calculationResult.combined.netAnnual}
                  incomeTax={calculationResult.combined.annualPAYE}
                  nationalInsurance={calculationResult.combined.annualNI}
                  pension={calculationResult.combined.annualPensionEmployee + sippPersonal}
                  height={260}
                />
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-brand-textMuted">Gross pay (annual)</dt>
                  <dd className="text-right font-medium text-brand-text">
                    {formatGBP(calculationResult.combined.grossAnnual)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-brand-textMuted">PAYE income tax</dt>
                  <dd className="text-right font-medium text-brand-text">
                    {formatGBP(calculationResult.combined.annualPAYE)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-brand-textMuted">National Insurance</dt>
                  <dd className="text-right font-medium text-brand-text">
                    {formatGBP(calculationResult.combined.annualNI)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-brand-textMuted">Workplace pension (employee)</dt>
                  <dd className="text-right font-medium text-brand-text">
                    {formatGBP(calculationResult.combined.annualPensionEmployee)}
                  </dd>
                </div>
                {sippPersonal > 0 && (
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-brand-textMuted">SIPP contributions (personal)</dt>
                    <dd className="text-right font-medium text-brand-text">
                      {formatGBP(sippPersonal)}
                    </dd>
                  </div>
                )}

                {/* Student loan per-plan breakdown where available */}
                {calculationResult.combined.studentLoanBreakdown.length > 0 && (
                  <>
                    <div className="pt-2 border-t border-brand-border/40">
                      <p className="text-xxs font-semibold text-brand-textMuted uppercase tracking-wide">
                        Student loan deductions (annual)
                      </p>
                    </div>
                    {calculationResult.combined.studentLoanBreakdown.map(
                      ({ plan, label, amount }) => (
                        <div
                          key={plan}
                          className="flex items-center justify-between gap-2"
                        >
                          <dt className="text-brand-textMuted">
                            Student loan ({label})
                          </dt>
                          <dd className="text-right font-medium text-brand-text">
                            {formatGBP(amount)}
                          </dd>
                        </div>
                      )
                    )}
                    <div className="flex items-center justify-between gap-2 border-t border-brand-border/40 pt-2">
                      <dt className="text-brand-text font-medium">
                        Total student loans
                      </dt>
                      <dd className="text-right font-semibold text-brand-text">
                        {formatGBP(calculationResult.combined.annualStudentLoan)}
                      </dd>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between gap-2 border-t border-brand-border/40 pt-2">
                  <dt className="text-brand-text font-medium">Net take-home (annual)</dt>
                  <dd className="text-right font-semibold text-brand-accent">
                    {formatGBP(calculationResult.combined.netAnnual)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-brand-textMuted">
                  <span>Net monthly</span>
                  <span className="font-medium text-brand-text">
                    {formatGBP(calculationResult.combined.monthly)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-brand-textMuted">
                  <span>Net weekly</span>
                  <span className="font-medium text-brand-text">
                    {formatGBP(calculationResult.combined.weekly)}
                  </span>
                </div>

                {onShowWealthTab && calculationResult.combined.grossAnnual > 0 && (
                  <div className="pt-3 border-t border-brand-border/40 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xxs text-brand-textMuted">
                      Curious how this compares to others in the UK on a similar salary?
                    </p>
                    <button
                      type="button"
                      onClick={onShowWealthTab}
                      className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-soft-xl transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/70"
                    >
                      See how your pay compares
                    </button>
                  </div>
                )}
              </dl>
            </div>
          ) : (
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-brand-textMuted">Gross pay (annual)</dt>
                <dd className="text-right font-medium text-brand-text">
                  {formatGBP(calculationResult.combined.grossAnnual)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-brand-textMuted">PAYE income tax</dt>
                <dd className="text-right font-medium text-brand-text">
                  {formatGBP(calculationResult.combined.annualPAYE)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-brand-textMuted">National Insurance</dt>
                <dd className="text-right font-medium text-brand-text">
                  {formatGBP(calculationResult.combined.annualNI)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-brand-textMuted">Workplace pension (employee)</dt>
                <dd className="text-right font-medium text-brand-text">
                  {formatGBP(calculationResult.combined.annualPensionEmployee)}
                </dd>
              </div>
              {sippPersonal > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-brand-textMuted">SIPP contributions (personal)</dt>
                  <dd className="text-right font-medium text-brand-text">
                    {formatGBP(sippPersonal)}
                  </dd>
                </div>
              )}
              {calculationResult.combined.studentLoanBreakdown.length > 0 && (
                <>
                  <div className="pt-2 border-t border-brand-border/40">
                    <p className="text-xxs font-semibold text-brand-textMuted uppercase tracking-wide">
                      Student loan deductions (annual)
                    </p>
                  </div>
                  {calculationResult.combined.studentLoanBreakdown.map(
                    ({ plan, label, amount }) => (
                      <div
                        key={plan}
                        className="flex items-center justify-between gap-2"
                      >
                        <dt className="text-brand-textMuted">
                          Student loan ({label})
                        </dt>
                        <dd className="text-right font-medium text-brand-text">
                          {formatGBP(amount)}
                        </dd>
                      </div>
                    )
                  )}
                  <div className="flex items-center justify-between gap-2 border-t border-brand-border/40 pt-2">
                    <dt className="text-brand-text font-medium">
                      Total student loans
                    </dt>
                    <dd className="text-right font-semibold text-brand-text">
                      {formatGBP(calculationResult.combined.annualStudentLoan)}
                    </dd>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between gap-2 border-t border-brand-border/40 pt-2">
                <dt className="text-brand-text font-medium">Net take-home (annual)</dt>
                <dd className="text-right font-semibold text-brand-accent">
                  {formatGBP(calculationResult.combined.netAnnual)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-brand-textMuted">
                <span>Net monthly</span>
                <span className="font-medium text-brand-text">
                  {formatGBP(calculationResult.combined.monthly)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-brand-textMuted">
                <span>Net weekly</span>
                <span className="font-medium text-brand-text">
                  {formatGBP(calculationResult.combined.weekly)}
                </span>
              </div>

              {onShowWealthTab && calculationResult.combined.grossAnnual > 0 && (
                <div className="pt-3 border-t border-brand-border/40 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xxs text-brand-textMuted">
                    Curious how this compares to others in the UK on a similar salary?
                  </p>
                  <button
                    type="button"
                    onClick={onShowWealthTab}
                    className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-soft-xl transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/70"
                  >
                    See how your pay compares
                  </button>
                </div>
              )}
            </dl>
          )}

          {/* Optional Hourly Context Section */}
          {(() => {
            // Derive hourly breakdown from existing calculations (no new calculations)
            // Use optionalHoursPerWeek if provided, otherwise fall back to calculation hours or default
            const numericHoursPerWeek = optionalHoursPerWeek 
              ? parseFloat(optionalHoursPerWeek.replace(/,/g, "")) 
              : (primaryFrequency === "hourly" ? hoursPerWeek : undefined);

            // Only show if we have valid hours per week and existing weekly results
            if (numericHoursPerWeek && numericHoursPerWeek > 0 && calculationResult.combined.weekly > 0) {
              // Derive hourly rates from existing weekly results
              const grossWeekly = calculationResult.combined.grossAnnual / 52;
              const netWeekly = calculationResult.combined.weekly;
              const taxWeekly = calculationResult.combined.annualPAYE / 52;
              const niWeekly = calculationResult.combined.annualNI / 52;

              const impliedGrossHourly = grossWeekly / numericHoursPerWeek;
              const impliedNetHourly = netWeekly / numericHoursPerWeek;
              const impliedTaxHourly = taxWeekly / numericHoursPerWeek;
              const impliedNiHourly = niWeekly / numericHoursPerWeek;

              return (
                <div className="mt-4 pt-4 border-t border-brand-border/40">
                  <div className="mb-3">
                    <p className="text-xxs font-semibold text-brand-textMuted uppercase tracking-wide">
                      Hourly breakdown (derived)
                    </p>
                    <p className="mt-1 text-xxs text-brand-textMuted">
                      Based on {numericHoursPerWeek.toFixed(1)} hours/week × 52 weeks
                    </p>
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-brand-textMuted">Gross pay (per hour)</dt>
                      <dd className="text-right font-medium text-brand-text">
                        {formatGBP(impliedGrossHourly)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-brand-textMuted">PAYE income tax (per hour)</dt>
                      <dd className="text-right font-medium text-brand-text">
                        {formatGBP(impliedTaxHourly)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-brand-textMuted">National Insurance (per hour)</dt>
                      <dd className="text-right font-medium text-brand-text">
                        {formatGBP(impliedNiHourly)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-brand-border/40 pt-2">
                      <dt className="text-brand-text font-medium">Net take-home (per hour)</dt>
                      <dd className="text-right font-semibold text-brand-accent">
                        {formatGBP(impliedNetHourly)}
                      </dd>
                    </div>
                  </dl>
                </div>
              );
            }
            return null;
          })()}

          <p className="mt-2 text-xxs text-brand-textMuted">
            These figures are estimates based on current UK PAYE rules and your inputs.
            They&apos;re for guidance only and not an official HMRC calculation.
          </p>
        </div>
      </section>

    </div>
  );
}
