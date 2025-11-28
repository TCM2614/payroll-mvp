'use client';

import { useMemo } from 'react';
import { Trophy, Users, TrendingUp } from 'lucide-react';
import { formatGBP } from '@/lib/format';
import { estimatePercentileFromIncome, getIncomeForPercentile } from '@/utils/wealth';

type LifestyleComparisonProps = {
  salary: number;
};

const CARD_BASE_CLASSES = 'rounded-2xl border border-slate-700 bg-slate-800/90 p-5 shadow-inner shadow-black/30';

export function LifestyleComparison({ salary }: LifestyleComparisonProps) {
  const percentile = useMemo(() => estimatePercentileFromIncome(salary), [salary]);

  const cards = useMemo(() => {
    const nextPercentile = Math.min(99, percentile + 5);
    const nextIncomeTarget = getIncomeForPercentile(nextPercentile);
    const topShare = Math.max(0.1, 100 - percentile);
    const perHour = salary > 0 ? salary / (52 * 37.5) : 0;
    const nextDelta = Math.max(0, nextIncomeTarget - salary);

    return [
      {
        title: 'National Ranking',
        icon: Trophy,
        value: `Top ${topShare.toFixed(1)}%`,
        support: `You earn more than ${percentile.toFixed(1)}% of UK earners.`,
      },
      {
        title: 'Buying Power',
        icon: Users,
        value: `${formatGBP(perHour)}/hr`,
        support: 'Based on a 37.5 hour working week.',
      },
      {
        title: 'Next Level',
        icon: TrendingUp,
        value: formatGBP(nextDelta),
        support: `Reach ${formatGBP(nextIncomeTarget)} to hit the next percentile band.`,
      },
    ];
  }, [percentile, salary]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map(({ title, icon: Icon, value, support }) => (
        <div key={title} className={CARD_BASE_CLASSES}>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            <Icon className="h-4 w-4 text-emerald-300" />
            <span>{title}</span>
          </div>
          <p className="mt-4 text-3xl font-bold text-emerald-400">{value}</p>
          <p className="mt-2 text-sm text-slate-300">{support}</p>
        </div>
      ))}
    </div>
  );
}
