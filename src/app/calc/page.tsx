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

        <p className="mt-3 text-xs text-white/60">

          For a deeper check using your real payslips, use the &apos;Periodic tax check&apos; tab to enter period-by-period income and see if you might be over- or underpaying PAYE during the year.

        </p>

      </section>



      <section className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-xl sm:p-6">

        <TakeHomeCalculator />

      </section>



      {/* Redirect banner */}
      <section className="mt-8 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 p-6 text-center">

        <div className="flex flex-col items-center gap-3">

          <div className="text-2xl">🎉</div>

          <h3 className="text-lg font-semibold text-white">

            Track your take-home trends

          </h3>

          <p className="text-sm text-white/70">

            Join early for dashboard access and unlock analytics and trend tracking.

          </p>

          <a

            href="/signup"

            className="mt-2 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"

          >

            Get Early Access

          </a>

        </div>

      </section>

    </AppShell>

  );

}
