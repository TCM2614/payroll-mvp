import { UK_TAX_2025, LoanKey } from "../tax/uk2025";

export type Frequency = "hourly"|"daily"|"monthly"|"annual";
export type TaxCodeFlavor = "L"|"BR"|"D0"|"D1"|"0T"|"NT";

export type PayeIncomeStream = {
  id: string; label: string;
  frequency: Frequency; amount: number;
  taxCode: string;
  salarySacrificePct?: number; salarySacrificeFixed?: number;
};

export type CombinedPayeInput = { streams: PayeIncomeStream[]; sippPersonal?: number; };
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
  totalGrossAnnual: number; totalTakeHomeAnnual: number;
};

function parseTaxCode(raw: string): { flavor: TaxCodeFlavor; paFromCode?: number; nonCumulative?: boolean } {
  const s = raw.trim().toUpperCase();
  const nonCumulative = /\b(W1|M1)\b/.test(s);
  if (s.includes("NT")) return { flavor: "NT", nonCumulative };
  if (s.includes("BR")) return { flavor: "BR", nonCumulative };
  if (s.includes("D0")) return { flavor: "D0", nonCumulative };
  if (s.includes("D1")) return { flavor: "D1", nonCumulative };
  if (s.includes("0T")) return { flavor: "0T", nonCumulative };
  const m = s.match(/(\d{3,4})L/);
  if (m) return { flavor: "L", paFromCode: Number(m[1]) * 10, nonCumulative };
  return { flavor: "0T", nonCumulative };
}

