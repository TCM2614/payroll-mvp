import type { Metadata } from "next";
import { WealthPercentileTab } from "@/components/tabs/WealthPercentileTab";
import { TAX_YEAR } from "../lib/taxYear";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

interface PageProps {
  searchParams: Promise<{ income?: string; age?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const income = Number(sp.income);
  const hasIncome = Number.isFinite(income) && income > 0;
  return {
    title: hasIncome
      ? `Where does £${income.toLocaleString("en-GB")} rank in the UK? — Salary Percentile`
      : `UK Salary Percentile Calculator (${TAX_YEAR})`,
    description: `See where any UK salary ranks against adult income taxpayers by age band. Free UK salary percentile calculator using HMRC / ONS-derived data.`,
    keywords:
      "UK salary percentile, how rich am I, UK income distribution, salary ranking UK, income percentile calculator",
    alternates: { canonical: `${siteUrl}/salary-percentile` },
    openGraph: {
      title: hasIncome
        ? `Where does £${income.toLocaleString("en-GB")} rank in the UK?`
        : `UK Salary Percentile Calculator`,
      description: `Where any UK salary sits against the UK population of adult income taxpayers, by age band.`,
      url: `${siteUrl}/salary-percentile`,
      siteName: "UK Take-Home Calculator",
      type: "website",
      locale: "en_GB",
    },
  };
}

export default async function SalaryPercentilePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const income = Number(sp.income);
  const age = Number(sp.age);

  const defaultAnnualIncome =
    Number.isFinite(income) && income > 0 ? income : 45_000;
  const defaultAge = Number.isFinite(age) && age >= 16 && age <= 100 ? age : 35;

  return (
    <div className="space-y-6">
      <section className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          UK · {TAX_YEAR}
        </span>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          How Rich Are You? UK Salary Percentile
        </h1>
        <p className="text-balance text-sm text-brand-textMuted sm:text-base">
          See where a UK salary sits against the population of adult income
          taxpayers in your age band. Approximate, indicative and useful for
          perspective.
        </p>
      </section>

      <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-4 shadow-soft-xl backdrop-blur sm:p-8">
        <WealthPercentileTab
          defaultAge={defaultAge}
          defaultAnnualIncome={defaultAnnualIncome}
        />
      </section>

      <section className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          Methodology
        </h2>
        <p className="text-sm text-brand-textMuted">
          Percentiles are derived from published HMRC{" "}
          <em>Survey of Personal Incomes</em> and ONS ASHE releases, cut by
          age band. Numbers are approximate and refresh against the latest
          release; this is a perspective tool, not authoritative or
          predictive. Not financial advice.
        </p>
      </section>
    </div>
  );
}
