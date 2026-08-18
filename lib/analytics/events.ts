/**
 * Canonical list of growth events emitted by the app. Keep this file in sync
 * with `docs/growth/analytics-spec.md`.
 *
 * Rules:
 *  - Event names are stable, lower_snake_case, and describe user *behaviour*,
 *    not implementation details.
 *  - Properties are strictly typed. Anything looking like a raw salary must
 *    be renamed with a `_band` suffix and use `salaryBand()` before dispatch.
 *  - Never include: name, tax code, employer, PII, exact loan balance,
 *    exact pension pot.
 */

export type GrowthEventName =
  | "calculator_started"
  | "calculator_type_selected"
  | "calculation_completed"
  | "comparison_started"
  | "comparison_completed"
  | "percentile_viewed"
  | "salary_page_viewed"
  | "guide_viewed"
  | "related_content_clicked"
  | "share_clicked"
  | "share_platform"
  | "newsletter_signup"
  | "returning_user"
  | "outbound_partner_clicked"
  | "ad_removal_interest";

export type CalculatorType =
  | "paye"
  | "hourly"
  | "monthly"
  | "bonus"
  | "pay_rise"
  | "umbrella"
  | "ltd_outside_ir35"
  | "ltd_inside_ir35";

export type SharePlatform =
  | "copy"
  | "whatsapp"
  | "x"
  | "linkedin"
  | "facebook"
  | "email"
  | "native";

export interface GrowthEventProperties {
  // Salary segmentation — always pre‑bucketed by callers.
  salary_band?: string;
  raise_band?: string;
  target_band?: string;

  // Calculator variants.
  calculator_type?: CalculatorType;
  region?: "england-wales-ni" | "scotland";
  has_student_loan?: boolean;
  has_pension_contribution?: boolean;

  // Comparison / percentile.
  comparison_a_band?: string;
  comparison_b_band?: string;
  percentile_bucket?: string; // e.g. "top-10"

  // Share.
  share_platform?: SharePlatform;
  share_surface?: string; // "salary_page", "comparison", "100k_trap", "percentile"

  // Content.
  content_slug?: string;
  destination_url?: string;

  // Newsletter.
  newsletter_source?: string;
}