function toAnnual(amount: number, frequency: Frequency): number {
  switch (frequency) {
    case "hourly": return amount * 7.5 * 5 * 46;
    case "daily": return amount * 5 * 46;
    case "monthly": return amount * 12;
    default: return amount;
  }
}
function clampPA(income: number, pa: number) {
  if (income <= UK_TAX_2025.paTaperStart) return pa;
  const lost = Math.min(pa, Math.max(0, Math.floor((income - UK_TAX_2025.paTaperStart) / 2)));
  return Math.max(0, pa - lost);
}
function bandTax(taxable: number) {
  const { basicRate, higherRate, additionalRate, basicBandTop, higherBandTop } = UK_TAX_2025;
  const basic = Math.min(taxable, basicBandTop);
  const higher = Math.min(Math.max(0, taxable - basicBandTop), higherBandTop - basicBandTop);
  const addl = Math.max(0, taxable - higherBandTop);
  return Math.max(0, basic*basicRate + higher*higherRate + addl*additionalRate);
}
function eeNI(annualGross: number) {
  const { primaryThreshold, upperEarningsLimit, mainRate, upperRate } = UK_TAX_2025.ni;
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

function allocatePA(streams: PayeIncomeStream[], basePA: number, totalIncomeAfterSSOnPrimary: number) {
  const tapered = clampPA(totalIncomeAfterSSOnPrimary, basePA);
  const lStreams = streams.filter(s => parseTaxCode(s.taxCode).flavor === "L");
  const map = new Map<string, number>();
  if (!lStreams.length) return map;

  const primary = lStreams.find(s => s.id === "primary") ?? lStreams[0];
  const primRaw = toAnnual(primary.amount, primary.frequency);
  const { adjustedGross: primAdj } = applySS(primRaw, primary.salarySacrificePct, primary.salarySacrificeFixed);
  const primPA = Math.min(tapered, primAdj);
  map.set(primary.id, primPA);

  const remaining = Math.max(0, tapered - primPA);
  const others = lStreams.filter(s => s.id !== primary.id);
  if (remaining > 0 && others.length) {
    const total = others.reduce((a, s) => a + toAnnual(s.amount, s.frequency), 0) || 1;
    for (const s of others) {
      const share = Math.min(remaining, (toAnnual(s.amount, s.frequency) / total) * remaining);
      map.set(s.id, (map.get(s.id) ?? 0) + share);
    }
  }
  return map;
}

function calcStreamAnnual(stream: PayeIncomeStream, paShare: number, isPrimary: boolean): StreamResult {
  const parsed = parseTaxCode(stream.taxCode);
  const raw = toAnnual(stream.amount, stream.frequency);

  let salarySacrifice = 0, gross = raw;
  const notes: string[] = [];
  if (isPrimary && (stream.salarySacrificeFixed || stream.salarySacrificePct)) {
    const res = applySS(raw, stream.salarySacrificePct, stream.salarySacrificeFixed);
    gross = res.adjustedGross; salarySacrifice = res.sacrifice;
    notes.push("Salary sacrifice applied on primary stream.");
  }

  let tax = 0, taxable = 0;
  switch (parsed.flavor) {
    case "NT": tax = 0; taxable = 0; notes.push("NT: no tax."); break;
    case "BR": tax = gross * UK_TAX_2025.basicRate; taxable = gross; notes.push("BR: 20% flat."); break;
    case "D0": tax = gross * UK_TAX_2025.higherRate; taxable = gross; notes.push("D0: 40% flat."); break;
    case "D1": tax = gross * UK_TAX_2025.additionalRate; taxable = gross; notes.push("D1: 45% flat."); break;
    case "0T": taxable = gross; tax = bandTax(taxable); notes.push("0T: no PA, banding."); break;
    case "L":  taxable = Math.max(0, gross - paShare); tax = bandTax(taxable); notes.push(`L: PA £${paShare.toFixed(0)}.`); break;
  }
  const ni = eeNI(gross);

  return {
    id: stream.id, label: stream.label, frequency: stream.frequency,
    grossEntered: stream.amount, annualisedGross: raw,
    salarySacrifice, incomeTax: tax, employeeNI: ni,
    taxableIncomeAfterReliefs: taxable, notes
  };
}

export function calcPAYECombined(input: CombinedPayeInput): CombinedPayeOutput {
  const { streams, sippPersonal = 0 } = input;

  let totalAfterSSPrimary = 0;
  for (const s of streams) {
    const annual = toAnnual(s.amount, s.frequency);
    if (s.id === "primary" && (s.salarySacrificeFixed || s.salarySacrificePct)) {
      totalAfterSSPrimary += applySS(annual, s.salarySacrificePct, s.salarySacrificeFixed).adjustedGross;
    } else totalAfterSSPrimary += annual;
  }

  const primary = streams.find(s => s.id === "primary");
  const basePA = primary
    ? (parseTaxCode(primary.taxCode).paFromCode ?? UK_TAX_2025.personalAllowance)
    : UK_TAX_2025.personalAllowance;

  const paAlloc = allocatePA(streams, basePA, totalAfterSSPrimary);
  const results = streams.map(s => calcStreamAnnual(s, paAlloc.get(s.id) ?? 0, s.id === "primary"));

  const sippGrossed = sippPersonal > 0 ? sippPersonal / 0.8 : 0;
  const totalAnnualGross = results.reduce((a, r) => a + r.annualisedGross, 0);
  const marginal =
    totalAnnualGross > UK_TAX_2025.higherBandTop ? UK_TAX_2025.additionalRate
      : totalAnnualGross > UK_TAX_2025.basicBandTop ? UK_TAX_2025.higherRate
      : UK_TAX_2025.basicRate;
  const extraReliefRate = Math.max(0, marginal - 0.20);
  const sippExtraReliefEstimate = sippGrossed * extraReliefRate;
  const taxSavingFromSipp = sippGrossed * marginal;

  const totalIncomeTaxBefore = results.reduce((a, r) => a + r.incomeTax, 0);
  const totalEmployeeNIBefore = results.reduce((a, r) => a + r.employeeNI, 0);
  const totalIncomeTax = Math.max(0, totalIncomeTaxBefore - taxSavingFromSipp);
  const totalEmployeeNI = totalEmployeeNIBefore;

  const annualGrossAfterSS = results.reduce((sum, r) =>
    sum + (r.id === "primary" ? (r.annualisedGross - r.salarySacrifice) : r.annualisedGross), 0);

  const totalTakeHomeAnnual = annualGrossAfterSS - totalIncomeTax - totalEmployeeNI - sippPersonal;

  return {
    streams: results,
    sippGrossed,
    sippExtraReliefEstimate,
    totalIncomeTax,
    totalEmployeeNI,
    totalGrossAnnual: totalAnnualGross,
    totalTakeHomeAnnual,
  };
}

// Helper function for simple monthly PAYE calculation
export function calcPayeMonthly(input: {
  grossMonthly: number;
  taxCode: string;
  loans?: LoanKey[];
  pensionPct?: number;
  sippPct?: number;
}): number {
  const { grossMonthly, taxCode, loans = [], pensionPct = 0, sippPct = 0 } = input;
  
  const annualGross = grossMonthly * 12;
  const pensionAmount = (annualGross * pensionPct) / 100;
  const sippPersonal = (annualGross * sippPct) / 100;
  
  const result = calcPAYECombined({
    streams: [{
      id: "primary",
      label: "Primary job",
      frequency: "monthly",
      amount: grossMonthly,
      taxCode,
      salarySacrificePct: pensionPct > 0 ? pensionPct : undefined,
    }],
    sippPersonal,
  });
  
  // Calculate student loan repayments (simplified)
  let studentLoanTotal = 0;
  // This is a placeholder - you'd need to implement proper student loan calculation
  // based on the loan plans in the loans array
  
  return (result.totalTakeHomeAnnual - studentLoanTotal) / 12;
}
