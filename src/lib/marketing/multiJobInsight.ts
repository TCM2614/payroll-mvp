/**
 * Deterministic multi-job insight helper.
 *
 * Wraps the existing `calcPAYECombined` multi-stream engine into a compact
 * shape suitable for the `/multiple-jobs/[slug]` landing pages and the
 * educational `/multiple-jobs` hub. Every £ figure originates from the
 * calculator — this module never invents tax logic.
 *
 * How UK second jobs work (assumed everywhere in this module):
 *
 *  - Your primary job receives your Personal Allowance via a tax code
 *    such as `1257L` (or a K/S/M/N variant); HMRC allocates the full
 *    Personal Allowance to whichever job holds that code.
 *  - Additional jobs default to `BR` (basic rate — flat 20% on every £),
 *    `D0` (higher rate — flat 40%) or `D1` (additional rate — flat 45%),
 *    depending on where your total income places the second job's band.
 *  - NI is calculated *separately* per employment, using each
 *    employer's own Primary Threshold / UEL. That means splitting a
 *    salary across two jobs can *reduce* NI compared with earning the
 *    same total from one employer.
 */

import {
  calcPAYECombined,
  type PayeIncomeStream,
} from "@/lib/calculators/paye";
import type { TaxYearLabel } from "@/lib/taxYear";
import { buildSalaryInsight, type SalaryInsight } from "./salaryInsight";
import { formatGBP } from "@/lib/format";

export type SecondJobCode = "BR" | "D0" | "D1";

export interface MultiJobInputs {
  primaryAnnual: number;
  secondaryAnnual: number;
  /** Tax code applied to the primary job (defaults to `1257L`). */
  primaryTaxCode?: string;
  /** Tax code applied to the second job (defaults to `BR`). */
  secondaryTaxCode?: SecondJobCode;
  taxYear?: TaxYearLabel;
}

export interface MultiJobInsight {
  taxYear: TaxYearLabel;
  primary: {
    gross: number;
    taxCode: string;
  };
  secondary: {
    gross: number;
    taxCode: SecondJobCode;
  };
  combined: {
    grossAnnual: number;
    incomeTax: number;
    employeeNI: number;
    studentLoan: number;
    netAnnual: number;
    netMonthly: number;
    effectiveRate: number;
    retainedPercent: number;
  };
  /** What the same *combined* gross would look like in a single PAYE
   *  employment on 1257L, for direct comparison. */
  singleJobEquivalent: SalaryInsight;
  /** Net-annual delta: multi-job vs single-job. Positive means multi-job
   *  keeps more (usually driven by per-employment NI thresholds). */
  vsSingleJob: {
    grossDelta: number;
    netDelta: number;
    taxDelta: number;
    niDelta: number;
    formatted: {
      grossDelta: string;
      netDelta: string;
      taxDelta: string;
      niDelta: string;
    };
  };
  formatted: {
    primaryGross: string;
    secondaryGross: string;
    combinedGross: string;
    combinedNet: string;
    combinedMonthly: string;
    incomeTax: string;
    ni: string;
    effectiveRate: string;
    retainedPercent: string;
  };
}

