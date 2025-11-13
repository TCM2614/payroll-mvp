"use client";

import * as React from "react";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";

export default function ContractingPage() {
  const [mode, setMode] = React.useState<"compare" | "combined">("compare");

  return (
    <AppShell>
      <main className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-6 space-y-6">
        <section className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Contracting structures – compare and combine
          </h1>
          <p className="text-sm text-slate-700">
            Understand how Standard PAYE, umbrella and limited company (inside IR35) are
            treated in the calculator, and how to think about combining multiple income
            sources.
          </p>
        </section>

        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-700">
            Switch between an overview of each structure and guidance on combining income.
          </p>
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setMode("compare")}
              className={
                "px-3 py-1.5 rounded-full transition-colors " +
                (mode === "compare"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-50")
              }
            >
              Compare
            </button>
            <button
              type="button"
              onClick={() => setMode("combined")}
              className={
                "px-3 py-1.5 rounded-full transition-colors " +
                (mode === "combined"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-50")
              }
            >
              Combined
            </button>
          </div>
        </section>

        {mode === "compare" && (
          <section className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-2">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                Standard PAYE
              </h2>
              <p className="text-sm text-slate-700">
                This is traditional UK employment through PAYE. Your employer deducts
                income tax and National Insurance before you are paid. Use the{" "}
                <span className="font-semibold">Standard PAYE</span> tab in the main
                calculator to model this, including pension and student loan.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-2">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                Umbrella (inside IR35)
              </h2>
              <p className="text-sm text-slate-700">
                With an umbrella company you are treated like an employee for tax
                purposes. Income is usually inside IR35 and taxed via PAYE. Use the{" "}
                <span className="font-semibold">Umbrella</span> tab to model day, hourly
                or monthly rates as PAYE income, including tax, NI and pension.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-2">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                Limited company (inside vs outside IR35)
              </h2>
              <p className="text-sm text-slate-700">
                As a limited company contractor, work can be inside or outside IR35.
                Inside IR35 is taxed broadly like employment, which the{" "}
                <span className="font-semibold">Limited company</span> tab models using
                PAYE-style rules. Outside IR35 involves company profits and dividends.
                That full outside IR35 modelling is <span className="font-semibold">
                  not yet supported
                </span> in the calculator – you&apos;ll see a clear message on the
                Limited tab when that scenario applies.
              </p>
            </section>
          </section>
        )}

        {mode === "combined" && (
          <section className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-2">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                Combining multiple income sources
              </h2>
              <p className="text-sm text-slate-700">
                Many people have more than one source of income – for example a main
                PAYE job plus a second job, or a mix of employment and umbrella or
                limited company work. The main calculator focuses on one income stream
                at a time so that the tax rules stay clear.
              </p>
              <p className="text-sm text-slate-700">
                For now, to understand your overall position you can calculate each
                income separately in the main calculator tabs, then compare the net
                figures. Future versions of this tool will add more support for
                combining multiple jobs and income types in a single view.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                How to use the calculator today
              </h3>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
                <li>
                  Use the <span className="font-semibold">Standard PAYE</span>,
                  <span className="font-semibold"> Umbrella</span> or
                  <span className="font-semibold"> Limited company</span> tab to model
                  each income stream separately.
                </li>
                <li>
                  Note the net annual or monthly income for each scenario from the
                  results section.
                </li>
                <li>
                  Add those net amounts together to see your total take-home across all
                  sources.
                </li>
              </ol>
              <p className="text-[11px] text-slate-500">
                Note: we do not yet model complex interactions between multiple jobs,
                such as shared tax codes or self-assessment adjustments. Treat this as a
                guide rather than a full combined tax calculation.
              </p>
              <div className="pt-2">
                <a
                  href="/calc"
                  className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Open the main calculator
                </a>
              </div>
            </section>
          </section>
        )}
      </main>
    </AppShell>
  );
}
