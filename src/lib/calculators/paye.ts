import { getPayeTaxConfig, type LoanKey, type PayeTaxConfig } from "../tax/uk2025";
import type { TaxYearLabel } from "../taxYear";
import {
  computeIncomeTaxFromCode,
  parseTaxCode as sharedParseTaxCode,
  taperPersonalAllowance,
  type ParsedTaxCode,
} from "@/domain/tax/taxCode";

export type Frequency = "hourly"|"daily"|"monthly"|"annual";
/** Legacy alias — kept for the small handful of external callers. */
export type TaxCodeFlavor = ParsedTaxCode["flavor"];

export type PayeIncomeStream = {
  id: string; label: string;
  frequency: Frequency; amount: number;
  taxCode: string;
  salarySacrificePct?: number; salarySacrificeFixed?: number;
};

export type CombinedPayeInput = {
  streams: PayeIncomeStream[];
  sippPersonal?: number;
  loans?: LoanKey[];
  /**
   * Optional tax year for PAYE calculations in the multi-job engine.
   * Defaults to "2026-27" (the current UK tax year).
   */
  taxYear?: TaxYearLabel;
};
export type StreamResult = {
  id: string; label: string; frequency: Frequency;
  grossEntered: number; annualisedGross: number;
  salarySacrifice: number; incomeTax: number; employeeNI: number;
  taxableIncomeAfterReliefs: number; notes: string[];
};
export type CombinedPayeOutput = {
  streams: StreamResult[];
  sippGrossed: number; sippExtraReliefEstimate: number;
  totalIncomeTax: number; totalEmployeeNI: number;
  totalStudentLoans: number;
  studentLoanBreakdown: Array<{ plan: LoanKey; label: string; amount: number }>;
  totalGrossAnnual: number; totalTakeHomeAnnual: number;
};

/**
 * Wrapper kept for the multi-stream PA-allocation code below. Uses the
 * canonical parser under the hood so every downstream engine agrees on
 * the flavour taxonomy.
 */
function parseTaxCode(raw: string, config: PayeTaxConfig): ParsedTaxCode {
  return sharedParseTaxCode(raw, config.personalAllowance);
}

/**
 * True for codes that carry a positive personal allowance the
 * multi-stream engine can partially allocate (L / M / N / T). K codes
 * add a negative allowance instead and are always taxed in full; the
 * flat-rate codes have no PA at all.
 */
function codeCarriesPersonalAllowance(parsed: ParsedTaxCode): boolean {
  return (
    parsed.flavor === "L" ||
    parsed.flavor === "M" ||
    parsed.flavor === "N" ||
    parsed.flavor === "T"
  );
}

function toAnnual(amount: number, frequency: Frequency): number {
  switch (frequency) {
    case "hourly": return amount * 7.5 * 5 * 46;
    case "daily": return amount * 5 * 46;
    case "monthly": return amount * 12;
    default: return amount;
  }
}
function eeNI(annualGross: number, config: PayeTaxConfig) {
  const { primaryThreshold, upperEarningsLimit, mainRate, upperRate } = config.ni;
  if (annualGross <= primaryThreshold) return 0;
  const main = Math.min(annualGross, upperEarningsLimit) - primaryThreshold;
  const upper = Math.max(0, annualGross - upperEarningsLimit);
  return Math.max(0, Math.max(0, main)*mainRate + upper*upperRate);
}
function applySS(annualGross: number, pct?: number, fixed?: number) {
  const ssp = pct ? annualGross * (pct / 100) : 0;
  const ssf = fixed ?? 0;
  const sacrifice = Math.max(0, ssp + ssf);
  return { adjustedGross: Math.max(0, annualGross - sacrifice), sacrifice };
}

/**
 * Calculate student loan repayments for given loan plans.
 * Student loans are calculated on gross income (after salary sacrifice) above the threshold.
 * Each loan plan is calculated separately and added together.
 * 
 * Returns both per-plan breakdown and total for display purposes.
 */
