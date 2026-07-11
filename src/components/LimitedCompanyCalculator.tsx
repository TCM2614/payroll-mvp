"use client";

import { useState, useMemo, useEffect } from "react";
import {
  calculateContractorAnnual,
  type ContractorInputs,
  type Ir35Status,
} from "@/domain/tax/contracting";
import { createUK2026Config, calculateAnnualTax } from "@/domain/tax/periodTax";
import { StudentLoanSelector } from "@/components/StudentLoanSelector";
import { CalculatorSummary } from "@/components/CalculatorSummary";
import type { StudentLoanSelection } from "@/lib/student-loans";
import { studentLoanSelectionToLoanKeys } from "@/lib/student-loans";
import {
  trackCalculatorSubmit,
  trackResultsView,
  trackCalculatorRun,
  getSalaryBand,
} from "@/lib/analytics";

export function LimitedCompanyCalculator() {
  const [monthlyRate, setMonthlyRate] = useState<number | undefined>(undefined);
  const [dayRate, setDayRate] = useState<number | undefined>(500);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [hourlyRate, setHourlyRate] = useState<number | undefined>(undefined);
  const [hoursPerDay, setHoursPerDay] = useState(7.5);
  const [ir35Status, setIr35Status] = useState<Ir35Status>("inside");
  const [weeksWorkedPerYear, setWeeksWorkedPerYear] = useState(46);
  const [taxCode, setTaxCode] = useState("1257L");
  const [pensionPct, setPensionPct] = useState(5);
  const [studentLoanSelection, setStudentLoanSelection] = useState<StudentLoanSelection>({
    undergraduatePlan: "none",
    hasPostgraduateLoan: false,
  });

  // Calculate single scenario with combined student loans
  const calculationResult = useMemo(() => {
    const loans = studentLoanSelectionToLoanKeys(studentLoanSelection);
    
    const contractorInputs: ContractorInputs = {
      engagementType: "limited",
      ir35Status,
      monthlyRate,
      dayRate,
      daysPerWeek,
      hourlyRate,
      hoursPerDay,
      weeksWorkedPerYear,
      taxYear: "2026-27",
      taxCode,
      pensionEmployeePercent: pensionPct,
      studentLoanPlan: loans.length > 0 ? (loans[0] as ContractorInputs["studentLoanPlan"]) : undefined,
    };

    const result = calculateContractorAnnual(contractorInputs, {
      createConfigForYear: () => createUK2026Config(),
      calculateAnnual: (input) => {
        // Use the new multi-plan support
        return calculateAnnualTax({
          ...input,
          studentLoanPlans: loans.length > 0 ? loans : undefined,
        });
      },
    });

    return {
      result,
      netMonthly: result.supported && result.annual ? result.annual.net / 12 : 0,
      netWeekly: result.supported && result.annual ? result.annual.net / 52 : 0,
    };
  }, [
    studentLoanSelection,
    ir35Status,
    monthlyRate,
    dayRate,
    daysPerWeek,
    hourlyRate,
    hoursPerDay,
    weeksWorkedPerYear,
    taxCode,
    pensionPct,
  ]);

  // Track calculator submission and calculator_run goal
  useEffect(() => {
    if (calculationResult.result.grossAnnualIncome > 0) {
      const hasStudentLoan =
        studentLoanSelection.undergraduatePlan !== "none" ||
        studentLoanSelection.hasPostgraduateLoan;
      trackCalculatorSubmit({
        tab: "limited",
        hasPension: pensionPct > 0,
        hasStudentLoan,
        salaryBand: getSalaryBand(calculationResult.result.grossAnnualIncome),
      });
      // Track calculator_run goal
      trackCalculatorRun("limited");
    }
  }, [calculationResult, pensionPct, studentLoanSelection]);

  // Track results view
  useEffect(() => {
    if (calculationResult.result.supported && calculationResult.result.annual && calculationResult.result.annual.net > 0) {
      trackResultsView();
    }
  }, [calculationResult]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-navy-50 sm:text-4xl">
          Limited company calculator
        </h2>
        <p className="mt-1 text-sm text-navy-200">
          Calculate your take-home pay when contracting via a limited company. Select your IR35 status below.
        </p>
      </header>

      {/* Section 1: Configuration */}
      <section className="rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-8 shadow-xl shadow-navy-900/50 space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-navy-100 sm:text-base">Configuration</h2>
        </header>
        <p className="text-xs text-navy-200">
          You can enter a day rate, hourly rate or monthly rate. If you enter more than one, we&apos;ll prioritise monthly, then day rate, then hourly.
        </p>

        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4">
          {/* IR35 Status - prominent */}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-navy-100">IR35 status</label>
            <select
              value={ir35Status}
              onChange={(e) => setIr35Status(e.target.value as Ir35Status)}
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
            >
              <option value="inside">Inside IR35</option>
              <option value="outside">Outside IR35</option>
            </select>
            <p className="text-xs text-navy-300">
              Inside IR35: PAYE-style treatment. Outside IR35: Not yet supported (see results).
            </p>
          </div>

          {/* Rate inputs */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-navy-100">Monthly rate (£)</label>
            <input
              type="number"
              value={monthlyRate ?? ""}
              onChange={(e) =>
                setMonthlyRate(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
              placeholder="Optional"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-navy-100">Day rate (£)</label>
            <input
              type="number"
              value={dayRate ?? ""}
              onChange={(e) =>
                setDayRate(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
              placeholder="Optional"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-navy-100">Days per week</label>
            <input
              type="number"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value) || 5)}
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
            />
            <p className="text-xs text-navy-300">Default: 5</p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-navy-100">Hourly rate (£)</label>
            <input
              type="number"
              value={hourlyRate ?? ""}
              onChange={(e) =>
                setHourlyRate(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
              placeholder="Optional"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-navy-100">Hours per day</label>
            <input
              type="number"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value) || 7.5)}
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
            />
            <p className="text-xs text-navy-300">Default: 7.5</p>
          </div>

          {/* Weeks worked per year */}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-navy-100">
              Weeks worked per year
            </label>
            <input
              type="number"
              min={1}
              max={52}
              step={1}
              value={weeksWorkedPerYear}
              onChange={(e) => {
                const raw = Number(e.target.value);
                if (!Number.isFinite(raw) || raw <= 0) {
                  setWeeksWorkedPerYear(46);
                  return;
                }
                setWeeksWorkedPerYear(Math.min(52, Math.max(1, Math.round(raw))));
              }}
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
            />
            <p className="text-xs text-navy-300">
              Contract days won&apos;t be uniform every month — use this to
              account for holidays, bench time and gaps between contracts.
              Typical: 46 weeks. At {daysPerWeek} day
              {daysPerWeek === 1 ? "" : "s"} per week that&apos;s{" "}
              <span className="font-medium text-navy-100">
                {daysPerWeek * weeksWorkedPerYear} billable day
                {daysPerWeek * weeksWorkedPerYear === 1 ? "" : "s"} per year
              </span>
              . Ignored when you enter a monthly rate.
            </p>
          </div>

          {/* Tax inputs */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-navy-100">Tax code</label>
            <input
              type="text"
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm uppercase text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
              placeholder="1257L"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-navy-100">Pension (%)</label>
            <input
              type="number"
              value={pensionPct}
              onChange={(e) => setPensionPct(Number(e.target.value) || 0)}
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
            />
          </div>

          <div className="md:col-span-2">
            <StudentLoanSelector
              selection={studentLoanSelection}
              onChange={setStudentLoanSelection}
            />
          </div>
        </div>
      </section>

      {/* Section 2: Results — shared CalculatorSummary template */}
      {!calculationResult.result.supported ? (
        <CalculatorSummary
          title="Limited company take-home pay"
          subtitle="We currently model inside IR35 (PAYE-style) only."
          grossAnnual={calculationResult.result.grossAnnualIncome}
          incomeTaxAnnual={0}
          nationalInsuranceAnnual={0}
          netAnnual={0}
          notice={{
            variant: "warn",
            heading: "Outside IR35 not yet supported",
            body: (
              <>
                <p>
                  We do not currently model full limited company and dividend tax. We only provide inside IR35 / PAYE-style estimates.
                </p>
                {calculationResult.result.reasonIfUnsupported && (
                  <p className="mt-2">
                    {calculationResult.result.reasonIfUnsupported}
                  </p>
                )}
              </>
            ),
          }}
          disclaimer="These figures use PAYE-style rules for guidance only and are not an official HMRC calculation. This is an inside IR35 estimate."
        />
      ) : calculationResult.result.annual ? (
        <CalculatorSummary
          title="Limited company take-home pay"
          subtitle={
            ir35Status === "inside"
              ? "Inside IR35 — PAYE-style estimate."
              : "Estimated take-home for your engagement."
          }
          contextLine={
            monthlyRate && monthlyRate > 0 ? (
              <>Based on a monthly retainer over 12 months.</>
            ) : (
              <>
                Based on {daysPerWeek} day
                {daysPerWeek === 1 ? "" : "s"} per week ×{" "}
                {calculationResult.result.weeksWorkedPerYear} week
                {calculationResult.result.weeksWorkedPerYear === 1 ? "" : "s"}{" "}
                worked (≈{" "}
                {daysPerWeek * calculationResult.result.weeksWorkedPerYear}{" "}
                billable days per year).
              </>
            )
          }
          grossAnnual={calculationResult.result.grossAnnualIncome}
          incomeTaxAnnual={calculationResult.result.annual.paye}
          nationalInsuranceAnnual={calculationResult.result.annual.ni}
          workplacePensionAnnual={calculationResult.result.annual.pensionEmployee}
          studentLoanAnnual={calculationResult.result.annual.studentLoan}
          studentLoanBreakdown={(calculationResult.result.annual.studentLoanBreakdown ?? []).map(
            ({ plan, label, amount }) => ({
              key: plan,
              label,
              annualAmount: amount,
            }),
          )}
          netAnnual={calculationResult.result.annual.net}
          disclaimer="These figures use PAYE-style rules for guidance only and are not an official HMRC calculation. This is an inside IR35 estimate."
        />
      ) : null}
    </div>
  );
}
