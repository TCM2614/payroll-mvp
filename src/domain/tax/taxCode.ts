/**
 * Canonical UK tax-code parser + income-tax applier.
 *
 * Consolidates the three (previously drifting) parsers that used to live
 * in `src/lib/calculators/paye.ts`, `src/domain/tax/periodTax.ts`, and
 * `src/domain/tax/outsideIR35.ts`. Every consumer of a UK tax code
 * should now import from this module.
 *
 * ## Codes supported
 *
 *   Standard L / M / N / T codes           NNNNL, NNNNM, NNNNN, NNNNT
 *     → digits × 10 = personal allowance
 *     → M = received Marriage Allowance transfer; N = gave it up
 *     → T = HMRC review pending; treated numerically as L
 *
 *   K codes                                KNNN, NNNK
 *     → digits × 10 = "negative allowance", added to taxable income
 *     → PA = 0
 *
 *   Flat-rate codes                        BR, D0, D1
 *     → BR = 20% flat, D0 = 40% flat, D1 = 45% flat (rUK)
 *     → Scottish equivalents: SBR = 20%, SD0 = 21%, SD1 = 42%, SD2 = 45%
 *     → No personal allowance
 *
 *   0T                                     zero personal allowance,
 *                                          taxed via the normal band
 *                                          structure of the current
 *                                          regime
 *
 *   NT                                     no tax deducted
 *
 * ## Regime prefixes
 *
 *   S  → Scotland — uses the Scottish six-band structure. When the
 *        active tax-year config doesn't carry a `scotland` block the
 *        parser falls back to rUK bands and flags the result as
 *        partially-supported.
 *   C  → Wales — same rates as rUK for 2025/26 and 2026/27.
 *   (no prefix) → rest of the UK (England / Northern Ireland).
 *
 * ## Emergency (non-cumulative) suffixes
 *
 *   W1 / M1 / X  → non-cumulative basis. For an annual estimator the
 *                  total tax owed for the year is unchanged; the flag
 *                  is surfaced so the UI can hint about mid-year
 *                  over/under-taxation.
 *
 * ## Unrecognised codes
 *
 *   Anything the parser can't classify — e.g. a typo — is marked
 *   `unrecognised: true`, defaults to the rUK personal allowance from
 *   the config, and returns a description explaining the fallback so
 *   the UI can surface a warning.
 */

import type { IncomeTaxBand, PayeTaxConfig } from "@/lib/tax/uk2025";

export type TaxRegime = "rUK" | "scotland" | "wales";

export type TaxCodeFlavor =
  | "L" // standard: PA = digits × 10
  | "K" // negative allowance: digits × 10 added to taxable income
  | "M" // marriage allowance received (numerically like L)
  | "N" // marriage allowance given (numerically like L)
  | "T" // HMRC review pending (numerically like L)
  | "BR" // basic-rate flat
  | "D0" // second-tier flat (rUK higher / Scottish intermediate)
  | "D1" // third-tier flat (rUK additional / Scottish higher)
  | "D2" // Scottish advanced flat (SD2 only)
  | "0T" // no PA, banded
  | "NT"; // no tax

export interface ParsedTaxCode {
  raw: string;
  normalised: string;
  regime: TaxRegime;
  flavor: TaxCodeFlavor;
  /**
   * Positive personal allowance implied by the code (for L / M / N / T
   * codes). Zero for BR / D0 / D1 / D2 / 0T / K / NT.
   */
  personalAllowance: number;
  /**
   * Additional taxable income the code adds to gross (K codes only).
   * Zero for every other flavour.
   */
  negativeAllowance: number;
  /** Non-cumulative flag from W1 / M1 / X suffix. */
  nonCumulative: boolean;
  /** True when the code doesn't match any known shape. */
  unrecognised: boolean;
  /** Suffix flags for UI surfacing. */
  suffixFlags: {
    W1: boolean;
    M1: boolean;
    X: boolean;
    T: boolean;
    M: boolean;
    N: boolean;
  };
  /** Short human-readable description of the code's effect. */
  description: string;
}

