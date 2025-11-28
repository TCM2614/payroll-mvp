'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator, LineChart, Info, Menu, X, Coins, Briefcase } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Calculator },
  { href: '/calc', label: 'Calculator', icon: Calculator },
  { href: '/capital-gains-tax', label: 'CGT', icon: Coins },
  { href: '/business-tax', label: 'Business', icon: Briefcase },
  { href: '/dashboard', label: 'Dashboard (Coming Soon)', icon: LineChart },
  { href: '/about', label: 'About', icon: Info },
  { href: '/privacy', label: 'Privacy', icon: Info },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        {/* Nav - Desktop: pill-style navigation */}
        <nav className="hidden items-center gap-1 rounded-full border border-brand-border/70 bg-brand-surface/80 px-1 py-1 text-xs sm:flex backdrop-blur">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== '/' && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/70',
                  isActive
                    ? 'bg-brand-primary text-emerald-400 shadow-soft-xl'
                    : 'text-brand-textMuted hover:text-brand-text hover:bg-brand-border/40',
                ].join(' ')}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Tax year - Desktop */}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs text-brand-textMuted">Tax year 2024/25</span>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full p-2 text-brand-text hover:bg-brand-surface/60 sm:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Nav Panel */}
      {mobileMenuOpen && (
        <div className="border-t border-brand-border/60 bg-brand-bg/95 px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href || (href !== '/' && pathname?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={[
                    'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-primary/20 text-emerald-400'
                      : 'text-brand-textMuted hover:bg-brand-surface/60 hover:text-brand-text',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

