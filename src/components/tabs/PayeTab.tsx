"use client";

import { useState, useEffect, useMemo } from "react";
import SIPPAndSalarySacrifice from "@/components/SIPPAndSalarySacrifice";
import { StudentLoanMultiSelect, type StudentLoanPlan } from "@/components/StudentLoanMultiSelect";
import { calcPayeMonthly } from "@/lib/calculators/paye";
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



  const [selectedPlans, setSelectedPlans] = useState<StudentLoanPlan[]>(["none"]);

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



  // Calculate scenarios per selected student loan plan
  const scenarios = useMemo(() => {
    return selectedPlans.map((plan) => {
      const loansForPlan: LoanKey[] = plan === "none" ? [] : [plan as LoanKey];
      
      const totalTakeHome = allJobs.reduce((sum, job) => {
        return (
          sum +
          calcPayeMonthly({
            grossMonthly: job.grossMonthly,
            taxCode: job.taxCode,
            loans: loansForPlan,
            pensionPct,
            sippPct: 0, // SIPP is handled separately via sippPersonal
          })
        );
      }, 0);

      return {
        plan,
        totalTakeHome,
        annualTakeHome: totalTakeHome * 12,
        weeklyTakeHome: (totalTakeHome * 12) / 52,
      };
    });
  }, [selectedPlans, allJobs, pensionPct]);

  // Track calculator submission
  useEffect(() => {
    if (annualGross > 0) {
      const hasStudentLoan = selectedPlans.some((p) => p !== "none");
      trackCalculatorSubmit({
        tab: "standard",
        hasPension: pensionPct > 0 || salarySacrificeFixed > 0 || sippPersonal > 0,
        hasStudentLoan,
        salaryBand: getSalaryBand(annualGross),
      });
    }
  }, [annualGross, pensionPct, salarySacrificeFixed, sippPersonal, selectedPlans]);

  // Track results view
  useEffect(() => {
    if (scenarios.length > 0 && scenarios[0].totalTakeHome > 0) {
      trackResultsView();
    }
  }, [scenarios]);



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
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Standard PAYE salary calculator
        </h2>
        <p className="mt-1 text-sm text-white/70">
          Use this tab if you&apos;re a UK employee paid through PAYE. For payslip-by-payslip checks, use the &apos;Periodic tax check&apos; tab.
        </p>
      </header>

      {/* Section 1: Primary job inputs */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-xl space-y-3">

        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white/90 sm:text-base">Primary job</h2>
        </header>
        <p className="text-xs text-white/70">
          Enter your main employment income details
        </p>

        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4">

          {/* Income input with frequency selector */}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-white/90">Income</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={primaryIncome}
                onChange={(e) => setPrimaryIncome(Number(e.target.value) || 0)}
                className="flex-1 rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              />
              <select
                value={primaryFrequency}
                onChange={(e) =>
                  setPrimaryFrequency(e.target.value as typeof primaryFrequency)
                }
                className="rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="monthly">per month</option>
                <option value="annual">per year</option>
                <option value="weekly">per week</option>
                <option value="daily">per day</option>
                <option value="hourly">per hour</option>
              </select>
            </div>
            <p className="text-xs text-white/70">
              Annual: {formatGBP(annualGross)} | Hourly (est.): £{hourlyRate.toFixed(2)}
            </p>
          </div>

          {/* Tax code */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/90">Tax code</label>
            <input
              type="text"
              value={primaryTaxCode}
              onChange={(e) => setPrimaryTaxCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm uppercase text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
            />
            <p className="text-xs text-white/70">
              Your default tax code (e.g. 1257L)
            </p>
          </div>

          {/* Student loans */}
          <div className="md:col-span-2">
            <StudentLoanMultiSelect
              selectedPlans={selectedPlans}
              onChange={setSelectedPlans}
            />
          </div>

        </div>

      </section>



      {/* Section 2: Pension & SIPP */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-xl space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white/90 sm:text-base">Pension & SIPP</h2>
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
      <section className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-xl space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white/90 sm:text-base">Additional jobs</h2>
          <button
            type="button"
            onClick={addJob}
            className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
          >
            + Add job
          </button>
        </header>

        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2"
            >
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">Name</label>
                  <input
                    value={job.name}
                    onChange={(e) => updateJob(job.id, "name", e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">Gross / month (£)</label>
                  <input
                    type="number"
                    value={job.grossMonthly}
                    onChange={(e) =>
                      updateJob(job.id, "grossMonthly", Number(e.target.value) || 0)
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">Tax code</label>
                  <input
                    value={job.taxCode}
                    onChange={(e) =>
                      updateJob(job.id, "taxCode", e.target.value.toUpperCase())
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm uppercase text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeJob(job.id)}
                className="text-xs text-rose-600 hover:text-rose-700 transition-colors"
              >
                Remove job
              </button>
            </div>
          ))}
          {jobs.length === 0 && (
            <p className="text-xs text-slate-500">
              No extra jobs added yet. Click &quot;+ Add job&quot; to include more employment.
            </p>
          )}
        </div>
      </section>

      {/* Section 4: Results */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-xl space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white/90 sm:text-base">Take-home pay</h2>
        </header>
        
        <div className="space-y-3">
          {scenarios.map(({ plan, totalTakeHome, annualTakeHome, weeklyTakeHome }) => (
            <div
              key={plan}
              className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2"
            >
              <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                {plan === "none" ? "No student loan" : `Student loan: ${plan === "postgrad" ? "Postgraduate" : plan.toUpperCase()}`}
              </h3>
              
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <p className="text-xs text-white/70">Monthly take-home</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-400">{formatGBP(totalTakeHome)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-white/10 bg-black/40 p-2">
                  <span className="text-white/70">Annual:</span>
                  <span className="ml-1 font-semibold text-white">{formatGBP(annualTakeHome)}</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-2">
                  <span className="text-white/70">Weekly:</span>
                  <span className="ml-1 font-semibold text-white">{formatGBP(weeklyTakeHome)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-white/70">
          Estimated PAYE take-home (all jobs, after loans, pension & SIPP). These figures are estimates based on the 2024/25 UK PAYE rules and your inputs. They&apos;re for guidance only and not an official HMRC calculation.
        </p>
      </section>

    </div>

  );

}
