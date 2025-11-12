// src/app/calc/page.tsx

"use client";

import { useState } from "react";



export default function CalcPage() {

  const [gross, setGross] = useState(6000);

  const tax = gross * 0.22;

  const ni = gross * 0.08;

  const takeHome = gross - tax - ni;



  return (

    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">

      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

        <h1 className="mb-6 text-center text-2xl font-semibold">Take-Home Calculator</h1>

        <label className="mb-2 block text-sm font-medium">Gross per month (£)</label>

        <input

          type="number"

          value={gross}

          onChange={(e) => setGross(Number(e.target.value) || 0)}

          className="mb-4 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"

        />

        <div className="text-center">

          <p className="text-sm text-zinc-600 dark:text-zinc-400">Estimated Take-Home</p>

          <p className="mt-1 text-3xl font-bold">£{takeHome.toLocaleString()}</p>

        </div>

      </div>

    </main>

  );

}

