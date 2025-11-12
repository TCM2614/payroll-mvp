"use client";

import { TakeHomeCalculator } from "@/components/take-home-calculator";



export default function CalcPage() {

  return (

    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white px-4 py-10 dark:from-zinc-900 dark:to-zinc-950">

      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">

        <div className="w-full lg:w-2/3">

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <TakeHomeCalculator />

          </div>

        </div>



        <aside className="w-full lg:w-1/3">

          {/* Summary / key numbers / notes */}

          <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">

            <h2 className="mb-2 text-sm font-semibold">Quick summary</h2>

            {/* You can show key take-home & effective tax here */}

          </div>

          {/* Room for future panels */}

        </aside>

      </div>

    </main>

  );

}
