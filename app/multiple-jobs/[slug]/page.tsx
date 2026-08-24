import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareBar } from "@/components/ShareBar";
import { PageViewTracker } from "@/components/PageViewTracker";
import {
  MULTI_JOB_CATALOG,
  buildMultiJobInsight,
  multiJobPath,
  multiJobSlug,
  parseMultiJobSlug,
} from "@/lib/marketing/multiJobInsight";
import { TAX_YEAR } from "../../lib/taxYear";
import { SITE_URL } from "@/lib/siteUrl";

export function generateStaticParams() {
  return MULTI_JOB_CATALOG.map((entry) => ({
    slug: multiJobSlug(entry.primary, entry.secondary),
  }));
}

export const dynamicParams = false;

interface RouteParams {
  params: Promise<{ slug: string }>;
}

function catalogEntryFor(slug: string) {
  const parsed = parseMultiJobSlug(slug);
  if (!parsed) return null;
  return (
    MULTI_JOB_CATALOG.find(
      (e) =>
        e.primary === parsed.primary && e.secondary === parsed.secondary,
    ) ?? null
  );
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const entry = catalogEntryFor(slug);
  if (!entry) return {};

  const insight = buildMultiJobInsight({
    primaryAnnual: entry.primary,
    secondaryAnnual: entry.secondary,
    secondaryTaxCode: entry.secondaryTaxCode,
  });
  const url = `${SITE_URL}/multiple-jobs/${slug}`;

  return {
    title: `${insight.formatted.primaryGross} + ${insight.formatted.secondaryGross} UK — Two-Job Take-Home (${TAX_YEAR})`,
    description: `Two UK jobs at ${insight.formatted.primaryGross} + ${insight.formatted.secondaryGross} (second job on ${insight.secondary.taxCode}) means ${insight.formatted.combinedMonthly}/mo take-home for ${TAX_YEAR}. Full breakdown vs a single-employment equivalent.`,
    keywords: [
      `${Math.round(entry.primary / 1000)}k plus ${Math.round(entry.secondary / 1000)}k`,
      `second job ${insight.secondary.taxCode}`,
      "two jobs tax code UK",
      "multiple jobs PAYE",
    ].join(", "),
    alternates: { canonical: url },
    openGraph: {
      title: `${insight.formatted.primaryGross} + ${insight.formatted.secondaryGross} UK two-job take-home`,
      description: `Combined net ${insight.formatted.combinedNet} · ${insight.formatted.combinedMonthly}/mo · second job on ${insight.secondary.taxCode}.`,
      url,
      siteName: "UK Take-Home Calculator",
      type: "article",
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: `${insight.formatted.primaryGross} + ${insight.formatted.secondaryGross} UK`,
      description: `Combined take-home ${insight.formatted.combinedNet} · ${insight.formatted.combinedMonthly}/mo.`,
    },
  };
}

