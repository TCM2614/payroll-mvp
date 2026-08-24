import type { Metadata } from "next";
import Link from "next/link";
import { ShareBar } from "@/components/ShareBar";
import { PageViewTracker } from "@/components/PageViewTracker";
import { TaxTrapChart } from "@/components/TaxTrapChart";
import {
  buildSalaryInsight,
  compareSalaryInsights,
} from "@/lib/marketing/salaryInsight";
import { TAX_YEAR } from "../lib/taxYear";
import { SITE_URL } from "@/lib/siteUrl";


export const metadata: Metadata = {
  title: `The £100k Tax Trap Explained (UK ${TAX_YEAR})`,
  description: `Between £100,000 and £125,140 the UK Personal Allowance is withdrawn, creating an effective 60% marginal Income Tax rate. See what the numbers actually look like for the ${TAX_YEAR} tax year.`,
  keywords:
    "£100k tax trap, 100000 tax UK, 60% marginal rate UK, personal allowance taper, salary sacrifice £100k",
  alternates: { canonical: `${SITE_URL}/100k-tax-trap` },
  openGraph: {
    title: `The £100k UK Tax Trap Explained (${TAX_YEAR})`,
    description: `The £100k–£125,140 UK Personal Allowance taper visualised, deterministically calculated for the ${TAX_YEAR} tax year.`,
    url: `${SITE_URL}/100k-tax-trap`,
    siteName: "UK Take-Home Calculator",
    type: "article",
    locale: "en_GB",
  },
};

const TRAP_SALARIES = [
  90_000, 100_000, 105_000, 110_000, 115_000, 120_000, 125_140, 130_000,
  150_000,
];

/**
 * Marginal rate on the next £1 earned at `salary`, computed as
 * `1 − Δnet / Δgross` over a small window (£100) using the same tax engine
 * as the rest of the page. Rounded to the nearest whole percent for the
 * table — the exact figure fluctuates by pence but the story is the band.
 */
function marginalRateAt(salary: number): number {
  const WINDOW = 100;
  const lo = compareSalaryInsights(salary - WINDOW, salary + WINDOW);
  const gross = lo.grossDelta; // 2 × WINDOW
  if (gross <= 0) return 0;
  const net = lo.netDelta;
  return Math.max(0, 1 - net / gross);
}

