import Link from "next/link";
import { SITE_NAME } from "@/lib/seo/site";

const nav = [
  { href: "/calculator", label: "Calculator" },
  { href: "/salary", label: "Salary explorer" },
  { href: "/pay-rise", label: "Pay rise" },
  { href: "/100k-tax-trap", label: "£100k trap" },
  { href: "/salary-percentile", label: "How rich are you?" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/85 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight sm:text-base"
          aria-label={`${SITE_NAME} home`}
        >
          <span className="text-emerald-600 dark:text-emerald-400">UK</span>{" "}
          <span className="hidden sm:inline">Take Home Calculator</span>
          <span className="sm:hidden">Take Home</span>
        </Link>
        <nav
          aria-label="Primary"
          className="flex items-center gap-1 overflow-x-auto text-sm text-zinc-600 dark:text-zinc-300"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-2 py-1 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-zinc-200 py-10 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            {SITE_NAME}
          </p>
          <p className="mt-2 max-w-md">
            The easiest way to understand your money. Free UK take‑home
            calculator for PAYE, contractors and salary sacrifice — with no
            paywalls on the core calculator.
          </p>
        </div>
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">Tools</p>
          <ul className="mt-2 space-y-1">
            <li>
              <Link href="/calculator">Salary calculator</Link>
            </li>
            <li>
              <Link href="/pay-rise">Pay rise calculator</Link>
            </li>
            <li>
              <Link href="/compare">Salary comparison</Link>
            </li>
            <li>
              <Link href="/100k-tax-trap">£100k tax trap</Link>
            </li>
            <li>
              <Link href="/salary-percentile">Salary percentile</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">Info</p>
          <ul className="mt-2 space-y-1">
            <li>
              <Link href="/methodology">Methodology</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/sitemap.xml">Sitemap</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-6xl px-4 text-xs text-zinc-500">
        Calculations use HMRC 2025/26 rates. Figures are estimates and not
        financial advice. See methodology for sources and limitations.
      </div>
    </footer>
  );
}
