'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

import AppShell from '@/components/layout/AppShell';
import { StickySummary } from '@/components/StickySummary';
import { formatGBP } from '@/lib/format';
import {
  calculateCGT,
  type AssetType,
  type IncomeBand,
  type CapitalGainsResult,
} from '@/utils/tax-calculations';

const DonutChart = dynamic(() => import('@/components/charts/WealthDistributionChart'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-3xl border border-slate-800 bg-slate-900/60" />
  ),
});

const parseCurrency = (value: string): number => {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const numeric = parseFloat(cleaned);
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function CapitalGainsClient() {
  console.log('CapitalGainsClient Rendering');

  const [assetType, setAssetType] = useState<AssetType>('property');
  const [incomeBand, setIncomeBand] = useState<IncomeBand>('basic');
  const [purchasePrice, setPurchasePrice] = useState('200000');
  const [salePrice, setSalePrice] = useState('265000');
  const [allowableCosts, setAllowableCosts] = useState('12000');

  const numericInputs = useMemo(() => {
    const purchase = parseCurrency(purchasePrice);
    const sale = parseCurrency(salePrice);
    const costs = parseCurrency(allowableCosts);
    const totalGain = Math.max(0, sale - purchase - costs);

    return {
      purchase,
      sale,
      costs,
      totalGain,
    };
  }, [purchasePrice, salePrice, allowableCosts]);

  const [result, setResult] = useState<CapitalGainsResult>(() =>
    calculateCGT({ profit: numericInputs.totalGain, type: assetType, incomeBand }),
  );

  useEffect(() => {
    setResult(calculateCGT({ profit: numericInputs.totalGain, type: assetType, incomeBand }));
  }, [assetType, incomeBand, numericInputs.totalGain]);

  const summarySnapshot = useMemo(
    () => ({
      grossAnnual: result.totalGain,
      netAnnual: result.netGain,
      taxAnnual: result.totalTax,
      niAnnual: 0,
      pensionAnnual: 0,
    }),
    [result],
  );

  const chartProps = useMemo(
    () => ({
      netIncome: result.netGain,
      taxPaid: result.totalTax,
      niPaid: 0,
      pensionContrib: 0,
    }),
    [result],
  );

  return (
    <AppShell>
      <div className="space-y-10 text-white">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-soft-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">
            Capital Gains Tax · 2024/25
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Capital Gains Tax Calculator for UK property and shares
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Model your annual allowance, taxable gains and CGT bills for residential property or share disposals. Updated for the £3,000 allowance and post-October 2024 rates.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold">Inputs</h2>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
                Asset type
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  { value: 'property', label: 'Residential property' },
                  { value: 'shares', label: 'Shares & funds' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAssetType(option.value as AssetType)}
                    className={[
                      'rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors',
                      assetType === option.value
                        ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                        : 'border-slate-700 bg-slate-900/50 text-white/70 hover:border-slate-500',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-sm font-medium text-white/80">
              Purchase price
              <input
                type="text"
                inputMode="decimal"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white placeholder:text-white/40"
                placeholder="e.g. 200000"
              />
            </label>

            <label className="block text-sm font-medium text-white/80">
              Sale price
              <input
                type="text"
                inputMode="decimal"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white placeholder:text-white/40"
                placeholder="e.g. 265000"
              />
            </label>

            <label className="block text-sm font-medium text-white/80">
              Allowable costs (solicitor, stamp duty, improvements)
              <input
                type="text"
                inputMode="decimal"
                value={allowableCosts}
                onChange={(e) => setAllowableCosts(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white placeholder:text-white/40"
                placeholder="e.g. 12000"
              />
            </label>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
                Income band
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  { value: 'basic', label: 'Basic rate taxpayer' },
                  { value: 'higher', label: 'Higher / Additional' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setIncomeBand(option.value as IncomeBand)}
                    className={[
                      'rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors',
                      incomeBand === option.value
                        ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                        : 'border-slate-700 bg-slate-900/50 text-white/70 hover:border-slate-500',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold">Results</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Total gain</dt>
                <dd className="mt-1 text-xl font-semibold text-emerald-300">
                  {formatGBP(result.totalGain)}
                </dd>
                <p className="text-[11px] text-white/60">Sale price - purchase - costs.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Taxable gain</dt>
                <dd className="mt-1 text-xl font-semibold text-emerald-300">
                  {formatGBP(result.taxableGain)}
                </dd>
                <p className="text-[11px] text-white/60">After £3,000 allowance.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Basic rate CGT</dt>
                <dd className="mt-1 text-xl font-semibold text-emerald-300">
                  {formatGBP(result.basicRateTax)}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Higher rate CGT</dt>
                <dd className="mt-1 text-xl font-semibold text-emerald-300">
                  {formatGBP(result.higherRateTax)}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:col-span-2">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Net profit after CGT</dt>
                <dd className="mt-1 text-2xl font-semibold text-emerald-400">
                  {formatGBP(result.netGain)}
                </dd>
                <p className="text-[11px] text-white/60">Displayed in donut chart.</p>
              </div>
            </dl>

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-inner shadow-black/30">
              <DonutChart {...chartProps} />
            </div>
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
