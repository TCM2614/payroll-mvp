"use client";



import AppShell from "@/components/layout/AppShell";

import { TakeHomeCalculator } from "@/components/take-home-calculator";



export default function CalcPage() {

  return (

    <AppShell>

      <section className="mb-6">

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">

          Take-Home Calculator

        </h1>

        <p className="mt-2 text-sm text-white/70">

          Compare PAYE, Umbrella and Limited company take-home pay side by side, including student loans and pensions.

        </p>

      </section>



      <section className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-xl sm:p-6">

        <TakeHomeCalculator />

      </section>

    </AppShell>

  );

}
