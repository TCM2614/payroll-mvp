"use client";



import Link from "next/link";



export default function MainHeader() {

  return (

    <header className="w-full border-b border-slate-200 bg-white backdrop-blur">

      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-4 md:px-6 py-4">

        <Link href="/" className="flex items-center gap-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-xs font-black text-black shadow-lg">

            PAYE

          </div>

          <span className="text-sm font-semibold tracking-wide text-slate-900">

            UK Payroll Take-Home

          </span>

        </Link>



        <nav className="flex items-center gap-6 text-sm text-slate-700">

          <Link href="/" className="hover:text-slate-900 transition-colors">

            Home

          </Link>

          <Link href="/about" className="hover:text-slate-900 transition-colors">

            About

          </Link>

          <Link href="/privacy" className="hover:text-slate-900 transition-colors">

            Privacy

          </Link>

        </nav>

      </div>

    </header>

  );

}

