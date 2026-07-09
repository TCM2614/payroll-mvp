"use client";

/**
 * CalculatorSummary
 *
 * Shared, canonical "take-home pay" summary card used by every calculator on
 * the site (Standard PAYE, Umbrella, Limited company, and any future ones).
 *
 * The visual language is deliberately identical to the Standard PAYE combined
 * summary card so that users see a consistent breakdown regardless of which
 * calculator they are using. This is the ONLY summary style/template to use
 * for take-home pay results — do not add bespoke summary blocks in individual
 * calculators; extend this component instead.
 */

import type { ReactNode } from "react";
import { formatGBP } from "@/lib/format";

export interface StudentLoanLineItem {
  key: string;
  label: string;
  annualAmount: number;
}

export interface SummaryNotice {
  variant?: "info" | "warn";
  heading?: string;
  body: ReactNode;
}

export interface SummaryCta {
  label: string;
  hint?: string;
  onClick: () => void;
}

export interface CalculatorSummaryProps {
  /** Title of the summary card, e.g. "Combined across all jobs". */
  title?: string;
  /** Short lead line under the title. */
  subtitle?: string;

  /** Annual gross income (before deductions). */
  grossAnnual: number;
  /** Annual PAYE income tax. */
  incomeTaxAnnual: number;
  /** Annual employee National Insurance. */
  nationalInsuranceAnnual: number;
  /** Workplace / salary-sacrifice pension employee contribution (annual). */
  workplacePensionAnnual?: number;
  /** Personal SIPP contributions (annual). Only shown when > 0. */
  sippAnnual?: number;
  /** Total annual student loan repayments. */
  studentLoanAnnual?: number;
  /** Per-plan student loan breakdown. */
  studentLoanBreakdown?: StudentLoanLineItem[];
  /** Net take-home (annual). */
  netAnnual: number;

  /**
   * Optional hours-per-week for a derived hourly breakdown. When omitted, the
   * hourly breakdown block is not rendered.
   */
  hoursPerWeek?: number;

  /**
   * Optional replacement disclaimer. Defaults to a standard PAYE disclaimer.
   */
  disclaimer?: ReactNode;

  /**
   * Optional CTA rendered at the bottom of the card, above the disclaimer.
   */
  cta?: SummaryCta;

  /**
   * Optional inline notice rendered inside the card (e.g. for unsupported
   * scenarios like Outside IR35). When provided, it is shown above the figures.
   */
  notice?: SummaryNotice;
}

const DEFAULT_DISCLAIMER =
  "These figures are estimates based on current UK PAYE rules and your inputs. They're for guidance only and not an official HMRC calculation.";