function calculateStudentLoans(
  grossAnnual: number,
  loans: LoanKey[],
  config: PayeTaxConfig
): { total: number; breakdown: Array<{ plan: LoanKey; label: string; amount: number }> } {
  const breakdown: Array<{ plan: LoanKey; label: string; amount: number }> = [];
  let total = 0;
  
  const planLabels: Record<LoanKey, string> = {
    plan1: "Plan 1",
    plan2: "Plan 2",
    plan4: "Plan 4",
    plan5: "Plan 5",
    postgrad: "Postgraduate loan",
  };
  
  for (const loanKey of loans) {
    const loan = config.studentLoans[loanKey];
    if (!loan) continue;
    const repayable = Math.max(0, grossAnnual - loan.threshold);
    const amount = repayable * loan.rate;
    
    if (amount > 0) {
      breakdown.push({
        plan: loanKey,
        label: planLabels[loanKey] || loanKey,
        amount,
      });
      total += amount;
    }
  }
  
  return { total, breakdown };
}

function allocatePA(
  streams: PayeIncomeStream[],
  basePA: number,
  totalIncomeAfterSSOnPrimary: number,
  config: PayeTaxConfig,
) {
  const tapered = taperPersonalAllowance(basePA, totalIncomeAfterSSOnPrimary, config);
  const paStreams = streams.filter((s) =>
    codeCarriesPersonalAllowance(parseTaxCode(s.taxCode, config)),
  );
  const map = new Map<string, number>();
  if (!paStreams.length) return map;

  const primary = paStreams.find((s) => s.id === "primary") ?? paStreams[0];
  const primRaw = toAnnual(primary.amount, primary.frequency);
  const { adjustedGross: primAdj } = applySS(
    primRaw,
    primary.salarySacrificePct,
    primary.salarySacrificeFixed,
  );
  const primPA = Math.min(tapered, primAdj);
  map.set(primary.id, primPA);

  const remaining = Math.max(0, tapered - primPA);
  const others = paStreams.filter((s) => s.id !== primary.id);
  if (remaining > 0 && others.length) {
    const total =
      others.reduce((a, s) => a + toAnnual(s.amount, s.frequency), 0) || 1;
    for (const s of others) {
      const share = Math.min(
        remaining,
        (toAnnual(s.amount, s.frequency) / total) * remaining,
      );
      map.set(s.id, (map.get(s.id) ?? 0) + share);
    }
  }
  return map;
}

function calcStreamAnnual(
  stream: PayeIncomeStream,
  paShare: number,
  isPrimary: boolean,
  config: PayeTaxConfig,
): StreamResult {
  const parsed = parseTaxCode(stream.taxCode, config);
  const raw = toAnnual(stream.amount, stream.frequency);

  let salarySacrifice = 0;
  let gross = raw;
  const notes: string[] = [];
  if (isPrimary && (stream.salarySacrificeFixed || stream.salarySacrificePct)) {
    const res = applySS(
      raw,
      stream.salarySacrificePct,
      stream.salarySacrificeFixed,
    );
    gross = res.adjustedGross;
    salarySacrifice = res.sacrifice;
    notes.push("Salary sacrifice applied on primary stream.");
  }

  // Route every code through the shared engine. For L/M/N/T we pass the
  // multi-stream-allocated PA in explicitly so we don't double-taper.
  const tax = codeCarriesPersonalAllowance(parsed)
    ? computeIncomeTaxFromCode(parsed, gross, config, {
        effectivePersonalAllowance: paShare,
      })
    : computeIncomeTaxFromCode(parsed, gross, config);

  // Derive a taxable-income figure for the payslip breakdown UI. This is
  // an informational value only — the actual tax number is what matters
  // for take-home.
  const effectivePA = codeCarriesPersonalAllowance(parsed) ? paShare : 0;
  const taxable = Math.max(0, gross + parsed.negativeAllowance - effectivePA);

  notes.push(parsed.description);
  if (parsed.nonCumulative) {
    notes.push(
      "Non-cumulative (W1 / M1 / X) — annual total unchanged, but your monthly deductions may be off until HMRC catches up.",
    );
  }
  if (parsed.unrecognised) {
    notes.push(
      "Tax code not recognised — falling back to the standard personal allowance.",
    );
  }
  if (parsed.regime === "scotland" && !config.scotland) {
    notes.push(
      "Scottish rates config missing for this tax year — using rUK bands as a fallback.",
    );
  }

  const ni = eeNI(gross, config);

  return {
    id: stream.id,
    label: stream.label,
    frequency: stream.frequency,
    grossEntered: stream.amount,
    annualisedGross: raw,
    salarySacrifice,
    incomeTax: tax,
    employeeNI: ni,
    taxableIncomeAfterReliefs: taxable,
    notes,
  };
}

