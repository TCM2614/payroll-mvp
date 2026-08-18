"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareBar } from "@/components/ShareBar";
import { computePercentile } from "@/lib/content/insights";
import { UK_SALARY_PERCENTILES } from "@/lib/content/percentile-data";
import { absoluteUrl } from "@/lib/share";
import { trackEvent, salaryBand } from "@/lib/analytics";

export default function PercentileClient() {
  const [salary, setSalary] = useState(45_000);
  const p = useMemo(() => computePercentile(salary), [salary]);
  const shareText = `My UK salary of £${salary.toLocaleString("en-GB")} puts me in the ${p.descriptor}.`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "How rich are you?", path: "/salary-percentile" }]} />
      <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
        How rich are you? UK salary percentile
      </h1>
      <p className="mb-6 max-w-2xl text-zinc-600 dark:text-zinc-400">
        See where a UK salary sits against the population of adult income
        taxpayers. Approximate, indicative, and useful for perspective.
      </p>

      <form className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <label className="block">
          <span className="text-sm font-medium">Gross annual salary — £{salary.toLocaleString("en-GB")}</span>
          <input
            type="range"
            min={10_000}
            max={300_000}
            step={1_000}
            value={salary}
            onChange={(e) => {
              const n = Number(e.target.value);
              setSalary(n);
              trackEvent("percentile_viewed", { salary_band: salaryBand(n) });
            }}
            className="mt-2 w-full accent-emerald-600"
            aria-label="Gross annual salary"
          />
          <span className="mt-2 flex justify-between text-xs text-zinc-500">
            <span>£10k</span>
            <span>£300k</span>
          </span>
        </label>
      </form>

      <section className="mb-8 rounded-2xl border border-zinc-200 bg-gradient-to-br from-emerald-50 to-white p-6 dark:border-zinc-800 dark:from-emerald-950/40 dark:to-zinc-950">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Your salary</p>
        <p className="text-3xl font-semibold">£{salary.toLocaleString("en-GB")}</p>
        <p className="mt-4 text-2xl">
          You earn more than approximately{" "}
          <strong className="text-emerald-700 dark:text-emerald-400">
            {p.percentile.toFixed(0)}%
          </strong>{" "}
          of UK adult taxpayers.
        </p>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          That puts you in the <strong>{p.descriptor}</strong>.
        </p>
        <div className="mt-4">
          <ShareBar url={absoluteUrl(`/salary-percentile`)} text={shareText} surface="percentile" salary={salary} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Percentile at a glance</h2>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left dark:bg-zinc-900">
              <tr>
                <th className="p-3">Salary</th>
                <th className="p-3">Percentile</th>
              </tr>
            </thead>
            <tbody>
              {UK_SALARY_PERCENTILES.map((row) => (
                <tr key={row.salary} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="p-3 font-medium">£{row.salary.toLocaleString("en-GB")}</td>
                  <td className="p-3">{row.percentile}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Methodology & disclaimer</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Source: {p.source} ({p.sourceYear}). Percentiles are
          approximate and cover UK adult income tax payers. This tool is
          intended for perspective and is not authoritative or predictive.
          Percentile is a snapshot; individual circumstances vary. Not financial
          advice.
        </p>
      </section>

      <section>
        <Link href={`/salary/${salary}-after-tax`} className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
          See what £{salary.toLocaleString("en-GB")} takes home
        </Link>
      </section>
    </div>
  );
}
