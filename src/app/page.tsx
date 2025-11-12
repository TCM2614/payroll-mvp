"use client";

import Link from "next/link";



export default function Home() {

  return (

    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">

      <div className="max-w-2xl text-center">

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">

          UK Payroll Take-Home Calculator

        </h1>

        <p className="mb-8 text-zinc-600 dark:text-zinc-400">

          Compare PAYE, Umbrella and Limited company income side-by-side. Fast,

          accurate, and made for contractors.

        </p>

        <Link

          href="/calc"

          className="rounded-xl bg-zinc-900 px-6 py-3 text-white font-medium hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition"

        >

          Launch Calculator

        </Link>

      </div>

    </main>

  );

}
