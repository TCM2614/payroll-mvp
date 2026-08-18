import type { Metadata } from "next";
import { Calculator } from "@/components/Calculator";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { LANDMARK_SALARIES, salaryPath } from "@/lib/content/salary-catalog";
import Link from "next/link";

export const metadata: Metadata = buildMetadata({
  title: "UK Take‑Home Salary Calculator (2025/26)",
  description:
    "Free UK salary calculator for the 2025/26 tax year. Enter your gross pay and see your take‑home after PAYE Income Tax, National Insurance, pension and student loans.",
  path: "/calculator",
  keywords: [
    "UK salary calculator",
    "take home pay calculator",
    "PAYE calculator",
    "income tax calculator UK",
    "National Insurance calculator",
    "2025/26 tax year",
  ],
});

interface PageProps {
  searchParams: Promise<{ gross?: string; region?: string }>;
}

export default async function CalculatorPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const gross = Number(sp.gross) > 0 ? Number(sp.gross) : 35_000;
  const region = sp.region === "scotland" ? "scotland" : "england-wales-ni";
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Calculator", path: "/calculator" }]} />
      <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
        UK Take‑Home Salary Calculator
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        See what you keep from any UK salary in 2025/26 — after Income Tax,
        National Insurance, pension and student loan.
      </p>
      <Calculator initialGross={gross} initialRegion={region} />

      <section aria-labelledby="jump-title" className="mt-12">
        <h2 id="jump-title" className="mb-3 text-xl font-semibold">
          Jump to a common salary
        </h2>
        <div className="flex flex-wrap gap-2">
          {LANDMARK_SALARIES.map((s) => (
            <Link
              key={s}
              href={salaryPath(s)}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:border-emerald-500 hover:bg-emerald-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/50"
            >
              £{(s / 1000).toFixed(0)}k
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
