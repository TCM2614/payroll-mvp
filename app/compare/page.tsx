import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { LANDMARK_SALARIES } from "@/lib/content/salary-catalog";

export const metadata: Metadata = buildMetadata({
  title: "UK Salary Comparison — Any Two Salaries, Side by Side",
  description:
    "Compare any two UK salaries side by side. See gross difference, tax difference, National Insurance impact, and how much of the raise you actually keep.",
  path: "/compare",
});

export default function CompareIndexPage() {
  const combos: [number, number][] = [];
  for (let i = 0; i < LANDMARK_SALARIES.length; i++) {
    for (let j = i + 1; j < LANDMARK_SALARIES.length; j++) {
      const a = LANDMARK_SALARIES[i];
      const b = LANDMARK_SALARIES[j];
      if (b - a > 20_000) continue;
      combos.push([a, b]);
    }
  }
  const highlight: [number, number][] = [
    [40_000, 50_000],
    [50_000, 60_000],
    [50_000, 70_000],
    [70_000, 100_000],
    [100_000, 125_000],
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Compare", path: "/compare" }]} />
      <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
        UK Salary Comparison
      </h1>
      <p className="mb-8 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Pick any two salaries to see the real after‑tax difference. Every
        comparison shows the extra take‑home per year and per month, plus how
        much of the raise you actually keep.
      </p>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Popular comparisons</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {highlight.map(([a, b]) => (
            <Link
              key={`${a}-${b}`}
              href={`/compare/${a}-vs-${b}`}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <span className="font-medium">
                £{(a / 1000).toFixed(0)}k vs £{(b / 1000).toFixed(0)}k
              </span>
              <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                +£{((b - a) / 1000).toFixed(0)}k gross
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">All landmark comparisons</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {combos.map(([a, b]) => (
            <Link
              key={`${a}-${b}`}
              href={`/compare/${a}-vs-${b}`}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950"
            >
              £{(a / 1000).toFixed(0)}k vs £{(b / 1000).toFixed(0)}k
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
