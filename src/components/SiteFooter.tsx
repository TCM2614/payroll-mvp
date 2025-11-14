"use client";

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-brand-border/60 bg-brand-bg/90">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-5 text-[11px] text-brand-textMuted sm:flex-row sm:items-center sm:justify-between">
        <span className="whitespace-nowrap">
          © {new Date().getFullYear()} UK Payroll Take-Home Calculator.
        </span>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/privacy"
            className="transition-colors hover:text-brand-text"
          >
            Privacy Policy
          </Link>
          <Link
            href="/cookies"
            className="transition-colors hover:text-brand-text"
          >
            Cookie Policy
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-brand-text"
          >
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}

