import type { Metadata } from "next";
import Link from "next/link";
import { compareSalaryInsights } from "@/lib/marketing/salaryInsight";
import { LANDMARK_SALARIES } from "@/lib/marketing/salaryCatalog";
import { TAX_YEAR } from "../lib/taxYear";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const from = clamp(Number(sp.from) || 40_000, 1_000, 1_000_000);
  const to = clamp(Number(sp.to) || from + 5_000, 1_000, 1_000_000);
  const url = `${siteUrl}/pay-rise?from=${from}&to=${to}`;
  return {
    title: `Pay Rise Calculator — £${from.toLocaleString("en-GB")} → £${to.toLocaleString("en-GB")} (${TAX_YEAR})`,
    description: `Model any UK pay rise from £${from.toLocaleString("en-GB")} to £${to.toLocaleString("en-GB")} for the ${TAX_YEAR} tax year. See how much of the raise you actually keep after Income Tax and NI.`,
    alternates: { canonical: url },
    openGraph: {
      title: `£${from.toLocaleString("en-GB")} → £${to.toLocaleString("en-GB")} pay rise (UK ${TAX_YEAR})`,
      description: `See the real take-home impact of a UK pay rise from £${from.toLocaleString("en-GB")} to £${to.toLocaleString("en-GB")}.`,
      url,
      siteName: "UK Take-Home Calculator",
      type: "website",
      locale: "en_GB",
    },
  };
}

export default async function PayRisePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const from = clamp(Number(sp.from) || 40_000, 1_000, 1_000_000);
  const to = clamp(Number(sp.to) || from + 5_000, 1_000, 1_000_000);
  const cmp = compareSalaryInsights(from, to);

  const suggestions: Array<[number, number]> = [
    [30_000, 35_000],
    [40_000, 50_000],
    [50_000, 60_000],
    [60_000, 70_000],
    [80_000, 100_000],
    [100_000, 110_000],
    [100_000, 125_000],
  ];

  return (
    <div className="space-y-6">
      <section className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          UK · PAYE · {TAX_YEAR}
        </span>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          How much of your pay rise do you actually keep?
        </h1>
        <p className="text-balance text-sm text-brand-textMuted sm:text-base">
          Enter your current and target salaries below to see the real UK
          take-home impact for the {TAX_YEAR} tax year.
        </p>
      </section>

      <section className="mx-auto max-w-3xl rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <form method="get" className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-brand-textMuted">
            Current salary (£)
            <input
              type="number"
              name="from"
              defaultValue={from}
              min={1_000}
              step={1_000}
              className="mt-1 w-full rounded-lg border border-brand-border/60 bg-brand-bg/40 px-3 py-2 text-brand-text"
            />
          </label>
          <label className="block text-sm text-brand-textMuted">
            New salary (£)
            <input
              type="number"
              name="to"
              defaultValue={to}
              min={1_000}
              step={1_000}
              className="mt-1 w-full rounded-lg border border-brand-border/60 bg-brand-bg/40 px-3 py-2 text-brand-text"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
            >
              Calculate raise
            </button>
          </div>
        </form>
      </section>

      <section
        aria-labelledby="raise-numbers"
        className="mx-auto max-w-3xl rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent p-6 backdrop-blur sm:p-8"
      >
        <h2 id="raise-numbers" className="sr-only">
          Pay-rise breakdown
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Gross raise" value={cmp.formatted.grossDelta} />
          <Stat
            label="Additional take-home"
            value={cmp.formatted.netDelta}
            big
          />
          <Stat
            label="Monthly boost"
            value={cmp.formatted.monthlyNetDelta}
            big
          />
          <Stat
            label="Extra Income Tax"
            value={cmp.formatted.taxDelta}
            tone="negative"
          />
          <Stat label="Extra NI" value={cmp.formatted.niDelta} tone="negative" />
          <Stat
            label="You keep"
            value={cmp.formatted.retainedPercent}
            big
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          Popular pay-rise scenarios
        </h2>
        <div className="flex flex-wrap gap-2">
          {suggestions.map(([a, b]) => (
            <Link
              key={`${a}-${b}`}
              href={`/pay-rise?from=${a}&to=${b}`}
              className="rounded-md border border-brand-border/60 bg-brand-bg/40 px-3 py-1.5 text-xs font-medium text-brand-text hover:border-brand-primary/60 hover:bg-brand-primary/10"
            >
              £{(a / 1000).toFixed(0)}k → £{(b / 1000).toFixed(0)}k
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-brand-text sm:text-2xl">
          Related salaries
        </h2>
        <div className="flex flex-wrap gap-2">
          {LANDMARK_SALARIES.filter((s) => Math.abs(s - to) < 30_000).map(
            (s) => (
              <Link
                key={s}
                href={`/salary/${s}-after-tax`}
                className="rounded-md border border-brand-border/60 bg-brand-bg/40 px-3 py-1.5 text-xs font-medium text-brand-text hover:border-brand-primary/60 hover:bg-brand-primary/10"
              >
                £{(s / 1000).toFixed(0)}k
              </Link>
            ),
          )}
        </div>
      </section>
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
