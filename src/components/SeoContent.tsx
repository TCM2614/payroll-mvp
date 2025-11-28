import React from "react";

export default function SeoContent() {
  return (
    <article>
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-semibold mb-3 text-indigo-600">The 1257L Tax Code</h3>
          <p className="text-slate-600 mb-4">
            The standard tax code for the 2024/25 tax year is <strong>1257L</strong>. This means you have a 
            Personal Allowance of <strong>£12,570</strong> completely tax-free. You only pay Income Tax on earnings above this threshold.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-semibold mb-3 text-indigo-600">National Insurance Cut</h3>
          <p className="text-slate-600 mb-4">
            As of 2024, the main rate of Class 1 National Insurance for employees has been cut to <strong>8%</strong> 
            (down from 10% and previously 12%). This calculator automatically applies these new lower rates to show your true saving.
          </p>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-4">Student Loan Thresholds (2024/25)</h3>
      <p className="text-slate-600 mb-4">
        Your student loan repayment depends on which plan you are on. Repayments are usually 9% of anything you earn over the threshold:
      </p>
      <ul className="list-disc pl-5 space-y-2 text-slate-700 mb-8">
        <li><strong>Plan 1:</strong> Threshold is £24,990.</li>
        <li><strong>Plan 2:</strong> Threshold is £27,295.</li>
        <li><strong>Plan 4 (Scotland):</strong> Threshold is £31,395.</li>
        <li><strong>Plan 5:</strong> Threshold is £25,000 (New loans from Aug 2023).</li>
      </ul>
      <h3 className="text-2xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h3>
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-lg text-slate-900">Does this calculator include pension?</h4>
          <p className="text-slate-600">
            Yes. By default, we apply a standard 5% auto-enrolment pension contribution on qualifying earnings. 
            You can adjust this percentage in the settings if you contribute more.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-lg text-slate-900">Why is my actual pay slightly different?</h4>
          <p className="text-slate-600">
            Actual pay can vary due to specific tax codes (like K codes), taxable benefits (like company cars), 
            or emergency tax codes. This tool calculates the standard 'best case' scenario for the majority of UK employees.
          </p>
        </div>
      </div>
    </article>
  );
}
