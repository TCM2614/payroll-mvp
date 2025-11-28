'use client';

import { useMemo } from 'react';
import { formatGBP } from '@/lib/format';
import { estimatePercentileFromIncome, getIncomeForPercentile } from '@/utils/wealth';

type LifestyleComparisonProps = {
  salary: number;
};

const CARD_BASE_CLASSES = 'rounded-2xl border border-slate-700 bg-slate-800/90 p-5 shadow-inner shadow-black/20';

export function LifestyleComparison({ salary }: LifestyleComparisonProps) {
  const percentile = useMemo(() => estimatePercentileFromIncome(salary), [salary]);

  const cards = useMemo(() => {
    const percentileLabel = percentile >= 95
      ? 'Top earner'
      : percentile >= 75
      ? 'High performer'
      : percentile >= 50
      ? 'Above average'
      : percentile >= 25
      ? 'Mid-career'
      : 'Getting started';

    const nextPercentile = Math.min(99, percentile + 5);
    const nextIncomeTarget = getIncomeForPercentile(nextPercentile);

    const buyingPowerCopy = percentile >= 85
      ? 'Comfortably covers large mortgage or school fees with buffer for investing.'
      : percentile >= 60
      ? 'Supports a strong lifestyle with room for pension and overpayments.'
      : percentile >= 40
      ? 'Tracks the national median — focus on pension match and emergency fund.'
      : 'Prioritize debt reduction and upskilling to move into the median band.';

    const nextLevelCopy = percentile >= 90
      ? 'Next step: diversify investments and plan for lifetime allowance changes.'
      : percentile >= 60
      ? 'Next step: increase pension contributions to capture tax relief.'
      : 'Next step: negotiate for benefits (pension match, allowances) to accelerate growth.';

    return [
      {
        title: 'Ranking',
        headline: `${percentile.toFixed(1)} percentile`,
        support: percentileLabel,
      },
      {
        title: 'Buying power',
        headline: formatGBP(salary),
        support: buyingPowerCopy,
      },
      {
        title: 'Next level',
        headline: formatGBP(nextIncomeTarget),
        support: nextLevelCopy,
      },
    ];
  }, [percentile, salary]);

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <div key={card.title} className={CARD_BASE_CLASSES}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            {card.title}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-50">{card.headline}</p>
          <p className="mt-2 text-sm text-slate-300">{card.support}</p>
        </div>
      ))}
    </div>
  );
}
