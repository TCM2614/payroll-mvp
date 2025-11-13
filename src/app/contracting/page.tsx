"use client";

import AppShell from "@/components/layout/AppShell";
import Link from "next/link";

export default function ContractingPage() {
  return (
    <AppShell>
      <main className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-6 space-y-6">
        <section className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Contracting structures – at a glance
          </h1>
          <p className="text-sm text-slate-700">
            Compare how Standard PAYE, umbrella and limited company (inside IR35)
            affect how your income is taxed. This page is a simple overview –
            use the calculator tabs to run real numbers.
          </p>
        </section>

        {/* Standard PAYE */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-2">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900">
            Standard PAYE
          </h2>
          <p className="text-sm text-slate-700">
            Traditional employment where your employer deducts tax and National Insurance
            before you receive your pay. The &quot;Standard PAYE&quot; tab in the main calculator
            models this structure.
          </p>
          <p className="text-xs text-slate-600">
            <Link href="/calc" className="text-indigo-600 hover:text-indigo-700 underline">
              Use the Standard tab in the calculator
            </Link>{" "}
            to see your take-home pay.
          </p>
        </section>

        {/* Umbrella */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-2">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900">
            Umbrella (inside IR35)
          </h2>
          <p className="text-sm text-slate-700">
            Inside IR35, paid via an umbrella company, treated like PAYE employment in the calculator.
            The umbrella company invoices the client and pays you through PAYE after deducting
            their margin, tax, and National Insurance.
          </p>
          <p className="text-xs text-slate-600">
            <Link href="/calc" className="text-indigo-600 hover:text-indigo-700 underline">
              Use the Umbrella tab in the calculator
            </Link>{" "}
            to model your take-home pay.
          </p>
        </section>

        {/* Limited Company */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-2">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900">
            Limited company (inside IR35 vs outside IR35)
          </h2>
          <p className="text-sm text-slate-700">
            <strong>Inside IR35:</strong> Treated as PAYE employment for tax purposes. Income is
            subject to PAYE and National Insurance, similar to umbrella or standard employment.
            The calculator models this on the Limited tab when you select &quot;Inside IR35&quot;.
          </p>
          <p className="text-sm text-slate-700">
            <strong>Outside IR35:</strong> Not yet modelled in this calculator. The Limited tab
            shows a &quot;not supported&quot; message when you select &quot;Outside IR35&quot;.
            This would involve different tax treatment with dividends and corporation tax, which
            is not currently supported.
          </p>
          <p className="text-xs text-slate-600">
            <Link href="/calc" className="text-indigo-600 hover:text-indigo-700 underline">
              Use the Limited tab in the calculator
            </Link>{" "}
            and select your IR35 status to see available calculations.
          </p>
        </section>
      </main>
    </AppShell>
  );
}
