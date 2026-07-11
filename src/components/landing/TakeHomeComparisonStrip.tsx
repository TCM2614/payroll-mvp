"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";
import {
  computeLandingComparison,
  type ComparisonScenarioInputs,
} from "@/lib/marketing/landingComparison";
import { formatGBP } from "@/lib/format";
import {
  trackComparisonStripCta,
  trackComparisonStripView,
} from "@/lib/analytics";

interface Props {
  /**
   * Override the default scenario inputs. Used by the share URLs at
   * `/compare/[slug]` (e.g. `500-a-day`, `50-per-hour`) and by the
   * calculators to keep the strip in sync with the user's inputs.
   */
  inputs?: Partial<ComparisonScenarioInputs>;
  /**
   * Analytics source label so we can distinguish landing-hero views from
   * share-URL views and embedded-in-calculator views in Plausible.
   */
  analyticsSource?: string;
  /**
   * Extra props applied to the internal Link CTA (e.g. a custom href for
   * share URLs pointing to the calculator with pre-filled inputs).
   */
  ctaHref?: string;
  /**
   * Optional eyebrow text ("SEE THE DIFFERENCE" by default).
   */
  eyebrow?: string;
  /**
   * Optional title override. When omitted the strip auto-composes
   * "Same £X/day contractor. Four engagement types." from the resolved
   * day rate. Calculators that use monthly / annual mental models pass
   * their own headline instead.
   */
  title?: ReactNode;
  /**
   * Optional subtitle override. When omitted the strip auto-composes
   * a working-pattern sentence from the resolved inputs.
   */
  subtitle?: ReactNode;
  /**
   * Whether to render the "Model your own rate" CTA. Suppressed when the
   * strip is embedded inside the calculator itself (there's no need to
   * link to /calc from /calc).
   */
  showCta?: boolean;
  /**
   * Extra utility classes for the outer <section>. Lets callers tighten
   * spacing when embedding the strip below a CalculatorSummary.
   */
  className?: string;
}

/**
 * "See the difference — same £500/day contractor" comparison strip.
 *
 * A landing-page marketing block that puts all four engagement types
 * side-by-side using the site's own calculation engines. Highlights the
 * differentiator (a UK take-home calculator that covers PAYE, umbrella,
 * inside IR35 and outside IR35 in one place — with a real umbrella-payslip
 * model and marginal-relief corporation tax on the outside-IR35 side) with
 * a single visual glance and a clear CTA into /calc.
 */
export function TakeHomeComparisonStrip({
  inputs,
  analyticsSource = "landing_hero",
  ctaHref = "/calc",
  eyebrow = "See the difference",
  title,
  subtitle,
  showCta = true,
  className,
}: Props = {}) {
  const comparison = useMemo(
    () => computeLandingComparison(inputs),
    [inputs],
  );

  const sectionRef = useRef<HTMLElement | null>(null);
  const hasFiredViewRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasFiredViewRef.current) return;
    const node = sectionRef.current;
    if (!node) return;

    // Support older browsers gracefully — fire immediately if IO is missing.
    if (typeof IntersectionObserver === "undefined") {
      hasFiredViewRef.current = true;
      trackComparisonStripView(analyticsSource);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasFiredViewRef.current) {
            hasFiredViewRef.current = true;
            trackComparisonStripView(analyticsSource);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [analyticsSource]);

  const bestKey = comparison.bestScenarioKey;
  const worstKey = comparison.worstScenarioKey;

  const regimeClasses: Record<string, string> = {
    PAYE: "border-white/20 bg-white/5 text-white/80",
    "Inside IR35": "border-amber-400/40 bg-amber-500/10 text-amber-200",
    "Outside IR35": "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
  };

  const resolvedTitle: ReactNode = title ?? (
    <>
      Same {formatGBP(comparison.headlineDayRate)}/day contractor. Four
      engagement types.
    </>
  );
  const resolvedSubtitle: ReactNode = subtitle ?? (
    <>
      Assumes {comparison.inputs.daysPerWeek} days a week ×{" "}
      {comparison.inputs.weeksWorkedPerYear} billable weeks, tax code 1257L,
      no student loans, UK 2026/27 tax year — all figures are live from the
      same engines that power the calculators.
    </>
  );

  return (
    <section
      ref={sectionRef}
      className={className ?? "mt-14 w-full max-w-5xl"}
    >
      <div className="mb-5 flex flex-col gap-1 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
          {eyebrow}
        </p>
        <h2 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {resolvedTitle}
        </h2>
        <p className="mt-2 text-balance text-sm text-white/70">
          {resolvedSubtitle}
        </p>
      </div>

      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {comparison.scenarios.map((s) => {
          const isBest = s.key === bestKey;
          const isWorst = s.key === worstKey && bestKey !== worstKey;
          const cardBorder = isBest
            ? "border-emerald-400/60 shadow-emerald-500/20"
            : "border-white/10";
          const deltaLabel =
            s.deltaVsPayeAnnual === 0
              ? "Baseline"
              : `${s.deltaVsPayeAnnual > 0 ? "+" : "−"}${formatGBP(Math.abs(s.deltaVsPayeAnnual))} vs PAYE`;

          return (
            <li
              key={s.key}
              className={`relative rounded-2xl border ${cardBorder} bg-white/[0.03] p-4 shadow-lg transition hover:bg-white/[0.06]`}
            >
              {isBest && (
                <span className="absolute -top-2 left-4 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
                  Highest net
                </span>
              )}
              {isWorst && (
                <span className="absolute -top-2 left-4 rounded-full bg-rose-500/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Lowest net
                </span>
              )}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{s.label}</p>
                  <span
                    className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${regimeClasses[s.regime] ?? regimeClasses.PAYE}`}
                  >
                    {s.regime}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-white/50">
                  Annual take-home
                </p>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {formatGBP(s.netAnnual)}
                </p>
                <p className="text-xs text-white/60">
                  {formatGBP(s.netMonthly)} / month
                </p>
              </div>

              <dl className="mt-4 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-white/70">
                  <dt>Effective tax rate</dt>
                  <dd className="font-medium text-white/90 tabular-nums">
                    {(s.effectiveTaxRate * 100).toFixed(1)}%
                  </dd>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <dt>vs. Standard PAYE</dt>
                  <dd
                    className={`font-medium tabular-nums ${
                      s.deltaVsPayeAnnual > 0
                        ? "text-emerald-300"
                        : s.deltaVsPayeAnnual < 0
                          ? "text-rose-300"
                          : "text-white/80"
                    }`}
                  >
                    {deltaLabel}
                  </dd>
                </div>
              </dl>

              <p className="mt-3 text-[11px] leading-snug text-white/60">
                {s.note}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 flex flex-col items-center gap-2">
        <p className="text-xs text-white/60">
          Gap between the best and worst option:{" "}
          <span className="font-semibold text-white">
            {formatGBP(comparison.bestVsWorstAnnual)}
          </span>{" "}
          / year on the same working assumptions.
        </p>
        {showCta && (
          <Link
            href={ctaHref}
            onClick={() => trackComparisonStripCta(analyticsSource)}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
          >
            Model your own rate →
          </Link>
        )}
      </div>
    </section>
  );
}
