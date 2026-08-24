import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareBar } from "@/components/ShareBar";
import { PageViewTracker } from "@/components/PageViewTracker";
import { TakeHomeComparisonStrip } from "@/components/landing/TakeHomeComparisonStrip";
import { computeLandingComparison } from "@/lib/marketing/landingComparison";
import {
  CONTRACTOR_CATALOG,
  CONTRACTOR_LANDMARK_SALARIES,
  annualToDayRate,
  contractorPath,
  parseContractorSlug,
} from "@/lib/marketing/contractorCatalog";
import { buildSalaryInsight } from "@/lib/marketing/salaryInsight";
import { formatGBP } from "@/lib/format";
import { TAX_YEAR } from "../../lib/taxYear";
import { SITE_URL } from "@/lib/siteUrl";

export function generateStaticParams() {
  return CONTRACTOR_CATALOG.map((e) => ({
    slug: `${e.salary}-take-home`,
  }));
}

export const dynamicParams = false;

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const salary = parseContractorSlug(slug);
  if (salary === null) return {};

  const dayRate = Math.round(annualToDayRate(salary));
  const comparison = computeLandingComparison({ dayRate });
  const paye = comparison.scenarios.find((s) => s.key === "paye");
  const outside = comparison.scenarios.find((s) => s.key === "limited-outside");
  const url = `${SITE_URL}/contractor/${slug}`;
  const ogImage = `${SITE_URL}/api/og-comparison?slug=${dayRate}-a-day`;

  return {
    title: `£${salary.toLocaleString("en-GB")} Contractor Take-Home UK (${TAX_YEAR}) — PAYE vs Umbrella vs Ltd`,
    description: `£${salary.toLocaleString("en-GB")} annualised contractor income in the UK ${TAX_YEAR}. Take-home under PAYE ${formatGBP(paye?.netAnnual ?? 0)} vs Ltd Outside IR35 ${formatGBP(outside?.netAnnual ?? 0)}. Same annual gross, four regimes.`,
    keywords: [
      `${salary} contractor take home`,
      `${salary} contractor salary UK`,
      `${salary} umbrella take home`,
      `${salary} outside IR35`,
      `${salary} inside IR35`,
    ].join(", "),
    alternates: { canonical: url },
    openGraph: {
      title: `£${salary.toLocaleString("en-GB")} contractor — 4 UK regimes side by side`,
      description: `PAYE ${formatGBP(paye?.netAnnual ?? 0)} · Ltd Outside IR35 ${formatGBP(outside?.netAnnual ?? 0)} for a £${salary.toLocaleString("en-GB")} annualised gross.`,
      url,
      siteName: "UK Take-Home Calculator",
      type: "website",
      locale: "en_GB",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `£${salary.toLocaleString("en-GB")} contractor: 4 regimes, one gross`,
      description: `UK ${TAX_YEAR} contractor take-home comparison for a £${salary.toLocaleString("en-GB")} annualised gross.`,
      images: [ogImage],
    },
  };
}

