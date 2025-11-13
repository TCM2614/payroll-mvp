"use client";

import * as React from "react";
import AppShell from "@/components/layout/AppShell";
import { TakeHomeCalculator } from "@/components/take-home-calculator";
import DashboardFeedbackForm from "@/components/DashboardFeedbackForm";
import Link from "next/link";

type TopLevelTab = "calculators" | "faqs" | "dashboard";

export default function CalcPage() {
  const [activeTab, setActiveTab] = React.useState<TopLevelTab>("calculators");

  return (
    <AppShell>
      {/* Header */}
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-slate-900">
          UK Salary Calculator 2024/25 – Instant Take-Home Pay
        </h1>
        <p className="text-sm text-slate-700">
          Calculate your UK take-home pay after tax, National Insurance, pension and student loan deductions for the 2024/25 tax year.
        </p>
      </section>

      {/* Top-level segmented control */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-700">
          Switch between calculators, FAQs and dashboard preview.
        </p>
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("calculators")}
            className={
              "px-3 py-1.5 rounded-full transition-colors " +
              (activeTab === "calculators"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-50")
            }
          >
            Calculators
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("faqs")}
            className={
              "px-3 py-1.5 rounded-full transition-colors " +
              (activeTab === "faqs"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-50")
            }
          >
            FAQs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={
              "px-3 py-1.5 rounded-full transition-colors " +
              (activeTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-50")
            }
          >
            Dashboard (coming soon)
          </button>
        </div>
      </section>

      {/* Calculators Tab */}
      {activeTab === "calculators" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-6">
          <TakeHomeCalculator />
        </section>
      )}

      {/* FAQs Tab */}
      {activeTab === "faqs" && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Frequently asked questions about UK take-home pay
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                How does this calculator work?
              </h3>
              <p className="text-sm text-slate-700">
                Enter your gross income, tax code, pension contributions and student loan plan. The calculator uses official 2024/25 UK PAYE and National Insurance rates to compute your take-home pay. It shows a breakdown of tax, NI, pension and student loan deductions.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Which tax year does it use?
              </h3>
              <p className="text-sm text-slate-700">
                All calculations use the 2024/25 UK tax year rates, including personal allowance, income tax bands, National Insurance thresholds and student loan repayment rates.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Do you store my data?
              </h3>
              <p className="text-sm text-slate-700">
                No. All calculations happen in your browser. We don&apos;t store your salary, tax codes or any personal financial information. We only collect anonymous usage analytics to improve the tool.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Can it show over/under-tax mid-year?
              </h3>
              <p className="text-sm text-slate-700">
                Yes. Use the Periodic tax check tab to enter your actual payslip data period-by-period. The calculator compares what you&apos;ve paid against what you&apos;d expect, highlighting potential over-taxation or underpayments.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Does it cover student loans?
              </h3>
              <p className="text-sm text-slate-700">
                Yes. The calculator supports Plan 1, Plan 2, Plan 4, Plan 5 and Postgraduate loan repayments, using the correct thresholds and rates for the 2024/25 tax year.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Does it support outside IR35 limited company scenarios?
              </h3>
              <p className="text-sm text-slate-700">
                No. Outside IR35 limited company scenarios are not yet modelled. The Limited company tab shows a clear message when you select &quot;Outside IR35&quot;. Inside IR35 is supported and treated as PAYE-style employment.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Is it an official HMRC service?
              </h3>
              <p className="text-sm text-slate-700">
                No. This is an independent calculator for guidance only. It uses official HMRC rates but is not affiliated with HMRC. For official tax calculations, consult HMRC directly or a qualified tax advisor.
              </p>
            </div>
          </div>

          {/* FAQPage JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "How does this calculator work?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Enter your gross income, tax code, pension contributions and student loan plan. The calculator uses official 2024/25 UK PAYE and National Insurance rates to compute your take-home pay. It shows a breakdown of tax, NI, pension and student loan deductions.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Which tax year does it use?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "All calculations use the 2024/25 UK tax year rates, including personal allowance, income tax bands, National Insurance thresholds and student loan repayment rates.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Do you store my data?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "No. All calculations happen in your browser. We don't store your salary, tax codes or any personal financial information. We only collect anonymous usage analytics to improve the tool.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Can it show over/under-tax mid-year?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. Use the Periodic tax check tab to enter your actual payslip data period-by-period. The calculator compares what you've paid against what you'd expect, highlighting potential over-taxation or underpayments.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Does it cover student loans?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. The calculator supports Plan 1, Plan 2, Plan 4, Plan 5 and Postgraduate loan repayments, using the correct thresholds and rates for the 2024/25 tax year.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Does it support outside IR35 limited company scenarios?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "No. Outside IR35 limited company scenarios are not yet modelled. The Limited company tab shows a clear message when you select Outside IR35. Inside IR35 is supported and treated as PAYE-style employment.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is it an official HMRC service?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "No. This is an independent calculator for guidance only. It uses official HMRC rates but is not affiliated with HMRC. For official tax calculations, consult HMRC directly or a qualified tax advisor.",
                    },
                  },
                ],
              }),
            }}
          />
        </section>
      )}

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <section className="flex items-center justify-center py-6">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white/80 p-5 sm:p-6 shadow-lg backdrop-blur space-y-4">
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
              Dashboard coming soon
            </h2>
            <p className="text-sm text-slate-700">
              We&apos;re working on a dashboard to compare scenarios, track your take-home
              over time and visualise tax changes. Share what you&apos;d like it to do and
              we&apos;ll use your feedback to shape the roadmap.
            </p>
            <p className="text-[11px] text-slate-500">
              You can already use the calculator tabs to explore Standard PAYE, Umbrella,
              Limited and Periodic analysis. The dashboard will bring these together into a
              single, visual view.
            </p>

            <DashboardFeedbackForm variant="light" showLinkToCalculator={false} />

            <div className="pt-2">
              <Link
                href="/dashboard-preview"
                className="text-xs text-indigo-600 hover:text-indigo-700 underline"
              >
                View full dashboard preview page →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* SoftwareApplication JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "UK Take-Home Calculator",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/calc` : "https://yourdomain.com/calc",
            description: "Calculate your UK salary after tax, National Insurance, pension and student loan deductions for the 2024/25 tax year.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "GBP",
            },
          }),
        }}
      />
    </AppShell>
  );
}
