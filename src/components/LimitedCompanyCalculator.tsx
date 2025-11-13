"use client";

import { useState, useMemo, useEffect } from "react";
import { formatGBP } from "@/lib/format";
import {
  calculateContractorAnnual,
  type ContractorInputs,
  type Ir35Status,
} from "@/domain/tax/contracting";
import { createUK2025Config, calculateAnnualTax } from "@/domain/tax/periodTax";
import { StudentLoanMultiSelect, type StudentLoanPlan } from "@/components/StudentLoanMultiSelect";
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
  const [selectedPlans, setSelectedPlans] = useState<StudentLoanPlan[]>(["none"]);

  // Calculate scenarios per selected student loan plan
  const scenarios = useMemo(() => {
    return selectedPlans.map((plan) => {
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
        studentLoanPlan: plan === "none" ? undefined : plan,
      };

      const result = calculateContractorAnnual(contractorInputs, {
        createConfigForYear: () => createUK2025Config(),
        calculateAnnual: (input) => calculateAnnualTax(input),
      });

      return {
        plan,
        result,
        netMonthly: result.supported && result.annual ? result.annual.net / 12 : 0,
        netWeekly: result.supported && result.annual ? result.annual.net / 52 : 0,
      };
    });
  }, [selectedPlans, ir35Status, monthlyRate, dayRate, daysPerWeek, hourlyRate, hoursPerDay, taxCode, pensionPct]);

  // Track calculator submission
  useEffect(() => {
    if (scenarios.length > 0 && scenarios[0].result.grossAnnualIncome > 0) {
      const hasStudentLoan = selectedPlans.some((p) => p !== "none");
      trackCalculatorSubmit({
        tab: "limited",
        hasPension: pensionPct > 0,
        hasStudentLoan,
        salaryBand: getSalaryBand(scenarios[0].result.grossAnnualIncome),
      });
    }
  }, [scenarios, pensionPct, selectedPlans]);

  // Track results view
  useEffect(() => {
    if (scenarios.length > 0 && scenarios[0].result.supported && scenarios[0].result.annual && scenarios[0].result.annual.net > 0) {
      trackResultsView();
    }
  }, [scenarios]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Limited company calculator
        </h2>
        <p className="mt-1 text-sm text-white/70">
          Calculate your take-home pay when contracting via a limited company. Select your IR35 status below.
        </p>
      </header>

      {/* Section 1: Configuration */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-xl space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white/90 sm:text-base">Configuration</h2>
        </header>
        <p className="text-xs text-white/70">
          You can enter a day rate, hourly rate or monthly rate. If you enter more than one, we&apos;ll prioritise monthly, then day rate, then hourly.
        </p>

        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4">
          {/* IR35 Status - prominent */}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-white/90">IR35 status</label>
            <select
              value={ir35Status}
              onChange={(e) => setIr35Status(e.target.value as Ir35Status)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="inside">Inside IR35</option>
              <option value="outside">Outside IR35</option>
            </select>
            <p className="text-xs text-white/70">
              Inside IR35: PAYE-style treatment. Outside IR35: Not yet supported (see results).
            </p>
          </div>

          {/* Rate inputs */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/90">Monthly rate (£)</label>
            <input
              type="number"
              value={monthlyRate ?? ""}
              onChange={(e) =>
                setMonthlyRate(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              placeholder="Optional"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/90">Day rate (£)</label>
            <input
              type="number"
              value={dayRate ?? ""}
              onChange={(e) =>
                setDayRate(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              placeholder="Optional"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/90">Days per week</label>
            <input
              type="number"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value) || 5)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
            />
            <p className="text-xs text-white/70">Default: 5</p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/90">Hourly rate (£)</label>
            <input
              type="number"
              value={hourlyRate ?? ""}
              onChange={(e) =>
                setHourlyRate(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              placeholder="Optional"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/90">Hours per day</label>
            <input
              type="number"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value) || 7.5)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
            />
            <p className="text-xs text-white/70">Default: 7.5</p>
          </div>

          {/* Tax inputs */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/90">Tax code</label>
            <input
              type="text"
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm uppercase text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              placeholder="1257L"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/90">Pension (%)</label>
            <input
              type="number"
              value={pensionPct}
              onChange={(e) => setPensionPct(Number(e.target.value) || 0)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div className="md:col-span-2">
            <StudentLoanMultiSelect
              selectedPlans={selectedPlans}
              onChange={setSelectedPlans}
            />
          </div>
        </div>
      </section>

      {/* Section 2: Results */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-xl space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white/90 sm:text-base">Take-home pay</h2>
        </header>

        <div className="space-y-3">
          {scenarios.map(({ plan, result, netMonthly, netWeekly }) => (
            <div
              key={plan}
              className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2"
            >
              <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                {plan === "none" ? "No student loan" : `Student loan: ${plan === "postgrad" ? "Postgraduate" : plan.toUpperCase()}`}
              </h3>

              {!result.supported ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                  <p className="text-sm font-semibold text-rose-300">Outside IR35 not yet supported</p>
                  <p className="mt-2 text-xs text-rose-400">
                    We do not currently model full limited company and dividend tax. We only provide inside IR35 / PAYE-style estimates.
                  </p>
                  <p className="mt-2 text-xs text-rose-600">
                    {result.reasonIfUnsupported}
                  </p>
                </div>
              ) : result.annual ? (
                <>
                  <div className="space-y-3">
                    <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                      <p className="text-xs text-white/70">Gross annual income</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatGBP(result.grossAnnualIncome)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-slate-200 bg-white p-2">
                        <span className="text-white/70">Monthly:</span>
                        <span className="ml-1 font-semibold text-emerald-400">
                          {formatGBP(netMonthly)}
                        </span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-2">
                        <span className="text-white/70">Weekly:</span>
                        <span className="ml-1 font-semibold text-emerald-400">
                          {formatGBP(netWeekly)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-slate-200 bg-white p-2">
                        <span className="text-white/70">PAYE:</span>
                        <span className="ml-1 font-semibold text-white">
                          {formatGBP(result.annual.paye)}
                        </span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-2">
                        <span className="text-white/70">NI:</span>
                        <span className="ml-1 font-semibold text-white">
                          {formatGBP(result.annual.ni)}
                        </span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-2">
                        <span className="text-white/70">Pension:</span>
                        <span className="ml-1 font-semibold text-white">
                          {formatGBP(result.annual.pensionEmployee)}
                        </span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-2">
                        <span className="text-white/70">Student loan:</span>
                        <span className="ml-1 font-semibold text-white">
                          {formatGBP(result.annual.studentLoan)}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                      <p className="text-xs text-white/70">Net annual income</p>
                      <p className="mt-1 text-xl font-semibold text-emerald-400">
                        {formatGBP(result.annual.net)}
                      </p>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </div>

        <p className="text-xs text-white/70">
          These figures use PAYE-style rules for guidance only and are not an official HMRC calculation. This is an inside IR35 estimate.
        </p>
      </section>
    </div>
  );
}
