"use client";

import Link from "next/link";
import { TAX_YEAR } from "./lib/taxYear";



export default function Home() {

  return (

    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      <div className="mb-4 inline-flex rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
        Tax year {TAX_YEAR}
      </div>

      <h1 className="mb-4 text-4xl font-bold">UK Payroll Take-Home Calculator</h1>

      <p className="mb-8 text-zinc-600 dark:text-zinc-400">

        Compare PAYE, Umbrella & Limited company take-home pay — live, fast and accurate.

      </p>

      <Link

        href="/calc"

        className="rounded-xl bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"

      >

        Launch Calculator

      </Link>

    </main>

  );

}
