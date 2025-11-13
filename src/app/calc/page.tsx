"use client";



import AppShell from "@/components/layout/AppShell";

import { TakeHomeCalculator } from "@/components/take-home-calculator";



export default function CalcPage() {

  return (

    <AppShell>

      <section className="mb-6">

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">

          UK Salary Calculator 2024/25 – Instant Take-Home Pay

        </h1>

        <p className="mt-2 text-sm text-white/70">

          Calculate your UK take-home pay after tax, National Insurance, pension and student loan deductions for the 2024/25 tax year.

        </p>

        <p className="mt-3 text-xs text-white/60">

          Use the Standard tab if you&apos;re a PAYE employee, the Umbrella or Limited company tabs for contracting, and the Periodic tax check tab to analyse real payslips. For advanced tools like comparing structures or multiple jobs, visit the <a href="/contracting" className="text-emerald-400 hover:text-emerald-300 underline">Advanced Contracting Tools</a> page.

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

      {/* FAQ Section */}
      <section className="mt-12 space-y-6">
        <h2 className="text-xl font-semibold text-white">Frequently asked questions about UK take-home pay</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-white mb-2">
              How does this calculator work?
            </h3>
            <p className="text-sm text-white/70">
              Enter your gross income, tax code, pension contributions and student loan plan. The calculator uses official 2024/25 UK PAYE and National Insurance rates to compute your take-home pay. It shows a breakdown of tax, NI, pension and student loan deductions.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-2">
              Which tax year does it use?
            </h3>
            <p className="text-sm text-white/70">
              All calculations use the 2024/25 UK tax year rates, including personal allowance, income tax bands, National Insurance thresholds and student loan repayment rates.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-2">
              Do you store my data?
            </h3>
            <p className="text-sm text-white/70">
              No. All calculations happen in your browser. We don&apos;t store your salary, tax codes or any personal financial information. We only collect anonymous usage analytics to improve the tool.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-2">
              Can it show over/under-tax mid-year?
            </h3>
            <p className="text-sm text-white/70">
              Yes. Use the Periodic tax check tab to enter your actual payslip data period-by-period. The calculator compares what you&apos;ve paid against what you&apos;d expect, highlighting potential over-taxation or underpayments.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-2">
              Does it cover student loans?
            </h3>
            <p className="text-sm text-white/70">
              Yes. The calculator supports Plan 1, Plan 2, Plan 4, Plan 5 and Postgraduate loan repayments, using the correct thresholds and rates for the 2024/25 tax year.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-2">
              Does it support outside IR35 limited company scenarios?
            </h3>
            <p className="text-sm text-white/70">
              No. Outside IR35 limited company scenarios are not yet modelled. The Limited company tab shows a clear message when you select &quot;Outside IR35&quot;. Inside IR35 is supported and treated as PAYE-style employment.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-2">
              Is it an official HMRC service?
            </h3>
            <p className="text-sm text-white/70">
              No. This is an independent calculator for guidance only. It uses official HMRC rates but is not affiliated with HMRC. For official tax calculations, consult HMRC directly or a qualified tax advisor.
            </p>
          </div>
        </div>
      </section>

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
