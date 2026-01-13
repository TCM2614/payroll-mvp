"use client";

import { useState, useMemo } from "react";
import { formatGBP } from "@/lib/format";
import { LoanKey } from "@/lib/tax/uk2025";
import SIPPAndSalarySacrifice from "@/components/SIPPAndSalarySacrifice";
import LoansMultiSelect from "@/components/LoansMultiSelect";
import {
  calculateMultiJob,
  type JobInput,
  type EmploymentKind,
} from "@/domain/tax/multiJob";

type Frequency = "hourly" | "daily" | "monthly" | "annual";

type JobBlock = {
  id: string;
  label: string;
  grossAmount: number;
  frequency: Frequency;
  taxCode: string;
  pensionEmployeeAnnual?: number;
};

export function AdditionalJobsTab() {
  const [jobs, setJobs] = useState<JobBlock[]>([
    {
      id: "job-1",
      label: "Job 1",
      grossAmount: 0,
      frequency: "monthly",
      taxCode: "1257L",
    },
  ]);

  const [loans, setLoans] = useState<LoanKey[]>([]);
  const [pensionPct, setPensionPct] = useState(0);
  const [salarySacrificeFixed, setSalarySacrificeFixed] = useState(0);
  const [sippPersonal, setSippPersonal] = useState(0);

  // Convert frequency to annual gross
  const toAnnualGross = (amount: number, frequency: Frequency): number => {
    switch (frequency) {
      case "hourly":
        return amount * 7.5 * 5 * 46; // 7.5 hours/day, 5 days/week, 46 weeks/year
      case "daily":
        return amount * 5 * 46; // 5 days/week, 46 weeks/year
      case "monthly":
        return amount * 12;
      case "annual":
        return amount;
    }
  };

  const addJob = () => {
    const newJob: JobBlock = {
      id: `job-${Date.now()}`,
      label: `Job ${jobs.length + 1}`,
      grossAmount: 0,
      frequency: "monthly",
      taxCode: "BR",
    };
    setJobs([...jobs, newJob]);
  };

  const removeJob = (id: string) => {
    setJobs(jobs.filter((job) => job.id !== id));
  };

  const updateJob = (id: string, field: keyof JobBlock, value: string | number) => {
    setJobs(
      jobs.map((job) =>
        job.id === id ? { ...job, [field]: value } : job
      )
    );
  };

  // Convert jobs to domain format and calculate
  const calculationResult = useMemo(() => {
    if (jobs.length === 0) {
      return null;
    }

    // Convert to domain JobInput format
    // First job is "main", others are "additional"
    const jobInputs: JobInput[] = jobs.map((job, index) => {
      const annualGross = toAnnualGross(job.grossAmount, job.frequency);
      const kind: EmploymentKind = index === 0 ? "main" : "additional";
      
      // Calculate pension: first job gets percentage/fixed, others can have their own
      let pensionEmployeeAnnual = 0;
      if (index === 0) {
        if (pensionPct > 0) {
          pensionEmployeeAnnual = annualGross * (pensionPct / 100);
        }
        if (salarySacrificeFixed > 0) {
          pensionEmployeeAnnual += salarySacrificeFixed * 12; // Convert monthly to annual
        }
      } else if (job.pensionEmployeeAnnual !== undefined) {
        pensionEmployeeAnnual = job.pensionEmployeeAnnual;
      }

      return {
        id: job.id,
        label: job.label,
        kind,
        annualGross,
        taxCode: job.taxCode,
        pensionEmployeeAnnual,
      };
    });

    // Calculate using domain function
    try {
      return calculateMultiJob({
        taxYear: "2024-25",
        jobs: jobInputs,
        studentLoan: {
          plans: loans,
        },
      });
    } catch (error) {
      console.error("Calculation error:", error);
      return null;
    }
  }, [jobs, loans, pensionPct, salarySacrificeFixed]);

  return (
    <div className="space-y-6">
      {/* Job blocks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Additional Jobs
            </h2>
            <p className="mt-1 text-xs text-white/50">
              Add multiple employment income streams and see combined take-home
            </p>
          </div>
          <button
            type="button"
            onClick={addJob}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
          >
            + Add Job
          </button>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white/90">{job.label}</h3>
                {jobs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeJob(job.id)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {/* Job label */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/90">Job Name</label>
                  <input
                    type="text"
                    value={job.label}
                    onChange={(e) => updateJob(job.id, "label", e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                {/* Gross amount */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/90">
                    Gross Amount (£)
                  </label>
                  <input
                    type="number"
                    value={job.grossAmount}
                    onChange={(e) =>
                      updateJob(job.id, "grossAmount", Number(e.target.value) || 0)
                    }
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                {/* Frequency */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/90">Frequency</label>
                  <select
                    value={job.frequency}
                    onChange={(e) =>
                      updateJob(job.id, "frequency", e.target.value as Frequency)
                    }
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                  >
                    <option value="hourly">Per hour</option>
                    <option value="daily">Per day</option>
                    <option value="monthly">Per month</option>
                    <option value="annual">Per year</option>
                  </select>
                </div>

                {/* Tax code */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/90">Tax Code</label>
                  <input
                    type="text"
                    value={job.taxCode}
                    onChange={(e) =>
                      updateJob(job.id, "taxCode", e.target.value.toUpperCase())
                    }
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm uppercase text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                    placeholder="1257L"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Student loans */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Student Loans</h3>
        <LoansMultiSelect value={loans} onChange={setLoans} />
      </section>

      {/* Pensions & SIPP */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Pension & SIPP</h3>
        <SIPPAndSalarySacrifice
          salarySacrificePct={pensionPct}
          setSalarySacrificePct={setPensionPct}
          salarySacrificeFixed={salarySacrificeFixed}
          setSalarySacrificeFixed={setSalarySacrificeFixed}
          sippPersonal={sippPersonal}
          setSippPersonal={setSippPersonal}
        />
      </section>

      {/* Results summary */}
      {calculationResult && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Take-home pay breakdown</h3>

          {/* Per-job breakdowns */}
          <div className="space-y-4">
            {calculationResult.jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white/90">
                    {job.kind === "main" ? "Main job" : "Additional job"} – {job.label}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <span className="text-white/70">Gross annual:</span>
                    <span className="ml-1 font-semibold text-white">
                      {formatGBP(job.grossAnnual)}
                    </span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <span className="text-white/70">PAYE:</span>
                    <span className="ml-1 font-semibold text-white">
                      {formatGBP(job.annualPAYE)}
                    </span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <span className="text-white/70">NI:</span>
                    <span className="ml-1 font-semibold text-white">
                      {formatGBP(job.annualNI)}
                    </span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <span className="text-white/70">Pension:</span>
                    <span className="ml-1 font-semibold text-white">
                      {formatGBP(job.annualPensionEmployee)}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="text-xs text-white/70">Net annual</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-300">
                    {formatGBP(job.netAnnual)}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <span className="text-white/70">
                      Monthly: <span className="font-semibold text-white">{formatGBP(job.netAnnual / 12)}</span>
                    </span>
                    <span className="text-white/70">
                      Weekly: <span className="font-semibold text-white">{formatGBP(job.netAnnual / 52)}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Combined breakdown */}
          <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 p-4 space-y-3 mt-4">
            <h4 className="text-sm font-semibold text-white">
              Combined across all jobs
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                <span className="text-white/70">Total gross annual:</span>
                <span className="ml-1 font-semibold text-white">
                  {formatGBP(calculationResult.combined.grossAnnual)}
                </span>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                <span className="text-white/70">Total PAYE:</span>
                <span className="ml-1 font-semibold text-white">
                  {formatGBP(calculationResult.combined.annualPAYE)}
                </span>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                <span className="text-white/70">Total NI:</span>
                <span className="ml-1 font-semibold text-white">
                  {formatGBP(calculationResult.combined.annualNI)}
                </span>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                <span className="text-white/70">Total pension:</span>
                <span className="ml-1 font-semibold text-white">
                  {formatGBP(calculationResult.combined.annualPensionEmployee)}
                </span>
              </div>
            </div>

            {/* Student loan breakdown (only in combined, as it's calculated on total gross) */}
            {calculationResult.combined.studentLoanBreakdown.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-black/20 p-3 space-y-2">
                <h5 className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                  Student loan deductions
                </h5>
                <div className="space-y-1">
                  {calculationResult.combined.studentLoanBreakdown.map(({ plan, label, amount }) => (
                    <div key={plan} className="flex items-center justify-between text-xs">
                      <span className="text-white/70">Student loan ({label}):</span>
                      <span className="font-semibold text-white">{formatGBP(amount)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                    <span className="font-medium text-white">Total student loans:</span>
                    <span className="font-semibold text-white">
                      {formatGBP(calculationResult.combined.annualStudentLoan)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="text-xs text-emerald-300/90">Total net annual</p>
              <p className="mt-1 text-2xl font-bold text-emerald-300">
                {formatGBP(calculationResult.combined.netAnnual)}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <span className="text-emerald-300/70">
                  Monthly: <span className="font-semibold text-emerald-300">{formatGBP(calculationResult.combined.netAnnual / 12)}</span>
                </span>
                <span className="text-emerald-300/70">
                  Weekly: <span className="font-semibold text-emerald-300">{formatGBP(calculationResult.combined.netAnnual / 52)}</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

