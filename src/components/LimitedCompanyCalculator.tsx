"use client";



import { useState } from "react";

import { formatGBP } from "@/lib/format";

import { calcLimited } from "@/lib/calculators/limited";



export function LimitedCompanyCalculator() {

  const [dayRate, setDayRate] = useState(500);

  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const [weeksPerYear, setWeeksPerYear] = useState(46);

  const [salaryMonthly, setSalaryMonthly] = useState(1000);

  const [pensionPct, setPensionPct] = useState(5);

  const [sippPct, setSippPct] = useState(0);



  const grossMonthly = (dayRate * daysPerWeek * weeksPerYear) / 12;

  const revenueAnnual = dayRate * daysPerWeek * weeksPerYear;

  const salaryAnnual = salaryMonthly * 12;

  const employerPension = (revenueAnnual * pensionPct) / 100;



  // TODO: adjust to your calcLimited signature

  const result = calcLimited({

    dayRate,

    daysPerWeek,

    weeksPerYear,

    salaryAnnual,

    employerPension,

  });



  const monthlyTakeHome = result.netToDirector / 12;



  return (

    <div className="space-y-4">

      <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">

        <div className="space-y-1">

          <label className="text-xs font-medium">Day rate (£)</label>

          <input

            type="number"

            value={dayRate}

            onChange={(e) => setDayRate(Number(e.target.value) || 0)}

            className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"

          />

        </div>

        <div className="space-y-1">

          <label className="text-xs font-medium">Days / week</label>

          <input

            type="number"

            value={daysPerWeek}

            onChange={(e) => setDaysPerWeek(Number(e.target.value) || 0)}

            className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"

          />

        </div>

        <div className="space-y-1">

          <label className="text-xs font-medium">Weeks / year</label>

          <input

            type="number"

            value={weeksPerYear}

            onChange={(e) => setWeeksPerYear(Number(e.target.value) || 0)}

            className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"

          />

        </div>

        <div className="space-y-1">

          <label className="text-xs font-medium">Director salary / month (£)</label>

          <input

            type="number"

            value={salaryMonthly}

            onChange={(e) => setSalaryMonthly(Number(e.target.value) || 0)}

            className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"

          />

        </div>

        <div className="space-y-1">

          <label className="text-xs font-medium">Pension (%)</label>

          <input

            type="number"

            value={pensionPct}

            onChange={(e) => setPensionPct(Number(e.target.value) || 0)}

            className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"

          />

        </div>

        <div className="space-y-1">

          <label className="text-xs font-medium">SIPP (%)</label>

          <input

            type="number"

            value={sippPct}

            onChange={(e) => setSippPct(Number(e.target.value) || 0)}

            className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"

          />

        </div>

      </section>



      <section className="rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">

        <p className="text-zinc-500">Approx gross via limited company:</p>

        <p className="mt-1 text-lg font-semibold">

          {formatGBP(grossMonthly)} / month

        </p>

        <p className="mt-3 text-zinc-500">Estimated take-home (salary + dividends):</p>

        <p className="mt-1 text-2xl font-semibold">

          {formatGBP(monthlyTakeHome)} / month

        </p>

      </section>

    </div>

  );

}

