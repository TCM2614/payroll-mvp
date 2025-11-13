"use client";

import { useState, useMemo, useEffect } from "react";
import { formatGBP } from "@/lib/format";
import {
  calculateContractorAnnual,
  type ContractorInputs,
  type Ir35Status,
} from "@/domain/tax/contracting";
import { createUK2025Config, calculateAnnualTax } from "@/domain/tax/periodTax";
import {
  trackCalculatorSubmit,
  trackResultsView,
  getSalaryBand,
} from "@/lib/analytics";

export function LimitedCompanyCalculator() {
  const [monthlyRate, setMonthlyRate] = useState<number | undefined>(undefined);
  const [dayRate, setDayRate] = useState<number | undefined>(500);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [hourlyRate, setHourlyRate] = useState<number | undefined>(undefined);
  const [hoursPerDay, setHoursPerDay] = useState(7.5);
  const [ir35Status, setIr35Status] = useState<Ir35Status>("inside");
  const [taxCode, setTaxCode] = useState("1257L");
  const [pensionPct, setPensionPct] = useState(5);
  const [studentLoanPlan, setStudentLoanPlan] = useState<
    "none" | "plan1" | "plan2" | "plan4" | "plan5" | "postgrad"
  >("none");

  // Build contractor inputs
  const contractorInputs: ContractorInputs = {
    engagementType: "limited",
    ir35Status,
    monthlyRate,
    dayRate,
    daysPerWeek,
    hourlyRate,
    hoursPerDay,
    taxYear: "2024-25",
    taxCode,
    pensionEmployeePercent: pensionPct,
    studentLoanPlan: studentLoanPlan === "none" ? undefined : studentLoanPlan,
  };

  // Calculate using contractor engine
  const result = useMemo(() => {
    return calculateContractorAnnual(contractorInputs, {
      createConfigForYear: () => createUK2025Config(),
      calculateAnnual: (input) => calculateAnnualTax(input),
    });
  }, [contractorInputs]);

  // Derive net monthly/weekly/daily if supported
  const netMonthly = result.supported && result.annual
    ? result.annual.net / 12
    : 0;
  const netWeekly = result.supported && result.annual
    ? result.annual.net / 52
    : 0;

  // Track calculator submission
  useEffect(() => {
    if (result.grossAnnualIncome > 0) {
      trackCalculatorSubmit({
        tab: "limited",
        hasPension: pensionPct > 0,
        hasStudentLoan: studentLoanPlan !== "none",
        salaryBand: getSalaryBand(result.grossAnnualIncome),
      });
    }
  }, [result.grossAnnualIncome, pensionPct, studentLoanPlan]);

  // Track results view
  useEffect(() => {
    if (result.supported && result.annual && result.annual.net > 0) {
      trackResultsView();
    }
  }, [result.supported, result.annual]);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 space-y-4">
      {/* Header */}
      <header>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
          Limited company calculator
        </h2>
        <p className="mt-1 text-sm sm:text-[15px] text-slate-700">
          Calculate your take-home pay when contracting via a limited company. Select your IR35 status below.
        </p>
      </header>

      {/* Section 1: Configuration */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">Configuration</h2>
        </header>
        <p className="text-xs text-slate-500">
          You can enter a day rate, hourly rate or monthly rate. If you enter more than one, we&apos;ll prioritise monthly, then day rate, then hourly.
        </p>

        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4">
          {/* IR35 Status - prominent */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-slate-700">IR35 status</label>
            <select
              value={ir35Status}
              onChange={(e) => setIr35Status(e.target.value as Ir35Status)}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="inside">Inside IR35</option>
              <option value="outside">Outside IR35</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Inside IR35: PAYE-style treatment. Outside IR35: Not yet supported (see results).
            </p>
          </div>

          {/* Rate inputs */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Monthly rate (£)</label>
            <input
              type="number"
              value={monthlyRate ?? ""}
              onChange={(e) =>
                setMonthlyRate(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Optional"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Day rate (£)</label>
            <input
              type="number"
              value={dayRate ?? ""}
              onChange={(e) =>
                setDayRate(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Optional"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Days per week</label>
            <input
              type="number"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value) || 5)}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="text-[11px] text-slate-500">Default: 5</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Hourly rate (£)</label>
            <input
              type="number"
              value={hourlyRate ?? ""}
              onChange={(e) =>
                setHourlyRate(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Optional"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Hours per day</label>
            <input
              type="number"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value) || 7.5)}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="text-[11px] text-slate-500">Default: 7.5</p>
          </div>

          {/* Tax inputs */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Tax code</label>
            <input
              type="text"
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value.toUpperCase())}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm uppercase text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="1257L"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Pension (%)</label>
            <input
              type="number"
              value={pensionPct}
              onChange={(e) => setPensionPct(Number(e.target.value) || 0)}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-slate-700">Student loan plan</label>
            <select
              value={studentLoanPlan}
              onChange={(e) =>
                setStudentLoanPlan(
                  e.target.value as
                    | "none"
                    | "plan1"
                    | "plan2"
                    | "plan4"
                    | "plan5"
                    | "postgrad"
                )
              }
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="none">None</option>
              <option value="plan1">Plan 1</option>
              <option value="plan2">Plan 2</option>
              <option value="plan4">Plan 4</option>
              <option value="plan5">Plan 5</option>
              <option value="postgrad">Postgraduate</option>
            </select>
          </div>
        </div>
      </section>

      {/* Section 2: Results */}
      <section className="rounded-2xl border border-slate-200 bg-indigo-50 p-4 sm:p-5 space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">Take-home pay</h2>
        </header>

        {!result.supported ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <p className="text-sm font-semibold text-rose-700">Outside IR35 not yet supported</p>
            <p className="mt-2 text-xs text-rose-600">
              We do not currently model full limited company and dividend tax. We only provide inside IR35 / PAYE-style estimates.
            </p>
            <p className="mt-2 text-xs text-rose-600">
              {result.reasonIfUnsupported}
            </p>
          </div>
        ) : result.annual ? (
          <>
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-600">Gross annual income</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatGBP(result.grossAnnualIncome)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <span className="text-slate-600">Monthly:</span>
                  <span className="ml-1 font-semibold text-indigo-600">
                    {formatGBP(netMonthly)}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <span className="text-slate-600">Weekly:</span>
                  <span className="ml-1 font-semibold text-indigo-600">
                    {formatGBP(netWeekly)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <span className="text-slate-600">PAYE:</span>
                  <span className="ml-1 font-semibold text-slate-900">
                    {formatGBP(result.annual.paye)}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <span className="text-slate-600">NI:</span>
                  <span className="ml-1 font-semibold text-slate-900">
                    {formatGBP(result.annual.ni)}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <span className="text-slate-600">Pension:</span>
                  <span className="ml-1 font-semibold text-slate-900">
                    {formatGBP(result.annual.pensionEmployee)}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <span className="text-slate-600">Student loan:</span>
                  <span className="ml-1 font-semibold text-slate-900">
                    {formatGBP(result.annual.studentLoan)}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-600">Net annual income</p>
                <p className="mt-1 text-xl font-semibold text-indigo-600">
                  {formatGBP(result.annual.net)}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              These figures use PAYE-style rules for guidance only and are not an official HMRC calculation. This is an inside IR35 estimate.
            </p>
          </>
        ) : null}
      </section>
    </div>
  );
}
