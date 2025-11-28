"use client";

import Link from "next/link";
import Script from "next/script";
import { useMemo, useState, useCallback } from "react";

import AppShell from "@/components/layout/AppShell";
import EmailSignupSection from "@/components/landing/EmailSignupSection";
import FeedbackModal from "@/components/landing/FeedbackModal";
import CookieBanner from "@/components/landing/CookieBanner";
import { EarlyAccessForm } from "@/components/EarlyAccessForm";
import { TakeHomeCalculator } from "@/components/take-home-calculator";
import { StickySummary } from "@/components/StickySummary";
import { WealthInsights } from "@/components/WealthInsights";
import { MortgageAffordability } from "@/components/MortgageAffordability";
import type { CalculatorSummary } from "@/types/calculator";

export default function HomeClient() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [latestSummary, setLatestSummary] = useState<CalculatorSummary | null>(null);
  const [latestGross, setLatestGross] = useState<number | null>(null);
  const [latestNet, setLatestNet] = useState<number | null>(null);

  const visualSalary = useMemo(() => {
    const candidate =
      latestGross ??
      latestSummary?.annualGross ??
      latestSummary?.annualNet ??
      latestNet ??
      0;
    return candidate > 0 ? candidate : 45000;
  }, [latestGross, latestSummary, latestNet]);

  const softwareSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "UK Take-Home Pay Calculator",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "GBP",
      },
      url: "https://payroll-mvp.vercel.app",
      description:
        "Calculate accurate UK take-home pay for PAYE, Umbrella and Limited Company engagements with student loan and pension support.",
    }),
    [],
  );

  const handleSummaryChange = useCallback((summary: CalculatorSummary) => {
    setLatestSummary(summary);
  }, []);

  const handleGrossChange = useCallback((value?: number) => {
    if (typeof value === "number" && value > 0) {
      setLatestGross(value);
    }
  }, []);

  const handleNetChange = useCallback((value?: number) => {
    if (typeof value === "number" && value > 0) {
      setLatestNet(value);
    }
  }, []);

  const scrollToVisuals = () => {
    const target = document.getElementById("wealth-visuals");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <AppShell>
      <Script
        id="adsense-script"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5163287208898205"
        strategy="afterInteractive"
        crossOrigin="anonymous"
        async
      />
      <Script
        id="software-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <main className="space-y-16 pb-16">
        <section className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-black/60 px-3 py-1 text-xs text-emerald-300/90 shadow-lg shadow-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Early access · UK tax year 2024/25
          </div>
          <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            UK Take-Home Pay Calculator 2024/25 – Calculate Your Net Pay After Tax
          </h1>
          <p className="mt-4 text-balance text-sm text-white/70 sm:text-base">
            Instant UK take-home pay calculator across PAYE, Umbrella, Limited Company and Periodic tax
            checks. Updated for 2024/25 with student loan, salary sacrifice and IR35 coverage.
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
                  (window as any).plausible("cta_click", {
                    props: { cta: "calculate_take_home_pay", location: "landing_hero" },
                  });
                }
              }}
              className="btn-primary px-6 py-2.5"
            >
              Calculate Take-Home Pay
            </Link>
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="btn-secondary px-5 py-2.5"
            >
              Give Feedback
            </button>
          </div>
          <p className="mt-3 text-[11px] text-white/50">
            No spam. No sales. Just accurate, transparent UK payroll numbers.
          </p>
        </section>

        <EmailSignupSection />

        <section className="grid w-full gap-4 text-xs text-white/70 sm:grid-cols-3">
          {[
            {
              title: "Coverage",
              copy:
                "Compare PAYE, Umbrella and Limited Company take-home pay. Model multiple jobs, student loan plans and pension strategies.",
            },
            {
              title: "Transparency",
              copy:
                "See the breakdown of gross pay, Income Tax, Class 1 National Insurance and student loans on every result.",
            },
            {
              title: "Privacy-first",
              copy: "We only store minimal analytics. Your figures stay on your device.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                {item.title}
              </p>
              <p className="mt-2">{item.copy}</p>
            </div>
          ))}
        </section>

        <section id="calculator" className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              Choose your income scenario
            </h2>
            <p className="text-sm text-white/70">
              Switch between Standard PAYE, Umbrella, Limited Company or Periodic PAYE checks without
              losing your inputs.
            </p>
          </div>
          <TakeHomeCalculator
            onSummaryChange={handleSummaryChange}
            onGrossChange={handleGrossChange}
            onNetChange={handleNetChange}
          />
          {latestSummary && latestSummary.annualNet > 0 && (
            <div className="flex justify-center pt-32 lg:pt-0">
              <StickySummary
                annualNet={latestSummary.annualNet}
                monthlyNet={latestSummary.monthlyNet}
                weeklyNet={latestSummary.weeklyNet}
                onSeeBreakdown={scrollToVisuals}
                className="lg:max-w-4xl"
              />
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              Home buying power
            </h2>
            <p className="text-sm text-white/70">
              Estimate your mortgage potential instantly using your latest salary projection.
            </p>
          </div>
          <MortgageAffordability salary={visualSalary} />
        </section>

        <section aria-labelledby="tax-explainer" className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 id="tax-explainer" className="text-2xl font-semibold text-white">
            How is UK Take-Home Pay Calculated?
          </h2>
          <article className="mt-4 space-y-3 text-sm text-white/80">
            <p>
              We start with the standard 1257L tax code to allocate your personal allowance. Income above
              that allowance is taxed at the basic, higher and additional PAYE bands for 2024/25. Salary
              sacrifice pension contributions reduce taxable income before those bands are applied.
            </p>
            <p>
              Class 1 National Insurance uses the latest thresholds, with separate primary (employee) and
              secondary (employer) rates. When you enter a pension contribution we recompute the NI saving so
              you can see the real net impact.
            </p>
            <p>
              Student Loan Plan 2 (and Plans 1, 4, 5 plus Postgraduate) repayments sit on top of the PAYE
              result. We compare your gross income to the appropriate threshold, calculate the deduction and
              include it in your take-home pay so the amount you actually receive is crystal clear.
            </p>
          </article>
        </section>

        <section aria-labelledby="faq-title" className="space-y-4">
          <h2 id="faq-title" className="text-2xl font-semibold text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            <details className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-white">
                Does this calculator include student loan?
              </summary>
              <p className="mt-2 text-sm text-white/80">
                Yes. Plans 1, 2, 4, 5 and Postgraduate are supported, including concurrent plans. Each period
                shows the exact deduction next to Income Tax and National Insurance.
              </p>
            </details>
            <details className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-white">
                Is this accurate for 2024/25?
              </summary>
              <p className="mt-2 text-sm text-white/80">
                The engine is aligned with HMRC&apos;s 2024/25 PAYE, Class 1 NI and student loan thresholds.
                Umbrella and Limited Company tabs share the same annual tax engine, so you get consistent
                results regardless of the scenario you model.
              </p>
            </details>
          </div>
        </section>
      </main>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <CookieBanner />
    </AppShell>
  );
}
