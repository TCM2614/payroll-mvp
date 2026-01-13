"use client";

import React, { useMemo, useState } from "react";
import LoansMultiSelect from "./LoansMultiSelect";
import SIPPAndSalarySacrifice from "./SIPPAndSalarySacrifice";
import PayeMultiIncome from "./PayeMultiIncome";
import {
  calcPAYECombined,
  CombinedPayeInput,
  PayeIncomeStream,
} from "@/lib/calculators/paye";
import { calcUmbrella } from "@/lib/calculators/umbrella";
import { calcLimited } from "@/lib/calculators/limited";
import { LoanKey } from "@/lib/tax/uk2025";

export default function ContractorComparisonTabs() {
  const [freqForUL, setFreqForUL] = useState<"daily" | "hourly" | "monthly" | "annual">(
    "daily",
  );
  const [basePay, setBasePay] = useState<number>(450);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [hoursPerDay, setHoursPerDay] = useState(7.5);
  const [weeksPerYear, setWeeksPerYear] = useState(46);
  const [taxCodeForUmbrella, setTaxCodeForUmbrella] = useState("1257L");

  const [ssPct, setSsPct] = useState(0);
  const [ssFixed, setSsFixed] = useState(0);
  const [sipp, setSipp] = useState(0);

  const [loans, setLoans] = useState<LoanKey[]>([]);

  const [umbMarginWeekly, setUmbMarginWeekly] = useState(20);
  const [holidayPct, setHolidayPct] = useState(12.07);

  const [directorSalary, setDirectorSalary] = useState(12_570);
  const [companyExpenses, setCompanyExpenses] = useState(0);
  const [employerPension, setEmployerPension] = useState(0);

  const [streams, setStreams] = useState<PayeIncomeStream[]>([
    {
      id: "primary",
      label: "Primary",
      frequency: "monthly",
      amount: 4_000,
      taxCode: "1257L",
      salarySacrificePct: 0,
      salarySacrificeFixed: 0,
    },
  ]);

  const payeCombined = useMemo(() => {
    const input: CombinedPayeInput = { streams, sippPersonal: sipp, loans };
    return calcPAYECombined(input);
  }, [streams, sipp, loans]);

  const umbrella = useMemo(
    () =>
      calcUmbrella({
        dayRate: freqForUL === "daily" ? basePay : undefined,
        hourlyRate: freqForUL === "hourly" ? basePay : undefined,
        monthlyRate: freqForUL === "monthly" ? basePay : undefined,
        annualRate: freqForUL === "annual" ? basePay : undefined,
        daysPerWeek,
        hoursPerDay,
        weeksPerYear,
        umbrellaMarginPerWeek: umbMarginWeekly,
        holidayPayPct: holidayPct,
        salarySacrificePct: ssPct,
        salarySacrificeFixed: ssFixed,
        sippPersonal: sipp,
        taxCode: taxCodeForUmbrella,
        loans,
      }),
    [
      basePay,
      freqForUL,
      daysPerWeek,
      hoursPerDay,
      weeksPerYear,
      umbMarginWeekly,
      holidayPct,
      ssPct,
      ssFixed,
      sipp,
      taxCodeForUmbrella,
      loans,
    ],
  );

  const limited = useMemo(
    () =>
      calcLimited({
        dayRate: freqForUL === "daily" ? basePay : undefined,
        hourlyRate: freqForUL === "hourly" ? basePay : undefined,
        monthlyRate: freqForUL === "monthly" ? basePay : undefined,
        annualRate: freqForUL === "annual" ? basePay : undefined,
        daysPerWeek,
        hoursPerDay,
        weeksPerYear,
        salaryAnnual: directorSalary,
        allowableExpensesAnnual: companyExpenses,
        employerPension,
        loans,
        salarySacrificePct: ssPct,
        salarySacrificeFixed: ssFixed,
        sippPersonal: sipp,
        taxCode: taxCodeForUmbrella,
      }),
    [
      basePay,
      freqForUL,
      daysPerWeek,
      hoursPerDay,
      weeksPerYear,
      directorSalary,
      companyExpenses,
      employerPension,
      loans,
      ssPct,
      ssFixed,
      sipp,
      taxCodeForUmbrella,
    ],
  );

  return (
    <div className="grid gap-6">
      <PayeMultiIncome streams={streams} onChange={setStreams} />

      <SIPPAndSalarySacrifice
        salarySacrificePct={ssPct}
        setSalarySacrificePct={setSsPct}
        salarySacrificeFixed={ssFixed}
        setSalarySacrificeFixed={setSsFixed}
        sippPersonal={sipp}
        setSippPersonal={setSipp}
      />

      <LoansMultiSelect value={loans} onChange={setLoans} />

      <div className="grid gap-4 rounded-2xl border p-4 shadow-sm">
        <h3 className="text-lg font-semibold">PAYE Multi-Income Summary</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <ul className="grid gap-2 text-sm">
            {payeCombined.streams.map((stream) => (
              <li key={stream.id} className="rounded-lg border p-3">
                <div className="font-semibold">
                  {stream.label} • Gross ({stream.frequency}): £
                  {stream.grossEntered.toFixed(2)}
                </div>
                <div>Annualised (internal): £{stream.annualisedGross.toFixed(0)}</div>
                {stream.salarySacrifice > 0 && (
                  <div>Salary sacrifice: £{stream.salarySacrifice.toFixed(0)}</div>
                )}
                <div>Taxable after reliefs: £{stream.taxableIncomeAfterReliefs.toFixed(0)}</div>
                <div>Income tax: £{stream.incomeTax.toFixed(0)}</div>
                <div>Employee NI: £{stream.employeeNI.toFixed(0)}</div>
              </li>
            ))}
          </ul>
          <ul className="grid gap-2 rounded-lg border p-3 text-sm">
            <li>
              <span className="opacity-70">Total gross (annual):</span> £
              {payeCombined.totalGrossAnnual.toFixed(0)}
            </li>
            <li>
              <span className="opacity-70">SIPP grossed:</span> £
              {payeCombined.sippGrossed.toFixed(0)}{" "}
              <span className="opacity-50">
                (extra relief est. £{payeCombined.sippExtraReliefEstimate.toFixed(0)})
              </span>
            </li>
            <li>
              <span className="opacity-70">Total income tax:</span> £
              {payeCombined.totalIncomeTax.toFixed(0)}
            </li>
            <li>
              <span className="opacity-70">Total employee NI:</span> £
              {payeCombined.totalEmployeeNI.toFixed(0)}
            </li>
            {payeCombined.totalStudentLoans > 0 && (
              <li>
                <span className="opacity-70">Total student loans:</span> £
                {payeCombined.totalStudentLoans.toFixed(0)}
              </li>
            )}
            <li className="mt-2 font-semibold">
              Net take-home (annual): £{payeCombined.totalTakeHomeAnnual.toFixed(0)}
            </li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          Gross figures stay in their entered frequency. HMRC PAYE and NI logic runs on
          annualised values, with NI applied per employment stream.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border p-4 shadow-sm">
        <h3 className="text-lg font-semibold">Umbrella Options</h3>
        <div className="grid gap-4 md:grid-cols-5">
          <label className="grid gap-1 text-sm">
            <span>Frequency</span>
            <select
              className="rounded-lg border px-2 py-2 text-sm"
              value={freqForUL}
              onChange={(event) => setFreqForUL(event.target.value as typeof freqForUL)}
            >
              <option value="daily">daily</option>
              <option value="hourly">hourly</option>
              <option value="monthly">monthly</option>
              <option value="annual">annual</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span>Gross ({freqForUL})</span>
            <input
              type="number"
              className="rounded-lg border px-2 py-2 text-sm"
              value={basePay}
              onChange={(event) => setBasePay(Number(event.target.value || 0))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Days / week</span>
            <input
              type="number"
              className="rounded-lg border px-2 py-2 text-sm"
              value={daysPerWeek}
              onChange={(event) => setDaysPerWeek(Number(event.target.value || 0))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Hours / day</span>
            <input
              type="number"
              className="rounded-lg border px-2 py-2 text-sm"
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(Number(event.target.value || 0))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Weeks / year</span>
            <input
              type="number"
              className="rounded-lg border px-2 py-2 text-sm"
              value={weeksPerYear}
              onChange={(event) => setWeeksPerYear(Number(event.target.value || 0))}
            />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            <span>Tax code</span>
            <input
              className="rounded-lg border px-2 py-2 text-sm"
              value={taxCodeForUmbrella}
              onChange={(event) => setTaxCodeForUmbrella(event.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-1 text-sm">
            <span>Umbrella margin (£/week)</span>
            <input
              type="number"
              className="rounded-lg border px-2 py-2 text-sm"
              value={umbMarginWeekly}
              onChange={(event) => setUmbMarginWeekly(Number(event.target.value || 0))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Rolled holiday (%)</span>
            <input
              type="number"
              className="rounded-lg border px-2 py-2 text-sm"
              value={holidayPct}
              onChange={(event) => setHolidayPct(Number(event.target.value || 0))}
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border p-4 shadow-sm">
        <h3 className="text-lg font-semibold">Limited Company Options</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-1 text-sm">
            <span>Director salary (£/yr)</span>
            <input
              type="number"
              className="rounded-lg border px-2 py-2 text-sm"
              value={directorSalary}
              onChange={(event) => setDirectorSalary(Number(event.target.value || 0))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Allowable expenses (£/yr)</span>
            <input
              type="number"
              className="rounded-lg border px-2 py-2 text-sm"
              value={companyExpenses}
              onChange={(event) => setCompanyExpenses(Number(event.target.value || 0))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Employer pension (£/yr)</span>
            <input
              type="number"
              className="rounded-lg border px-2 py-2 text-sm"
              value={employerPension}
              onChange={(event) => setEmployerPension(Number(event.target.value || 0))}
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Comparison</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-4">
            <h4 className="mb-2 font-semibold">PAYE (Multi-Income)</h4>
            <ul className="grid gap-1 text-sm">
              <li>
                <span className="opacity-70">Total gross (annual):</span> £
                {payeCombined.totalGrossAnnual.toFixed(0)}
              </li>
              <li>
                <span className="opacity-70">Income tax (total):</span> £
                {payeCombined.totalIncomeTax.toFixed(0)}
              </li>
              <li>
                <span className="opacity-70">Employee NI (total):</span> £
                {payeCombined.totalEmployeeNI.toFixed(0)}
              </li>
              {payeCombined.totalStudentLoans > 0 && (
                <li>
                  <span className="opacity-70">Student loans:</span> £
                  {payeCombined.totalStudentLoans.toFixed(0)}
                </li>
              )}
              <li>
                <span className="opacity-70">SIPP grossed:</span> £
                {payeCombined.sippGrossed.toFixed(0)}{" "}
                <span className="opacity-50">
                  (extra relief est. £{payeCombined.sippExtraReliefEstimate.toFixed(0)})
                </span>
              </li>
              <li className="mt-2 font-semibold">
                Net take-home: £{payeCombined.totalTakeHomeAnnual.toFixed(0)}/yr
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border p-4">
            <h4 className="mb-2 font-semibold">Umbrella</h4>
            <ul className="grid gap-1 text-sm">
              <li>
                <span className="opacity-70">Assignment income:</span> £
                {umbrella.assignmentAnnual.toFixed(0)}
              </li>
              <li>
                <span className="opacity-70">Employer costs:</span> £
                {umbrella.employmentCostAnnual.toFixed(0)}
              </li>
              <li>
                <span className="opacity-70">Gross to employee:</span> £
                {umbrella.grossToEmployeeAnnual.toFixed(0)}
              </li>
              <li>
                <span className="opacity-70">Income tax:</span> £
                {umbrella.paye.totalIncomeTax.toFixed(0)}
              </li>
              <li>
                <span className="opacity-70">Employee NI:</span> £
                {umbrella.paye.totalEmployeeNI.toFixed(0)}
              </li>
              {umbrella.paye.totalStudentLoans > 0 && (
                <li>
                  <span className="opacity-70">Student loans:</span> £
                  {umbrella.paye.totalStudentLoans.toFixed(0)}
                </li>
              )}
              <li>
                <span className="opacity-70">Rolled holiday (info):</span> £
                {umbrella.rolledHoliday.toFixed(0)}
              </li>
              <li className="mt-2 font-semibold">
                Net take-home: £{umbrella.netTakeHomeAnnual.toFixed(0)}/yr
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border p-4">
            <h4 className="mb-2 font-semibold">Limited Company</h4>
            <ul className="grid gap-1 text-sm">
              <li>
                <span className="opacity-70">Revenue:</span> £{limited.revenueAnnual.toFixed(0)}
              </li>
              <li>
                <span className="opacity-70">Profit before tax:</span> £
                {limited.profitBeforeTax.toFixed(0)}
              </li>
              <li>
                <span className="opacity-70">Corporation tax:</span> £{limited.corpTax.toFixed(0)}
              </li>
              <li>
                <span className="opacity-70">Director salary (gross):</span> £
                {limited.salary.toFixed(0)}
              </li>
              <li>
                <span className="opacity-70">Income tax on salary:</span> £
                {limited.paye.totalIncomeTax.toFixed(0)}
              </li>
              <li>
                <span className="opacity-70">Employee NI on salary:</span> £
                {limited.paye.totalEmployeeNI.toFixed(0)}
              </li>
              {limited.paye.totalStudentLoans > 0 && (
                <li>
                  <span className="opacity-70">Student loans:</span> £
                  {limited.paye.totalStudentLoans.toFixed(0)}
                </li>
              )}
              <li>
                <span className="opacity-70">Net salary (after PAYE/NI):</span> £
                {limited.netSalary.toFixed(0)}
              </li>
              <li>
                <span className="opacity-70">Distributable:</span> £
                {limited.distributable.toFixed(0)}
              </li>
              <li>
                <span className="opacity-70">Dividend tax:</span> £
                {limited.dividendTax.toFixed(0)}
              </li>
              <li>
                <span className="opacity-70">Net dividends:</span> £
                {limited.netDividends.toFixed(0)}
              </li>
              <li className="mt-2 font-semibold">
                Net to director: £{limited.netToDirector.toFixed(0)}/yr
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
