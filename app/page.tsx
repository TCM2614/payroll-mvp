import Link from "next/link";
import { Calculator } from "@/components/Calculator";
import { LANDMARK_SALARIES, salaryPath } from "@/lib/content/salary-catalog";
import { SITE_TAGLINE } from "@/lib/seo/site";
import { buildSalaryInsight } from "@/lib/content/insights";

export default function Home() {
  const featured = [30_000, 40_000, 50_000, 75_000, 100_000, 150_000].map(
    (s) => buildSalaryInsight(s),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <section aria-labelledby="hero-title" className="mb-10 text-center sm:mb-14">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          UK 2025/26
        </p>
        <h1 id="hero-title" className="text-3xl font-bold tracking-tight sm:text-5xl">
          {SITE_TAGLINE}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
          See exactly what you keep after Income Tax, National Insurance, pension
          and student loan deductions. Free, private, and fast.
        </p>
      </section>

      <section aria-labelledby="calculator-title" className="mb-14">
        <h2 id="calculator-title" className="sr-only">
          Take‑home calculator
        </h2>
        <Calculator />
      </section>

      <section aria-labelledby="explore-title" className="mb-14">
        <h2 id="explore-title" className="mb-4 text-2xl font-semibold">
          Explore common UK salaries
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((f) => (
            <Link
              key={f.salary}
              href={f.path}
              className="block rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-emerald-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {f.formatted.gross} salary
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
                {f.formatted.monthly}
                <span className="ml-1 text-sm font-normal text-zinc-500">/mo</span>
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                You keep {f.formatted.retainedPercent}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="graph-title" className="mb-14">
        <h2 id="graph-title" className="mb-4 text-2xl font-semibold">
          Salary explorer
        </h2>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          Jump straight to a common UK salary.
        </p>
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

      <section aria-labelledby="tools-title" className="mb-14">
        <h2 id="tools-title" className="mb-4 text-2xl font-semibold">
          Beyond the calculator
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard
            href="/pay-rise"
            title="Pay rise calculator"
            description="Your boss offers a raise — how much do you actually keep?"
          />
          <ToolCard
            href="/compare"
            title="Salary comparison"
            description="Compare two UK salaries side by side. See the real difference."
          />
          <ToolCard
            href="/100k-tax-trap"
            title="The £100k tax trap"
            description="Why earning more around £100,000 can feel disproportionately taxed."
          />
          <ToolCard
            href="/salary-percentile"
            title="How rich are you?"
            description="See where your salary ranks against UK workers."
          />
          <ToolCard
            href="/calculator?umbrella=true"
            title="Umbrella / Inside IR35"
            description="See what a contractor day‑rate really takes home."
          />
          <ToolCard
            href="/salary"
            title="Every salary, every month"
            description="Browse pages for common UK salaries from £18k to £150k."
          />
        </div>
      </section>
    </div>
  );
}

function ToolCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-emerald-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
    >
      <p className="text-lg font-semibold group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
        {title}
      </p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </Link>
  );
}
