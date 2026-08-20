import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TakeHomeCalculator } from "@/components/take-home-calculator";
import { ShareBar } from "@/components/ShareBar";
import { PageViewTracker } from "@/components/PageViewTracker";
import {
  LANDMARK_SALARIES,
  SALARY_CATALOG,
  neighbourSalaries,
  parseSalarySlug,
  salaryPath,
} from "@/lib/marketing/salaryCatalog";
import {
  buildSalaryInsight,
  compareSalaryInsights,
} from "@/lib/marketing/salaryInsight";
import { TAX_YEAR } from "../../lib/taxYear";
import { SITE_URL } from "@/lib/siteUrl";


export function generateStaticParams() {
  return SALARY_CATALOG.map((e) => ({ slug: `${e.salary}-after-tax` }));
}

export const dynamicParams = false;

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const salary = parseSalarySlug(slug);
  if (salary === null) return {};
  const insight = buildSalaryInsight(salary);
  const url = `${SITE_URL}/salary/${slug}`;
  const ogImage = `${SITE_URL}/api/og-salary?salary=${salary}`;

  return {
    title: `£${salary.toLocaleString("en-GB")} After Tax UK (${TAX_YEAR}) — ${insight.formatted.monthly}/mo Take-Home`,
    description: `£${salary.toLocaleString("en-GB")} salary after tax in the UK ${TAX_YEAR}. Monthly take-home ${insight.formatted.monthly}, annual ${insight.formatted.net}. You keep ${insight.formatted.retainedPercent}.`,
    keywords: [
      `${salary} after tax`,
      `${salary} salary UK`,
      `${salary} take home pay`,
      `£${salary} monthly`,
      "UK salary calculator",
      "PAYE calculator",
    ].join(", "),
    alternates: { canonical: url },
    openGraph: {
      title: `£${salary.toLocaleString("en-GB")} after tax — ${insight.formatted.monthly}/mo take-home`,
      description: `UK ${TAX_YEAR} PAYE breakdown: ${insight.formatted.incomeTax} Income Tax, ${insight.formatted.ni} NI. You keep ${insight.formatted.retainedPercent}.`,
      url,
      siteName: "UK Take-Home Calculator",
      type: "website",
      locale: "en_GB",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `£${salary.toLocaleString("en-GB")} after tax — ${insight.formatted.monthly}/mo`,
      description: `UK ${TAX_YEAR}: Income Tax ${insight.formatted.incomeTax}, NI ${insight.formatted.ni}, retained ${insight.formatted.retainedPercent}.`,
      images: [ogImage],
    },
  };
}

