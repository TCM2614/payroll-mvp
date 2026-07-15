"use client";

/**
 * OutsideIR35Calculator
 *
 * Estimator for a UK contractor operating a personal service company (PSC)
 * where the engagement is **outside IR35** and the director is paid via a
 * salary + dividends mix. Uses the shared CalculatorSummary template with a
 * pre-tax company P&L (director's salary, employer NI, employer pension,
 * corporation tax with marginal relief) so the result mirrors the same
 * summary style as every other calculator on the site.
 */

import { useMemo, useState, useEffect } from "react";
import {
  deriveGrossAnnualFromContractorInputs,
  type ContractorInputs,
} from "@/domain/tax/contracting";
import {
  calculateOutsideIR35Annual,
  type SalaryStrategy,
} from "@/domain/tax/outsideIR35";
import { getPayeTaxConfig } from "@/lib/tax/uk2025";
import type { StudentLoanSelection } from "@/lib/student-loans";
import { studentLoanSelectionToLoanKeys } from "@/lib/student-loans";
import { StudentLoanSelector } from "@/components/StudentLoanSelector";
import { CalculatorSummary } from "@/components/CalculatorSummary";
import { IR35Badge } from "@/components/IR35Badge";
import { TaxCodeHelper } from "@/components/TaxCodeHelper";
import { TakeHomeComparisonStrip } from "@/components/landing/TakeHomeComparisonStrip";
import { deriveComparisonInputs } from "@/lib/marketing/deriveComparisonInputs";
import { formatGBP } from "@/lib/format";
import {
  trackCalculatorSubmit,
  trackResultsView,
  trackCalculatorRun,
  getSalaryBand,
} from "@/lib/analytics";

const TAX_YEAR = "2026-27";

