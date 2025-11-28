'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

import AppShell from '@/components/layout/AppShell';
import { StickySummary } from '@/components/StickySummary';
import { formatGBP } from '@/lib/format';
import { MoneyInput } from '@/components/ui/MoneyInput';
import {
  calculateSoleTrader,
  calculateCorpTax,
  type SoleTraderResult,
  type CorpTaxResult,
} from '@/utils/tax-calculations';

const BusinessChart = dynamic(() => import('@/components/charts/BusinessTaxBreakdownChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full animate-pulse rounded-xl border border-slate-700 bg-slate-800/50" />
  ),
});

const dividendRateForProfit = (profit: number): number => {
  if (profit <= 50270) return 0.0875;
  if (profit <= 125140) return 0.3375;
  return 0.3935;
};

type Mode = 'sole' | 'limited';

export default function BusinessTaxClient() {
  console.log('BusinessTaxClient Rendering');

  const [mode, setMode] = useState<Mode>('sole');
  const [profitInput, setProfitInput] = useState(90000);
  const [dividendInput, setDividendInput] = useState(30000);

  const parsedProfit = useMemo(() => Math.max(0, profitInput ?? 0), [profitInput]);
  const parsedDividend = useMemo(() => Math.max(0, dividendInput ?? 0), [dividendInput]);

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
          mode: 'sole' as const,
          incomeTax: soleResult.incomeTax,
          ni: soleResult.class4NI,
          net: soleResult.netProfit,
        },
      ];
    }

    return [
      {
        name: 'Limited Company',
        mode: 'limited' as const,
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
            <div className="flex w-full gap-1 rounded-lg bg-slate-700 p-1 text-sm sm:w-auto">
              {(
                [
                  { value: 'sole', label: 'Sole Trader' },
                  { value: 'limited', label: 'Limited Company' },
                ] as { value: Mode; label: string }[]
              ).map((option) => {
                const isActive = mode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMode(option.value)}
                    className={[
                      'flex-1 rounded-md px-4 py-2 font-semibold transition-all',
                      isActive
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-white/80">
              Annual profit before tax
              <div className="mt-1">
                <MoneyInput
                  value={profitInput}
                  onValueChange={setProfitInput}
                  placeholder="e.g. 90,000"
                  aria-label="Annual profit before tax"
                />
              </div>
            </label>

            {mode === 'limited' && (
              <label className="block text-sm font-medium text-white/80">
                Dividend withdrawal (optional)
                <div className="mt-1">
                  <MoneyInput
                    value={dividendInput}
                    onValueChange={setDividendInput}
                    placeholder="e.g. 30,000"
                    aria-label="Dividend withdrawal amount"
                  />
                </div>
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
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
                  <dt className="text-sm font-medium uppercase tracking-wider text-slate-400">
                    Income tax
                  </dt>
                  <dd className="mt-2 text-3xl font-bold text-slate-100">
                    {formatGBP(soleResult.incomeTax)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
                  <dt className="text-sm font-medium uppercase tracking-wider text-slate-400">
                    Class 4 NI
                  </dt>
                  <dd className="mt-2 text-3xl font-bold text-slate-100">
                    {formatGBP(soleResult.class4NI)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm sm:col-span-2">
                  <dt className="text-sm font-medium uppercase tracking-wider text-slate-400">
                    Net profit after tax
                  </dt>
                  <dd className="mt-2 text-3xl font-bold text-slate-100">
                    {formatGBP(soleResult.netProfit)}
                  </dd>
                  <p className="text-xs text-slate-400">
                    Effective tax rate {Math.round(soleResult.effectiveRate * 1000) / 10}%
                  </p>
                </div>
              </dl>
            ) : (
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
                  <dt className="text-sm font-medium uppercase tracking-wider text-slate-400">
                    Corporation tax
                  </dt>
                  <dd className="mt-2 text-3xl font-bold text-slate-100">
                    {formatGBP(corpResult.corporationTax)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
                  <dt className="text-sm font-medium uppercase tracking-wider text-slate-400">
                    Dividend tax
                  </dt>
                  <dd className="mt-2 text-3xl font-bold text-slate-100">
                    {formatGBP(limitedView.dividendTax)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
                  <dt className="text-sm font-medium uppercase tracking-wider text-slate-400">
                    Net dividends
                  </dt>
                  <dd className="mt-2 text-3xl font-bold text-slate-100">
                    {formatGBP(limitedView.netDividend)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
                  <dt className="text-sm font-medium uppercase tracking-wider text-slate-400">
                    Retained profit
                  </dt>
                  <dd className="mt-2 text-3xl font-bold text-slate-100">
                    {formatGBP(limitedView.retainedProfit)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm sm:col-span-2">
                  <dt className="text-sm font-medium uppercase tracking-wider text-slate-400">
                    Effective tax rate
                  </dt>
                  <dd className="mt-2 text-3xl font-bold text-slate-100">
                    {Math.round(limitedView.effectiveRate * 1000) / 10}%
                  </dd>
                </div>
              </dl>
            )}
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-inner shadow-black/30">
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
        title="Business snapshot"
        netLabel="net profit"
      />
    </AppShell>
  );
}
