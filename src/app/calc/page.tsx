"use client";

import { useState } from "react";



export default function CalcPage() {

  const [gross, setGross] = useState(6000);

  const tax = gross * 0.22;

  const ni = gross * 0.08;

  const takeHome = gross - tax - ni;



  return (

    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">

      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

        <h1 className="mb-6 text-center text-2xl font-semibold">Take-Home Calculator</h1>



        <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">

          Gross per month (£)

        </label>

        <input

          type="number"

          value={gross}

          onChange={(e) => setGross(Number(e.target.value) || 0)}

          className="mb-4 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950"

        />



        <div className="text-center">

          <p className="text-sm text-zinc-600 dark:text-zinc-400">Estimated Take-Home</p>

          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">

            £{takeHome.toLocaleString()}

          </p>

        </div>

      </div>

    </main>

  );

}