/**
 * Derive the rUK income-tax band schedule from a PayeTaxConfig. The
 * config carries the numeric bookends (basic rate, band tops, etc.);
 * this helper converts them into the taxable-income band form the tax
 * engine wants.
 */
function rUKBandsFromConfig(config: PayeTaxConfig): IncomeTaxBand[] {
  return [
    { rate: config.basicRate, lower: 0, upper: config.basicBandTop },
    { rate: config.higherRate, lower: config.basicBandTop, upper: config.higherBandTop },
    { rate: config.additionalRate, lower: config.higherBandTop },
  ];
}

/**
 * Parse a UK tax code and derive everything downstream calculators need
 * to apply it (PA, negative allowance, regime, non-cumulative flag,
 * description). Never throws — unrecognised inputs return a best-effort
 * fallback with `unrecognised: true`.
 */
export function parseTaxCode(raw: string, defaultPA: number): ParsedTaxCode {
  const original = raw ?? "";
  const normalised = original.trim().toUpperCase();
  const suffixFlags = {
    W1: /\bW1\b/.test(normalised),
    M1: /\bM1\b/.test(normalised),
    X: /(?:\s|[A-Z])X\b|^X\s|\bX$/.test(normalised) && !/\bTAXX?\b/.test(normalised),
    T: false,
    M: false,
    N: false,
  };
  // Strip the non-cumulative markers so the flavour matcher below sees a
  // clean code. We're only stripping the modifier tokens, not stray X
  // characters that might be part of the code itself.
  let core = normalised
    .replace(/\s+/g, "")
    .replace(/W1$/, "")
    .replace(/M1$/, "")
    .replace(/X$/, "");

  // Regime prefix — one letter, either S (Scotland) or C (Wales / Cymru).
  let regime: TaxRegime = "rUK";
  if (core.startsWith("S")) {
    // Guard: "SBR" is Scottish flat-basic; the prefix "S" is only a
    // regime marker when it's followed by digits or one of the flat
    // codes we know about.
    if (/^S(?:D\d|BR|\d{3,4}[LMKNT])/.test(core)) {
      regime = "scotland";
      core = core.slice(1);
    }
  } else if (core.startsWith("C")) {
    // Welsh codes mirror rUK numerically but we still want to record the
    // regime so callers can display "Welsh" in copy. Only strip the
    // prefix when the remainder looks like a Welsh code proper.
    if (/^C(?:\d{3,4}[LMKNT]|BR|D\d|0T|NT)/.test(core)) {
      regime = "wales";
      core = core.slice(1);
    }
  }

  const nonCumulative = suffixFlags.W1 || suffixFlags.M1 || suffixFlags.X;
  const clampedDefault = Math.max(0, defaultPA);

  // Explicit flavours in priority order — most-specific first.
  //
  // NT: no tax.
  if (core === "NT") {
    return {
      raw: original,
      normalised,
      regime,
      flavor: "NT",
      personalAllowance: 0,
      negativeAllowance: 0,
      nonCumulative,
      unrecognised: false,
      suffixFlags,
      description: "No tax deducted (NT).",
    };
  }

  // Scottish flat-rate codes: SD0 / SD1 / SD2 map to distinct flavours.
  // rUK D2 is not a real code so we only reach D2 from an SD2 input.
  if (regime === "scotland" && core === "D2") {
    return {
      raw: original,
      normalised,
      regime,
      flavor: "D2",
      personalAllowance: 0,
      negativeAllowance: 0,
      nonCumulative,
      unrecognised: false,
      suffixFlags,
      description: "Scottish advanced-rate flat (SD2): 45% on every pound.",
    };
  }

  if (core === "BR" || core === "D0" || core === "D1") {
    const desc =
      core === "BR"
        ? regime === "scotland"
          ? "Scottish basic-rate flat (SBR): 20% on every pound."
          : "Basic-rate flat (BR): 20% on every pound."
        : core === "D0"
          ? regime === "scotland"
            ? "Scottish intermediate-rate flat (SD0): 21% on every pound."
            : "Higher-rate flat (D0): 40% on every pound."
          : regime === "scotland"
            ? "Scottish higher-rate flat (SD1): 42% on every pound."
            : "Additional-rate flat (D1): 45% on every pound.";
    return {
      raw: original,
      normalised,
      regime,
      flavor: core as "BR" | "D0" | "D1",
      personalAllowance: 0,
      negativeAllowance: 0,
      nonCumulative,
      unrecognised: false,
      suffixFlags,
      description: desc,
    };
  }

  // 0T: no personal allowance, banded taxation.
  if (core === "0T") {
    return {
      raw: original,
      normalised,
      regime,
      flavor: "0T",
      personalAllowance: 0,
      negativeAllowance: 0,
      nonCumulative,
      unrecognised: false,
      suffixFlags,
      description: "No personal allowance (0T); taxed at the normal bands.",
    };
  }

  // K codes: negative allowance. HMRC prints them both as "KNNN" and,
  // less commonly, as "NNNK" — accept either.
  const kMatch =
    core.match(/^K(\d{2,4})$/) ?? core.match(/^(\d{2,4})K$/);
  if (kMatch) {
    const digits = Number(kMatch[1]);
    if (Number.isFinite(digits) && digits >= 0) {
      const negativeAllowance = digits * 10;
      return {
        raw: original,
        normalised,
        regime,
        flavor: "K",
        personalAllowance: 0,
        negativeAllowance,
        nonCumulative,
        unrecognised: false,
        suffixFlags,
        description: `K code: adds £${negativeAllowance.toLocaleString("en-GB")}/year to your taxable income (untaxed benefit or arrears).`,
      };
    }
  }

  // L / M / N / T suffix codes with digits.
  const suffixMatch = core.match(/^(\d{3,4})([LMNT])$/);
  if (suffixMatch) {
    const digits = Number(suffixMatch[1]);
    const letter = suffixMatch[2] as "L" | "M" | "N" | "T";
    const personalAllowance = digits * 10;

    suffixFlags.M = letter === "M";
    suffixFlags.N = letter === "N";
    suffixFlags.T = letter === "T";

    const desc =
      letter === "L"
        ? `Standard code (${letter}): personal allowance £${personalAllowance.toLocaleString("en-GB")}.`
        : letter === "M"
          ? `Marriage Allowance received (${letter}): personal allowance £${personalAllowance.toLocaleString("en-GB")}.`
          : letter === "N"
            ? `Marriage Allowance transferred (${letter}): personal allowance £${personalAllowance.toLocaleString("en-GB")}.`
            : `HMRC review pending (${letter}): personal allowance £${personalAllowance.toLocaleString("en-GB")}.`;

    return {
      raw: original,
      normalised,
      regime,
      flavor: letter,
      personalAllowance,
      negativeAllowance: 0,
      nonCumulative,
      unrecognised: false,
      suffixFlags,
      description: desc,
    };
  }

  // Fallback: unrecognised. Return a safe default so calculators still
  // produce a result — but flag it so the UI can nudge the user.
  return {
    raw: original,
    normalised,
    regime,
    flavor: "L",
    personalAllowance: clampedDefault,
    negativeAllowance: 0,
    nonCumulative,
    unrecognised: true,
    suffixFlags,
    description: `Unrecognised code "${original}" — defaulting to the standard personal allowance of £${clampedDefault.toLocaleString("en-GB")}.`,
  };
}

