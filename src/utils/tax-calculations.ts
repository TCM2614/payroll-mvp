const CGT_ALLOWANCE = 3000;
const PERSONAL_ALLOWANCE = 12570;
const BASIC_THRESHOLD = 50270;
const ADDITIONAL_THRESHOLD = 125140;
const CLASS4_LOWER_LIMIT = 12570;
const CLASS4_UPPER_LIMIT = 50270;

export type AssetType = "property" | "shares";
export type IncomeBand = "basic" | "higher" | "additional";

export type CapitalGainsInput = {
  profit: number;
  type: AssetType;
  incomeBand: IncomeBand;
};

export type CapitalGainsResult = {
  totalGain: number;
  allowanceUsed: number;
  taxableGain: number;
  basicRateTax: number;
  higherRateTax: number;
  totalTax: number;
  netGain: number;
};

export function calculateCGT({ profit, type, incomeBand }: CapitalGainsInput): CapitalGainsResult {
  const sanitizedProfit = Number.isFinite(profit) ? Math.max(0, profit) : 0;
  const allowanceUsed = Math.min(CGT_ALLOWANCE, sanitizedProfit);
  const taxableGain = Math.max(0, sanitizedProfit - CGT_ALLOWANCE);

  const basicRate = type === "property" ? 0.18 : 0.18;
  const higherRate = type === "property" ? 0.24 : 0.24;

  let basicRateTax = 0;
  let higherRateTax = 0;

  if (incomeBand === "basic") {
    basicRateTax = taxableGain * basicRate;
  } else {
    higherRateTax = taxableGain * higherRate;
  }

  const totalTax = basicRateTax + higherRateTax;
  const netGain = sanitizedProfit - totalTax;

  return {
    totalGain: sanitizedProfit,
    allowanceUsed,
    taxableGain,
    basicRateTax,
    higherRateTax,
    totalTax,
    netGain: Math.max(netGain, 0),
  };
}

export type SoleTraderInput = {
  profit: number;
};

export type SoleTraderResult = {
  incomeTax: number;
  class4NI: number;
  totalTax: number;
  netProfit: number;
  effectiveRate: number;
};

export function calculateSoleTrader({ profit }: SoleTraderInput): SoleTraderResult {
  const sanitizedProfit = Number.isFinite(profit) ? Math.max(0, profit) : 0;

  const taxableIncome = Math.max(0, sanitizedProfit - PERSONAL_ALLOWANCE);
  let remaining = taxableIncome;
  let incomeTax = 0;

  const basicBandWidth = Math.max(0, BASIC_THRESHOLD - PERSONAL_ALLOWANCE);
  const higherBandWidth = Math.max(0, ADDITIONAL_THRESHOLD - BASIC_THRESHOLD);

  const applyBand = (bandWidth: number, rate: number) => {
    if (remaining <= 0) return 0;
    const used = Math.min(remaining, bandWidth);
    remaining -= used;
    return used * rate;
  };

  incomeTax += applyBand(basicBandWidth, 0.2);
  incomeTax += applyBand(higherBandWidth, 0.4);
  if (remaining > 0) {
    incomeTax += remaining * 0.45;
  }

  const midBand = Math.min(Math.max(sanitizedProfit - CLASS4_LOWER_LIMIT, 0), CLASS4_UPPER_LIMIT - CLASS4_LOWER_LIMIT);
  const upperBand = Math.max(sanitizedProfit - CLASS4_UPPER_LIMIT, 0);
  const class4NI = midBand * 0.06 + upperBand * 0.02;

  const totalTax = incomeTax + class4NI;
  const netProfit = sanitizedProfit - totalTax;
  const effectiveRate = sanitizedProfit > 0 ? totalTax / sanitizedProfit : 0;

  return {
    incomeTax,
    class4NI,
    totalTax,
    netProfit,
    effectiveRate,
  };
}

export type CorpTaxInput = {
  profit: number;
};

export type CorpTaxResult = {
  corporationTax: number;
  effectiveRate: number;
  netProfit: number;
};

export function calculateCorpTax({ profit }: CorpTaxInput): CorpTaxResult {
  const sanitizedProfit = Number.isFinite(profit) ? Math.max(0, profit) : 0;

  let corporationTax = 0;

  if (sanitizedProfit <= 50000) {
    corporationTax = sanitizedProfit * 0.19;
  } else if (sanitizedProfit >= 250000) {
    corporationTax = sanitizedProfit * 0.25;
  } else {
    corporationTax = sanitizedProfit * 0.25 - (250000 - sanitizedProfit) * 0.015;
  }

  const netProfit = sanitizedProfit - corporationTax;
  const effectiveRate = sanitizedProfit > 0 ? corporationTax / sanitizedProfit : 0;

  return {
    corporationTax,
    effectiveRate,
    netProfit,
  };
}