export default async function MultipleJobsWorkedPage({
  params,
}: RouteParams) {
  const { slug } = await params;
  const entry = catalogEntryFor(slug);
  if (!entry) notFound();

  const insight = buildMultiJobInsight({
    primaryAnnual: entry.primary,
    secondaryAnnual: entry.secondary,
    secondaryTaxCode: entry.secondaryTaxCode,
  });

  const url = `${SITE_URL}/multiple-jobs/${slug}`;
  const shareText = `UK ${insight.formatted.primaryGross} + ${insight.formatted.secondaryGross} two-job take-home: ${insight.formatted.combinedMonthly}/mo (second job on ${insight.secondary.taxCode}).`;

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
            <Link href="/multiple-jobs" className="hover:text-brand-text">
              Multiple jobs
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="text-brand-text">
            {insight.formatted.primaryGross} +{" "}
            {insight.formatted.secondaryGross}
          </li>
        </ol>
      </nav>

      <section className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          Two jobs · {TAX_YEAR}
        </span>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          {insight.formatted.primaryGross} +{" "}
          {insight.formatted.secondaryGross} across two UK jobs
        </h1>
        <p className="text-balance text-sm text-brand-textMuted sm:text-base">
          Primary job on <strong className="text-brand-text">1257L</strong>,
          second job on{" "}
          <strong className="text-brand-text">{insight.secondary.taxCode}</strong>{" "}
          — the standard HMRC allocation. Deterministic {TAX_YEAR} numbers
          throughout.
        </p>
      </section>

      <section
        aria-labelledby="hero"
        className="mx-auto max-w-3xl rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent p-6 backdrop-blur sm:p-8"
      >
        <h2 id="hero" className="sr-only">
          Combined take-home
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Combined gross" value={insight.formatted.combinedGross} />
          <Stat
            label="Annual take-home"
            value={insight.formatted.combinedNet}
            big
          />
          <Stat
            label="Monthly take-home"
            value={insight.formatted.combinedMonthly}
            big
          />
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
        <p className="mt-5 text-base text-brand-text">
          You keep{" "}
          <strong className="text-emerald-300">
            {insight.formatted.retainedPercent}
          </strong>{" "}
          of every combined pound.
        </p>
        <div className="mt-5">
          <ShareBar
            url={url}
            text={shareText}
            pageType="multiple_jobs"
            contentType={slug}
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          How it&apos;s calculated
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-brand-border/40 bg-brand-bg/40 p-4">
            <p className="text-sm font-semibold text-brand-text">
              Job 1 — {insight.formatted.primaryGross}
            </p>
            <p className="mt-1 text-xs text-brand-textMuted">
              Tax code {insight.primary.taxCode} — Personal Allowance
              £12,570, then 20% up to £50,270 and 40% above (with the £100k+
              PA taper if applicable).
            </p>
          </div>
          <div className="rounded-2xl border border-brand-border/40 bg-brand-bg/40 p-4">
            <p className="text-sm font-semibold text-brand-text">
              Job 2 — {insight.formatted.secondaryGross}
            </p>
            <p className="mt-1 text-xs text-brand-textMuted">
              Tax code {insight.secondary.taxCode} —{" "}
              {insight.secondary.taxCode === "BR"
                ? "every £ taxed at 20% (Basic Rate)."
                : insight.secondary.taxCode === "D0"
                  ? "every £ taxed at 40% (Higher Rate)."
                  : "every £ taxed at 45% (Additional Rate)."}{" "}
              No Personal Allowance because Job 1 already used it.
            </p>
          </div>
        </div>
        <p className="text-sm text-brand-textMuted">
          National Insurance is calculated per employment, each with its own
          £12,570 Primary Threshold. That&apos;s why the two-job NI total
          ({insight.formatted.ni}) differs from the single-employment
          equivalent below.
        </p>
      </section>

      <section className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          vs. earning the same {insight.formatted.combinedGross} from a
          single employer
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-brand-border/40 bg-brand-bg/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-textMuted/80">
              Single-employer take-home
            </p>
            <p className="mt-1 text-2xl font-semibold text-brand-text tabular-nums">
              {insight.singleJobEquivalent.formatted.net}
            </p>
            <p className="text-xs text-brand-textMuted">
              {insight.singleJobEquivalent.formatted.monthly} / month
            </p>
          </div>
          <div className="rounded-2xl border border-brand-border/40 bg-brand-bg/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-textMuted/80">
              Two-job take-home
            </p>
            <p className="mt-1 text-2xl font-semibold text-brand-text tabular-nums">
              {insight.formatted.combinedNet}
            </p>
            <p className="text-xs text-brand-textMuted">
              {insight.formatted.combinedMonthly} / month
            </p>
          </div>
        </div>
        <ul className="text-sm text-brand-textMuted space-y-1">
          <li>
            Net difference:{" "}
            <strong
              className={
                insight.vsSingleJob.netDelta >= 0
                  ? "text-emerald-300"
                  : "text-rose-300"
              }
            >
              {insight.vsSingleJob.netDelta >= 0 ? "+" : ""}
              {insight.vsSingleJob.formatted.netDelta}/yr
            </strong>{" "}
            (two jobs vs one)
          </li>
          <li>
            Income Tax difference:{" "}
            <strong className="text-brand-text">
              {insight.vsSingleJob.formatted.taxDelta}
            </strong>
          </li>
          <li>
            NI difference:{" "}
            <strong className="text-brand-text">
              {insight.vsSingleJob.formatted.niDelta}
            </strong>
          </li>
        </ul>
        <p className="text-xs text-brand-textMuted/80">
          {insight.vsSingleJob.niDelta < 0
            ? "The NI saving from two separate employer thresholds is why the two-job outcome typically keeps a little more here."
            : "In this scenario the two-job NI outcome is roughly the same as a single employer."}
        </p>
      </section>

      <section className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          Explore other two-job setups
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {MULTI_JOB_CATALOG.filter(
            (e) => !(e.primary === entry.primary && e.secondary === entry.secondary),
          )
            .slice(0, 6)
            .map((e) => (
              <Link
                key={`${e.primary}-${e.secondary}`}
                href={multiJobPath(e.primary, e.secondary)}
                className="flex items-baseline justify-between rounded-lg border border-brand-border/50 bg-brand-bg/40 px-4 py-2 hover:border-emerald-500/60 hover:bg-brand-bg/60"
              >
                <span className="font-medium text-brand-text">
                  £{(e.primary / 1000).toFixed(0)}k + £
                  {(e.secondary / 1000).toFixed(0)}k
                </span>
                <span className="text-[10px] uppercase tracking-wide text-brand-textMuted/70">
                  {e.secondaryTaxCode ?? "BR"}
                </span>
              </Link>
            ))}
        </div>
      </section>

      <p className="mx-auto max-w-3xl px-6 text-xs text-brand-textMuted/70">
        Deterministic {TAX_YEAR} calculation using HMRC standard tax codes
        (1257L primary, {insight.secondary.taxCode} secondary) and no student
        loan or pension. The interactive multi-job calculator at{" "}
        <Link href="/calc" className="underline hover:text-brand-text">
          /calc
        </Link>{" "}
        lets you model salary sacrifice, student loans and non-standard codes.
        Not financial advice.
      </p>

      <PageViewTracker
        event="salary_page_viewed"
        salary={insight.combined.grossAnnual}
        salaryPage={`multiple-jobs-${slug}`}
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
