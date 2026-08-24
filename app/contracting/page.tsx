"use client";

import * as React from "react";
import Link from "next/link";

export default function ContractingPage() {
  const [mode, setMode] = React.useState<"compare" | "combined">("compare");

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-10 pt-6 sm:pt-8">
      <section className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-text">
          Contracting structures – compare and combine
        </h1>
        <p className="text-sm text-brand-textMuted">
          Understand how Standard PAYE, umbrella and limited company (inside IR35) are
          treated in the calculator, and how to think about combining multiple income
          sources.
        </p>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-brand-textMuted">
          Switch between an overview of each structure and guidance on combining income.
        </p>
        <div className="inline-flex rounded-full border border-brand-border/70 bg-brand-surface/80 px-1 py-1 text-xs sm:text-sm backdrop-blur">
          <button
            type="button"
            onClick={() => setMode("compare")}
            className={
              "px-3 py-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/70 " +
              (mode === "compare"
                ? "bg-brand-primary text-white shadow-soft-xl"
                : "text-brand-textMuted hover:text-brand-text hover:bg-brand-border/40")
            }
          >
            Compare
          </button>
          <button
            type="button"
            onClick={() => setMode("combined")}
            className={
              "px-3 py-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/70 " +
              (mode === "combined"
                ? "bg-brand-primary text-white shadow-soft-xl"
                : "text-brand-textMuted hover:text-brand-text hover:bg-brand-border/40")
            }
          >
            Combined
          </button>
        </div>
      </section>

        {mode === "compare" && (
          <section className="space-y-4">
            <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-4 sm:p-5 shadow-soft-xl backdrop-blur space-y-2">
              <h2 className="text-sm sm:text-base font-semibold text-brand-text">
                Standard PAYE
              </h2>
              <p className="text-sm text-brand-textMuted">
                This is traditional UK employment through PAYE. Your employer deducts
                income tax and National Insurance before you are paid. Use the{" "}
                <span className="font-semibold text-brand-text">Standard PAYE</span> tab in the main
                calculator to model this, including pension and student loan.
              </p>
            </section>

            <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-4 sm:p-5 shadow-soft-xl backdrop-blur space-y-2">
              <h2 className="text-sm sm:text-base font-semibold text-brand-text">
                Umbrella (inside IR35)
              </h2>
              <p className="text-sm text-brand-textMuted">
                With an umbrella company you are treated like an employee for tax
                purposes. Income is usually inside IR35 and taxed via PAYE. Use the{" "}
                <span className="font-semibold text-brand-text">Umbrella</span> tab to model day, hourly
                or monthly rates as PAYE income, including tax, NI and pension.
              </p>
            </section>

            <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-4 sm:p-5 shadow-soft-xl backdrop-blur space-y-2">
              <h2 className="text-sm sm:text-base font-semibold text-brand-text">
                Limited company (inside vs outside IR35)
              </h2>
              <p className="text-sm text-brand-textMuted">
                As a limited company contractor, work can be inside or outside IR35.
                Inside IR35 is taxed broadly like employment, which the{" "}
                <span className="font-semibold text-brand-text">Limited company</span> tab models using
                PAYE-style rules. Outside IR35 involves company profits and dividends.
                That full outside IR35 modelling is <span className="font-semibold text-brand-text">
                  not yet supported
                </span> in the calculator – you&apos;ll see a clear message on the
                Limited tab when that scenario applies.
              </p>
            </section>
          </section>
        )}

        {mode === "combined" && (
          <section className="space-y-4">
            <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-4 sm:p-5 shadow-soft-xl backdrop-blur space-y-2">
              <h2 className="text-sm sm:text-base font-semibold text-brand-text">
                Combining multiple income sources
              </h2>
              <p className="text-sm text-brand-textMuted">
                Many people have more than one source of income – for example a main
                PAYE job plus a second job, or a mix of employment and umbrella or
                limited company work. The main calculator focuses on one income stream
                at a time so that the tax rules stay clear.
              </p>
              <p className="text-sm text-brand-textMuted">
                For now, to understand your overall position you can calculate each
                income separately in the main calculator tabs, then compare the net
                figures. Future versions of this tool will add more support for
                combining multiple jobs and income types in a single view.
              </p>
            </section>

            <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-4 sm:p-5 shadow-soft-xl backdrop-blur space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-brand-text">
                How to use the calculator today
              </h3>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-brand-textMuted">
                <li>
                  Use the <span className="font-semibold text-brand-text">Standard PAYE</span>,
                  <span className="font-semibold text-brand-text"> Umbrella</span> or
                  <span className="font-semibold text-brand-text"> Limited company</span> tab to model
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
              <p className="text-[11px] text-brand-textMuted">
                Note: we do not yet model complex interactions between multiple jobs,
                such as shared tax codes or self-assessment adjustments. Treat this as a
                guide rather than a full combined tax calculation.
              </p>
              <div className="pt-2">
                <Link
                  href="/calc"
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-primarySoft to-brand-primary px-4 py-2 text-sm font-medium text-white shadow-soft-xl hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/70 transition-colors"
                >
                  Open the main calculator
                </Link>
              </div>
            </section>
          </section>
        )}
    </main>
  );
}
