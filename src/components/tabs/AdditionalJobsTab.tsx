"use client";

import { useState } from "react";
import { calcPAYECombined, PayeIncomeStream, Frequency } from "@/lib/calculators/paye";
import { formatGBP } from "@/lib/format";
import { LoanKey } from "@/lib/tax/uk2025";
import SIPPAndSalarySacrifice from "@/components/SIPPAndSalarySacrifice";
import LoansMultiSelect from "@/components/LoansMultiSelect";

type JobBlock = {
  id: string;
  label: string;
  grossAmount: number;
  frequency: Frequency;
  taxCode: string;
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

  // Convert jobs to PayeIncomeStream format
  const streams: PayeIncomeStream[] = jobs.map((job) => ({
    id: job.id,
    label: job.label,
    frequency: job.frequency,
    amount: job.grossAmount,
    taxCode: job.taxCode,
    salarySacrificePct: job.id === jobs[0]?.id ? pensionPct : undefined,
    salarySacrificeFixed: job.id === jobs[0]?.id ? salarySacrificeFixed : undefined,
  }));

  // Calculate combined PAYE
  const result = calcPAYECombined({
    streams,
    sippPersonal,
    loans,
  });

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
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Combined Results</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Total Gross (annual):</span>
              <span className="font-semibold text-white">
                {formatGBP(result.totalGrossAnnual)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Income Tax:</span>
              <span className="font-semibold text-white">
                {formatGBP(result.totalIncomeTax)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Employee NI:</span>
              <span className="font-semibold text-white">
                {formatGBP(result.totalEmployeeNI)}
              </span>
            </div>
            {result.totalStudentLoans > 0 && (
              <div className="flex justify-between">
                <span className="text-white/70">Student Loans:</span>
                <span className="font-semibold text-white">
                  {formatGBP(result.totalStudentLoans)}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4">
              <div className="text-xs text-emerald-300/90">Take-Home (annual)</div>
              <div className="text-2xl font-bold text-emerald-300 mt-1">
                {formatGBP(result.totalTakeHomeAnnual)}
              </div>
              <div className="text-xs text-emerald-300/70 mt-1">
                {formatGBP(result.totalTakeHomeAnnual / 12)}/month
              </div>
            </div>
          </div>
        </div>

        {/* Individual job breakdown */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <h4 className="text-xs font-semibold text-white/90 mb-3">Job Breakdown</h4>
          <div className="space-y-2">
            {result.streams.map((stream) => (
              <div
                key={stream.id}
                className="flex justify-between text-xs bg-black/20 rounded-lg px-3 py-2"
              >
                <span className="text-white/70">{stream.label}:</span>
                <span className="text-white">
                  {formatGBP(stream.annualisedGross)} gross →{" "}
                  {formatGBP(
                    stream.annualisedGross -
                      stream.incomeTax -
                      stream.employeeNI
                  )}{" "}
                  after tax/NI
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

