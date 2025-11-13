"use client";



import Link from "next/link";

import { useState } from "react";

import MainHeader from "@/components/layout/MainHeader";

import EmailSignupSection from "@/components/landing/EmailSignupSection";

import FeedbackModal from "@/components/landing/FeedbackModal";

import CookieBanner from "@/components/landing/CookieBanner";



export default function LandingPage() {

  const [feedbackOpen, setFeedbackOpen] = useState(false);



  return (

    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-zinc-900 text-white">

      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.12),_transparent_55%)]" />



      <MainHeader />



      <main className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-24 pt-12">

        {/* Hero */}

        <section className="relative w-full max-w-3xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-black/60 px-3 py-1 text-xs text-emerald-300/90 shadow-lg shadow-emerald-500/20">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            Early access · UK tax year 2024/25

          </div>



          <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">

            UK Payroll Take-Home Calculator

          </h1>



          <p className="mt-4 text-balance text-sm text-white/70 sm:text-base">

            Instantly compare PAYE, Umbrella and Limited company take-home pay

            in one place. Built for UK employees, contractors and side-hustlers

            who want clarity on every payslip.

          </p>



          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">

            <Link

              href="/calc"

              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"

            >

              Enter App

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

              PAYE, Umbrella and Limited company scenarios, including multi-job

              setups and student loans.

            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">

              Transparency

            </p>

            <p className="mt-2">

              Clear breakdowns of gross, tax, NI, student loans and pension

              deductions on every calculation.

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

      </main>



      {/* Footer */}

      <footer className="border-t border-white/10 bg-black/60">

        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">

          <p>© {new Date().getFullYear()} UK Payroll Take-Home Calculator.</p>

          <div className="flex flex-wrap gap-4">

            <a href="/privacy" className="hover:text-white">

              Privacy Policy

            </a>

            <a href="/cookies" className="hover:text-white">

              Cookie Policy

            </a>

            <a href="/terms" className="hover:text-white">

              Terms

            </a>

          </div>

        </div>

      </footer>



      <FeedbackModal

        isOpen={feedbackOpen}

        onClose={() => setFeedbackOpen(false)}

      />

      <CookieBanner />

    </div>

  );

}
