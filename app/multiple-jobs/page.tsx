import type { Metadata } from "next";
import Link from "next/link";
import { PageViewTracker } from "@/components/PageViewTracker";
import {
  MULTI_JOB_CATALOG,
  buildMultiJobInsight,
  multiJobPath,
} from "@/lib/marketing/multiJobInsight";
import { TAX_YEAR } from "../lib/taxYear";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: `Multiple UK Jobs & Second-Job Tax Codes (${TAX_YEAR})`,
  description: `How UK PAYE tax codes work when you have more than one job. BR, D0 and D1 explained, with worked examples showing how a second job affects your take-home for the ${TAX_YEAR} tax year.`,
  keywords:
    "second job tax UK, BR tax code, D0 tax code, two jobs tax code UK, multiple jobs PAYE, side job tax UK",
  alternates: { canonical: `${SITE_URL}/multiple-jobs` },
  openGraph: {
    title: `Multiple UK Jobs & Second-Job Tax Codes (${TAX_YEAR})`,
    description: `Understand BR / D0 / D1 second-job tax codes and see worked take-home examples for common two-job UK setups.`,
    url: `${SITE_URL}/multiple-jobs`,
    siteName: "UK Take-Home Calculator",
    type: "article",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: `Multiple UK Jobs & Second-Job Tax Codes (${TAX_YEAR})`,
    description: `Understand BR / D0 / D1 second-job tax codes and see worked examples.`,
  },
};

