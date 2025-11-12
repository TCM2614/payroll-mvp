"use client";

import { TakeHomeCalculator } from "@/components/take-home-calculator";



export default function CalcPage() {

  return (

    <main className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">

      <div className="w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

        <TakeHomeCalculator />

      </div>

    </main>

  );

}