export default async function SalaryPage({ params }: RouteParams) {
  const { slug } = await params;
  const salary = parseSalarySlug(slug);
  if (salary === null || !SALARY_CATALOG.find((e) => e.salary === salary)) {
    notFound();
  }
  const insight = buildSalaryInsight(salary);
  const nextRaise = compareSalaryInsights(salary, salary + 5_000);
  const nb = neighbourSalaries(salary);

  const url = `${SITE_URL}/salary/${slug}`;

  const faqs = [
    {
      question: `How much is ${insight.formatted.gross} after tax in the UK?`,
      answer: `${insight.formatted.gross} gross salary in the UK for the ${TAX_YEAR} tax year means ${insight.formatted.net} annual take-home (${insight.formatted.monthly} per month). You pay ${insight.formatted.incomeTax} in Income Tax and ${insight.formatted.ni} in National Insurance, and keep ${insight.formatted.retainedPercent} of your gross pay.`,
    },
    {
      question: `What is the monthly take-home for ${insight.formatted.gross}?`,
      answer: `${insight.formatted.gross} per year is ${insight.formatted.monthly} per month after Income Tax and National Insurance (assuming the standard 1257L tax code, no student loan and no pension contribution).`,
    },
    {
      question: `What is the weekly take-home for ${insight.formatted.gross}?`,
      answer: `${insight.formatted.gross} per year is ${insight.formatted.weekly} per week take-home.`,
    },
    {
      question: `How much would a £5,000 pay rise from ${insight.formatted.gross} actually give me?`,
      answer: `Going from ${insight.formatted.gross} to ${nextRaise.to.formatted.gross} gives you an extra ${nextRaise.formatted.netDelta} per year net — ${nextRaise.formatted.monthlyNetDelta} per month. You keep ${nextRaise.formatted.retainedPercent} of the raise.`,
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Salary", item: `${SITE_URL}/salary` },
      {
        "@type": "ListItem",
        position: 3,
        name: `${insight.formatted.gross} after tax`,
        item: url,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-3xl text-xs text-brand-textMuted"
      >
        <ol className="flex flex-wrap gap-1">
          <li>
            <Link href="/" className="hover:text-brand-text">
              Home
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href="/salary" className="hover:text-brand-text">
              Salary
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="text-brand-text">{insight.formatted.gross} after tax</li>
        </ol>
      </nav>

      <section className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          PAYE · {TAX_YEAR}
        </span>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          {insight.formatted.gross} After Tax in the UK
        </h1>
        <p className="text-balance text-sm text-brand-textMuted sm:text-base">
          Your deterministic {TAX_YEAR} PAYE breakdown for a{" "}
          {insight.formatted.gross} gross salary — Income Tax, National
          Insurance and the take-home you actually see on your payslip.
        </p>
      </section>

      <section
        aria-labelledby="hero-numbers"
        className="mx-auto max-w-3xl rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent p-6 backdrop-blur sm:p-8"
      >
        <h2 id="hero-numbers" className="sr-only">
          Take-home summary
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Annual take-home" value={insight.formatted.net} big />
          <Stat label="Monthly take-home" value={insight.formatted.monthly} big />
          <Stat label="Weekly take-home" value={insight.formatted.weekly} big />
          <Stat
            label="Income Tax"
            value={insight.formatted.incomeTax}
            tone="negative"
          />
          <Stat
            label="National Insurance"
            value={insight.formatted.ni}
            tone="negative"
          />
          <Stat
            label="Effective rate"
            value={insight.formatted.effectiveRate}
          />
        </div>
        <p className="mt-6 text-base sm:text-lg">
          You keep{" "}
          <strong className="text-emerald-300">
            {insight.formatted.retainedPercent}
          </strong>{" "}
          of every pound.
        </p>
        <div className="mt-5">
          <ShareBar
            url={url}
            text={`£${salary.toLocaleString("en-GB")} UK salary: ${insight.formatted.monthly}/mo take-home. You keep ${insight.formatted.retainedPercent}.`}
            pageType="salary_page"
            contentType={`${salary}-after-tax`}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-4 shadow-soft-xl backdrop-blur sm:p-8">
        <h2 className="mb-4 text-xl font-semibold text-brand-text sm:text-2xl">
          Adjust the calculation
        </h2>
        <TakeHomeCalculator initialTab="paye" />
      </section>

      <section className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          Where your money goes
        </h2>
        <ul className="space-y-1 text-sm text-brand-textMuted">
          <li>
            Income Tax: <strong>{insight.formatted.incomeTax}</strong> (
            {((insight.incomeTax / salary) * 100).toFixed(1)}%)
          </li>
          <li>
            National Insurance: <strong>{insight.formatted.ni}</strong> (
            {((insight.employeeNI / salary) * 100).toFixed(1)}%)
          </li>
          <li>
            Take-home: <strong>{insight.formatted.net}</strong> (
            {insight.formatted.retainedPercent})
          </li>
        </ul>
      </section>

      <section className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          What would £5,000 more give you?
        </h2>
        <p className="text-sm text-brand-textMuted">
          A raise from {nextRaise.from.formatted.gross} to{" "}
          {nextRaise.to.formatted.gross} gives you an extra{" "}
          <strong className="text-brand-text">
            {nextRaise.formatted.netDelta}
          </strong>{" "}
          per year — about{" "}
          <strong className="text-brand-text">
            {nextRaise.formatted.monthlyNetDelta}
          </strong>{" "}
          per month. You keep{" "}
          <strong className="text-brand-text">
            {nextRaise.formatted.retainedPercent}
          </strong>{" "}
          of the raise.
        </p>
        <Link
          href={`/pay-rise?from=${salary}&to=${salary + 5_000}`}
          className="inline-flex items-center justify-center rounded-xl border border-brand-primary/50 bg-brand-primary/10 px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/20"
        >
          See the full raise breakdown
        </Link>
      </section>

      {insight.percentile && (
        <section className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
          <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
            Where does {insight.formatted.gross} rank in the UK?
          </h2>
          <p className="text-sm text-brand-textMuted">
            A gross salary of {insight.formatted.gross} puts you at
            approximately the{" "}
            <strong className="text-brand-text">
              {insight.percentile.percentile.toFixed(0)}th percentile
            </strong>{" "}
            — {insight.percentile.descriptor}. That&apos;s calculated for{" "}
            {insight.percentile.ageGroupLabel} against a median of{" "}
            £{insight.percentile.medianForAgeGroup.toLocaleString("en-GB")}.
          </p>
          <Link
            href={`/salary-percentile?income=${salary}`}
            className="inline-flex items-center justify-center rounded-xl border border-brand-border/60 bg-brand-bg/40 px-4 py-2 text-sm font-semibold text-brand-text hover:bg-brand-bg/60"
          >
            See the full ranking
          </Link>
          <p className="text-xs text-brand-textMuted/70">
            Source: {insight.percentile.source}.
          </p>
        </section>
      )}

      <section className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          Explore nearby salaries
        </h2>
        <div className="flex flex-wrap gap-2">
          {[...nb.prev, ...nb.next].map((s) => (
            <Link
              key={s}
              href={salaryPath(s)}
              className="rounded-full border border-brand-border/60 bg-brand-bg/40 px-3 py-1.5 text-xs font-medium text-brand-text hover:border-brand-primary/60 hover:bg-brand-primary/10"
            >
              £{s.toLocaleString("en-GB")}
            </Link>
          ))}
        </div>
        <p className="mt-3 text-xs text-brand-textMuted">Landmark jumps:</p>
        <div className="flex flex-wrap gap-2">
          {nb.jumps.slice(0, 8).map((s) => (
            <Link
              key={s}
              href={salaryPath(s)}
              className="rounded-full border border-brand-border/60 bg-brand-bg/40 px-3 py-1.5 text-xs font-medium text-brand-text hover:border-brand-primary/60 hover:bg-brand-primary/10"
            >
              £{(s / 1000).toFixed(0)}k
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          Compare with another salary
        </h2>
        <div className="flex flex-wrap gap-2">
          {LANDMARK_SALARIES.filter((s) => s !== salary)
            .slice(0, 6)
            .map((s) => (
              <Link
                key={s}
                href={`/pay-rise?from=${salary}&to=${s}`}
                className="rounded-md border border-brand-border/60 bg-brand-bg/40 px-3 py-1.5 text-xs font-medium text-brand-text hover:border-brand-primary/60 hover:bg-brand-primary/10"
              >
                £{(salary / 1000).toFixed(0)}k vs £{(s / 1000).toFixed(0)}k
              </Link>
            ))}
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

      <p className="mx-auto max-w-3xl px-6 text-xs text-brand-textMuted/70">
        Numbers are deterministic estimates from the UK PAYE engine for the
        {" "}{TAX_YEAR} tax year, using tax code 1257L and no student loan or
        pension. Use the calculator above to model your exact situation. Not
        financial advice.
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PageViewTracker
        event="salary_page_viewed"
        salary={salary}
        salaryPage={`${salary}-after-tax`}
        taxYear={insight.taxYear}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  big,
  tone,
}: {
  label: string;
  value: string;
  big?: boolean;
  tone?: "negative";
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-textMuted/80">
        {label}
      </p>
      <p
        className={`mt-1 tabular-nums font-semibold ${big ? "text-2xl sm:text-3xl" : "text-xl"} ${
          tone === "negative" ? "text-rose-300" : "text-brand-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
