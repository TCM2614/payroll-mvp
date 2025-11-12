"use client";

import { useState } from "react";



export default function CalcPage() {

  const [gross, setGross] = useState(6000);

  const tax = gross * 0.22;

  const ni = gross * 0.08;

  const takeHome = gross - tax - ni;



  return (

    <main className="mx-auto max-w-2xl px-6 py-16">

      <h1 className="mb-6 text-2xl font-semibold">Take-Home Calculator</h1>

      <div className="mb-4">

        <label className="block text-sm font-medium">Gross per month (£)</label>

        <input

          type="number"

          value={gross}

          onChange={(e) => setGross(Number(e.target.value) || 0)}

          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"

        />

      </div>

      <div className="text-xl font-semibold">

        Estimated Take-Home: £{takeHome.toLocaleString()}

      </div>

    </main>

  );

}

