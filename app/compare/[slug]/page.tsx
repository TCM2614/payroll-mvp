import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareBar } from "@/components/ShareBar";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/share";
import { compareSalaries } from "@/lib/content/insights";
import { LANDMARK_SALARIES, parseComparisonSlug } from "@/lib/content/salary-catalog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const combos: { slug: string }[] = [];
  for (const a of LANDMARK_SALARIES) {
    for (const b of LANDMARK_SALARIES) {
      if (a >= b) continue;
      combos.push({ slug: `${a}-vs-${b}` });
    }
  }
  return combos;
}

export const dynamicParams = true;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseComparisonSlug(slug);
  if (!parsed) return { title: "Salary comparison" };
  const cmp = compareSalaries(parsed.a, parsed.b);
  return buildMetadata({
    title: `£${parsed.a.toLocaleString("en-GB")} vs £${parsed.b.toLocaleString("en-GB")} — UK Salary Comparison`,
    description: `Compare £${parsed.a} and £${parsed.b} UK salaries after tax. ${cmp.from.formatted.gross} gives ${cmp.from.formatted.net}/yr, ${cmp.to.formatted.gross} gives ${cmp.to.formatted.net}/yr.`,
    path: `/compare/${slug}`,
  });
}

export default async function ComparePage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseComparisonSlug(slug);
  if (!parsed) notFound();
  const cmp = compareSalaries(parsed.a, parsed.b);
  const shareText = `£${(parsed.a / 1000).toFixed(0)}k vs £${(parsed.b / 1000).toFixed(0)}k UK: the higher salary keeps ${cmp.formatted.retainedPercent} of the £${(cmp.grossDelta / 1000).toFixed(0)}k difference.`;

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
          { name: `£${parsed.a.toLocaleString("en-GB")} vs £${parsed.b.toLocaleString("en-GB")}`, path: `/compare/${slug}` },
        ]}
      />
      <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
        {cmp.from.formatted.gross} vs {cmp.to.formatted.gross}
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        UK 2025/26 side‑by‑side comparison, PAYE, England / Wales / NI.
      </p>

      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        <SalaryCard title={cmp.from.formatted.gross} data={cmp.from} />
        <SalaryCard title={cmp.to.formatted.gross} data={cmp.to} />
      </section>

      <section className="mb-8 rounded-2xl border border-zinc-200 bg-gradient-to-br from-emerald-50 to-white p-6 dark:border-zinc-800 dark:from-emerald-950/40 dark:to-zinc-950">
        <h2 className="mb-3 text-2xl font-semibold">The real difference</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Stat label="Gross difference" value={cmp.formatted.grossDelta} />
          <Stat label="Net difference (yr)" value={cmp.formatted.netDelta} big />
          <Stat label="Net difference (mo)" value={cmp.formatted.monthlyNetDelta} big />
          <Stat label="Extra Income Tax" value={cmp.formatted.taxDelta} tone="negative" />
          <Stat label="Extra NI" value={cmp.formatted.niDelta} tone="negative" />
          <Stat label="Retained % of gain" value={cmp.formatted.retainedPercent} big />
        </div>
        <div className="mt-4">
          <ShareBar url={absoluteUrl(`/compare/${slug}`)} text={shareText} surface="comparison" />
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <Link href={`/salary/${parsed.a}-after-tax`} className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          More on £{(parsed.a / 1000).toFixed(0)}k
        </Link>
        <Link href={`/salary/${parsed.b}-after-tax`} className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          More on £{(parsed.b / 1000).toFixed(0)}k
        </Link>
        <Link href={`/pay-rise?from=${parsed.a}&to=${parsed.b}`} className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          As a pay rise
        </Link>
      </section>
    </article>
  );
}

function SalaryCard({
  title,
  data,
}: {
  title: string;
  data: ReturnType<typeof compareSalaries>["from"];
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Gross</p>
      <p className="text-2xl font-semibold">{title}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Annual net</dt>
          <dd className="font-semibold text-emerald-700 dark:text-emerald-400">{data.formatted.net}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Monthly net</dt>
          <dd className="font-semibold">{data.formatted.monthly}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Income Tax</dt>
          <dd className="font-semibold text-rose-600 dark:text-rose-400">{data.formatted.incomeTax}</dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">NI</dt>
          <dd className="font-semibold text-rose-600 dark:text-rose-400">{data.formatted.ni}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-zinc-500 dark:text-zinc-400">You keep</dt>
          <dd className="font-semibold">{data.formatted.retainedPercent}</dd>
        </div>
      </dl>
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
      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p
        className={`mt-1 font-semibold tabular-nums ${
          big ? "text-2xl" : "text-lg"
        } ${tone === "negative" ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"}`}
      >
        {value}
      </p>
    </div>
  );
}