export function CalculatorSummary({
  title = "Take-home pay summary",
  subtitle = "Estimated take-home after income tax, NI, pension and any student loan repayments.",
  grossAnnual,
  incomeTaxAnnual,
  nationalInsuranceAnnual,
  workplacePensionAnnual = 0,
  sippAnnual = 0,
  studentLoanAnnual = 0,
  studentLoanBreakdown = [],
  netAnnual,
  hoursPerWeek,
  disclaimer,
  cta,
  notice,
}: CalculatorSummaryProps) {
  const netMonthly = netAnnual / 12;
  const netWeekly = netAnnual / 52;

  const hasHourlyContext =
    typeof hoursPerWeek === "number" && hoursPerWeek > 0 && grossAnnual > 0;

  const grossWeekly = grossAnnual / 52;
  const taxWeekly = incomeTaxAnnual / 52;
  const niWeekly = nationalInsuranceAnnual / 52;

  const noticeClasses =
    notice?.variant === "warn"
      ? "rounded-xl border border-aqua-500/30 bg-aqua-500/10 p-3"
      : "rounded-xl border border-brand-border/60 bg-brand-surface/60 p-3";

  const noticeHeadingClasses =
    notice?.variant === "warn"
      ? "text-sm font-semibold text-aqua-300"
      : "text-sm font-semibold text-brand-text";

  const noticeBodyClasses =
    notice?.variant === "warn"
      ? "mt-2 text-xs text-aqua-200"
      : "mt-2 text-xs text-brand-textMuted";

  return (
    <div className="rounded-3xl bg-brand-surface/80 border border-brand-border/60 shadow-soft-xl backdrop-blur-xl p-4 sm:p-6 space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-brand-text">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-xs text-brand-textMuted">{subtitle}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xxs text-brand-textMuted">Net take-home (monthly)</p>
          <p className="text-2xl font-bold text-brand-text">
            {formatGBP(netMonthly)}
          </p>
        </div>
      </header>

      {notice && (
        <div className={noticeClasses}>
          {notice.heading && (
            <p className={noticeHeadingClasses}>{notice.heading}</p>
          )}
          <div className={noticeBodyClasses}>{notice.body}</div>
        </div>
      )}

      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-brand-textMuted">Gross pay (annual)</dt>
          <dd className="text-right font-medium text-brand-text">
            {formatGBP(grossAnnual)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-brand-textMuted">PAYE income tax</dt>
          <dd className="text-right font-medium text-brand-text">
            {formatGBP(incomeTaxAnnual)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-brand-textMuted">National Insurance</dt>
          <dd className="text-right font-medium text-brand-text">
            {formatGBP(nationalInsuranceAnnual)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-brand-textMuted">Workplace pension (employee)</dt>
          <dd className="text-right font-medium text-brand-text">
            {formatGBP(workplacePensionAnnual)}
          </dd>
        </div>
        {sippAnnual > 0 && (
          <div className="flex items-center justify-between gap-2">
            <dt className="text-brand-textMuted">SIPP contributions (personal)</dt>
            <dd className="text-right font-medium text-brand-text">
              {formatGBP(sippAnnual)}
            </dd>
          </div>
        )}

        {studentLoanBreakdown.length > 0 ? (
          <>
            <div className="pt-2 border-t border-brand-border/40">
              <p className="text-xxs font-semibold text-brand-textMuted uppercase tracking-wide">
                Student loan deductions (annual)
              </p>
            </div>
            {studentLoanBreakdown.map(({ key, label, annualAmount }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-2"
              >
                <dt className="text-brand-textMuted">Student loan ({label})</dt>
                <dd className="text-right font-medium text-brand-text">
                  {formatGBP(annualAmount)}
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-2 border-t border-brand-border/40 pt-2">
              <dt className="text-brand-text font-medium">Total student loans</dt>
              <dd className="text-right font-semibold text-brand-text">
                {formatGBP(studentLoanAnnual)}
              </dd>
            </div>
          </>
        ) : studentLoanAnnual > 0 ? (
          <div className="flex items-center justify-between gap-2">
            <dt className="text-brand-textMuted">Student loan repayments</dt>
            <dd className="text-right font-medium text-brand-text">
              {formatGBP(studentLoanAnnual)}
            </dd>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-2 border-t border-brand-border/40 pt-2">
          <dt className="text-brand-text font-medium">Net take-home (annual)</dt>
          <dd className="text-right font-semibold text-brand-accent">
            {formatGBP(netAnnual)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-brand-textMuted">
          <span>Net monthly</span>
          <span className="font-medium text-brand-text">
            {formatGBP(netMonthly)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-brand-textMuted">
          <span>Net weekly</span>
          <span className="font-medium text-brand-text">
            {formatGBP(netWeekly)}
          </span>
        </div>

        {cta && grossAnnual > 0 && (
          <div className="pt-3 border-t border-brand-border/40 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {cta.hint && (
              <p className="text-xxs text-brand-textMuted">{cta.hint}</p>
            )}
            <button
              type="button"
              onClick={cta.onClick}
              className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-soft-xl transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/70"
            >
              {cta.label}
            </button>
          </div>
        )}
      </dl>

      {hasHourlyContext && (
        <div className="mt-4 pt-4 border-t border-brand-border/40">
          <div className="mb-3">
            <p className="text-xxs font-semibold text-brand-textMuted uppercase tracking-wide">
              Hourly breakdown (derived)
            </p>
            <p className="mt-1 text-xxs text-brand-textMuted">
              Based on {hoursPerWeek!.toFixed(1)} hours/week × 52 weeks
            </p>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-brand-textMuted">Gross pay (per hour)</dt>
              <dd className="text-right font-medium text-brand-text">
                {formatGBP(grossWeekly / hoursPerWeek!)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-brand-textMuted">PAYE income tax (per hour)</dt>
              <dd className="text-right font-medium text-brand-text">
                {formatGBP(taxWeekly / hoursPerWeek!)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-brand-textMuted">National Insurance (per hour)</dt>
              <dd className="text-right font-medium text-brand-text">
                {formatGBP(niWeekly / hoursPerWeek!)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-brand-border/40 pt-2">
              <dt className="text-brand-text font-medium">Net take-home (per hour)</dt>
              <dd className="text-right font-semibold text-brand-accent">
                {formatGBP(netWeekly / hoursPerWeek!)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <p className="mt-2 text-xxs text-brand-textMuted">
        {disclaimer ?? DEFAULT_DISCLAIMER}
      </p>
    </div>
  );
}
