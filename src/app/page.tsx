"use client";



import Link from "next/link";

import { useState } from "react";

import AppShell from "@/components/layout/AppShell";

import EmailSignupSection from "@/components/landing/EmailSignupSection";

import FeedbackModal from "@/components/landing/FeedbackModal";

import CookieBanner from "@/components/landing/CookieBanner";

import { EarlyAccessForm } from "@/components/EarlyAccessForm";



export default function LandingPage() {

  const [feedbackOpen, setFeedbackOpen] = useState(false);



  return (

    <AppShell>

      <div className="flex flex-col items-center">

        {/* Hero */}

        <section className="relative w-full max-w-3xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-black/60 px-3 py-1 text-xs text-emerald-300/90 shadow-lg shadow-emerald-500/20">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            Early access · UK tax year 2024/25

          </div>



          <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">

            UK Take-Home Pay Calculator 2024/25 – Calculate Your Net Pay After Tax

          </h1>



          <p className="mt-4 text-balance text-sm text-white/70 sm:text-base">
            Instant UK take-home pay calculator. Accurate PAYE, Umbrella and Limited Company tax breakdowns with student loan, pension and salary sacrifice support — fully updated for the 2025/26 tax year.
          </p>

          <p className="mt-5 text-sm text-white/80">
            Join early access to save and compare your take-home pay scenarios.
          </p>

          <div className="mt-4 flex justify-center">
            <EarlyAccessForm />
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">

            <Link

              href="/calc"

              onClick={() => {
                if (typeof window !== "undefined" && (window as any).plausible) {
                  (window as any).plausible("cta_click", { props: { cta: "calculate_take_home_pay", location: "landing_hero" } });
                }
              }}

              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"

            >

              Calculate Take-Home Pay

            </Link>

            <button

              type="button"

              onClick={() => setFeedbackOpen(true)}

              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/90 shadow-md shadow-black/40 transition hover:border-emerald-400 hover:bg-white/10"

            >

              Give Feedback

            </button>

          </div>



          <p className="mt-3 text-[11px] text-white/50">

            No spam. No sales. Just accurate, transparent UK payroll numbers.

          </p>

        </section>



        {/* Email signup */}

        <EmailSignupSection />



        {/* Simple 3-column trust strip */}

        <section className="mt-12 grid w-full max-w-4xl gap-4 text-xs text-white/70 sm:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">

              Coverage

            </p>

            <p className="mt-2">

              Compare PAYE, Umbrella, and Limited Company take-home pay. Calculate multiple jobs, all student loan plans (1, 2, 4, 5, and Postgraduate), and see how IR35 status affects your net pay.

            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">

              Transparency

            </p>

            <p className="mt-2">

              Clear breakdowns of gross pay, income tax, National Insurance, student loan repayments, and pension contributions on every calculation. See exactly where your money goes.

            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">

              Privacy-first

            </p>

            <p className="mt-2">

              We only store what&apos;s needed for analytics and feedback. Your

              numbers stay your numbers.

            </p>

          </div>

        </section>

      </div>



      <FeedbackModal

        isOpen={feedbackOpen}

        onClose={() => setFeedbackOpen(false)}

      />

      <CookieBanner />

    </AppShell>

  );

}
