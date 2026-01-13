"use client";

/**
 * Shared tax-year type for the PAYE UI layer.
 *
 * NOTE: This is intentionally independent from the core domain TaxYearLabel
 * used in `src/lib/calc.ts` (which uses "2024/25" format). Here we use
 * dash-separated labels for a cleaner UX toggle and analytics.
 */

export type TaxYearLabel = "2024-25" | "2025-26";

export const TAX_YEAR_OPTIONS: TaxYearLabel[] = ["2024-25", "2025-26"];

/**
 * Minimal tax-year configuration shape for UI/analytics.
 *
 * The heavy-duty tax engine already lives elsewhere (e.g. UK_TAX_2025,
 * `createUK2025Config`, etc.), so we keep this lightweight and
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

export function getTaxYearConfig(taxYear: TaxYearLabel): TaxYearConfigMeta {
  switch (taxYear) {
    case "2024-25":
      return CONFIG_2024_25;
    case "2025-26":
      return CONFIG_2025_26;
    default:
      return CONFIG_2025_26;
  }
}


