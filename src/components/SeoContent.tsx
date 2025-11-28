import React from "react";

const STUDENT_PLANS = [
  { plan: "Plan 1", threshold: "£24,990" },
  { plan: "Plan 2", threshold: "£27,295" },
  { plan: "Plan 4 (Scotland)", threshold: "£31,395" },
  { plan: "Plan 5", threshold: "£25,000" },
];

export default function SeoContent() {
  return (
    <section className="mt-16 space-y-12 text-slate-300">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-lg shadow-black/30">
          <h3 className="text-xl font-bold text-indigo-400">The 1257L Tax Code</h3>
          <p className="mt-3">
            The standard tax code for the 2024/25 tax year is <strong>1257L</strong>. This gives you a Personal
            Allowance of <strong>£12,570</strong> tax-free. Only earnings above this threshold are taxed, and this calculator
            applies the personal allowance automatically.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-lg shadow-black/30">
          <h3 className="text-xl font-bold text-indigo-400">National Insurance Cut</h3>
          <p className="mt-3">
            Class 1 National Insurance is now <strong>8%</strong> for employees in 2024 (down from 10% and previously 12%).
            We automatically apply the new thresholds and rates so you can see the real saving in your take-home pay.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white">Student Loan Thresholds (2024/25)</h3>
        <p>
          Repayments are usually 9% of what you earn over your plan threshold. Use these as a quick reference when modelling your income:
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
        <h3 className="text-2xl font-bold text-white">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <h4 className="text-lg font-semibold text-white">
              Does this calculator include pension?
            </h4>
            <p className="mt-2 text-slate-300">
              Yes. By default we apply a 5% auto-enrolment contribution on qualifying earnings. You can change
              this to match your actual pension or salary sacrifice arrangement in the settings.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <h4 className="text-lg font-semibold text-white">
              Why is my actual pay slightly different?
            </h4>
            <p className="mt-2 text-slate-300">
              Real payslips can include special tax codes, taxable benefits, or emergency adjustments. We calculate
              the standard scenario most UK employees should expect, so treat unusual results as a prompt to double-check
              your payslip or speak to payroll.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