export function buildMultiJobInsight(
  input: MultiJobInputs,
): MultiJobInsight {
  const taxYear: TaxYearLabel = input.taxYear ?? "2026-27";
  const primaryTaxCode = input.primaryTaxCode ?? "1257L";
  const secondaryTaxCode: SecondJobCode = input.secondaryTaxCode ?? "BR";

  const primary: PayeIncomeStream = {
    id: "primary",
    label: "Primary job",
    frequency: "annual",
    amount: input.primaryAnnual,
    taxCode: primaryTaxCode,
  };
  const secondary: PayeIncomeStream = {
    id: "secondary",
    label: "Second job",
    frequency: "annual",
    amount: input.secondaryAnnual,
    taxCode: secondaryTaxCode,
  };

  const out = calcPAYECombined({
    streams: [primary, secondary],
    taxYear,
  });

  const combinedGross = out.totalGrossAnnual;
  const net = out.totalTakeHomeAnnual;
  const effectiveRate = combinedGross > 0 ? 1 - net / combinedGross : 0;

  const singleJobEquivalent = buildSalaryInsight(combinedGross, {
    taxYear,
    taxCode: "1257L",
  });

  const grossDelta = combinedGross - singleJobEquivalent.gross;
  const netDelta = net - singleJobEquivalent.netAnnual;
  const taxDelta = out.totalIncomeTax - singleJobEquivalent.incomeTax;
  const niDelta = out.totalEmployeeNI - singleJobEquivalent.employeeNI;

  return {
    taxYear,
    primary: {
      gross: input.primaryAnnual,
      taxCode: primaryTaxCode,
    },
    secondary: {
      gross: input.secondaryAnnual,
      taxCode: secondaryTaxCode,
    },
    combined: {
      grossAnnual: combinedGross,
      incomeTax: out.totalIncomeTax,
      employeeNI: out.totalEmployeeNI,
      studentLoan: out.totalStudentLoans,
      netAnnual: net,
      netMonthly: net / 12,
      effectiveRate,
      retainedPercent: combinedGross > 0 ? (net / combinedGross) * 100 : 0,
    },
    singleJobEquivalent,
    vsSingleJob: {
      grossDelta,
      netDelta,
      taxDelta,
      niDelta,
      formatted: {
        grossDelta: formatGBP(grossDelta),
        netDelta: formatGBP(netDelta),
        taxDelta: formatGBP(taxDelta),
        niDelta: formatGBP(niDelta),
      },
    },
    formatted: {
      primaryGross: formatGBP(input.primaryAnnual),
      secondaryGross: formatGBP(input.secondaryAnnual),
      combinedGross: formatGBP(combinedGross),
      combinedNet: formatGBP(net),
      combinedMonthly: formatGBP(net / 12),
      incomeTax: formatGBP(out.totalIncomeTax),
      ni: formatGBP(out.totalEmployeeNI),
      effectiveRate: `${(effectiveRate * 100).toFixed(1)}%`,
      retainedPercent: `${combinedGross > 0 ? ((net / combinedGross) * 100).toFixed(1) : "0"}%`,
    },
  };
}

/**
 * Curated catalog of common two-job UK scenarios that get a first-class
 * `/multiple-jobs/[slug]` landing page. Slug format is
 * `{primary}k-plus-{secondary}k` for readability.
 */
export interface MultiJobCatalogEntry {
  primary: number;
  secondary: number;
  secondaryTaxCode?: SecondJobCode;
  /** Rough audience descriptor for the landing page hero. */
  audience: string;
}

export const MULTI_JOB_CATALOG: MultiJobCatalogEntry[] = [
  {
    primary: 25_000,
    secondary: 5_000,
    audience: "Full-time job plus weekend or evening work",
  },
  {
    primary: 30_000,
    secondary: 10_000,
    audience: "Full-time day job plus regular side work",
  },
  {
    primary: 35_000,
    secondary: 15_000,
    audience: "Full-time role plus a substantial second employment",
  },
  {
    primary: 40_000,
    secondary: 20_000,
    audience: "Two solid employments straddling the higher-rate band",
  },
  {
    primary: 50_000,
    secondary: 10_000,
    audience: "Higher-rate main job plus supplementary income",
  },
  {
    primary: 50_000,
    secondary: 20_000,
    secondaryTaxCode: "D0",
    audience: "Main job at higher-rate top plus a second higher-rate role",
  },
  {
    primary: 60_000,
    secondary: 20_000,
    secondaryTaxCode: "D0",
    audience: "Fully into higher-rate on both employments",
  },
  {
    primary: 80_000,
    secondary: 20_000,
    secondaryTaxCode: "D0",
    audience: "High primary income with a substantial second job",
  },
];

export function multiJobSlug(primary: number, secondary: number): string {
  return `${Math.round(primary / 1000)}k-plus-${Math.round(secondary / 1000)}k`;
}

export function multiJobPath(primary: number, secondary: number): string {
  return `/multiple-jobs/${multiJobSlug(primary, secondary)}`;
}

export function parseMultiJobSlug(
  slug: string,
): { primary: number; secondary: number } | null {
  const m = /^(\d{1,3})k-plus-(\d{1,3})k$/.exec(slug);
  if (!m) return null;
  const primary = Number(m[1]) * 1_000;
  const secondary = Number(m[2]) * 1_000;
  if (!Number.isFinite(primary) || !Number.isFinite(secondary)) return null;
  if (primary < 5_000 || primary > 500_000) return null;
  if (secondary < 1_000 || secondary > 500_000) return null;
  if (secondary > primary) return null; // by convention primary is the larger job
  return { primary, secondary };
}
