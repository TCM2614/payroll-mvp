"use client";

import { useState, useEffect, useMemo } from "react";
import SIPPAndSalarySacrifice from "@/components/SIPPAndSalarySacrifice";
import { StudentLoanSelector } from "@/components/StudentLoanSelector";
import type { StudentLoanSelection } from "@/lib/student-loans";
import { studentLoanSelectionToLoanKeys } from "@/lib/student-loans";
import { calcPAYECombined } from "@/lib/calculators/paye";
import { formatGBP } from "@/lib/format";
import { LoanKey } from "@/lib/tax/uk2025";
import {
  trackCalculatorSubmit,
  trackResultsView,
  getSalaryBand,
} from "@/lib/analytics";



type JobInput = {

  id: number;

  name: string;

  grossMonthly: number;

  taxCode: string;

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

    { id: 0, name: "Primary job", grossMonthly: primaryGrossMonthly, taxCode: primaryTaxCode },

    ...jobs,

  ];



  // Calculate single scenario with combined student loans
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
    });

    return {
      totalIncomeTax: result.totalIncomeTax,
      totalEmployeeNI: result.totalEmployeeNI,
      totalStudentLoans: result.totalStudentLoans,
      studentLoanBreakdown: result.studentLoanBreakdown,
      totalTakeHomeAnnual: result.totalTakeHomeAnnual,
      monthlyTakeHome: result.totalTakeHomeAnnual / 12,
      weeklyTakeHome: result.totalTakeHomeAnnual / 52,
    };
  }, [studentLoanSelection, allJobs, pensionPct, sippPersonal]);

  // Track calculator submission
  useEffect(() => {
    if (annualGross > 0) {
      const hasStudentLoan =
        studentLoanSelection.undergraduatePlan !== "none" ||
        studentLoanSelection.hasPostgraduateLoan;
      trackCalculatorSubmit({
        tab: "standard",
        hasPension: pensionPct > 0 || salarySacrificeFixed > 0 || sippPersonal > 0,
        hasStudentLoan,
        salaryBand: getSalaryBand(annualGross),
      });
    }
  }, [annualGross, pensionPct, salarySacrificeFixed, sippPersonal, studentLoanSelection]);

  // Track results view
  useEffect(() => {
    if (calculationResult.totalTakeHomeAnnual > 0) {
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

      { id: nextJobId, name: `Job ${nextJobId}`, grossMonthly: 0, taxCode: "BR" },

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
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-navy-50 sm:text-4xl">
          Standard PAYE salary calculator
        </h2>
        <p className="mt-1 text-sm text-navy-200">
          Use this tab if you&apos;re a UK employee paid through PAYE. For payslip-by-payslip checks, use the &apos;Periodic tax check&apos; tab.
        </p>
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
      <section className="rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-8 shadow-xl shadow-navy-900/50 space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-navy-100 sm:text-base">Take-home pay</h2>
        </header>
        
        {/* Main take-home figure */}
        <div className="rounded-xl border border-sea-jet-700/30 bg-sea-jet-900/50 p-4">
          <p className="text-xs text-navy-300">Monthly take-home</p>
          <p className="mt-1 text-3xl font-bold text-ethereal-300">
            {formatGBP(calculationResult.monthlyTakeHome)}
          </p>
        </div>
        
        {/* Period breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl border border-sea-jet-700/30 bg-sea-jet-900/50 p-2">
            <span className="text-navy-300">Annual:</span>
            <span className="ml-1 font-semibold text-navy-50">
              {formatGBP(calculationResult.totalTakeHomeAnnual)}
            </span>
          </div>
          <div className="rounded-xl border border-sea-jet-700/30 bg-sea-jet-900/50 p-2">
            <span className="text-navy-300">Weekly:</span>
            <span className="ml-1 font-semibold text-navy-50">
              {formatGBP(calculationResult.weeklyTakeHome)}
            </span>
          </div>
        </div>

        {/* Student loan breakdown */}
        {calculationResult.studentLoanBreakdown.length > 0 && (
          <div className="rounded-xl border border-sea-jet-700/30 bg-sea-jet-900/50 p-3 space-y-2">
            <h3 className="text-xs font-semibold text-navy-100 uppercase tracking-wide">
              Student loan deductions
            </h3>
            <div className="space-y-1">
              {calculationResult.studentLoanBreakdown.map(({ plan, label, amount }) => (
                <div key={plan} className="flex items-center justify-between text-xs">
                  <span className="text-navy-300">Student loan ({label}):</span>
                  <span className="font-semibold text-navy-50">{formatGBP(amount / 12)}/month</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-sea-jet-700/30">
                <span className="font-medium text-navy-100">Total student loans:</span>
                <span className="font-semibold text-navy-50">
                  {formatGBP(calculationResult.totalStudentLoans / 12)}/month
                </span>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-xs text-navy-300">
          Estimated PAYE take-home (all jobs, after loans, pension & SIPP). These figures are estimates based on the 2024/25 UK PAYE rules and your inputs. They&apos;re for guidance only and not an official HMRC calculation.
        </p>
      </section>

    </div>

  );

}