/**
 * Apply the £100k+ PA taper to the code-derived personal allowance.
 * Every £2 of adjusted net income above £100,000 removes £1 of PA;
 * the allowance never goes below zero.
 */
export function taperPersonalAllowance(
  personalAllowance: number,
  adjustedNetIncome: number,
  config: PayeTaxConfig,
): number {
  if (adjustedNetIncome <= config.paTaperStart) return personalAllowance;
  const reduction = Math.floor(
    (adjustedNetIncome - config.paTaperStart) / 2,
  );
  return Math.max(0, personalAllowance - reduction);
}

/**
 * Compute annual income tax for a taxable amount using a given band
 * schedule. Bands are expressed as "taxable income" thresholds, matching
 * the shape produced by `createUK{2025,2026}Config` and the Scottish
 * schedule in `UK_TAX_2025.scotland.bands`.
 */
export function taxOnTaxableIncome(
  taxable: number,
  bands: readonly IncomeTaxBand[],
): number {
  if (taxable <= 0) return 0;
  let tax = 0;
  let remaining = taxable;
  for (const band of bands) {
    if (remaining <= 0) break;
    const width = band.upper !== undefined ? band.upper - band.lower : Infinity;
    const inBand = Math.max(0, Math.min(remaining, width));
    tax += inBand * band.rate;
    remaining -= inBand;
  }
  return Math.max(0, tax);
}

