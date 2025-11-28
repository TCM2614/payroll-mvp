import React from "react";

const STUDENT_PLANS = [
  { plan: "Plan 1", threshold: "£24,990" },
  { plan: "Plan 2", threshold: "£27,295" },
  { plan: "Plan 4 (Scotland)", threshold: "£31,395" },
  { plan: "Plan 5", threshold: "£25,000" },
];

const CAPITAL_GAINS_FACTS = [
  {
    title: "Annual CGT Allowance",
    detail: "£3,000 for 2024/25. We flag gains above the allowance and estimate basic / higher rate exposure.",
  },
  {
    title: "Investment Split",
    detail:
      "Track how much profit sits in shares, crypto, or property to model different CGT rates instantly.",
  },
  {
    title: "Tax Planning",
    detail:
      "Use salary sacrifice plus ISA allowances to reduce the taxable gain before you ever sell the asset.",
  },
];

export default function SeoContent() {
  return (
    <section className="mt-16 space-y-12 text-slate-300">
      <div className="grid gap-6 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-lg shadow-black/30">
          <h3 className="text-xl font-bold text-indigo-400">1257L Personal Allowance</h3>
          <p className="mt-3">
            The standard tax code for the 2024/25 tax year is <strong>1257L</strong>. It gives you a Personal
            Allowance of <strong>£12,570</strong> tax-free income. We use it as the default in PAYE, Umbrella and
            Limited Company calculators so your take-home pay starts from the correct HMRC baseline.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-lg shadow-black/30">
          <h3 className="text-xl font-bold text-indigo-400">National Insurance Changes</h3>
          <p className="mt-3">
            Class 1 NIC dropped to <strong>8%</strong> for employees. We automatically apply the new thresholds,
            primary/secondary split, and salary-sacrifice savings so you can compare the headline with the net pay.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-lg shadow-black/30">
          <h3 className="text-xl font-bold text-indigo-400">Capital Gains Snapshot</h3>
          <p className="mt-3">
            Planning to sell shares, property or crypto? The Capital Gains calculator estimates 2024/25 CGT using
            your total income, taper relief and the remaining annual allowance so you can budget before you transact.
          </p>
        </article>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white">Student Loan Thresholds (2024/25)</h3>
        <p>
          Repayments are 9% of your income above the plan threshold (6% for Postgraduate). Use the table to see which
          banding applies before entering your salary:
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STUDENT_PLANS.map((plan) => (
            <div
              key={plan.plan}
              className="rounded-2xl border border-slate-700 bg-slate-800/50 p-4"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
                {plan.plan}
              </p>
              <p className="mt-2 text-xl font-bold text-white">{plan.threshold}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white">Capital Gains Tax Planner</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {CAPITAL_GAINS_FACTS.map((fact) => (
            <article
              key={fact.title}
              className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 shadow-inner shadow-black/30"
            >
              <h4 className="text-lg font-semibold text-white">{fact.title}</h4>
              <p className="mt-2 text-slate-300">{fact.detail}</p>
            </article>
          ))}
        </div>
        <p>
          Pair your salary calculations with Capital Gains modelling to avoid unexpected 20% / 24% higher-rate CGT.
          The tool keeps a running tally of the allowance remaining after each scenario so you can confidently plan
          ISA transfers, pension top-ups, or gifts to a spouse.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <h4 className="text-lg font-semibold text-white">
              Does this calculator include pensions and salary sacrifice?
            </h4>
            <p className="mt-2 text-slate-300">
              Yes. We apply 5% auto-enrolment by default and let you increase contributions or model employer
              sacrifice. The tax engine recomputes PAYE, NIC and student loan deductions each time.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <h4 className="text-lg font-semibold text-white">Why might my payslip still differ?</h4>
            <p className="mt-2 text-slate-300">
              Emergency tax codes, taxable benefits, or irregular bonuses can alter a payslip. Treat the calculator
              as the HMRC baseline; if numbers diverge, it&apos;s a cue to review your tax code or speak to payroll.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
