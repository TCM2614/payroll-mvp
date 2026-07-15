import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TakeHomeComparisonStrip } from "@/components/landing/TakeHomeComparisonStrip";
import { computeLandingComparison } from "@/lib/marketing/landingComparison";
import {
  CANONICAL_COMPARE_SLUGS,
  parseCompareSlug,
} from "@/lib/marketing/compareSlug";
import { formatGBP } from "@/lib/format";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

export function generateStaticParams() {
  return CANONICAL_COMPARE_SLUGS.map((slug) => ({ slug }));
}

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);
  if (!parsed) return {};

  const title = `${parsed.compactDisplay} contractor take-home: PAYE vs Umbrella vs Inside/Outside IR35 (2026/27)`;
  const description = `See what a ${parsed.compactDisplay} UK contractor actually keeps under Standard PAYE, an umbrella company, Inside IR35 and Outside IR35 — all four figures calculated live for the 2026/27 tax year.`;

  const url = `${siteUrl}/compare/${slug}`;
  const ogImage = `${siteUrl}/api/og-comparison?slug=${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "UK Take-Home Calculator",
      type: "website",
      locale: "en_GB",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ComparePage({ params }: RouteParams) {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);
  if (!parsed) notFound();

  const comparison = computeLandingComparison(parsed.inputs);
  const paye = comparison.scenarios.find((s) => s.key === "paye")!;
  const umbrella = comparison.scenarios.find((s) => s.key === "umbrella")!;
  const insideIR35 = comparison.scenarios.find((s) => s.key === "limited-inside")!;
  const outsideIR35 = comparison.scenarios.find((s) => s.key === "limited-outside")!;

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `UK take-home comparison: ${parsed.compactDisplay}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: `${siteUrl}/compare/${slug}`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-8 sm:py-10">
      <header className="max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-black/60 px-3 py-1 text-xs text-emerald-300/90 shadow-lg shadow-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          UK tax year 2026/27
        </div>
        <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          {parsed.compactDisplay} contractor take-home, four engagement types
        </h1>
        <p className="mt-4 text-balance text-sm text-white/70 sm:text-base">
          Same {parsed.display}. Different tax structures. See what
          you&apos;d actually keep under UK PAYE, an umbrella (Inside IR35), a
          limited company inside IR35, and a limited company outside IR35 —
          all four figures computed live for 2026/27.
        </p>
      </header>

      <TakeHomeComparisonStrip
        inputs={parsed.inputs}
        analyticsSource={`share_${slug}`}
      />

      {/* Short narrative built from the live numbers so the page has body
          content Google can rank rather than a bare chart. */}
      <section className="mt-2 w-full max-w-3xl space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">
          What the numbers say for a {parsed.compactDisplay} contractor
        </h2>
        <p className="text-sm text-white/70">
          Assuming {parsed.workingPatternHint}, a 1257L tax code, no student
          loans and no personal pension, the {parsed.compactDisplay}{" "}
          contractor scenarios above break down like this for 2026/27:
        </p>
        <ul className="space-y-2 text-sm text-white/80">
          <li>
            <strong className="text-white">Standard PAYE:</strong>{" "}
            {formatGBP(paye.netAnnual)} net per year (effective tax rate{" "}
            {(paye.effectiveTaxRate * 100).toFixed(1)}%).
          </li>
          <li>
            <strong className="text-white">Umbrella (Inside IR35):</strong>{" "}
            {formatGBP(umbrella.netAnnual)} net per year — that&apos;s{" "}
            {umbrella.deltaVsPayeAnnual < 0 ? "" : "+"}
            {formatGBP(umbrella.deltaVsPayeAnnual)} vs. PAYE, mostly because
            employer NI, apprenticeship levy and the umbrella&apos;s margin
            come off the assignment rate before you see it.
          </li>
          <li>
            <strong className="text-white">Limited (Inside IR35):</strong>{" "}
            {formatGBP(insideIR35.netAnnual)} net per year — the fee-payer
            applies PAYE-style treatment, so the maths lands very close to
            standard PAYE.
          </li>
          <li>
            <strong className="text-white">Limited (Outside IR35):</strong>{" "}
            {formatGBP(outsideIR35.netAnnual)} net per year via an NI-optimal
            director&apos;s salary plus dividends, after corporation tax with
            marginal relief. That&apos;s{" "}
            {outsideIR35.deltaVsPayeAnnual < 0 ? "" : "+"}
            {formatGBP(outsideIR35.deltaVsPayeAnnual)} vs. PAYE.
          </li>
        </ul>
        <p className="text-sm text-white/70">
          Gap between the best and worst option:{" "}
          <strong className="text-white">
            {formatGBP(comparison.bestVsWorstAnnual)} per year
          </strong>
          . Model your own tax code, student loans, weeks worked and pension
          contributions in the full calculator to get a personalised number.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/calc"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
          >
            Open the full calculator →
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-2 text-sm font-medium text-white/90 shadow-md shadow-black/40 transition hover:border-emerald-400 hover:bg-white/10"
          >
            Back to home
          </Link>
        </div>
      </section>

      {/* Cross-links to a handful of nearby share URLs so users (and
          crawlers) can explore adjacent rates. */}
      <section className="w-full max-w-3xl space-y-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">
          Other UK contractor rates
        </h2>
        <div className="flex flex-wrap gap-2">
          {CANONICAL_COMPARE_SLUGS.filter((s) => s !== slug).map((other) => {
            const parsedOther = parseCompareSlug(other);
            if (!parsedOther) return null;
            return (
              <Link
                key={other}
                href={`/compare/${other}`}
                className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 transition hover:border-emerald-400/40 hover:bg-white/10"
              >
                {parsedOther.compactDisplay}
              </Link>
            );
          })}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
    </div>
  );
}
