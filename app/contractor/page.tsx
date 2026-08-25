import type { Metadata } from "next";
import Link from "next/link";
import { computeLandingComparison } from "@/lib/marketing/landingComparison";
import {
  CONTRACTOR_CATALOG,
  annualToDayRate,
  contractorPath,
} from "@/lib/marketing/contractorCatalog";
import { formatGBP } from "@/lib/format";
import { TAX_YEAR } from "../lib/taxYear";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: `UK Contractor Take-Home Explorer ${TAX_YEAR}`,
  description: `Browse contractor take-home pay across four UK engagement types (PAYE, Umbrella, Ltd Inside IR35, Ltd Outside IR35) for the ${TAX_YEAR} tax year. Same annualised gross, four regimes.`,
  keywords:
    "UK contractor take home, umbrella vs limited, IR35 comparison, contractor calculator UK",
  alternates: { canonical: `${SITE_URL}/contractor` },
  openGraph: {
    title: `UK Contractor Take-Home Explorer ${TAX_YEAR}`,
    description: `Same annualised gross, four contractor regimes — pick a target income to see the split.`,
    url: `${SITE_URL}/contractor`,
    siteName: "UK Take-Home Calculator",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: `${SITE_URL}/api/og-comparison?slug=500-a-day`,
        width: 1200,
        height: 630,
        alt: `UK contractor comparison ${TAX_YEAR}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `UK Contractor Take-Home Explorer ${TAX_YEAR}`,
    description: `Same annualised gross, four contractor regimes.`,
    images: [`${SITE_URL}/api/og-comparison?slug=500-a-day`],
  },
};

export default function ContractorIndexPage() {
  return (
    <div className="space-y-6">
      <section className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          Contractor · {TAX_YEAR}
        </span>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          UK Contractor Take-Home Explorer
        </h1>
        <p className="text-balance text-sm text-brand-textMuted sm:text-base">
          Pick your target annualised gross to see the take-home across all
          four UK engagement types — Standard PAYE, Umbrella (Inside IR35),
          Limited Company (Inside IR35) and Limited Company (Outside IR35).
        </p>
      </section>

      <section className="mx-auto max-w-5xl rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="mb-4 text-lg font-semibold text-brand-text">
          Pick a target income
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CONTRACTOR_CATALOG.map((e) => {
            const dayRate = Math.round(annualToDayRate(e.salary));
            const c = computeLandingComparison({ dayRate });
            const paye = c.scenarios.find((s) => s.key === "paye")!;
            const outside = c.scenarios.find(
              (s) => s.key === "limited-outside",
            )!;
            const spread = c.bestVsWorstAnnual;
            return (
              <Link
                key={e.salary}
                href={contractorPath(e.salary)}
                className="flex flex-col gap-1 rounded-lg border border-brand-border/50 bg-brand-bg/40 px-4 py-3 transition hover:border-emerald-500/60 hover:bg-brand-bg/60"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-brand-text">
                    £{e.salary.toLocaleString("en-GB")}/yr
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-brand-textMuted/70">
                    £{dayRate}/day
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-brand-textMuted">
                  <span>PAYE {formatGBP(paye.netAnnual)}</span>
                  <span>Ltd Out {formatGBP(outside.netAnnual)}</span>
                </div>
                <div className="text-[11px] text-brand-textMuted/70">
                  Gap {formatGBP(spread)}/yr across regimes
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          Prefer a day rate?
        </h2>
        <p className="text-sm text-brand-textMuted">
          If you know your day rate rather than an annual target, the
          contractor comparisons at{" "}
          <Link href="/compare/500-a-day" className="underline hover:text-brand-text">
            /compare/500-a-day
          </Link>{" "}
          and{" "}
          <Link href="/compare/700-a-day" className="underline hover:text-brand-text">
            /compare/700-a-day
          </Link>{" "}
          cover the same four regimes indexed by day rate instead.
        </p>
      </section>
    </div>
  );
}
