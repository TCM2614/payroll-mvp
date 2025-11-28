"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { formatGBP } from "@/lib/format";
import { calculateContractorAnnual, type ContractorInputs } from "@/domain/tax/contracting";
import { createUK2025Config, calculateAnnualTax } from "@/domain/tax/periodTax";
import { StudentLoanSelector } from "@/components/StudentLoanSelector";
import type { StudentLoanSelection } from "@/lib/student-loans";
import { studentLoanSelectionToLoanKeys } from "@/lib/student-loans";
import {
  trackCalculatorSubmit,
  trackResultsView,
  trackCalculatorRun,
  getSalaryBand,
} from "@/lib/analytics";
import { StickySummary } from "@/components/StickySummary";
import { TaxBreakdownChart } from "@/components/TaxBreakdownChart";

/**
 * UmbrellaCalculator
 *
 * UI wrapper around the contractor engine for inside-IR35 umbrella engagements.
 * Mirrors LimitedCompanyCalculator UX (rates, tax code, pension, student loans)
 * but always fixes engagementType="umbrella" and ir35Status="inside", and
 * wires multi-plan student loan selections into the annual tax engine.
 */
export function UmbrellaCalculator() {
  const [monthlyRate, setMonthlyRate] = useState<number | undefined>(undefined);
  const [dayRate, setDayRate] = useState<number | undefined>(500);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [hourlyRate, setHourlyRate] = useState<number | undefined>(undefined);
  const [hoursPerDay, setHoursPerDay] = useState(7.5);
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
      engagementType: "umbrella",
      ir35Status: "inside", // Umbrella is always inside IR35
      monthlyRate,
      dayRate,
      daysPerWeek,
      hourlyRate,
      hoursPerDay,
      taxYear: "2024-25",
      taxCode,
      pensionEmployeePercent: pensionPct,
      studentLoanPlan: loans.length > 0 ? (loans[0] as ContractorInputs["studentLoanPlan"]) : undefined,
    };

    const result = calculateContractorAnnual(contractorInputs, {
      createConfigForYear: () => createUK2025Config(),
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
      netDaily: result.supported && result.annual && daysPerWeek > 0
        ? result.annual.net / (daysPerWeek * 52)
        : 0,
    };
  }, [studentLoanSelection, monthlyRate, dayRate, daysPerWeek, hourlyRate, hoursPerDay, taxCode, pensionPct]);

  const breakdownRef = useRef<HTMLDivElement | null>(null);
  const annualNet = calculationResult.result.annual?.net ?? 0;
  const hasResults = calculationResult.result.supported && annualNet > 0;

  // Track calculator submission and calculator_run goal
  useEffect(() => {
    if (calculationResult.result.grossAnnualIncome > 0) {
      const hasStudentLoan =
        studentLoanSelection.undergraduatePlan !== "none" ||
        studentLoanSelection.hasPostgraduateLoan;
      trackCalculatorSubmit({
        tab: "umbrella",
        hasPension: pensionPct > 0,
        hasStudentLoan,
        salaryBand: getSalaryBand(calculationResult.result.grossAnnualIncome),
      });
      // Track calculator_run goal
      trackCalculatorRun("umbrella");
    }
  }, [calculationResult, pensionPct, studentLoanSelection]);

  // Track results view
  useEffect(() => {
    if (calculationResult.result.supported && calculationResult.result.annual && calculationResult.result.annual.net > 0) {
      trackResultsView();
    }
  }, [calculationResult]);

  return (
    <div className={`space-y-4 sm:space-y-6 ${hasResults ? "pb-40 lg:pb-0" : ""}`}>
      {/* Header */}
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-navy-50 sm:text-4xl">
          Umbrella company calculator
        </h2>
        <p className="mt-1 text-sm text-navy-200">
          Calculate your take-home pay when contracting via an umbrella company (inside IR35).
        </p>
      </header>

      {hasResults && (
        <div className="flex justify-center">
          <StickySummary
            annualNet={annualNet}
            monthlyNet={calculationResult.netMonthly}
            className="lg:max-w-3xl"
          />
        </div>
      )}

      {/* Section 1: Configuration */}
      <section className="rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-8 shadow-xl shadow-navy-900/50 space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-navy-100 sm:text-base">Configuration</h2>
        </header>
        <p className="text-xs text-navy-200">
          You can enter a day rate, hourly rate or monthly rate. If you enter more than one, we&apos;ll prioritise monthly, then day rate, then hourly.
        </p>

        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4">
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

      {/* Section 2: Results */}
      <section
        ref={breakdownRef}
        id="umbrella-breakdown"
        className="rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-8 shadow-xl shadow-navy-900/50 space-y-3 scroll-mt-28"
      >
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-navy-100 sm:text-base">Take-home pay</h2>
        </header>

        {!calculationResult.result.supported ? (
          <div className="rounded-xl border border-aqua-500/30 bg-aqua-500/10 p-3">
            <p className="text-sm font-medium text-aqua-300">Calculation not available</p>
            <p className="mt-1 text-xs text-aqua-400">
              {calculationResult.result.reasonIfUnsupported}
            </p>
          </div>
        ) : calculationResult.result.annual ? (
          <div className="space-y-3">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
              <div className="h-64 lg:h-72">
                <TaxBreakdownChart
                  netPay={calculationResult.result.annual.net}
                  incomeTax={calculationResult.result.annual.paye}
                  nationalInsurance={calculationResult.result.annual.ni}
                  pension={calculationResult.result.annual.pensionEmployee}
                />
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-sea-jet-700/30 bg-sea-jet-900/50 p-3">
                  <p className="text-xs text-navy-300">Gross annual income</p>
                  <p className="mt-1 text-lg font-semibold text-navy-50">
                    {formatGBP(calculationResult.result.grossAnnualIncome)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-sea-jet-700/30 bg-sea-jet-900/50 p-2">
                    <span className="text-navy-300">Monthly:</span>
                    <span className="ml-1 font-semibold text-ethereal-300">
                      {formatGBP(calculationResult.netMonthly)}
                    </span>
                  </div>
                  <div className="rounded-xl border border-sea-jet-700/30 bg-sea-jet-900/50 p-2">
                    <span className="text-navy-300">Weekly:</span>
                    <span className="ml-1 font-semibold text-ethereal-300">
                      {formatGBP(calculationResult.netWeekly)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-sea-jet-700/30 bg-sea-jet-900/50 p-2">
                    <span className="text-navy-300">PAYE:</span>
                    <span className="ml-1 font-semibold text-navy-50">
                      {formatGBP(calculationResult.result.annual.paye)}
                    </span>
                  </div>
                  <div className="rounded-xl border border-sea-jet-700/30 bg-sea-jet-900/50 p-2">
                    <span className="text-navy-300">NI:</span>
                    <span className="ml-1 font-semibold text-navy-50">
                      {formatGBP(calculationResult.result.annual.ni)}
                    </span>
                  </div>
                  <div className="rounded-xl border border-sea-jet-700/30 bg-sea-jet-900/50 p-2">
                    <span className="text-navy-300">Pension:</span>
                    <span className="ml-1 font-semibold text-navy-50">
                      {formatGBP(calculationResult.result.annual.pensionEmployee)}
                    </span>
                  </div>
                  <div className="rounded-xl border border-sea-jet-700/30 bg-sea-jet-900/50 p-2">
                    <span className="text-navy-300">Student loan:</span>
                    <span className="ml-1 font-semibold text-navy-50">
                      {formatGBP(calculationResult.result.annual.studentLoan)}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-sea-jet-700/30 bg-sea-jet-900/50 p-3">
                  <p className="text-xs text-navy-300">Net annual income</p>
                  <p className="mt-1 text-xl font-semibold text-ethereal-300">
                    {formatGBP(calculationResult.result.annual.net)}
                  </p>
                </div>
              </div>
            </div>

            {calculationResult.result.annual.studentLoanBreakdown &&
              calculationResult.result.annual.studentLoanBreakdown.length > 0 && (
                <div className="rounded-xl border border-sea-jet-700/30 bg-sea-jet-900/50 p-3 space-y-2">
                  <h3 className="text-xs font-semibold text-navy-100 uppercase tracking-wide">
                    Student loan deductions
                  </h3>
                  <div className="space-y-1">
                    {calculationResult.result.annual.studentLoanBreakdown.map(
                      ({ plan, label, amount }) => (
                        <div
                          key={plan}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-navy-300">Student loan ({label}):</span>
                          <span className="font-semibold text-navy-50">
                            {formatGBP(amount / 12)}/month
                          </span>
                        </div>
                      )
                    )}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-sea-jet-700/30">
                      <span className="font-medium text-navy-100">Total student loans:</span>
                      <span className="font-semibold text-navy-50">
                        {formatGBP(calculationResult.result.annual.studentLoan / 12)}/month
                      </span>
                    </div>
                  </div>
                </div>
              )}
          </div>
        ) : null}

        <p className="text-xs text-navy-300">
          These figures use PAYE-style rules for guidance only and are not an official HMRC
          calculation or full umbrella fee model. This is an inside IR35 estimate.
        </p>
      </section>
    </div>
  );
}
