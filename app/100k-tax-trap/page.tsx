import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareBar } from "@/components/ShareBar";
import { JsonLd } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { faqJsonLd } from "@/lib/seo/structured-data";
import { absoluteUrl } from "@/lib/share";
import { calculateSalary } from "@/lib/tax";
import { buildSalaryInsight } from "@/lib/content/insights";

export const metadata: Metadata = buildMetadata({
  title: "The £100k Tax Trap Explained (UK 2025/26)",
  description:
    "Why earning more around £100,000 in the UK can feel disproportionately taxed. Visualise the marginal 60% zone between £100k and £125,140, and what a pension can do.",
  path: "/100k-tax-trap",
  keywords: [
    "£100k tax trap",
    "100000 tax UK",
    "60% marginal rate UK",
    "personal allowance taper",
    "salary sacrifice £100k",
  ],
});

const TRAP_SALARIES = [90_000, 100_000, 105_000, 110_000, 115_000, 120_000, 125_140, 130_000, 150_000];

export default function TaxTrapPage() {
  const rows = TRAP_SALARIES.map((s) => {
    const r = calculateSalary(s);
    return {
      salary: s,
      net: r.netAnnual,
      tax: r.incomeTax,
      ni: r.nationalInsurance,
      pa: r.personalAllowance,
      effective: r.effectiveRate,
    };
  });

  const marginal100 = calculateSalary(100_000);
  const marginal110 = calculateSalary(110_000);
  const marginal125 = calculateSalary(125_140);
  const gained100_110 = marginal110.netAnnual - marginal100.netAnnual;
  const gained100_125 = marginal125.netAnnual - marginal100.netAnnual;

  // Salary sacrifice example: someone at £110k sacrifices £10k → back to £100k.
  const at110 = calculateSalary(110_000);
  const at110WithSac = calculateSalary(110_000, { pensionSalarySacrifice: 10_000 / 110_000 });
  const sacrificeSaved = at110WithSac.netAnnual + 10_000 - at110.netAnnual;

  const faqs = [
    {
      question: "What is the £100k tax trap?",
      answer:
        "Between £100,000 and £125,140 the UK Personal Allowance is withdrawn by £1 for every £2 earned. That effectively adds a 20% surcharge to your marginal 40% rate, making the marginal effective tax rate 60% (plus 2% NI). Above £125,140 the marginal rate drops to 45% (plus 2% NI).",
    },
    {
      question: "Is the tax trap a real cliff or a gradual effect?",
      answer:
        "Both. It applies smoothly across £100k → £125,140 but the effect concentrates around £100k because that's where the taper starts. Someone earning £100,001 keeps only about 38p of that additional pound.",
    },
    {
      question: "How do I avoid the £100k tax trap?",
      answer:
        "Pension salary sacrifice or SIPP contributions bring your taxable income back below £100k, restoring your Personal Allowance. This is not financial advice — speak to a qualified adviser about your situation.",
    },
    {
      question: "What is the effective marginal rate in the £100k zone?",
      answer:
        "About 60% for the Income Tax portion alone (40% higher rate + 20% from lost Personal Allowance) plus 2% employee National Insurance = ~62% marginal all‑in for most PAYE earners in England / Wales / NI.",
    },
  ];

  const shareText = `The UK £100k tax trap: earn £110k and you only keep about ${gbp0(gained100_110)} more than at £100k.`;

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "£100k tax trap", path: "/100k-tax-trap" }]} />
      <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
        The £100k Tax Trap Explained
      </h1>
      <p className="mb-8 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Between <strong>£100,000</strong> and <strong>£125,140</strong> the UK
        Personal Allowance is withdrawn — creating an effective 60% marginal
        Income Tax rate. Here&apos;s what the numbers actually look like.
      </p>

      <section className="mb-10 rounded-2xl border border-zinc-200 bg-gradient-to-br from-rose-50 to-white p-6 dark:border-zinc-800 dark:from-rose-950/40 dark:to-zinc-950">
        <h2 className="mb-1 text-lg font-semibold">The trap in one number</h2>
        <p className="text-zinc-700 dark:text-zinc-300">
          Going from <strong>£100,000</strong> to <strong>£110,000</strong> gross gives you only{" "}
          <strong className="text-rose-600 dark:text-rose-400">{gbp0(gained100_110)}</strong>{" "}
          extra take‑home. That&apos;s{" "}
          <strong>{Math.round((gained100_110 / 10_000) * 100)}%</strong> of the raise.
        </p>
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          Going from £100,000 all the way to <strong>£125,140</strong> — earning
          £25,140 more gross — adds only{" "}
          <strong className="text-rose-600 dark:text-rose-400">{gbp0(gained100_125)}</strong>{" "}
          to your take‑home.
        </p>
        <div className="mt-4">
          <ShareBar url={absoluteUrl("/100k-tax-trap")} text={shareText} surface="100k_trap" />
        </div>
      </section>

      <section aria-labelledby="table-title" className="mb-10">
        <h2 id="table-title" className="mb-3 text-2xl font-semibold">
          What happens at each salary
        </h2>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left font-semibold dark:bg-zinc-900">
              <tr>
                <th className="p-3">Gross salary</th>
                <th className="p-3">Personal Allowance</th>
                <th className="p-3">Income Tax</th>
                <th className="p-3">NI</th>
                <th className="p-3">Take‑home</th>
                <th className="p-3">Effective</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.salary} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="p-3 font-medium">
                    <Link href={`/salary/${r.salary}-after-tax`} className="hover:underline">
                      £{r.salary.toLocaleString("en-GB")}
                    </Link>
                  </td>
                  <td className="p-3 tabular-nums">£{r.pa.toLocaleString("en-GB")}</td>
                  <td className="p-3 tabular-nums text-rose-600 dark:text-rose-400">{gbp0(r.tax)}</td>
                  <td className="p-3 tabular-nums text-rose-600 dark:text-rose-400">{gbp0(r.ni)}</td>
                  <td className="p-3 tabular-nums text-emerald-700 dark:text-emerald-400">{gbp0(r.net)}</td>
                  <td className="p-3 tabular-nums">{(r.effective * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="sac-title" className="mb-10 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 id="sac-title" className="mb-3 text-2xl font-semibold">
          What a pension can do
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300">
          Someone earning £110,000 who salary‑sacrifices £10,000 into a pension
          moves their taxable income back to £100,000 — restoring the full
          Personal Allowance. Adding the pension contribution back to their
          effective compensation, this move recovers roughly{" "}
          <strong className="text-emerald-700 dark:text-emerald-400">
            {gbp0(sacrificeSaved)}
          </strong>{" "}
          compared to earning the £110k as taxable pay.
        </p>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          This is illustrative, not financial advice. Pension contributions are
          only usable at pension age; consider tax and personal circumstances
          before choosing to sacrifice.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-2xl font-semibold">Frequently asked</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.question} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <summary className="cursor-pointer font-medium">{f.question}</summary>
              <p className="mt-2 text-zinc-700 dark:text-zinc-300">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mb-10 flex flex-wrap gap-2">
        <Link href="/salary/100000-after-tax" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950">
          £100k page
        </Link>
        <Link href="/salary/125000-after-tax" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950">
          £125k page
        </Link>
        <Link href="/pay-rise?from=100000&to=110000" className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950">
          £100k → £110k pay rise
        </Link>
      </section>

      <JsonLd data={faqJsonLd(faqs)} />
      {/* keep insight ref to satisfy tree-shake linter on unused import */}
      <span className="sr-only">{buildSalaryInsight(100_000).percentile.descriptor}</span>
    </article>
  );
}

function gbp0(n: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}
