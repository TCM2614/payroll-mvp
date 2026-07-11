"use client";

import Link from "next/link";
import { TAX_YEAR } from "./lib/taxYear";

import AppShell from "@/components/layout/AppShell";
import { TakeHomeCalculator } from "@/components/take-home-calculator";

import CookieBanner from "@/components/landing/CookieBanner";

type PlausibleWindow = Window & {
  plausible?: (eventName: string, options?: { props?: Record<string, string> }) => void;
};

export default function LandingPage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center">
        {/* Hero */}
        <section className="relative w-full max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-black/60 px-3 py-1 text-xs text-emerald-300/90 shadow-lg shadow-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            UK tax year {TAX_YEAR}
          </div>

          <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            UK Take-Home Pay Calculator {TAX_YEAR} – Calculate Your Net Pay After Tax
          </h1>

          <p className="mt-4 text-balance text-sm text-white/70 sm:text-base">
            The only UK calculator that models PAYE, Umbrella (Inside IR35),
            Limited Company (Inside IR35) and Limited Company (Outside IR35)
            side by side — with a full umbrella-payslip reconciliation and
            corporation-tax marginal relief on the outside-IR35 side. Updated
            for {TAX_YEAR}.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/calc"
              onClick={() => {
                (window as PlausibleWindow).plausible?.("cta_click", {
                  props: {
                    cta: "calculate_take_home_pay",
                    location: "landing_hero",
                  },
                });
              }}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
            >
              Calculate Take-Home Pay
            </Link>
          </div>

          <p className="mt-3 text-[11px] text-white/50">
            No spam. No sales. Just accurate, transparent UK payroll numbers.
          </p>
        </section>

        {/* Calculator */}
        <section className="mt-10 w-full max-w-5xl">
          <div className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-4 shadow-soft-xl backdrop-blur sm:p-6">
            <TakeHomeCalculator />
          </div>
          <div className="mt-3 flex justify-center">
            <Link
              href="/calc"
              className="text-xs text-white/60 hover:text-white/80 transition-colors"
            >
              Prefer the full-page calculator? Open /calc
            </Link>
          </div>
        </section>

        {/* Simple 3-column trust strip */}
        <section className="mt-12 grid w-full max-w-4xl gap-4 text-xs text-white/70 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Coverage
            </p>
            <p className="mt-2">
              Compare PAYE, Umbrella, and Limited Company take-home pay.
              Calculate multiple jobs, all student loan plans (1, 2, 4, 5, and
              Postgraduate), and see how IR35 status affects your net pay.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Transparency
            </p>
            <p className="mt-2">
              Clear breakdowns of gross pay, income tax, National Insurance,
              student loan repayments, and pension contributions on every
              calculation. See exactly where your money goes.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Privacy-first
            </p>
            <p className="mt-2">
              Your calculations run in your browser. We don&apos;t collect,
              store, or share your salary information — nothing to sign up
              for, nothing to remember.
            </p>
          </div>
        </section>
      </div>

      <CookieBanner />
    </AppShell>
  );
}
