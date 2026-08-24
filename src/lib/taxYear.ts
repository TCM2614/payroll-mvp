"use client";

/**
 * Shared tax-year type for the PAYE UI layer.
 *
 * NOTE: This is intentionally independent from the core domain TaxYearLabel
 * used in `src/lib/calc.ts` (which uses "2024/25" format). Here we use
 * dash-separated labels for a cleaner UX toggle and analytics.
 */

export type TaxYearLabel = "2024-25" | "2025-26" | "2026-27";

// The site currently supports and displays the latest tax year only.
export const TAX_YEAR_OPTIONS: TaxYearLabel[] = ["2026-27"];

// Convenience constant for the "current" tax year used as the default across
// all calculators. UK tax year 2026/27 runs 6 April 2026 – 5 April 2027.
export const CURRENT_TAX_YEAR: TaxYearLabel = "2026-27";

/**
 * Minimal tax-year configuration shape for UI/analytics.
 *
 * The heavy-duty tax engine already lives elsewhere (e.g. UK_TAX_2026,
 * `createUK2026Config`, etc.), so we keep this lightweight and
 * non-invasive to avoid breaking existing loan/postgrad schemas.
 */
export interface TaxYearConfigMeta {
  label: TaxYearLabel;
  display: string;
}

const CONFIG_2024_25: TaxYearConfigMeta = {
  label: "2024-25",
  display: "2024/25",
};

const CONFIG_2025_26: TaxYearConfigMeta = {
  label: "2025-26",
  display: "2025/26",
};

const CONFIG_2026_27: TaxYearConfigMeta = {
  label: "2026-27",
  display: "2026/27",
};

export function getTaxYearConfig(taxYear: TaxYearLabel): TaxYearConfigMeta {
  switch (taxYear) {
    case "2024-25":
      return CONFIG_2024_25;
    case "2025-26":
      return CONFIG_2025_26;
    case "2026-27":
      return CONFIG_2026_27;
    default:
      return CONFIG_2026_27;
  }
}
