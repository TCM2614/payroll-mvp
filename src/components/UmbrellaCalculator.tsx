"use client";

import { useState, useMemo, useEffect } from "react";
import {
  calculateContractorAnnual,
  type ContractorInputs,
  type UmbrellaFeeFrequency,
} from "@/domain/tax/contracting";
import { createUK2026Config, calculateAnnualTax } from "@/domain/tax/periodTax";
import { StudentLoanSelector } from "@/components/StudentLoanSelector";
import { CalculatorSummary } from "@/components/CalculatorSummary";
import { IR35Badge } from "@/components/IR35Badge";
import { formatGBP } from "@/lib/format";
import type { StudentLoanSelection } from "@/lib/student-loans";
import { studentLoanSelectionToLoanKeys } from "@/lib/student-loans";
import {
  trackCalculatorSubmit,
  trackResultsView,
  trackCalculatorRun,
  getSalaryBand,
} from "@/lib/analytics";

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
  const [weeksWorkedPerYear, setWeeksWorkedPerYear] = useState(46);
  const [umbrellaFeeAmount, setUmbrellaFeeAmount] = useState(25);
  const [umbrellaFeeFrequency, setUmbrellaFeeFrequency] =
    useState<UmbrellaFeeFrequency>("weekly");
  const [employerPensionPct, setEmployerPensionPct] = useState(0);
  const [taxCode, setTaxCode] = useState("1257L");
  const [pensionPct, setPensionPct] = useState(5);
  const [studentLoanSelection, setStudentLoanSelection] = useState<StudentLoanSelection>({
    undergraduatePlan: "none",
    hasPostgraduateLoan: false,
  });

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
      weeksWorkedPerYear,
      umbrellaFeeAmount,
      umbrellaFeeFrequency,
      employerPensionPercent: employerPensionPct,
      taxYear: "2026-27",
      taxCode,
      pensionEmployeePercent: pensionPct,
      studentLoanPlan: loans.length > 0 ? (loans[0] as ContractorInputs["studentLoanPlan"]) : undefined,
    };

    const result = calculateContractorAnnual(contractorInputs, {
      createConfigForYear: () => createUK2026Config(),
      calculateAnnual: (input) => {
        const pensionEmployeeAnnual =
          ((input.pensionEmployeePercent ?? 0) / 100) * input.grossAnnualIncome;
        return calculateAnnualTax({
          ...input,
          pensionEmployeeAnnual,
          studentLoanPlans: loans.length > 0 ? loans : undefined,
        });
      },
    });

    return {
      result,
      netMonthly: result.supported && result.annual ? result.annual.net / 12 : 0,
      netWeekly: result.supported && result.annual ? result.annual.net / 52 : 0,
      netDaily:
        result.supported && result.annual && daysPerWeek > 0
          ? result.annual.net / (daysPerWeek * result.weeksWorkedPerYear)
          : 0,
    };
  }, [
    studentLoanSelection,
    monthlyRate,
    dayRate,
    daysPerWeek,
    hourlyRate,
    hoursPerDay,
    weeksWorkedPerYear,
    umbrellaFeeAmount,
    umbrellaFeeFrequency,
    employerPensionPct,
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight text-navy-50 sm:text-4xl">
            Umbrella company calculator
          </h2>
          <IR35Badge status="inside" />
        </div>
        <p className="mt-2 text-sm text-navy-200">
          Umbrella engagements are always treated as inside IR35 — you&apos;re
          taxed as a PAYE employee of the umbrella. We model the full
          reconciliation: from company income received down through
          apprenticeship levy, employer&apos;s NI, employer&apos;s pension and
          the umbrella&apos;s margin, and then the standard PAYE / NI /
          student loan deductions on your wages.
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
              Days worked won&apos;t be the same every month — use this to
              account for holidays, sick leave and gaps between contracts.
              Typical: 46 weeks (≈ 6 weeks unpaid time off). At{" "}
              {daysPerWeek} day{daysPerWeek === 1 ? "" : "s"} per week that&apos;s{" "}
              <span className="font-medium text-navy-100">
                {daysPerWeek * weeksWorkedPerYear} billable day
                {daysPerWeek * weeksWorkedPerYear === 1 ? "" : "s"} per year
              </span>
              .
            </p>
          </div>

          {/* Umbrella fee */}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-navy-100">
              Umbrella company fee
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-navy-300">
                  £
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={umbrellaFeeAmount}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    setUmbrellaFeeAmount(
                      Number.isFinite(raw) && raw >= 0 ? raw : 0,
                    );
                  }}
                  className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 pl-7 pr-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
                  placeholder="0"
                />
              </div>
              <select
                value={umbrellaFeeFrequency}
                onChange={(e) =>
                  setUmbrellaFeeFrequency(e.target.value as UmbrellaFeeFrequency)
                }
                className="rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
              >
                <option value="weekly">per week</option>
                <option value="monthly">per month</option>
              </select>
            </div>
            <p className="text-xs text-navy-300">
              The margin your umbrella deducts from the assignment rate before
              your PAYE is calculated. Typical UK umbrellas charge £15–£30/week.
              Annualised at your working pattern this is currently{" "}
              <span className="font-medium text-navy-100">
                {formatGBP(
                  umbrellaFeeFrequency === "monthly"
                    ? umbrellaFeeAmount * 12
                    : umbrellaFeeAmount * weeksWorkedPerYear,
                )}
              </span>
              .
            </p>
          </div>

          {/* Employer's pension */}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-navy-100">
              Employer&apos;s pension (%)
            </label>
            <input
              type="number"
              min={0}
              max={20}
              step="0.1"
              value={employerPensionPct}
              onChange={(e) => {
                const raw = Number(e.target.value);
                setEmployerPensionPct(
                  Number.isFinite(raw) && raw >= 0 ? Math.min(20, raw) : 0,
                );
              }}
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
              placeholder="0"
            />
            <p className="text-xs text-navy-300">
              Employer pension contribution paid by the umbrella (out of the
              assignment rate, before your PAYE). Leave at 0 if you&apos;ve
              opted out of the umbrella&apos;s auto-enrolment scheme;
              statutory AE minimum is 3%.
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
          title="Umbrella take-home pay"
          subtitle="Inside IR35 estimate — PAYE-style rules apply."
          grossAnnual={0}
          incomeTaxAnnual={0}
          nationalInsuranceAnnual={0}
          netAnnual={0}
          notice={{
            variant: "warn",
            heading: "Calculation not available",
            body:
              calculationResult.result.reasonIfUnsupported ??
              "We can't calculate umbrella take-home for these inputs.",
          }}
          disclaimer="These figures use PAYE-style rules for guidance only and are not an official HMRC calculation or full umbrella fee model. This is an inside IR35 estimate."
        />
      ) : calculationResult.result.annual ? (
        (() => {
          const {
            assignmentGrossAnnual,
            employerCosts,
            weeksWorkedPerYear: resultWeeksWorkedPerYear,
          } = calculationResult.result;
          const preTaxDeductions: {
            key: string;
            label: string;
            annualAmount: number;
            hint?: string;
          }[] = [];
          if (employerCosts) {
            if (employerCosts.apprenticeshipLevyAnnual > 0) {
              preTaxDeductions.push({
                key: "apprenticeship-levy",
                label: "Apprenticeship levy",
                annualAmount: employerCosts.apprenticeshipLevyAnnual,
                hint: "0.5% of wages",
              });
            }
            if (employerCosts.employerNIAnnual > 0) {
              preTaxDeductions.push({
                key: "employer-ni",
                label: "Employer's NI",
                annualAmount: employerCosts.employerNIAnnual,
                hint: "15% on wages above £5,000",
              });
            }
            if (employerCosts.employerPensionAnnual > 0) {
              preTaxDeductions.push({
                key: "employer-pension",
                label: "Employer's pension",
                annualAmount: employerCosts.employerPensionAnnual,
                hint: `${employerPensionPct.toFixed(
                  employerPensionPct % 1 === 0 ? 0 : 1,
                )}% of wages`,
              });
            }
            if (employerCosts.umbrellaFeeAnnual > 0) {
              preTaxDeductions.push({
                key: "umbrella-margin",
                label: "Company margin",
                annualAmount: employerCosts.umbrellaFeeAnnual,
                hint:
                  umbrellaFeeFrequency === "monthly"
                    ? `${formatGBP(umbrellaFeeAmount)}/month`
                    : `${formatGBP(umbrellaFeeAmount)}/week × ${resultWeeksWorkedPerYear}`,
              });
            }
          }

          return (
            <CalculatorSummary
              title="Umbrella take-home pay"
              subtitle="Assignment income reconciled through employer costs and PAYE deductions, matching a real umbrella payslip."
              contextLine={
                <>
                  Based on {daysPerWeek} day
                  {daysPerWeek === 1 ? "" : "s"} per week ×{" "}
                  {resultWeeksWorkedPerYear} week
                  {resultWeeksWorkedPerYear === 1 ? "" : "s"} worked (≈{" "}
                  {daysPerWeek * resultWeeksWorkedPerYear} billable days per
                  year).
                </>
              }
              assignmentGrossAnnual={assignmentGrossAnnual}
              preTaxDeductions={preTaxDeductions}
              grossAnnual={calculationResult.result.grossAnnualIncome}
              incomeTaxAnnual={calculationResult.result.annual.paye}
              nationalInsuranceAnnual={calculationResult.result.annual.ni}
              workplacePensionAnnual={
                calculationResult.result.annual.pensionEmployee
              }
              studentLoanAnnual={calculationResult.result.annual.studentLoan}
              studentLoanBreakdown={(
                calculationResult.result.annual.studentLoanBreakdown ?? []
              ).map(({ plan, label, amount }) => ({
                key: plan,
                label,
                annualAmount: amount,
              }))}
              netAnnual={calculationResult.result.annual.net}
              disclaimer="These figures mirror the reconciliation shown on a real umbrella payslip (company income → apprenticeship levy → employer's NI → employer's pension → margin → PAYE gross → tax, NIC, employee pension and student loans). Estimates for guidance only, not an official HMRC calculation."
            />
          );
        })()
      ) : null}
    </div>
  );
}
