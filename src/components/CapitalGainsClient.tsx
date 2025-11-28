'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

import AppShell from '@/components/layout/AppShell';
import { StickySummary } from '@/components/StickySummary';
import { formatGBP } from '@/lib/format';
import { MoneyInput } from '@/components/ui/MoneyInput';
import {
  calculateCGT,
  type AssetType,
  type IncomeBand,
  type CapitalGainsResult,
} from '@/utils/tax-calculations';

const DonutChart = dynamic(() => import('@/components/charts/TaxBreakdownChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full animate-pulse rounded-xl border border-slate-700 bg-slate-800/50" />
  ),
});

export default function CapitalGainsClient() {
  console.log('CapitalGainsClient Rendering');

  const [assetType, setAssetType] = useState<AssetType>('property');
  const [incomeBand, setIncomeBand] = useState<IncomeBand>('basic');
  const [purchasePrice, setPurchasePrice] = useState(200000);
  const [salePrice, setSalePrice] = useState(265000);
  const [allowableCosts, setAllowableCosts] = useState(12000);

  const numericInputs = useMemo(() => {
    const purchase = Math.max(0, purchasePrice ?? 0);
    const sale = Math.max(0, salePrice ?? 0);
    const costs = Math.max(0, allowableCosts ?? 0);
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
              <div className="mt-1">
                <MoneyInput
                  value={purchasePrice}
                  onValueChange={setPurchasePrice}
                  placeholder="e.g. 200,000"
                  aria-label="Purchase price"
                />
              </div>
            </label>

            <label className="block text-sm font-medium text-white/80">
              Sale price
              <div className="mt-1">
                <MoneyInput
                  value={salePrice}
                  onValueChange={setSalePrice}
                  placeholder="e.g. 265,000"
                  aria-label="Sale price"
                />
              </div>
            </label>

            <label className="block text-sm font-medium text-white/80">
              Allowable costs (solicitor, stamp duty, improvements)
              <div className="mt-1">
                <MoneyInput
                  value={allowableCosts}
                  onValueChange={setAllowableCosts}
                  placeholder="e.g. 12,000"
                  aria-label="Allowable costs"
                />
              </div>
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
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
                <dt className="text-sm font-medium uppercase tracking-wider text-slate-400">
                  Total gain
                </dt>
                <dd className="mt-2 text-3xl font-bold text-slate-100">
                  {formatGBP(result.totalGain)}
                </dd>
                <p className="text-xs text-slate-400">Sale price - purchase - costs.</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
                <dt className="text-sm font-medium uppercase tracking-wider text-slate-400">
                  Taxable gain
                </dt>
                <dd className="mt-2 text-3xl font-bold text-slate-100">
                  {formatGBP(result.taxableGain)}
                </dd>
                <p className="text-xs text-slate-400">After £3,000 allowance.</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
                <dt className="text-sm font-medium uppercase tracking-wider text-slate-400">
                  Basic rate CGT
                </dt>
                <dd className="mt-2 text-3xl font-bold text-slate-100">
                  {formatGBP(result.basicRateTax)}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
                <dt className="text-sm font-medium uppercase tracking-wider text-slate-400">
                  Higher rate CGT
                </dt>
                <dd className="mt-2 text-3xl font-bold text-slate-100">
                  {formatGBP(result.higherRateTax)}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm sm:col-span-2">
                <dt className="text-sm font-medium uppercase tracking-wider text-slate-400">
                  Net profit after CGT
                </dt>
                <dd className="mt-2 text-3xl font-bold text-slate-100">
                  {formatGBP(result.netGain)}
                </dd>
                <p className="text-xs text-slate-400">Displayed in donut chart.</p>
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
        title="Capital gains snapshot"
        netLabel="net profit"
      />
    </AppShell>
  );
}
