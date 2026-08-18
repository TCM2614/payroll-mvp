import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calculator } from "@/components/Calculator";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareBar } from "@/components/ShareBar";
import { NewsletterCta } from "@/components/NewsletterCta";
import { JsonLd } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { articleJsonLd, faqJsonLd } from "@/lib/seo/structured-data";
import { absoluteUrl } from "@/lib/share";
import {
  LANDMARK_SALARIES,
  SALARY_CATALOG,
  neighbourSalaries,
  parseSalarySlug,
  salaryPath,
} from "@/lib/content/salary-catalog";
import { buildSalaryInsight, compareSalaries } from "@/lib/content/insights";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SALARY_CATALOG.map((e) => ({ slug: `${e.salary}-after-tax` }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const salary = parseSalarySlug(slug);
  if (salary === null) return { title: "Salary not found" };
  const insight = buildSalaryInsight(salary);
  return buildMetadata({
    title: `£${salary.toLocaleString("en-GB")} After Tax UK (2025/26) — ${insight.formatted.monthly}/mo Take‑Home`,
    description: `£${salary.toLocaleString("en-GB")} salary after tax in the UK 2025/26. Monthly take‑home ${insight.formatted.monthly}, annual ${insight.formatted.net}. You keep ${insight.formatted.retainedPercent}.`,
    path: `/salary/${slug}`,
    keywords: [
      `${salary} after tax`,
      `${salary} salary UK`,
      `${salary} take home pay`,
      `£${salary} monthly`,
      "UK salary calculator",
    ],
  });
}

export default async function SalaryPage({ params }: PageProps) {
  const { slug } = await params;
  const salary = parseSalarySlug(slug);
  if (salary === null || !SALARY_CATALOG.find((e) => e.salary === salary)) {
    notFound();
  }
  const insight = buildSalaryInsight(salary);
  const withPension5 = buildSalaryInsight(salary);
  const nb = neighbourSalaries(salary);
  const nextRaise = compareSalaries(salary, salary + 5_000);
  const shareUrl = absoluteUrl(insight.path);
  const shareText = `${insight.formatted.gross} salary after tax in the UK → ${insight.formatted.monthly} per month. You keep ${insight.formatted.retainedPercent}.`;

  const faqs = [
    {
      question: `How much is ${insight.formatted.gross} after tax in the UK?`,
      answer: `${insight.formatted.gross} gross salary in the UK for the 2025/26 tax year means ${insight.formatted.net} annual take‑home (${insight.formatted.monthly} per month). You pay ${insight.formatted.incomeTax} in Income Tax and ${insight.formatted.ni} in National Insurance, and keep ${insight.formatted.retainedPercent} of your gross pay.`,
    },
    {
      question: `What is the monthly take‑home for ${insight.formatted.gross}?`,
      answer: `${insight.formatted.gross} per year is ${insight.formatted.monthly} per month after Income Tax and National Insurance (before pension or student loan).`,
    },
    {
      question: `What is the weekly take‑home for ${insight.formatted.gross}?`,
      answer: `${insight.formatted.gross} per year is ${insight.formatted.weekly} per week take‑home.`,
    },
    {
      question: `How much would a £5,000 pay rise from ${insight.formatted.gross} actually give me?`,
      answer: `Going from ${insight.formatted.gross} to ${nextRaise.to.formatted.gross} gives you an extra ${nextRaise.formatted.netDelta} per year net — ${nextRaise.formatted.monthlyNetDelta} per month. You keep ${nextRaise.formatted.retainedPercent} of the raise.`,
    },
  ];

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Salary", path: "/salary" },
          { name: `${insight.formatted.gross} after tax`, path: insight.path },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {insight.formatted.gross} After Tax in the UK
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          2025/26 tax year, England / Wales / NI. Deterministic HMRC calculation.
        </p>
      </header>

      <section
        aria-labelledby="hero-numbers"
        className="mb-10 rounded-2xl border border-zinc-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm dark:border-zinc-800 dark:from-emerald-950/40 dark:to-zinc-950"
      >
        <h2 id="hero-numbers" className="sr-only">
          Take‑home summary
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Annual take‑home" value={insight.formatted.net} big />
          <Stat label="Monthly take‑home" value={insight.formatted.monthly} big />
          <Stat label="Weekly take‑home" value={insight.formatted.weekly} big />
          <Stat label="Income Tax" value={insight.formatted.incomeTax} tone="negative" />
          <Stat label="National Insurance" value={insight.formatted.ni} tone="negative" />
          <Stat label="Effective rate" value={insight.formatted.effectiveRate} />
        </div>
        <p className="mt-6 text-lg">
          You keep{" "}
          <strong className="text-emerald-700 dark:text-emerald-400">
            {insight.formatted.retainedPercent}
          </strong>{" "}
          of every pound.
        </p>
        <div className="mt-4">
          <ShareBar
            url={shareUrl}
            text={shareText}
            surface="salary_page"
            salary={salary}
          />
        </div>
      </section>

      <section aria-labelledby="calc-title" className="mb-10">
        <h2 id="calc-title" className="mb-4 text-2xl font-semibold">
          Adjust the calculation
        </h2>
        <Calculator initialGross={salary} />
      </section>

      <section aria-labelledby="where-title" className="mb-10">
        <h2 id="where-title" className="mb-3 text-2xl font-semibold">
          Where your money goes
        </h2>
        <ul className="grid gap-2 text-zinc-700 dark:text-zinc-300">
          <li>
            Income Tax: <strong>{insight.formatted.incomeTax}</strong> ({percent(insight.result.incomeTax / salary)})
          </li>
          <li>
            National Insurance: <strong>{insight.formatted.ni}</strong> ({percent(insight.result.nationalInsurance / salary)})
          </li>
          <li>
            Take‑home: <strong>{insight.formatted.net}</strong> ({insight.formatted.retainedPercent})
          </li>
        </ul>
      </section>

      <section aria-labelledby="raise-title" className="mb-10 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 id="raise-title" className="mb-3 text-xl font-semibold">
          What would £5,000 more give you?
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300">
          A raise from {nextRaise.from.formatted.gross} to {nextRaise.to.formatted.gross}
          {" "}gives you an extra{" "}
          <strong>{nextRaise.formatted.netDelta}</strong> per year — about{" "}
          <strong>{nextRaise.formatted.monthlyNetDelta}</strong> per month. You keep{" "}
          <strong>{nextRaise.formatted.retainedPercent}</strong> of the raise.
        </p>
        <Link
          href={`/pay-rise?from=${salary}&to=${salary + 5_000}`}
          className="mt-3 inline-block rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          See the full raise breakdown
        </Link>
      </section>

      <section aria-labelledby="percentile-title" className="mb-10">
        <h2 id="percentile-title" className="mb-3 text-xl font-semibold">
          Where does {insight.formatted.gross} rank in the UK?
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300">
          A gross salary of {insight.formatted.gross} puts you in the{" "}
          <strong>{insight.percentile.descriptor}</strong>.{" "}
          <Link href="/salary-percentile" className="text-emerald-700 hover:underline dark:text-emerald-400">
            See the full ranking →
          </Link>
        </p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Source: {insight.percentile.source} ({insight.percentile.sourceYear}). {insight.percentile.disclaimer}
        </p>
      </section>

      <section aria-labelledby="graph-title" className="mb-10">
        <h2 id="graph-title" className="mb-3 text-xl font-semibold">
          Explore nearby salaries
        </h2>
        <div className="flex flex-wrap gap-2">
          {[...nb.prev, ...nb.next].map((s) => (
            <Link
              key={s}
              href={salaryPath(s)}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:border-emerald-500 hover:bg-emerald-50 dark:border-zinc-800 dark:bg-zinc-950"
            >
              £{s.toLocaleString("en-GB")}
            </Link>
          ))}
        </div>
        <p className="mt-4 mb-2 text-sm text-zinc-500 dark:text-zinc-400">Landmark jumps:</p>
        <div className="flex flex-wrap gap-2">
          {nb.jumps.slice(0, 8).map((s) => (
            <Link
              key={s}
              href={salaryPath(s)}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:border-emerald-500 hover:bg-emerald-50 dark:border-zinc-800 dark:bg-zinc-950"
            >
              £{(s / 1000).toFixed(0)}k
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="compare-title" className="mb-10">
        <h2 id="compare-title" className="mb-3 text-xl font-semibold">
          Compare with another salary
        </h2>
        <div className="flex flex-wrap gap-2">
          {LANDMARK_SALARIES.filter((s) => s !== salary)
            .slice(0, 6)
            .map((s) => (
              <Link
                key={s}
                href={`/compare/${salary}-vs-${s}`}
                className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:border-emerald-500 hover:bg-emerald-50 dark:border-zinc-800 dark:bg-zinc-950"
              >
                £{(salary / 1000).toFixed(0)}k vs £{(s / 1000).toFixed(0)}k
              </Link>
            ))}
        </div>
      </section>

      <section aria-labelledby="faq-title" className="mb-10">
        <h2 id="faq-title" className="mb-4 text-2xl font-semibold">
          Frequently asked
        </h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details
              key={f.question}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <summary className="cursor-pointer font-medium">{f.question}</summary>
              <p className="mt-2 text-zinc-700 dark:text-zinc-300">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="my-10">
        <NewsletterCta source={`salary_${salary}`} />
      </section>

      <p className="mt-10 text-xs text-zinc-500 dark:text-zinc-400">
        Not financial advice. Numbers are estimates for the 2025/26 UK tax year
        using standard PAYE assumptions. Read our{" "}
        <Link href="/methodology" className="underline">methodology</Link>.
      </p>

      {/* Hidden hook to keep withPension5 referenced (used for future variants). */}
      <span className="sr-only" data-alt-net={withPension5.formatted.net} />

      <JsonLd data={faqJsonLd(faqs)} />
      <JsonLd
        data={articleJsonLd({
          headline: `${insight.formatted.gross} After Tax in the UK`,
          description: `UK take‑home for a ${insight.formatted.gross} salary in 2025/26.`,
          path: insight.path,
          datePublished: "2025-04-06",
        })}
      />
    </article>
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
      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p
        className={`mt-1 font-semibold tabular-nums ${
          big ? "text-3xl" : "text-xl"
        } ${tone === "negative" ? "text-rose-600 dark:text-rose-400" : "text-zinc-900 dark:text-zinc-100"}`}
      >
        {value}
      </p>
    </div>
  );
}

function percent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}