export default async function ContractorPage({ params }: RouteParams) {
  const { slug } = await params;
  const salary = parseContractorSlug(slug);
  if (salary === null || !CONTRACTOR_CATALOG.find((e) => e.salary === salary)) {
    notFound();
  }

  const dayRate = Math.round(annualToDayRate(salary));
  const comparison = computeLandingComparison({ dayRate });
  const paye = comparison.scenarios.find((s) => s.key === "paye")!;
  const umbrella = comparison.scenarios.find((s) => s.key === "umbrella")!;
  const ltdInside = comparison.scenarios.find(
    (s) => s.key === "limited-inside",
  )!;
  const ltdOutside = comparison.scenarios.find(
    (s) => s.key === "limited-outside",
  )!;

  // PAYE baseline from the salary page so users can cross-link.
  const payeInsight = buildSalaryInsight(salary);

  const url = `${SITE_URL}/contractor/${slug}`;
  const shareText = `£${salary.toLocaleString("en-GB")} UK contractor take-home: PAYE ${formatGBP(paye.netAnnual)}, Umbrella ${formatGBP(umbrella.netAnnual)}, Ltd Outside IR35 ${formatGBP(ltdOutside.netAnnual)}.`;

  const faqs = [
    {
      question: `Why does £${salary.toLocaleString("en-GB")} take home a different amount as a contractor vs an employee?`,
      answer: `An employee earning £${salary.toLocaleString("en-GB")} pays only Income Tax and employee NI. A contractor billing the same annualised gross has to cover employer NI (15%), the apprenticeship levy (0.5%) and the umbrella's own margin (typically £${(25 * 52).toLocaleString("en-GB")}/yr) before PAYE — which is why the umbrella take-home is materially lower even though the "gross" number is the same. Outside IR35 through a limited company reintroduces the option of an NI-optimal salary plus dividends, subject to corporation tax with marginal relief.`,
    },
    {
      question: `What day rate corresponds to a £${salary.toLocaleString("en-GB")} annual gross?`,
      answer: `On the standard assumption of 5 working days × 46 billable weeks per year, £${salary.toLocaleString("en-GB")} annualises from a day rate of £${dayRate.toLocaleString("en-GB")}/day. The chart above uses that day rate to compute each regime.`,
    },
    {
      question: "Which contractor regime keeps the most?",
      answer: `On this £${salary.toLocaleString("en-GB")} scenario, ${comparison.bestScenarioKey === "paye" ? "Standard PAYE employment" : comparison.bestScenarioKey === "limited-outside" ? "Limited Company outside IR35" : comparison.bestScenarioKey === "limited-inside" ? "Limited Company inside IR35" : "Umbrella (Inside IR35)"} keeps the most (${formatGBP(paye.netAnnual > ltdOutside.netAnnual ? paye.netAnnual : ltdOutside.netAnnual)}). The gap between best and worst is ${formatGBP(comparison.bestVsWorstAnnual)}/year on the same annualised gross. IR35 status is determined by the contract and working arrangements, not by choice.`,
    },
    {
      question: "Is this financial advice?",
      answer:
        "No. Numbers are deterministic estimates from the same tax engine as the calculator, using standard 2026/27 UK assumptions (1257L tax code, £25/week umbrella margin, £1,200/year Ltd Outside IR35 overheads). Speak to an accountant for your specific situation.",
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
      {
        "@type": "ListItem",
        position: 2,
        name: "Contractor",
        item: `${SITE_URL}/contractor`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `£${salary.toLocaleString("en-GB")} take-home`,
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
            <Link href="/contractor" className="hover:text-brand-text">
              Contractor
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="text-brand-text">
            £{salary.toLocaleString("en-GB")} take-home
          </li>
        </ol>
      </nav>

      <section className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          Contractor · {TAX_YEAR}
        </span>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          £{salary.toLocaleString("en-GB")} Contractor Take-Home
        </h1>
        <p className="text-balance text-sm text-brand-textMuted sm:text-base">
          Same £{salary.toLocaleString("en-GB")} annualised gross — four
          engagement types side by side for the {TAX_YEAR} UK tax year. Based
          on a £{dayRate.toLocaleString("en-GB")}/day rate over 5 days × 46
          billable weeks.
        </p>
      </section>

      <section
        aria-labelledby="hero-numbers"
        className="mx-auto max-w-4xl rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent p-6 backdrop-blur sm:p-8"
      >
        <h2 id="hero-numbers" className="sr-only">
          Four regimes side by side
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RegimeCard
            title="Standard PAYE"
            regime="Employee"
            net={paye.netAnnual}
            monthly={paye.netMonthly}
            effective={paye.effectiveTaxRate}
            baseline
          />
          <RegimeCard
            title="Umbrella"
            regime="Inside IR35"
            net={umbrella.netAnnual}
            monthly={umbrella.netMonthly}
            effective={umbrella.effectiveTaxRate}
            deltaVsPaye={umbrella.deltaVsPayeAnnual}
            tone="warning"
          />
          <RegimeCard
            title="Ltd Inside IR35"
            regime="Inside IR35"
            net={ltdInside.netAnnual}
            monthly={ltdInside.netMonthly}
            effective={ltdInside.effectiveTaxRate}
            deltaVsPaye={ltdInside.deltaVsPayeAnnual}
          />
          <RegimeCard
            title="Ltd Outside IR35"
            regime="Outside IR35"
            net={ltdOutside.netAnnual}
            monthly={ltdOutside.netMonthly}
            effective={ltdOutside.effectiveTaxRate}
            deltaVsPaye={ltdOutside.deltaVsPayeAnnual}
            tone="success"
          />
        </div>

        <p className="mt-5 text-sm text-brand-textMuted">
          Best–worst gap on the same £{salary.toLocaleString("en-GB")}{" "}
          annualised gross:{" "}
          <strong className="text-brand-text">
            {formatGBP(comparison.bestVsWorstAnnual)}
          </strong>{" "}
          per year.
        </p>

        <div className="mt-5">
          <ShareBar
            url={url}
            text={shareText}
            pageType="contractor_page"
            contentType={`${salary}-take-home`}
          />
        </div>
      </section>

      <section
        aria-labelledby="live-strip"
        className="rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-4 shadow-soft-xl backdrop-blur sm:p-8"
      >
        <h2
          id="live-strip"
          className="mb-4 text-xl font-semibold text-brand-text sm:text-2xl"
        >
          Live model — adjust the assumptions
        </h2>
        <p className="mb-4 text-sm text-brand-textMuted">
          Fine-tune the day rate, umbrella margin, or Ltd overheads. Every
          value on this page recomputes deterministically.
        </p>
        <TakeHomeComparisonStrip
          inputs={{ dayRate }}
          analyticsSource={`contractor_${salary}`}
        />
      </section>

      <section className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          If you earned £{salary.toLocaleString("en-GB")} as an{" "}
          <em>employee</em> instead
        </h2>
        <p className="text-sm text-brand-textMuted">
          On PAYE with a standard 1257L tax code and no salary sacrifice, you
          would take home{" "}
          <strong className="text-brand-text">
            {payeInsight.formatted.net}
          </strong>{" "}
          annually — {payeInsight.formatted.monthly} per month. That&apos;s the
          baseline the four contractor regimes above are measured against.
        </p>
        <Link
          href={`/salary/${salary}-after-tax`}
          className="inline-flex items-center justify-center rounded-xl border border-brand-primary/50 bg-brand-primary/10 px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/20"
        >
          See the £{salary.toLocaleString("en-GB")} employee page
        </Link>
      </section>

      <section className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          Explore other contractor totals
        </h2>
        <div className="flex flex-wrap gap-2">
          {CONTRACTOR_LANDMARK_SALARIES.filter((s) => s !== salary).map(
            (s) => (
              <Link
                key={s}
                href={contractorPath(s)}
                className="rounded-full border border-brand-border/60 bg-brand-bg/40 px-3 py-1.5 text-xs font-medium text-brand-text hover:border-brand-primary/60 hover:bg-brand-primary/10"
              >
                £{(s / 1000).toFixed(0)}k
              </Link>
            ),
          )}
        </div>
        <p className="mt-3 text-xs text-brand-textMuted">
          Prefer to work in day-rate terms? Browse{" "}
          <Link href="/compare/500-a-day" className="underline hover:text-brand-text">
            /compare/500-a-day
          </Link>{" "}
          for the day-rate view of the same comparison.
        </p>
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
        Deterministic {TAX_YEAR} figures using standard contractor assumptions
        (£25/week umbrella margin, £1,200/year Ltd Outside IR35 overheads,
        NI-optimal director salary + dividends, corporation tax with marginal
        relief). IR35 status is determined by the contract; this tool
        illustrates the tax outcome per regime, not which regime applies to
        you. Not financial advice.
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
        salaryPage={`contractor-${salary}-take-home`}
        taxYear={payeInsight.taxYear}
      />
    </div>
  );
}

function RegimeCard({
  title,
  regime,
  net,
  monthly,
  effective,
  deltaVsPaye,
  baseline,
  tone,
}: {
  title: string;
  regime: string;
  net: number;
  monthly: number;
  effective: number;
  deltaVsPaye?: number;
  baseline?: boolean;
  tone?: "warning" | "success";
}) {
  const regimeBadge =
    regime === "Inside IR35"
      ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
      : regime === "Outside IR35"
        ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
        : "border-white/20 bg-white/5 text-white/80";
  const outline =
    tone === "success"
      ? "border-emerald-400/60"
      : tone === "warning"
        ? "border-rose-400/40"
        : "border-brand-border/60";
  return (
    <div
      className={`relative rounded-2xl border ${outline} bg-brand-bg/50 p-4`}
    >
      {tone === "success" && (
        <span className="absolute -top-2 left-4 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
          Highest net
        </span>
      )}
      {tone === "warning" && (
        <span className="absolute -top-2 left-4 rounded-full bg-rose-500/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          Lowest net
        </span>
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-text">{title}</p>
          <span
            className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${regimeBadge}`}
          >
            {regime}
          </span>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] uppercase tracking-wide text-brand-textMuted/80">
          Annual take-home
        </p>
        <p className="text-2xl font-bold text-brand-text tabular-nums">
          {formatGBP(net)}
        </p>
        <p className="text-xs text-brand-textMuted">
          {formatGBP(monthly)} / month · {(effective * 100).toFixed(1)}%
          effective
        </p>
      </div>
      {!baseline && typeof deltaVsPaye === "number" && (
        <p
          className={`mt-3 text-xs font-semibold tabular-nums ${
            deltaVsPaye >= 0 ? "text-emerald-300" : "text-rose-300"
          }`}
        >
          {deltaVsPaye >= 0 ? "+" : ""}
          {formatGBP(deltaVsPaye)} vs PAYE
        </p>
      )}
      {baseline && (
        <p className="mt-3 text-xs font-medium text-brand-textMuted">
          Baseline
        </p>
      )}
    </div>
  );
}