export function OutsideIR35Calculator() {
  const [monthlyRate, setMonthlyRate] = useState<number | undefined>(undefined);
  const [dayRate, setDayRate] = useState<number | undefined>(500);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [hourlyRate, setHourlyRate] = useState<number | undefined>(undefined);
  const [hoursPerDay, setHoursPerDay] = useState(7.5);
  const [weeksWorkedPerYear, setWeeksWorkedPerYear] = useState(46);

  const [salaryStrategy, setSalaryStrategy] =
    useState<SalaryStrategy>("ni-optimal");
  const [customSalary, setCustomSalary] = useState(12570);
  const [employerPensionAnnual, setEmployerPensionAnnual] = useState(0);
  const [personalSippAnnual, setPersonalSippAnnual] = useState(0);
  const [companyOverheadsAnnual, setCompanyOverheadsAnnual] = useState(1200);
  const [taxCode, setTaxCode] = useState("1257L");
  const [studentLoanSelection, setStudentLoanSelection] =
    useState<StudentLoanSelection>({
      undergraduatePlan: "none",
      hasPostgraduateLoan: false,
    });

  const calculation = useMemo(() => {
    const loans = studentLoanSelectionToLoanKeys(studentLoanSelection);

    // Re-use the shared rate-input derivation so day/hour/week/monthly
    // inputs work identically to the umbrella & inside-IR35 calculators.
    const contractorInputs: ContractorInputs = {
      engagementType: "limited",
      ir35Status: "outside",
      monthlyRate,
      dayRate,
      daysPerWeek,
      hourlyRate,
      hoursPerDay,
      weeksWorkedPerYear,
      taxYear: TAX_YEAR,
      taxCode,
    };

    let companyIncome = 0;
    let invalidReason: string | undefined;
    try {
      companyIncome = deriveGrossAnnualFromContractorInputs(contractorInputs);
    } catch (error) {
      invalidReason =
        error instanceof Error ? error.message : "Invalid rate input.";
    }

    const config = getPayeTaxConfig(TAX_YEAR);
    const result = calculateOutsideIR35Annual(
      {
        companyIncomeAnnual: companyIncome,
        companyOverheadsAnnual,
        salaryStrategy,
        customSalaryAnnual: customSalary,
        employerPensionAnnual,
        personalSippAnnual,
        taxCode,
        studentLoanPlans: loans,
      },
      config,
    );

    return { result, companyIncome, invalidReason };
  }, [
    studentLoanSelection,
    monthlyRate,
    dayRate,
    daysPerWeek,
    hourlyRate,
    hoursPerDay,
    weeksWorkedPerYear,
    salaryStrategy,
    customSalary,
    employerPensionAnnual,
    personalSippAnnual,
    companyOverheadsAnnual,
    taxCode,
  ]);

  const { company, personal, effectiveTaxRate } = calculation.result;

  useEffect(() => {
    if (personal.netTakeHomeAnnual > 0) {
      const hasStudentLoan =
        studentLoanSelection.undergraduatePlan !== "none" ||
        studentLoanSelection.hasPostgraduateLoan;
      trackCalculatorSubmit({
        tab: "limited-outside",
        hasPension: employerPensionAnnual > 0 || personalSippAnnual > 0,
        hasStudentLoan,
        salaryBand: getSalaryBand(company.companyIncomeAnnual),
      });
      trackCalculatorRun("limited-outside");
      trackResultsView();
    }
  }, [
    calculation.result,
    company.companyIncomeAnnual,
    personal.netTakeHomeAnnual,
    employerPensionAnnual,
    personalSippAnnual,
    studentLoanSelection.undergraduatePlan,
    studentLoanSelection.hasPostgraduateLoan,
  ]);

  const canComputeSummary =
    company.companyIncomeAnnual > 0 && !calculation.invalidReason;

  return (
    <div className="space-y-4 sm:space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight text-navy-50 sm:text-4xl">
            Limited company calculator
          </h2>
          <IR35Badge status="outside" />
        </div>
        <p className="mt-2 text-sm text-navy-200">
          For contractors operating a personal service company where the
          engagement is <span className="font-medium text-navy-100">outside IR35</span>{" "}
          and the director draws a small salary plus dividends. We model
          the full flow: assignment income → director&apos;s salary →
          employer&apos;s NI → employer&apos;s pension → corporation tax
          (with marginal relief between £50k and £250k) → dividends → your
          personal PAYE, NIC, dividend tax and any student loans.
        </p>
      </header>

      {/* Section 1: Rate / hours */}
      <section className="rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-8 shadow-xl shadow-navy-900/50 space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-navy-100 sm:text-base">
            Contract rate
          </h2>
        </header>
        <p className="text-xs text-navy-200">
          Enter a day, hourly or monthly rate. If you provide more than one,
          we prioritise monthly, then day rate, then hourly.
        </p>

        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4">
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
              Account for holidays, bench time and gaps between contracts.
              At {daysPerWeek} day{daysPerWeek === 1 ? "" : "s"} per week
              that&apos;s{" "}
              <span className="font-medium text-navy-100">
                {daysPerWeek * weeksWorkedPerYear} billable day
                {daysPerWeek * weeksWorkedPerYear === 1 ? "" : "s"} per year
              </span>
              . Ignored for monthly retainers.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Company strategy */}
      <section className="rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-8 shadow-xl shadow-navy-900/50 space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-navy-100 sm:text-base">
            Company strategy
          </h2>
        </header>
        <p className="text-xs text-navy-200">
          How much you pay yourself as salary vs. take as dividends. The
          NI-optimal strategy is the most tax-efficient for most one-person
          PSCs; the secondary-threshold strategy avoids employer NI entirely.
        </p>

        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-navy-100">
              Director&apos;s salary strategy
            </label>
            <select
              value={salaryStrategy}
              onChange={(e) =>
                setSalaryStrategy(e.target.value as SalaryStrategy)
              }
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
            >
              <option value="ni-optimal">
                NI-optimal — salary £12,570 (full personal allowance)
              </option>
              <option value="secondary-threshold">
                Secondary threshold — salary £5,000 (no employer NI)
              </option>
              <option value="custom">Custom salary</option>
            </select>
          </div>

          {salaryStrategy === "custom" && (
            <div className="space-y-1 md:col-span-2">
              <label className="block text-sm font-medium text-navy-100">
                Custom annual salary (£)
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={customSalary}
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  setCustomSalary(
                    Number.isFinite(raw) && raw >= 0 ? raw : 0,
                  );
                }}
                className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
              />
              <p className="text-xs text-navy-300">
                Salary above £12,570 triggers PAYE income tax and above
                £5,000 triggers employer NI on the excess.
              </p>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-navy-100">
              Employer&apos;s pension (£/year)
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={employerPensionAnnual}
              onChange={(e) => {
                const raw = Number(e.target.value);
                setEmployerPensionAnnual(
                  Number.isFinite(raw) && raw >= 0 ? raw : 0,
                );
              }}
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
            />
            <p className="text-xs text-navy-300">
              Pension paid by the company. Fully corporation-tax deductible.
              Annual allowance is £60k (subject to tapering).
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-navy-100">
              Personal SIPP (£/year)
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={personalSippAnnual}
              onChange={(e) => {
                const raw = Number(e.target.value);
                setPersonalSippAnnual(
                  Number.isFinite(raw) && raw >= 0 ? raw : 0,
                );
              }}
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
            />
            <p className="text-xs text-navy-300">
              Personal pension paid from dividends. Attracts basic-rate
              relief at source; higher-rate relief comes through
              self-assessment.
            </p>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-navy-100">
              Other company overheads (£/year)
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={companyOverheadsAnnual}
              onChange={(e) => {
                const raw = Number(e.target.value);
                setCompanyOverheadsAnnual(
                  Number.isFinite(raw) && raw >= 0 ? raw : 0,
                );
              }}
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
            />
            <p className="text-xs text-navy-300">
              Accountancy fees, insurance, software, mobile phone, etc.
              Anything wholly and exclusively for business use is
              corporation-tax deductible.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Personal tax settings */}
      <section className="rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-8 shadow-xl shadow-navy-900/50 space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-navy-100 sm:text-base">
            Personal tax settings
          </h2>
        </header>
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-navy-100">Tax code</label>
            <input
              type="text"
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm uppercase text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
              placeholder="e.g. 1257L, K475, S1257L, BR"
            />
            <TaxCodeHelper code={taxCode} />
          </div>
          <div className="md:col-span-2">
            <StudentLoanSelector
              selection={studentLoanSelection}
              onChange={setStudentLoanSelection}
            />
          </div>
        </div>
      </section>

      {/* Section 4: Results — shared CalculatorSummary template */}
      {calculation.invalidReason ? (
        <CalculatorSummary
          title="Limited company take-home pay (Outside IR35)"
          subtitle="Enter a valid rate to see your estimate."
          grossAnnual={0}
          incomeTaxAnnual={0}
          nationalInsuranceAnnual={0}
          netAnnual={0}
          notice={{
            variant: "warn",
            heading: "Rate input needed",
            body: calculation.invalidReason,
          }}
          disclaimer="Outside-IR35 estimator: PSC salary + dividends flow with UK 2026/27 rates. Estimates for guidance only, not an official HMRC or Companies House calculation."
        />
      ) : canComputeSummary ? (
        <CalculatorSummary
          title="Limited company take-home pay (Outside IR35)"
          subtitle="Outside IR35 — salary + dividends flow through your personal service company."
          contextLine={
            monthlyRate && monthlyRate > 0 ? (
              <>Based on a monthly retainer over 12 months.</>
            ) : (
              <>
                Based on {daysPerWeek} day
                {daysPerWeek === 1 ? "" : "s"} per week × {weeksWorkedPerYear}{" "}
                week{weeksWorkedPerYear === 1 ? "" : "s"} worked (≈{" "}
                {daysPerWeek * weeksWorkedPerYear} billable days per year).
                Effective total tax rate:{" "}
                <span className="font-medium text-brand-text">
                  {(effectiveTaxRate * 100).toFixed(1)}%
                </span>
                .
              </>
            )
          }
          assignmentGrossAnnual={company.companyIncomeAnnual}
          preTaxDeductions={[
            {
              key: "director-salary",
              label: "Director's salary paid out",
              annualAmount: company.directorSalaryAnnual,
              hint: "flows to you as employment income below",
            },
            ...(company.employerNIAnnual > 0
              ? [
                  {
                    key: "employer-ni",
                    label: "Employer's NI on salary",
                    annualAmount: company.employerNIAnnual,
                    hint: "15% on salary above £5,000",
                  },
                ]
              : []),
            ...(company.employerPensionAnnual > 0
              ? [
                  {
                    key: "employer-pension",
                    label: "Employer's pension contribution",
                    annualAmount: company.employerPensionAnnual,
                  },
                ]
              : []),
            ...(company.companyOverheadsAnnual > 0
              ? [
                  {
                    key: "company-overheads",
                    label: "Company overheads",
                    annualAmount: company.companyOverheadsAnnual,
                  },
                ]
              : []),
            {
              key: "corporation-tax",
              label: "Corporation tax on profit",
              annualAmount: company.corporationTaxAnnual,
              hint: company.corporationTaxMarginalRelief
                ? "marginal relief (profit £50k–£250k)"
                : company.profitBeforeCorporationTaxAnnual <= 50_000
                ? "small profits rate 19%"
                : "main rate 25%",
            },
          ]}
          grossLabel="Salary + dividends (annual)"
          grossSubRows={[
            {
              key: "salary-row",
              label: "Director's salary",
              annualAmount: personal.salaryAnnual,
            },
            {
              key: "dividends-row",
              label: "Dividend income",
              annualAmount: personal.dividendsAnnual,
              hint: `after ${formatGBP(company.corporationTaxAnnual)} corp tax`,
            },
          ]}
          grossAnnual={personal.totalTaxableIncomeAnnual}
          incomeTaxAnnual={personal.payeIncomeTaxAnnual}
          incomeTaxLabel="PAYE income tax on salary"
          nationalInsuranceAnnual={personal.employeeNIAnnual}
          extraDeductions={
            personal.dividendTaxAnnual > 0
              ? [
                  {
                    key: "dividend-tax",
                    label: "Dividend tax",
                    annualAmount: personal.dividendTaxAnnual,
                    hint: "8.75% / 33.75% / 39.35%",
                  },
                ]
              : []
          }
          sippAnnual={personal.personalSippAnnual}
          studentLoanAnnual={personal.studentLoanAnnual}
          studentLoanBreakdown={personal.studentLoanBreakdown.map(
            ({ plan, label, amount }) => ({
              key: plan,
              label,
              annualAmount: amount,
            }),
          )}
          netAnnual={personal.netTakeHomeAnnual}
          disclaimer="Outside-IR35 estimator: salary + dividends model with UK 2026/27 rates, corporation-tax marginal relief between £50k and £250k, and standard dividend allowance/bands. Assumes a single director-shareholder and no associated companies. Estimates for guidance only, not an official HMRC calculation."
        />
      ) : null}

      {/*
        Live comparison strip: same assignment rate under all four
        engagement types, updating with the inputs above.
      */}
      {(() => {
        const stripInputs = deriveComparisonInputs({
          kind: "annual-income",
          annualIncome: company.companyIncomeAnnual,
          daysPerWeek,
          weeksWorkedPerYear,
          outsideOverheadsAnnual: companyOverheadsAnnual,
        });
        if (!stripInputs) return null;
        return (
          <TakeHomeComparisonStrip
            inputs={stripInputs}
            analyticsSource="calc_limited_outside"
            showCta={false}
            eyebrow="Compare with other engagement types"
            title={
              <>
                Your assignment rate under all four engagement types.
              </>
            }
            subtitle={
              <>
                Based on your current inputs above ({daysPerWeek} day
                {daysPerWeek === 1 ? "" : "s"} per week ×{" "}
                {weeksWorkedPerYear} weeks,{" "}
                {formatGBP(companyOverheadsAnnual)} annual overheads), UK
                2026/27 tax year. The Limited (Outside IR35) figure matches
                your take-home above.
              </>
            }
            className="mt-8 w-full"
          />
        );
      })()}
    </div>
  );
}