export function calcPAYECombined(input: CombinedPayeInput): CombinedPayeOutput {
  const { streams, sippPersonal = 0, loans = [], taxYear = "2026-27" } = input;
  const config = getPayeTaxConfig(taxYear);

  let totalAfterSSPrimary = 0;
  for (const s of streams) {
    const annual = toAnnual(s.amount, s.frequency);
    if (s.id === "primary" && (s.salarySacrificeFixed || s.salarySacrificePct)) {
      totalAfterSSPrimary += applySS(annual, s.salarySacrificePct, s.salarySacrificeFixed).adjustedGross;
    } else totalAfterSSPrimary += annual;
  }

  const primary = streams.find((s) => s.id === "primary");
  const basePA = primary
    ? parseTaxCode(primary.taxCode, config).personalAllowance ||
      config.personalAllowance
    : config.personalAllowance;

  const paAlloc = allocatePA(streams, basePA, totalAfterSSPrimary, config);
  const results = streams.map(s =>
    calcStreamAnnual(s, paAlloc.get(s.id) ?? 0, s.id === "primary", config),
  );

  const sippGrossed = sippPersonal > 0 ? sippPersonal / 0.8 : 0;
  const totalAnnualGross = results.reduce((a, r) => a + r.annualisedGross, 0);
  const marginal =
    totalAnnualGross > config.higherBandTop ? config.additionalRate
      : totalAnnualGross > config.basicBandTop ? config.higherRate
      : config.basicRate;
  const extraReliefRate = Math.max(0, marginal - 0.20);
  const sippExtraReliefEstimate = sippGrossed * extraReliefRate;
  const taxSavingFromSipp = sippGrossed * marginal;

  const totalIncomeTaxBefore = results.reduce((a, r) => a + r.incomeTax, 0);
  const totalEmployeeNIBefore = results.reduce((a, r) => a + r.employeeNI, 0);
  const totalIncomeTax = Math.max(0, totalIncomeTaxBefore - taxSavingFromSipp);
  const totalEmployeeNI = totalEmployeeNIBefore;

  // Calculate gross income after salary sacrifice for student loan calculation
  // Student loans are calculated on gross income (after salary sacrifice) above threshold
  const annualGrossAfterSS = results.reduce((sum, r) =>
    sum + (r.id === "primary" ? (r.annualisedGross - r.salarySacrifice) : r.annualisedGross), 0);
  
  // Calculate student loan repayments (with breakdown)
  const studentLoanResult = calculateStudentLoans(annualGrossAfterSS, loans, config);
  const totalStudentLoans = studentLoanResult.total;

  const totalTakeHomeAnnual = annualGrossAfterSS - totalIncomeTax - totalEmployeeNI - totalStudentLoans - sippPersonal;

  return {
    streams: results,
    sippGrossed,
    sippExtraReliefEstimate,
    totalIncomeTax,
    totalEmployeeNI,
    totalStudentLoans,
    studentLoanBreakdown: studentLoanResult.breakdown,
    totalGrossAnnual: totalAnnualGross,
    totalTakeHomeAnnual,
  };
}

// Helper function for simple monthly PAYE calculation
// Returns just the monthly take-home (for backwards compatibility)
export function calcPayeMonthly(input: {
  grossMonthly: number;
  taxCode: string;
  loans?: LoanKey[];
  pensionPct?: number;
  sippPct?: number;
}): number {
  const result = calcPayeMonthlyFull(input);
  return result.totalTakeHomeAnnual / 12;
}

// Full breakdown version that includes student loan breakdown
export function calcPayeMonthlyFull(input: {
  grossMonthly: number;
  taxCode: string;
  loans?: LoanKey[];
  pensionPct?: number;
  sippPct?: number;
}): CombinedPayeOutput {
  const { grossMonthly, taxCode, loans = [], pensionPct = 0, sippPct = 0 } = input;
  
  const annualGross = grossMonthly * 12;
  const sippPersonal = (annualGross * sippPct) / 100;
  
  return calcPAYECombined({
    streams: [{
      id: "primary",
      label: "Primary job",
      frequency: "monthly",
      amount: grossMonthly,
      taxCode,
      salarySacrificePct: pensionPct > 0 ? pensionPct : undefined,
    }],
    sippPersonal,
    loans,
  });
}