export default function TaxTrapPage() {
  const rows = TRAP_SALARIES.map((s) => ({
    insight: buildSalaryInsight(s),
    marginal: marginalRateAt(s),
  }));
  const at100 = buildSalaryInsight(100_000);
  const cmp100_110 = compareSalaryInsights(100_000, 110_000);
  const cmp100_125 = compareSalaryInsights(100_000, 125_140);
  const marginalAt110 = Math.round(marginalRateAt(110_000) * 100);

  const faqs = [
    {
      question: "What is the £100k tax trap?",
      answer:
        "Between £100,000 and £125,140 the UK Personal Allowance is withdrawn by £1 for every £2 earned. That effectively adds a 20% surcharge to your marginal 40% rate, making the effective marginal Income Tax rate 60% (plus 2% employee NI). Above £125,140 the marginal Income Tax rate drops back to 45% (plus 2% NI).",
    },
    {
      question: "Is the tax trap a cliff or a gradual effect?",
      answer:
        "It applies smoothly across the £100k → £125,140 range but the psychological effect concentrates around £100k because that's where the taper begins.",
    },
    {
      question: "How do I avoid the £100k tax trap?",
      answer:
        "Pension salary sacrifice or SIPP contributions bring your taxable income back below £100k, restoring your Personal Allowance. This is not financial advice — speak to a qualified adviser about your situation.",
    },
    {
      question: "What is the effective marginal rate in the £100k zone?",
      answer:
        "About 60% for the Income Tax portion alone (40% higher rate + 20% from the withdrawn Personal Allowance) plus 2% employee National Insurance = ~62% marginal all-in for most PAYE earners in England / Wales / NI.",
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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-200">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          UK · {TAX_YEAR}
        </span>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          The £100k Tax Trap Explained
        </h1>
        <p className="text-balance text-sm text-brand-textMuted sm:text-base">
          Between <strong>£100,000</strong> and <strong>£125,140</strong> the
          UK Personal Allowance is withdrawn — creating an effective 60%
          marginal Income Tax rate. Here&apos;s what the numbers actually look
          like.
        </p>
      </section>

      <section className="mx-auto max-w-3xl rounded-3xl border border-rose-400/30 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          The trap in one number
        </h2>
        <p className="mt-3 text-sm text-brand-textMuted sm:text-base">
          Going from <strong>£100,000</strong> to <strong>£110,000</strong>{" "}
          gross gives you only{" "}
          <strong className="text-rose-300">
            {cmp100_110.formatted.netDelta}
          </strong>{" "}
          extra take-home. That&apos;s{" "}
          <strong className="text-brand-text">
            {cmp100_110.formatted.retainedPercent}
          </strong>{" "}
          of the raise.
        </p>
        <p className="mt-2 text-sm text-brand-textMuted sm:text-base">
          Going from £100,000 to <strong>£125,140</strong> — earning £25,140
          more gross — adds only{" "}
          <strong className="text-rose-300">
            {cmp100_125.formatted.netDelta}
          </strong>{" "}
          to your annual take-home.
        </p>
        <div className="mt-5">
          <ShareBar
            url={`${SITE_URL}/100k-tax-trap`}
            text={`UK £100k tax trap: earning £110k only adds ${cmp100_110.formatted.netDelta} take-home vs £100k. You keep ${cmp100_110.formatted.retainedPercent} of the raise.`}
            pageType="tax_trap"
            contentType="100k-to-125k"
          />
        </div>
      </section>

      <section
        aria-labelledby="trap-chart"
        className="mx-auto max-w-4xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-4 backdrop-blur sm:p-8"
      >
        <h2 id="trap-chart" className="text-xl font-semibold text-brand-text sm:text-2xl">
          The trap, visualised
        </h2>
        <p className="text-sm text-brand-textMuted">
          Green area: annual take-home as gross salary rises. Pink line:
          marginal rate you keep on each extra £. Between £100,000 and
          £125,140 the marginal Income Tax rate jumps to 60% (plus 2% NI) as
          the Personal Allowance is withdrawn.
        </p>
        <TaxTrapChart />
        <p className="text-xs text-brand-textMuted/70">
          Chart values are sourced from the same deterministic PAYE engine as
          the calculator and the table below. The table underneath is the
          authoritative numerical record for accessibility.
        </p>
      </section>

      <section className="mx-auto max-w-4xl rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-4 backdrop-blur sm:p-8">
        <h2 className="mb-2 text-xl font-semibold text-brand-text sm:text-2xl">
          What happens at each salary
        </h2>
        <p className="mb-4 text-sm text-brand-textMuted">
          Two different rates for two different questions. <strong>Effective
          (average)</strong> is your total tax + NI divided by your total gross
          — this stays under 40% for the whole trap zone because it&apos;s
          averaged across your <em>whole</em> salary. <strong>Marginal on next
          £</strong> is what HMRC actually takes from the next pound you earn
          — this is the number that jumps to ~{marginalAt110}% between £100k
          and £125,140 because the Personal Allowance is being withdrawn at £1
          per £2 <em>on top of</em> the higher-rate 40% band and 2% NI.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-brand-border/40">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-bg/40 text-left font-semibold text-brand-text">
              <tr>
                <th className="p-3">Gross salary</th>
                <th className="p-3">Income Tax</th>
                <th className="p-3">NI</th>
                <th className="p-3">Take-home</th>
                <th className="p-3">
                  Effective
                  <span className="ml-1 text-[10px] font-normal text-brand-textMuted">
                    (avg)
                  </span>
                </th>
                <th className="p-3">
                  Marginal
                  <span className="ml-1 text-[10px] font-normal text-brand-textMuted">
                    (next £)
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="text-brand-textMuted">
              {rows.map(({ insight: r, marginal }) => (
                <tr
                  key={r.salary}
                  className={
                    "border-t border-brand-border/40 hover:bg-brand-bg/30" +
                    (r.salary >= 100_000 && r.salary <= 125_140
                      ? " bg-rose-500/[0.06]"
                      : "")
                  }
                >
                  <td className="p-3 font-medium text-brand-text">
                    <Link
                      href={`/salary/${r.salary}-after-tax`}
                      className="hover:text-brand-primary"
                    >
                      {r.formatted.gross}
                    </Link>
                  </td>
                  <td className="p-3 tabular-nums text-rose-300">
                    {r.formatted.incomeTax}
                  </td>
                  <td className="p-3 tabular-nums text-rose-300">
                    {r.formatted.ni}
                  </td>
                  <td className="p-3 tabular-nums text-emerald-300">
                    {r.formatted.net}
                  </td>
                  <td className="p-3 tabular-nums">
                    {r.formatted.effectiveRate}
                  </td>
                  <td className="p-3 tabular-nums font-semibold">
                    <span
                      className={
                        r.salary >= 100_000 && r.salary <= 125_140
                          ? "text-rose-300"
                          : "text-brand-text"
                      }
                    >
                      {(marginal * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-brand-textMuted/70">
          Rose-shaded rows sit inside the PA-taper zone (£100,000 → £125,140).
          Marginal rate is derived by nudging the tax engine by £100 either
          side of each salary — no separate marginal-rate formula is used.
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

      <section className="mx-auto max-w-3xl">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/salary/100000-after-tax"
            className="rounded-md border border-brand-border/60 bg-brand-bg/40 px-3 py-1.5 text-xs font-medium text-brand-text hover:border-brand-primary/60 hover:bg-brand-primary/10"
          >
            £100k page
          </Link>
          <Link
            href="/salary/125000-after-tax"
            className="rounded-md border border-brand-border/60 bg-brand-bg/40 px-3 py-1.5 text-xs font-medium text-brand-text hover:border-brand-primary/60 hover:bg-brand-primary/10"
          >
            £125k page
          </Link>
          <Link
            href="/pay-rise?from=100000&to=110000"
            className="rounded-md border border-brand-border/60 bg-brand-bg/40 px-3 py-1.5 text-xs font-medium text-brand-text hover:border-brand-primary/60 hover:bg-brand-primary/10"
          >
            £100k → £110k pay rise
          </Link>
        </div>
      </section>

      {/* keep at100 used so tree-shaker is happy — value shown below */}
      <p className="mx-auto max-w-3xl px-6 text-xs text-brand-textMuted/70">
        Reference baseline: £100,000 gross gives {at100.formatted.net} annual
        take-home ({at100.formatted.effectiveRate} effective rate). All figures
        are deterministic {TAX_YEAR} PAYE estimates. Not financial advice.
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PageViewTracker event="tax_trap_viewed" surface="page" />
    </div>
  );
}
