'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

import AppShell from '@/components/layout/AppShell';
import { StickySummary } from '@/components/StickySummary';
import { formatGBP } from '@/lib/format';
import {
  calculateSoleTrader,
  calculateCorpTax,
  type SoleTraderResult,
  type CorpTaxResult,
} from '@/utils/tax-calculations';

const BusinessChart = dynamic(() => import('@/components/charts/BusinessTaxBreakdownChart'), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full animate-pulse rounded-3xl border border-slate-800 bg-slate-900/60" />
  ),
});

const parseCurrency = (value: string): number => {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const numeric = parseFloat(cleaned);
  return Number.isFinite(numeric) ? numeric : 0;
};

const dividendRateForProfit = (profit: number): number => {
  if (profit <= 50270) return 0.0875;
  if (profit <= 125140) return 0.3375;
  return 0.3935;
};

type Mode = 'sole' | 'limited';

export default function BusinessTaxClient() {
  console.log('BusinessTaxClient Rendering');

  const [mode, setMode] = useState<Mode>('sole');
  const [profitInput, setProfitInput] = useState('90000');
  const [dividendInput, setDividendInput] = useState('30000');

  const parsedProfit = useMemo(() => Math.max(0, parseCurrency(profitInput)), [profitInput]);
  const parsedDividend = useMemo(() => Math.max(0, parseCurrency(dividendInput)), [dividendInput]);

  const [soleResult, setSoleResult] = useState<SoleTraderResult>(() =>
    calculateSoleTrader({ profit: parsedProfit }),
  );
  const [corpResult, setCorpResult] = useState<CorpTaxResult>(() =>
    calculateCorpTax({ profit: parsedProfit }),
  );

  useEffect(() => {
    setSoleResult(calculateSoleTrader({ profit: parsedProfit }));
    setCorpResult(calculateCorpTax({ profit: parsedProfit }));
  }, [parsedProfit]);

  const limitedView = useMemo(() => {
    const availablePostTax = Math.max(corpResult.netProfit, 0);
    const dividendsRequested = Math.min(parsedDividend, availablePostTax);
    const dividendAllowance = 1000;
    const taxableDividend = Math.max(dividendsRequested - dividendAllowance, 0);
    const dividendTaxRate = dividendRateForProfit(parsedProfit);
    const dividendTax = taxableDividend * dividendTaxRate;
    const netDividend = Math.max(dividendsRequested - dividendTax, 0);
    const retainedProfit = Math.max(availablePostTax - dividendsRequested, 0);
    const totalTax = corpResult.corporationTax + dividendTax;
    const netResult = netDividend + retainedProfit;
    const effectiveRate = parsedProfit > 0 ? totalTax / parsedProfit : 0;

    return {
      availablePostTax,
      dividendsRequested,
      dividendTax,
      netDividend,
      retainedProfit,
      totalTax,
      netResult,
      effectiveRate,
    };
  }, [corpResult, parsedDividend, parsedProfit]);

  const chartData = useMemo(() => {
    if (mode === 'sole') {
      return [
        {
          name: 'Sole Trader',
          incomeTax: soleResult.incomeTax,
          ni: soleResult.class4NI,
          net: soleResult.netProfit,
        },
      ];
    }

    return [
      {
        name: 'Limited Company',
        corpTax: corpResult.corporationTax,
        dividendTax: limitedView.dividendTax,
        net: limitedView.netResult,
      },
    ];
  }, [mode, soleResult, corpResult, limitedView]);

  const summarySnapshot = useMemo(() => {
    if (mode === 'sole') {
      return {
        grossAnnual: parsedProfit,
        netAnnual: soleResult.netProfit,
        taxAnnual: soleResult.incomeTax,
        niAnnual: soleResult.class4NI,
        pensionAnnual: 0,
      };
    }

    return {
      grossAnnual: parsedProfit,
      netAnnual: limitedView.netResult,
      taxAnnual: corpResult.corporationTax,
      niAnnual: limitedView.dividendTax,
      pensionAnnual: 0,
    };
  }, [mode, parsedProfit, soleResult, corpResult, limitedView]);

  return (
    <AppShell>
      <div className="space-y-10 text-white">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-soft-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">
            Business tax planning · 2024/25
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Compare Sole Trader vs Limited Company tax
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Toggle between sole trader Class 4 National Insurance plus income tax or limited company corporation tax with dividend drawdowns.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Mode</h2>
            <div className="inline-flex rounded-full border border-slate-700 bg-slate-900/70 p-1 text-sm">
              {(
                [
                  { value: 'sole', label: 'Sole Trader' },
                  { value: 'limited', label: 'Limited Company' },
                ] as { value: Mode; label: string }[]
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMode(option.value)}
                  className={[
                    'rounded-full px-4 py-2 font-medium transition-colors',
                    mode === option.value
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                      : 'text-white/70 hover:text-white',
                  ].join(' ')}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-white/80">
              Annual profit before tax
              <input
                type="text"
                inputMode="decimal"
                value={profitInput}
                onChange={(e) => setProfitInput(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white placeholder:text-white/40"
                placeholder="e.g. 90000"
              />
            </label>

            {mode === 'limited' && (
              <label className="block text-sm font-medium text-white/80">
                Dividend withdrawal (optional)
                <input
                  type="text"
                  inputMode="decimal"
                  value={dividendInput}
                  onChange={(e) => setDividendInput(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white placeholder:text-white/40"
                  placeholder="e.g. 30000"
                />
                <p className="mt-1 text-xs text-white/60">
                  Capped at post-corporation-tax profit ({formatGBP(limitedView.availablePostTax)} available).
                </p>
              </label>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold">Breakdown</h2>
            {mode === 'sole' ? (
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Income tax</dt>
                  <dd className="mt-1 text-2xl font-semibold text-emerald-400">
                    {formatGBP(soleResult.incomeTax)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Class 4 NI</dt>
                  <dd className="mt-1 text-2xl font-semibold text-emerald-400">
                    {formatGBP(soleResult.class4NI)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Net profit after tax</dt>
                  <dd className="mt-1 text-3xl font-semibold text-emerald-300">
                    {formatGBP(soleResult.netProfit)}
                  </dd>
                  <p className="text-[11px] text-white/60">
                    Effective tax rate {Math.round(soleResult.effectiveRate * 1000) / 10}%
                  </p>
                </div>
              </dl>
            ) : (
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Corporation tax</dt>
                  <dd className="mt-1 text-2xl font-semibold text-emerald-400">
                    {formatGBP(corpResult.corporationTax)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Dividend tax</dt>
                  <dd className="mt-1 text-2xl font-semibold text-emerald-400">
                    {formatGBP(limitedView.dividendTax)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Net dividends</dt>
                  <dd className="mt-1 text-2xl font-semibold text-emerald-300">
                    {formatGBP(limitedView.netDividend)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Retained profit</dt>
                  <dd className="mt-1 text-2xl font-semibold text-emerald-300">
                    {formatGBP(limitedView.retainedProfit)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Effective tax rate</dt>
                  <dd className="mt-1 text-3xl font-semibold text-emerald-300">
                    {Math.round(limitedView.effectiveRate * 1000) / 10}%
                  </dd>
                </div>
              </dl>
            )}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold">Tax vs net income</h2>
            <BusinessChart data={chartData} />
          </div>
        </section>
      </div>

      <StickySummary
        grossAnnual={summarySnapshot.grossAnnual}
        netAnnual={summarySnapshot.netAnnual}
        taxAnnual={summarySnapshot.taxAnnual}
        niAnnual={summarySnapshot.niAnnual}
        pensionAnnual={summarySnapshot.pensionAnnual}
      />
    </AppShell>
  );
}
