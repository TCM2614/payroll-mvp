"use client";



import { useState } from "react";

import SIPPAndSalarySacrifice from "@/components/SIPPAndSalarySacrifice";

import { calcPayeMonthly } from "@/lib/calculators/paye";

import { formatGBP } from "@/lib/format";

import { LoanKey } from "@/lib/tax/uk2025";



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



  const [loanPlan, setLoanPlan] = useState<string | null>(null); // "plan1" | "plan2" | "plan4" | null

  const [hasPostgrad, setHasPostgrad] = useState(false);



  const loans: LoanKey[] = [

    ...(loanPlan ? [loanPlan as LoanKey] : []),

    ...(hasPostgrad ? ["postgrad" as LoanKey] : []),

  ];

  const [sippPct, setSippPct] = useState(0);

  const [pensionPct, setPensionPct] = useState(5);

  const [salarySacrificeFixed, setSalarySacrificeFixed] = useState(0);

  const [sippPersonal, setSippPersonal] = useState(0);



  const [cgtGains, setCgtGains] = useState(0);

  const [cgtAllowance, setCgtAllowance] = useState(3000);

  const [cgtRate, setCgtRate] = useState(20);



  const [debtPrincipal, setDebtPrincipal] = useState(0);

  const [debtRate, setDebtRate] = useState(10);



  const allJobs: JobInput[] = [

    { id: 0, name: "Primary job", grossMonthly: primaryGrossMonthly, taxCode: primaryTaxCode },

    ...jobs,

  ];



  // Example simple combined PAYE calc – plug into your real calc

  const totalTakeHome = allJobs.reduce((sum, job) => {

    return (

      sum +

      calcPayeMonthly({

        grossMonthly: job.grossMonthly,

        taxCode: job.taxCode,

        loans,

        pensionPct,

        sippPct,

      })

    );

  }, 0);



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



  const primaryGrossMonthly = toMonthly(primaryIncome, primaryFrequency);

  const annualGross = primaryGrossMonthly * 12;

  const weeklyGross = annualGross / 52;

  const hourlyRate = weeklyGross / assumedHoursPerWeek;



  return (

    <div className="space-y-6">

      {/* Primary job */}

      <section className="space-y-4">

        <h3 className="text-sm font-semibold">Primary job</h3>



        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">

          {/* Income input with chips and frequency selector */}

          <div className="space-y-1">

            <label className="text-xs font-medium">Income (£)</label>



            {/* Chips + frequency selector */}

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">

              <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">

                {formatGBP(annualGross)}/year

              </span>

              <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">

                £{hourlyRate.toFixed(2)}/hour (est.)

              </span>



              <select

                value={primaryFrequency}

                onChange={(e) =>

                  setPrimaryFrequency(e.target.value as typeof primaryFrequency)

                }

                className="rounded-lg border border-zinc-300 bg-transparent px-2 py-1 text-[11px] dark:border-zinc-700"

              >

                <option value="monthly">per month</option>

                <option value="annual">per year</option>

                <option value="weekly">per week</option>

                <option value="daily">per day</option>

                <option value="hourly">per hour</option>

              </select>

            </div>



            <input

              type="number"

              value={primaryIncome}

              onChange={(e) => setPrimaryIncome(Number(e.target.value) || 0)}

              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"

            />

          </div>



          {/* Tax code */}

          <div className="space-y-1">

            <label className="text-xs font-medium">Tax code</label>

            <input

              type="text"

              value={primaryTaxCode}

              onChange={(e) => setPrimaryTaxCode(e.target.value.toUpperCase())}

              className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm uppercase dark:border-zinc-700 dark:bg-zinc-900"

            />

          </div>



          {/* Student loans – aligned as third column */}

          <div className="flex flex-col justify-between space-y-2">

            <label className="text-xs font-medium text-center md:text-left">

              Student loans

            </label>



            <div className="flex flex-col gap-2">

              <select

                value={loanPlan ?? ""}

                onChange={(e) =>

                  setLoanPlan(e.target.value === "" ? null : e.target.value)

                }

                className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"

              >

                <option value="">No plan</option>

                <option value="plan1">Plan 1</option>

                <option value="plan2">Plan 2</option>

                <option value="plan4">Plan 4</option>

              </select>



              <button

                type="button"

                onClick={() => setHasPostgrad((v) => !v)}

                className={`w-full rounded-lg border px-3 py-1.5 text-sm ${

                  hasPostgrad

                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"

                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"

                }`}

              >

                {hasPostgrad ? "Postgrad loan: ON" : "Add Postgrad loan"}

              </button>

            </div>



            <p className="text-[11px] text-zinc-500">

              Choose your main loan plan and optionally add a Postgrad loan.

            </p>

          </div>

        </div>

      </section>



      {/* Additional jobs */}

      <section className="space-y-3">

        <div className="flex items-center justify-between">

          <h3 className="text-sm font-semibold">Additional jobs</h3>

          <button

            type="button"

            onClick={addJob}

            className="rounded-lg border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"

          >

            + Add job

          </button>

        </div>

        <div className="space-y-3">

          {jobs.map((job) => (

            <div

              key={job.id}

              className="grid items-end gap-3 rounded-xl border border-zinc-200 p-3 text-xs dark:border-zinc-800"

            >

              <div className="grid gap-2 sm:grid-cols-3">

                <div className="space-y-1">

                  <label className="text-[11px] font-medium">Name</label>

                  <input

                    value={job.name}

                    onChange={(e) => updateJob(job.id, "name", e.target.value)}

                    className="w-full rounded-lg border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"

                  />

                </div>

                <div className="space-y-1">

                  <label className="text-[11px] font-medium">Gross / month (£)</label>

                  <input

                    type="number"

                    value={job.grossMonthly}

                    onChange={(e) =>

                      updateJob(job.id, "grossMonthly", Number(e.target.value) || 0)

                    }

                    className="w-full rounded-lg border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"

                  />

                </div>

                <div className="space-y-1">

                  <label className="text-[11px] font-medium">Tax code</label>

                  <input

                    value={job.taxCode}

                    onChange={(e) =>

                      updateJob(job.id, "taxCode", e.target.value.toUpperCase())

                    }

                    className="w-full rounded-lg border border-zinc-300 px-2 py-1 uppercase dark:border-zinc-700 dark:bg-zinc-900"

                  />

                </div>

              </div>

              <button

                type="button"

                onClick={() => removeJob(job.id)}

                className="self-start text-[11px] text-red-500 hover:underline"

              >

                Remove job

              </button>

            </div>

          ))}

          {jobs.length === 0 && (

            <p className="text-xs text-zinc-500">

              No extra jobs added yet. Click &quot;+ Add job&quot; to include more employment.

            </p>

          )}

        </div>

      </section>



      {/* Pensions & SIPP */}

      <section className="space-y-3">

        <h3 className="text-sm font-semibold">Pension &amp; SIPP</h3>

        <SIPPAndSalarySacrifice

          salarySacrificePct={pensionPct}

          setSalarySacrificePct={setPensionPct}

          salarySacrificeFixed={salarySacrificeFixed}

          setSalarySacrificeFixed={setSalarySacrificeFixed}

          sippPersonal={sippPersonal}

          setSippPersonal={setSippPersonal}

        />

      </section>



      {/* Capital gains + debt */}

      <section className="grid gap-4 lg:grid-cols-2">

        <div className="space-y-2 rounded-xl border border-zinc-200 p-3 text-xs dark:border-zinc-800">

          <h3 className="text-sm font-semibold">Capital gains</h3>

          <div className="space-y-1">

            <label>Gains this year (£)</label>

            <input

              type="number"

              value={cgtGains}

              onChange={(e) => setCgtGains(Number(e.target.value) || 0)}

              className="w-full rounded-lg border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"

            />

          </div>

          <div className="space-y-1">

            <label>Allowance (£)</label>

            <input

              type="number"

              value={cgtAllowance}

              onChange={(e) => setCgtAllowance(Number(e.target.value) || 0)}

              className="w-full rounded-lg border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"

            />

          </div>

          <div className="space-y-1">

            <label>CGT rate (%)</label>

            <input

              type="number"

              value={cgtRate}

              onChange={(e) => setCgtRate(Number(e.target.value) || 0)}

              className="w-full rounded-lg border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"

            />

          </div>

          <p className="pt-1 text-[11px] text-zinc-500">

            Approx CGT due: <span className="font-semibold">{formatGBP(cgtDue)}</span>

          </p>

        </div>



        <div className="space-y-2 rounded-xl border border-zinc-200 p-3 text-xs dark:border-zinc-800">

          <h3 className="text-sm font-semibold">Debt &amp; interest</h3>

          <div className="space-y-1">

            <label>Debt balance (£)</label>

            <input

              type="number"

              value={debtPrincipal}

              onChange={(e) => setDebtPrincipal(Number(e.target.value) || 0)}

              className="w-full rounded-lg border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"

            />

          </div>

          <div className="space-y-1">

            <label>Interest rate (%)</label>

            <input

              type="number"

              value={debtRate}

              onChange={(e) => setDebtRate(Number(e.target.value) || 0)}

              className="w-full rounded-lg border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"

            />

          </div>

          <p className="pt-1 text-[11px] text-zinc-500">

            Approx interest / month:{" "}

            <span className="font-semibold">

              {formatGBP(monthlyDebtInterest)}

            </span>

          </p>

        </div>

      </section>



      {/* Result headline */}

      <section className="rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">

        <p className="text-zinc-500">Estimated PAYE take-home (all jobs, after loans, pension & SIPP):</p>

        <p className="mt-1 text-2xl font-semibold">{formatGBP(totalTakeHome)}/month</p>

      </section>

    </div>

  );

}
