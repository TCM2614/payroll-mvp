"use client";



import TakeHomeCalculator from "@/components/take-home-calculator";



export default function CalcPage() {

  return (

    <main className="flex min-h-screen items-center justify-center px-6 py-12 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">

      <div className="w-full max-w-3xl">

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

          {/* Your existing calculator */}

          <TakeHomeCalculator />

        </div>

      </div>

    </main>

  );

}

