"use client";

import { useState, useEffect, useMemo } from "react";
import SIPPAndSalarySacrifice from "@/components/SIPPAndSalarySacrifice";
import { StudentLoanSelector } from "@/components/StudentLoanSelector";
import { TaxYearToggle } from "@/components/TaxYearToggle";
import type { StudentLoanSelection } from "@/lib/student-loans";
import { studentLoanSelectionToLoanKeys } from "@/lib/student-loans";
import { calcPAYECombined } from "@/lib/calculators/paye";
import { formatGBP } from "@/lib/format";
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



export function PayeTab() {
  const [primaryIncome, setPrimaryIncome] = useState(6000);

  const [primaryFrequency, setPrimaryFrequency] = useState<

    "monthly" | "annual" | "weekly" | "daily" | "hourly"

  >("monthly");



  const assumedHoursPerWeek = 37.5; // adjust if you prefer



  function toMonthly(value: number, freq: typeof primaryFrequency): number {

    switch (freq) {

      case "annual":

        return value / 12;

      case "weekly":

        return (value * 52) / 12;

      case "daily":

        // assume 5 working days per week

        return (value * 5 * 52) / 12;

      case "hourly":

        return (value * assumedHoursPerWeek * 52) / 12;

      case "monthly":

      default:

        return value;

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

  const hourlyRate = weeklyGross / assumedHoursPerWeek;



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
  }, [studentLoanSelection, allJobs, pensionPct, sippPersonal]);

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
    <div className="space-y-4 sm:space-y-6">

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
            <label className="block text-sm font-medium text-navy-100">Income</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={primaryIncome}
                onChange={(e) => setPrimaryIncome(Number(e.target.value) || 0)}
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
            <p className="text-xs text-navy-300">
              Annual: {formatGBP(annualGross)} | Hourly (est.): £{hourlyRate.toFixed(2)}
            </p>
          </div>

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
      <section className="space-y-4">
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
          </dl>

          <p className="mt-2 text-xxs text-brand-textMuted">
            These figures are estimates based on current UK PAYE rules and your inputs.
            They&apos;re for guidance only and not an official HMRC calculation.
          </p>
        </div>
      </section>

    </div>

  );

}
