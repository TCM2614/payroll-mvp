'use client';

import { useEffect, useState } from 'react';
import { formatGBP } from '@/lib/format';

type StickySummaryProps = {
  grossAnnual: number;
  netAnnual: number;
  taxAnnual: number;
  niAnnual?: number;
  pensionAnnual?: number;
};

const DEFAULT_TRANSITION_THRESHOLD = 320;

export function StickySummary({
  grossAnnual,
  netAnnual,
  taxAnnual,
  niAnnual,
  pensionAnnual,
}: StickySummaryProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > DEFAULT_TRANSITION_THRESHOLD;
      setIsVisible(shouldShow);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={[
        'fixed inset-x-0 bottom-3 z-40 px-3 sm:px-6 transition-all duration-300',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-3xl border border-slate-700/70 bg-slate-900/90 px-5 py-4 text-white shadow-2xl shadow-black/40 ring-1 ring-black/30 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">Latest snapshot</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">{formatGBP(netAnnual)} take-home</p>
        </div>
        <dl className="grid flex-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.18em] text-white/50">Gross Annual</dt>
            <dd className="text-base font-semibold text-white">{formatGBP(grossAnnual)}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.18em] text-white/50">Tax &amp; NI</dt>
            <dd className="text-base font-semibold text-white">
              {formatGBP(taxAnnual + (niAnnual ?? 0))}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.18em] text-white/50">Pension</dt>
            <dd className="text-base font-semibold text-white">
              {pensionAnnual ? formatGBP(pensionAnnual) : '£0'}
            </dd>
          </div>
        </dl>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span className="text-xs text-white/70">Results update live as you calculate</span>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-emerald-400/60 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/10"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            Back to calculator
          </button>
        </div>
      </div>
    </div>
  );
}
