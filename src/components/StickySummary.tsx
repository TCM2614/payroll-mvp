'use client';

import { useEffect, useState } from 'react';
import { formatGBP } from '@/lib/format';

type StickySummaryProps = {
  grossAnnual: number;
  netAnnual: number;
  taxAnnual: number;
  niAnnual?: number;
  pensionAnnual?: number;
  title?: string;
  netLabel?: string;
};

const DEFAULT_TRANSITION_THRESHOLD = 320;

export function StickySummary({
  grossAnnual,
  netAnnual,
  taxAnnual,
  niAnnual,
  pensionAnnual,
  title,
  netLabel,
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
      <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-3xl border-t border-emerald-500/50 bg-gradient-to-r from-slate-900 to-emerald-900 px-5 py-5 text-white shadow-[0_-5px_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/20 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
            {title ?? 'Latest snapshot'}
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">
            {formatGBP(netAnnual)} {netLabel ?? 'take-home'}
          </p>
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
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span className="text-xs text-white/70">Results update live as you calculate</span>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-emerald-900 shadow-sm transition hover:bg-white/90"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              Back to calculator
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-emerald-300/70 bg-emerald-600/90 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/30 transition hover:bg-emerald-500"
              onClick={() => {
                if (typeof document !== 'undefined') {
                  document.getElementById('mortgage-section')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              View borrowing power
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