export default function MultipleJobsIndexPage() {
  const faqs = [
    {
      question: "How does HMRC tax a second job in the UK?",
      answer:
        "Your Personal Allowance (usually £12,570) is applied to whichever employment holds your primary tax code — usually 1257L. The second job then defaults to BR (basic rate — flat 20%), D0 (higher rate — flat 40%) or D1/D2 (additional rate — flat 45–48%), because HMRC assumes the primary job has already used your allowance and lower bands.",
    },
    {
      question: "What is a BR tax code?",
      answer:
        "BR stands for Basic Rate. Every pound you earn on that employment is taxed at 20%. HMRC assigns BR to a second job when your primary job earns enough to have used your Personal Allowance and basic-rate band already lands you in the basic band overall.",
    },
    {
      question: "What is a D0 tax code?",
      answer:
        "D0 taxes every pound on that employment at 40% (higher rate). HMRC assigns D0 to a second job when your total income (across all jobs) places the second job entirely in the higher-rate band.",
    },
    {
      question: "What is a D1 tax code?",
      answer:
        "D1 taxes every pound on that employment at 45% (additional rate). HMRC assigns D1 to a second job when your total income places it entirely above £125,140. Scotland has its own equivalents (SBR / SD0 / SD1 / SD2) with the corresponding Scottish rates.",
    },
    {
      question: "Do I pay more or less National Insurance across two jobs?",
      answer:
        "Employee NI is calculated separately for each employment, using each employer's own Primary Threshold. That means a person splitting £60,000 across two jobs typically pays less NI than someone earning the same £60,000 from a single employer — because they get two rounds of the £12,570 tax-free NI band. The Income Tax total is unaffected by the split.",
    },
    {
      question: "Can my tax code be wrong across two jobs?",
      answer:
        "Yes. If HMRC hasn't been told about the second job — or if your incomes change — the wrong tax code (e.g. two 1257Ls) can leave you significantly under-taxed and facing a bill at year-end. Use the multi-job calculator on the main page or contact HMRC to make sure your tax codes are correct.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="space-y-6">
      <section className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          Multiple jobs · {TAX_YEAR}
        </span>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          Multiple UK Jobs & Second-Job Tax Codes
        </h1>
        <p className="text-balance text-sm text-brand-textMuted sm:text-base">
          What actually happens to your take-home when you take on a second
          job — and how HMRC decides which tax code goes on which job.
        </p>
      </section>

      <section className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          The mental model in 30 seconds
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-brand-border/40 bg-brand-bg/40 p-4">
            <p className="text-sm font-semibold text-brand-text">
              Job 1 — your primary job
            </p>
            <p className="mt-2 text-sm text-brand-textMuted">
              Holds your Personal Allowance via a code like{" "}
              <strong className="text-brand-text">1257L</strong>. Tax is
              calculated normally: 0% up to £12,570, 20% up to £50,270, 40%
              above that (with a 60% zone between £100k and £125,140 because
              the PA tapers away).
            </p>
          </div>
          <div className="rounded-2xl border border-brand-border/40 bg-brand-bg/40 p-4">
            <p className="text-sm font-semibold text-brand-text">
              Job 2 — your second job
            </p>
            <p className="mt-2 text-sm text-brand-textMuted">
              Usually taxed at a{" "}
              <strong className="text-brand-text">flat rate</strong> — BR
              (20%), D0 (40%) or D1 (45%). No Personal Allowance is applied,
              because HMRC assumes it&apos;s already been used by Job 1.
            </p>
          </div>
        </div>
        <p className="text-sm text-brand-textMuted">
          National Insurance is different: it&apos;s calculated{" "}
          <strong className="text-brand-text">per employment</strong>, using
          each employer&apos;s own Primary Threshold. That&apos;s why
          splitting a salary across two jobs often pays less NI than a single
          large employment — even though the Income Tax total is the same.
        </p>
      </section>

      <section className="mx-auto max-w-4xl space-y-4 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          Worked examples
        </h2>
        <p className="text-sm text-brand-textMuted">
          Every figure below comes from the same PAYE engine the calculator
          uses. Click any scenario for the full breakdown.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MULTI_JOB_CATALOG.map((entry) => {
            const insight = buildMultiJobInsight({
              primaryAnnual: entry.primary,
              secondaryAnnual: entry.secondary,
              secondaryTaxCode: entry.secondaryTaxCode,
            });
            return (
              <Link
                key={`${entry.primary}-${entry.secondary}`}
                href={multiJobPath(entry.primary, entry.secondary)}
                className="flex flex-col gap-1 rounded-lg border border-brand-border/50 bg-brand-bg/40 px-4 py-3 transition hover:border-emerald-500/60 hover:bg-brand-bg/60"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-brand-text">
                    {insight.formatted.primaryGross} +{" "}
                    {insight.formatted.secondaryGross}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-brand-textMuted/70">
                    {insight.secondary.taxCode}
                  </span>
                </div>
                <p className="text-xs text-brand-textMuted">
                  Combined take-home{" "}
                  <span className="text-emerald-300">
                    {insight.formatted.combinedNet}
                  </span>{" "}
                  · {insight.formatted.combinedMonthly}/mo
                </p>
                <p className="text-[11px] text-brand-textMuted/80">
                  {entry.audience}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          Frequently asked
        </h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.question}
              className="rounded-2xl border border-brand-border/40 bg-brand-bg/40 p-4"
            >
              <summary className="cursor-pointer text-sm font-semibold text-brand-text sm:text-base">
                {f.question}
              </summary>
              <p className="mt-2 text-sm text-brand-textMuted">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/calc"
            className="rounded-md border border-brand-border/60 bg-brand-bg/40 px-3 py-1.5 text-xs font-medium text-brand-text hover:border-brand-primary/60 hover:bg-brand-primary/10"
          >
            Interactive multi-job calculator
          </Link>
          <Link
            href="/100k-tax-trap"
            className="rounded-md border border-brand-border/60 bg-brand-bg/40 px-3 py-1.5 text-xs font-medium text-brand-text hover:border-brand-primary/60 hover:bg-brand-primary/10"
          >
            The £100k tax trap
          </Link>
        </div>
      </section>

      <p className="mx-auto max-w-3xl px-6 text-xs text-brand-textMuted/70">
        Deterministic {TAX_YEAR} figures for a UK PAYE employee in England /
        Wales / Northern Ireland with a standard 1257L primary code. Scotland
        has equivalent codes (SBR / SD0 / SD1 / SD2). This is guidance, not
        financial advice — if in doubt about your tax code, contact HMRC.
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Reuse existing salary_page_viewed shape for parity with other
          growth pages. `salaryPage` records the surface identifier. */}
      <PageViewTracker
        event="salary_page_viewed"
        salary={0}
        salaryPage="multiple-jobs-hub"
        taxYear={TAX_YEAR}
      />
    </div>
  );
}
