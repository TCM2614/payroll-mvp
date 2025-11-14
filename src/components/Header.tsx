'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator, LineChart, Info } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Calculator', icon: Calculator },
  { href: '/scenarios', label: 'Scenarios', icon: LineChart },
  { href: '/about', label: 'About', icon: Info },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border/60 bg-brand-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-accent shadow-soft-xl">
            <span className="text-sm font-semibold text-white">UK</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-brand-text">
              Take-Home
            </span>
            <span className="text-xs font-normal text-brand-textMuted">
              PAYE · NI · Pension
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 rounded-full border border-brand-border/70 bg-brand-surface/80 px-1 py-1 text-xs sm:flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors',
                  isActive
                    ? 'bg-brand-primary text-white shadow-soft-xl'
                    : 'text-brand-textMuted hover:text-brand-text hover:bg-brand-border/40',
                ].join(' ')}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-brand-textMuted sm:inline">
            Tax year 2024/25
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-primarySoft to-brand-primary px-3 py-1.5 text-xs font-medium text-white shadow-soft-xl hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/70"
          >
            New scenario
          </button>
        </div>
      </div>
    </header>
  );
}

