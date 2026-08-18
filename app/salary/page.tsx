import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { SALARY_CATALOG, salaryPath } from "@/lib/content/salary-catalog";
import { buildSalaryInsight } from "@/lib/content/insights";

export const metadata: Metadata = buildMetadata({
  title: "UK Salary Explorer — Every Common Salary, After Tax",
  description:
    "Browse take‑home pay for every common UK salary from £18,000 to £150,000 for the 2025/26 tax year.",
  path: "/salary",
});

export default function SalaryIndexPage() {
  const groups = groupCatalog();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Salary explorer", path: "/salary" }]} />
      <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
        UK Salary Explorer
      </h1>
      <p className="mb-8 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Every common UK salary from £18,000 to £150,000. Click any figure to see
        your monthly take‑home, effective tax rate, comparison to nearby
        salaries, and pay‑rise breakdowns.
      </p>
      {Object.entries(groups).map(([label, entries]) => (
        <section key={label} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">{label}</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((e) => {
              const i = buildSalaryInsight(e.salary);
              return (
                <Link
                  key={e.salary}
                  href={salaryPath(e.salary)}
                  className="flex items-baseline justify-between rounded-lg border border-zinc-200 bg-white px-4 py-2 hover:border-emerald-500 hover:bg-emerald-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/50"
                >
                  <span className="font-medium">{i.formatted.gross}</span>
                  <span className="text-sm text-emerald-700 dark:text-emerald-400">
                    {i.formatted.monthly}/mo
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function groupCatalog() {
  const groups: Record<string, typeof SALARY_CATALOG> = {
    "£18k–£30k": [],
    "£30k–£50k": [],
    "£50k–£75k": [],
    "£75k–£100k": [],
    "£100k+": [],
  };
  for (const e of SALARY_CATALOG) {
    if (e.salary < 30_000) groups["£18k–£30k"].push(e);
    else if (e.salary < 50_000) groups["£30k–£50k"].push(e);
    else if (e.salary < 75_000) groups["£50k–£75k"].push(e);
    else if (e.salary < 100_000) groups["£75k–£100k"].push(e);
    else groups["£100k+"].push(e);
  }
  return groups;
}
