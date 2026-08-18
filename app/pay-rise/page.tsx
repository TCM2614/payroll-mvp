import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareBar } from "@/components/ShareBar";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/share";
import { compareSalaries } from "@/lib/content/insights";
import { LANDMARK_SALARIES } from "@/lib/content/salary-catalog";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const from = clamp(Number(sp.from) || 40_000, 1_000, 1_000_000);
  const to = clamp(Number(sp.to) || from + 5_000, 1_000, 1_000_000);
  return buildMetadata({
    title: `Pay Rise Calculator — £${from.toLocaleString("en-GB")} → £${to.toLocaleString("en-GB")}`,
    description: `See how much of a raise from £${from} to £${to} you actually keep after UK tax and National Insurance.`,
    path: `/pay-rise?from=${from}&to=${to}`,
    keywords: ["pay rise calculator", "how much of my raise do I keep", "UK salary increase after tax"],
  });
}

export default async function PayRisePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const from = clamp(Number(sp.from) || 40_000, 1_000, 1_000_000);
  const to = clamp(Number(sp.to) || from + 5_000, 1_000, 1_000_000);
  const cmp = compareSalaries(from, to);
  const shareText = `${cmp.from.formatted.gross} → ${cmp.to.formatted.gross}: you keep ${cmp.formatted.retainedPercent} of a ${cmp.formatted.grossDelta} raise.`;

  const suggestions: [number, number][] = [
    [30_000, 35_000],
    [40_000, 50_000],
    [50_000, 60_000],
    [60_000, 70_000],
    [80_000, 100_000],
    [100_000, 110_000],
    [100_000, 125_000],
  ];

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Pay rise", path: "/pay-rise" }]} />
      <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
        How much of your pay rise do you actually keep?
      </h1>
      <p className="mb-8 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Enter your current and target salaries below to see the real impact of a UK raise.
      </p>

      <form className="mb-8 grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Current salary (£)</span>
          <input
            type="number"
            name="from"
            defaultValue={from}
            min={1_000}
            step={1_000}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">New salary (£)</span>
          <input
            type="number"
            name="to"
            defaultValue={to}
            min={1_000}
            step={1_000}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Calculate raise
          </button>
        </div>
      </form>

      <section className="mb-8 rounded-2xl border border-zinc-200 bg-gradient-to-br from-emerald-50 to-white p-6 dark:border-zinc-800 dark:from-emerald-950/40 dark:to-zinc-950">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Gross raise" value={cmp.formatted.grossDelta} />
          <Stat label="Additional take‑home" value={cmp.formatted.netDelta} big />
          <Stat label="Monthly take‑home boost" value={cmp.formatted.monthlyNetDelta} big />
          <Stat label="Extra Income Tax" value={cmp.formatted.taxDelta} tone="negative" />
          <Stat label="Extra NI" value={cmp.formatted.niDelta} tone="negative" />
          <Stat label="You keep" value={cmp.formatted.retainedPercent} big />
        </div>
        <div className="mt-4">
          <ShareBar url={absoluteUrl(`/pay-rise?from=${from}&to=${to}`)} text={shareText} surface="pay_rise" />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Popular pay‑rise scenarios</h2>
        <div className="flex flex-wrap gap-2">
          {suggestions.map(([a, b]) => (
            <Link
              key={`${a}-${b}`}
              href={`/pay-rise?from=${a}&to=${b}`}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950"
            >
              £{(a / 1000).toFixed(0)}k → £{(b / 1000).toFixed(0)}k
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Related salaries</h2>
        <div className="flex flex-wrap gap-2">
          {LANDMARK_SALARIES.filter((s) => Math.abs(s - to) < 30_000).map((s) => (
            <Link
              key={s}
              href={`/salary/${s}-after-tax`}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950"
            >
              £{(s / 1000).toFixed(0)}k
            </Link>
          ))}
        </div>
      </section>
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
      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p
        className={`mt-1 font-semibold tabular-nums ${
          big ? "text-3xl" : "text-xl"
        } ${tone === "negative" ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"}`}
      >
        {value}
      </p>
    </div>
  );
}
