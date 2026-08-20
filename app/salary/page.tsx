import type { Metadata } from "next";
import Link from "next/link";
import {
  SALARY_CATALOG,
  salaryPath,
} from "@/lib/marketing/salaryCatalog";
import { buildSalaryInsight } from "@/lib/marketing/salaryInsight";
import { TAX_YEAR } from "../lib/taxYear";
import { SITE_URL } from "@/lib/siteUrl";


export const metadata: Metadata = {
  title: `UK Salary Explorer ${TAX_YEAR} — Every Common Salary, After Tax`,
  description: `Browse the take-home pay for every common UK salary from £18,000 to £150,000 for the ${TAX_YEAR} tax year. Free UK PAYE breakdowns for every salary.`,
  keywords:
    "UK salary explorer, UK salary after tax, take home pay UK, salary calculator",
  alternates: { canonical: `${SITE_URL}/salary` },
  openGraph: {
    title: `UK Salary Explorer — ${TAX_YEAR} Take-Home Pay`,
    description: `Every common UK salary from £18k to £150k with monthly take-home for the ${TAX_YEAR} tax year.`,
    url: `${SITE_URL}/salary`,
    siteName: "UK Take-Home Calculator",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: `${SITE_URL}/api/og-salary?salary=50000`,
        width: 1200,
        height: 630,
        alt: `UK salary explorer ${TAX_YEAR}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `UK Salary Explorer — ${TAX_YEAR}`,
    description: `Take-home for every common UK salary £18k–£150k.`,
    images: [`${SITE_URL}/api/og-salary?salary=50000`],
  },
};

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

export default function SalaryIndexPage() {
  const groups = groupCatalog();
  return (
    <div className="space-y-6">
      <section className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          UK · {TAX_YEAR}
        </span>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          UK Salary Explorer
        </h1>
        <p className="text-balance text-sm text-brand-textMuted sm:text-base">
          Every common UK salary from £18,000 to £150,000, with monthly
          take-home computed by the same deterministic PAYE engine as the
          main calculator. Click any figure for the full breakdown, adjacent
          salaries, and pay-rise math.
        </p>
      </section>

      {Object.entries(groups).map(([label, entries]) =>
        entries.length === 0 ? null : (
          <section
            key={label}
            className="mx-auto max-w-4xl space-y-3 rounded-3xl border border-brand-border/60 bg-brand-surface/60 p-6 backdrop-blur sm:p-8"
          >
            <h2 className="text-lg font-semibold text-brand-text">{label}</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((e) => {
                const i = buildSalaryInsight(e.salary);
                return (
                  <Link
                    key={e.salary}
                    href={salaryPath(e.salary)}
                    className="flex items-baseline justify-between rounded-lg border border-brand-border/50 bg-brand-bg/40 px-4 py-2 transition hover:border-brand-primary/60 hover:bg-brand-bg/60"
                  >
                    <span className="font-medium text-brand-text">
                      {i.formatted.gross}
                    </span>
                    <span className="text-sm text-emerald-300">
                      {i.formatted.monthly}/mo
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ),
      )}
    </div>
  );
}
