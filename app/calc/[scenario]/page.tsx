import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TakeHomeCalculator } from "@/components/take-home-calculator";
import {
  CALC_SCENARIO_SLUGS,
  CALC_SCENARIOS,
  type CalcScenarioSlug,
} from "@/lib/marketing/calcScenarios";
import { TAX_YEAR } from "../../lib/taxYear";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

const regimeBadgeClass: Record<
  "PAYE" | "Inside IR35" | "Outside IR35",
  string
> = {
  PAYE: "border-white/20 bg-white/5 text-white/80",
  "Inside IR35": "border-amber-400/40 bg-amber-500/10 text-amber-200",
  "Outside IR35": "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
};

export function generateStaticParams() {
  return CALC_SCENARIO_SLUGS.map((scenario) => ({ scenario }));
}

interface RouteParams {
  params: Promise<{ scenario: string }>;
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { scenario } = await params;
  const cfg = CALC_SCENARIOS[scenario as CalcScenarioSlug];
  if (!cfg) return {};

  const url = `${siteUrl}/calc/${cfg.slug}`;
  const ogImage = `${siteUrl}/api/og-comparison?slug=500-a-day`;

  return {
    title: cfg.metaTitle,
    description: cfg.metaDescription,
    keywords: cfg.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: cfg.ogTitle ?? cfg.metaTitle,
      description: cfg.ogDescription ?? cfg.metaDescription,
      url,
      siteName: "UK Take-Home Calculator",
      type: "website",
      locale: "en_GB",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: cfg.ogTitle ?? cfg.metaTitle,
      description: cfg.ogDescription ?? cfg.metaDescription,
      images: [ogImage],
    },
  };
}

export default async function ScenarioCalcPage({ params }: RouteParams) {
  const { scenario } = await params;
  const cfg = CALC_SCENARIOS[scenario as CalcScenarioSlug];
  if (!cfg) notFound();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cfg.faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: cfg.metaTitle,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: `${siteUrl}/calc/${cfg.slug}`,
    description: cfg.metaDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="mx-auto max-w-3xl space-y-3 text-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${regimeBadgeClass[cfg.regimeLabel]}`}
        >
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
          {cfg.regimeLabel} · {TAX_YEAR}
        </span>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          {cfg.h1}
        </h1>
        <p className="text-balance text-sm text-brand-textMuted sm:text-base">
          {cfg.subhead}
        </p>
      </section>

      {/* Calculator (pre-selected on the right tab) */}
      <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-4 shadow-soft-xl backdrop-blur sm:p-8">
        <TakeHomeCalculator initialTab={cfg.tab} />
      </section>

      {/* Body intro */}
      <section className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          How this calculator models {cfg.regimeLabel} income
        </h2>
        <p className="text-sm text-brand-textMuted">{cfg.intro}</p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {cfg.faq.map((entry) => (
            <details
              key={entry.question}
              className="rounded-2xl border border-brand-border/40 bg-brand-bg/40 p-4"
            >
              <summary className="cursor-pointer text-sm font-semibold text-brand-text sm:text-base">
                {entry.question}
              </summary>
              <p className="mt-2 text-sm text-brand-textMuted">
                {entry.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Cross-links to the other scenarios so Google discovers them and
          users can quickly compare regimes. */}
      <section className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          Compare other engagement types
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CALC_SCENARIO_SLUGS.filter((s) => s !== cfg.slug).map((slug) => {
            const other = CALC_SCENARIOS[slug];
            return (
              <Link
                key={slug}
                href={`/calc/${slug}`}
                className="group rounded-2xl border border-brand-border/50 bg-brand-bg/40 p-4 transition hover:border-brand-primary/60 hover:bg-brand-bg/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-brand-text group-hover:text-brand-primary">
                    {other.h1}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${regimeBadgeClass[other.regimeLabel]}`}
                  >
                    {other.regimeLabel}
                  </span>
                </div>
                <p className="mt-2 text-xs text-brand-textMuted">
                  {other.metaDescription}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
    </div>
  );
}