export interface ComputeIncomeTaxOptions {
  /**
   * Skip the £100k+ taper and use this pre-resolved personal allowance
   * as-is. Used by the multi-stream PAYE engine, which taper-allocates
   * PA across streams *before* per-stream tax is calculated — applying
   * the taper twice would understate tax at high incomes.
   */
  effectivePersonalAllowance?: number;
}

/**
 * Compute the annual income-tax charge implied by a parsed tax code on
 * a given gross annual income. Combines PA/negative-allowance logic,
 * the £100k+ taper, and regime-aware banded / flat-rate application.
 *
 * When `options.effectivePersonalAllowance` is provided the taper step
 * is skipped and the caller's PA value is used verbatim — appropriate
 * for multi-stream scenarios where PA is allocated externally.
 */
export function computeIncomeTaxFromCode(
  parsed: ParsedTaxCode,
  grossAnnualIncome: number,
  config: PayeTaxConfig,
  options: ComputeIncomeTaxOptions = {},
): number {
  if (grossAnnualIncome <= 0) return 0;
  if (parsed.flavor === "NT") return 0;

  const isScotland = parsed.regime === "scotland" && !!config.scotland;
  const scot = config.scotland;

  // Flat-rate codes bypass PA + band schedule entirely.
  if (parsed.flavor === "BR") {
    const rate = isScotland && scot ? scot.sBrRate : config.basicRate;
    return grossAnnualIncome * rate;
  }
  if (parsed.flavor === "D0") {
    const rate = isScotland && scot ? scot.sD0Rate : config.higherRate;
    return grossAnnualIncome * rate;
  }
  if (parsed.flavor === "D1") {
    const rate = isScotland && scot ? scot.sD1Rate : config.additionalRate;
    return grossAnnualIncome * rate;
  }
  if (parsed.flavor === "D2") {
    const rate = scot ? scot.sD2Rate : config.additionalRate;
    return grossAnnualIncome * rate;
  }

  const bands: readonly IncomeTaxBand[] =
    isScotland && scot ? scot.bands : rUKBandsFromConfig(config);

  // Apply the £100k+ taper to the code's headline PA unless the caller
  // already resolved an effective PA (multi-stream scenario). K codes
  // start with PA = 0, so the taper is a no-op for them regardless.
  const effectivePA =
    options.effectivePersonalAllowance !== undefined
      ? options.effectivePersonalAllowance
      : taperPersonalAllowance(
          parsed.personalAllowance,
          grossAnnualIncome,
          config,
        );

  const taxable = Math.max(
    0,
    grossAnnualIncome + parsed.negativeAllowance - effectivePA,
  );

  return taxOnTaxableIncome(taxable, bands);
}
