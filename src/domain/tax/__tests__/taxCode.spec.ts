/**
 * Regression coverage for the shared UK tax-code parser.
 *
 * Locks in every code shape the parser is supposed to handle — standard
 * L / M / N / T, K codes (both KNNN and NNNK), flat-rate BR / D0 / D1,
 * 0T, NT, Scottish S-prefix (S1257L, SBR, SD0, SD1, SD2), Welsh C
 * prefix, and every non-cumulative emergency suffix (W1 / M1 / X).
 * Also pins the £100k+ PA taper behaviour and the reconciliation
 * against a real-world Scottish £50k example.
 */

import { describe, expect, it } from "vitest";
import { UK_TAX_2026 } from "@/lib/tax/uk2025";
import {
  computeIncomeTaxFromCode,
  parseTaxCode,
} from "../taxCode";

const config = UK_TAX_2026;
const DEFAULT_PA = config.personalAllowance;

describe("parseTaxCode — L / standard codes", () => {
  it("parses 1257L into a full personal allowance", () => {
    const r = parseTaxCode("1257L", DEFAULT_PA);
    expect(r.flavor).toBe("L");
    expect(r.regime).toBe("rUK");
    expect(r.personalAllowance).toBe(12_570);
    expect(r.negativeAllowance).toBe(0);
    expect(r.nonCumulative).toBe(false);
    expect(r.unrecognised).toBe(false);
  });

  it("parses lowercased and whitespace-padded codes", () => {
    const r = parseTaxCode("  1257l  ", DEFAULT_PA);
    expect(r.flavor).toBe("L");
    expect(r.personalAllowance).toBe(12_570);
  });

  it("parses larger PA digits (e.g. 1383L for £13,830)", () => {
    const r = parseTaxCode("1383L", DEFAULT_PA);
    expect(r.personalAllowance).toBe(13_830);
  });
});

describe("parseTaxCode — M / N (Marriage Allowance)", () => {
  it("parses 1383M as marriage-allowance received (+£1,260 PA)", () => {
    const r = parseTaxCode("1383M", DEFAULT_PA);
    expect(r.flavor).toBe("M");
    expect(r.personalAllowance).toBe(13_830);
    expect(r.suffixFlags.M).toBe(true);
    expect(r.suffixFlags.N).toBe(false);
  });

  it("parses 1131N as marriage-allowance transferred (−£1,260 PA)", () => {
    const r = parseTaxCode("1131N", DEFAULT_PA);
    expect(r.flavor).toBe("N");
    expect(r.personalAllowance).toBe(11_310);
    expect(r.suffixFlags.N).toBe(true);
  });
});

describe("parseTaxCode — T (review pending)", () => {
  it("parses 500T with the exact PA HMRC provided", () => {
    const r = parseTaxCode("500T", DEFAULT_PA);
    expect(r.flavor).toBe("T");
    expect(r.personalAllowance).toBe(5_000);
    expect(r.suffixFlags.T).toBe(true);
  });
});

describe("parseTaxCode — K codes (negative allowance)", () => {
  it("parses K475 into a £4,750 negative allowance", () => {
    const r = parseTaxCode("K475", DEFAULT_PA);
    expect(r.flavor).toBe("K");
    expect(r.personalAllowance).toBe(0);
    expect(r.negativeAllowance).toBe(4_750);
  });

  it("also accepts the alternative NNNK ordering (e.g. 475K)", () => {
    const r = parseTaxCode("475K", DEFAULT_PA);
    expect(r.flavor).toBe("K");
    expect(r.negativeAllowance).toBe(4_750);
  });

  it("supports smaller K codes (K12 → £120)", () => {
    const r = parseTaxCode("K12", DEFAULT_PA);
    expect(r.negativeAllowance).toBe(120);
  });
});

describe("parseTaxCode — flat-rate codes", () => {
  it("parses BR as flat basic rate", () => {
    expect(parseTaxCode("BR", DEFAULT_PA).flavor).toBe("BR");
  });
  it("parses D0 as flat higher rate", () => {
    expect(parseTaxCode("D0", DEFAULT_PA).flavor).toBe("D0");
  });
  it("parses D1 as flat additional rate", () => {
    expect(parseTaxCode("D1", DEFAULT_PA).flavor).toBe("D1");
  });
  it("parses 0T as no-PA banded", () => {
    expect(parseTaxCode("0T", DEFAULT_PA).flavor).toBe("0T");
  });
  it("parses NT as no tax", () => {
    expect(parseTaxCode("NT", DEFAULT_PA).flavor).toBe("NT");
  });
});

describe("parseTaxCode — Scottish S-prefix", () => {
  it("recognises S1257L as a Scottish standard code", () => {
    const r = parseTaxCode("S1257L", DEFAULT_PA);
    expect(r.regime).toBe("scotland");
    expect(r.flavor).toBe("L");
    expect(r.personalAllowance).toBe(12_570);
  });

  it("recognises SBR / SD0 / SD1 / SD2 flat-rate Scottish codes", () => {
    expect(parseTaxCode("SBR", DEFAULT_PA)).toMatchObject({
      regime: "scotland",
      flavor: "BR",
    });
    expect(parseTaxCode("SD0", DEFAULT_PA)).toMatchObject({
      regime: "scotland",
      flavor: "D0",
    });
    expect(parseTaxCode("SD1", DEFAULT_PA)).toMatchObject({
      regime: "scotland",
      flavor: "D1",
    });
    expect(parseTaxCode("SD2", DEFAULT_PA)).toMatchObject({
      regime: "scotland",
      flavor: "D2",
    });
  });
});

describe("parseTaxCode — Welsh C-prefix", () => {
  it("recognises C1257L as a Welsh standard code", () => {
    const r = parseTaxCode("C1257L", DEFAULT_PA);
    expect(r.regime).toBe("wales");
    expect(r.flavor).toBe("L");
    expect(r.personalAllowance).toBe(12_570);
  });
});

describe("parseTaxCode — emergency non-cumulative suffixes", () => {
  it("flags W1 as non-cumulative and preserves the underlying code", () => {
    const r = parseTaxCode("1257L W1", DEFAULT_PA);
    expect(r.flavor).toBe("L");
    expect(r.personalAllowance).toBe(12_570);
    expect(r.nonCumulative).toBe(true);
    expect(r.suffixFlags.W1).toBe(true);
  });

  it("flags M1 as non-cumulative", () => {
    const r = parseTaxCode("1257L M1", DEFAULT_PA);
    expect(r.nonCumulative).toBe(true);
    expect(r.suffixFlags.M1).toBe(true);
  });

  it("flags X as non-cumulative and doesn't confuse it with 0T", () => {
    const r = parseTaxCode("1257L X", DEFAULT_PA);
    expect(r.flavor).toBe("L");
    expect(r.nonCumulative).toBe(true);
    expect(r.suffixFlags.X).toBe(true);
  });
});

describe("parseTaxCode — unrecognised", () => {
  it("marks nonsense inputs as unrecognised with a fallback PA", () => {
    const r = parseTaxCode("HELLO", DEFAULT_PA);
    expect(r.unrecognised).toBe(true);
    expect(r.personalAllowance).toBe(DEFAULT_PA);
  });

  it("marks the empty string as unrecognised", () => {
    const r = parseTaxCode("", DEFAULT_PA);
    expect(r.unrecognised).toBe(true);
  });
});

describe("computeIncomeTaxFromCode — rUK", () => {
  it("agrees with the pre-existing PA-taper spec at £80k on 1257L", () => {
    // 80,000 − 12,570 PA = 67,430 taxable → 20% on 37,700 = 7,540;
    // 40% on 29,730 = 11,892; total = 19,432 (rounded).
    const parsed = parseTaxCode("1257L", DEFAULT_PA);
    const tax = computeIncomeTaxFromCode(parsed, 80_000, config);
    expect(tax).toBeCloseTo(19_432, 0);
  });

  it("applies the £100k+ taper at £115k on 1257L", () => {
    // PA tapered by 7,500 → 5,070. Taxable = 109,930. Tax = 36,432.
    const parsed = parseTaxCode("1257L", DEFAULT_PA);
    const tax = computeIncomeTaxFromCode(parsed, 115_000, config);
    expect(tax).toBeCloseTo(36_432, 0);
  });

  it("applies BR as a flat 20% on all income", () => {
    const parsed = parseTaxCode("BR", DEFAULT_PA);
    const tax = computeIncomeTaxFromCode(parsed, 30_000, config);
    expect(tax).toBeCloseTo(6_000, 0);
  });

  it("applies D0 as a flat 40% on all income", () => {
    const parsed = parseTaxCode("D0", DEFAULT_PA);
    const tax = computeIncomeTaxFromCode(parsed, 30_000, config);
    expect(tax).toBeCloseTo(12_000, 0);
  });

  it("applies D1 as a flat 45% on all income", () => {
    const parsed = parseTaxCode("D1", DEFAULT_PA);
    const tax = computeIncomeTaxFromCode(parsed, 30_000, config);
    expect(tax).toBeCloseTo(13_500, 0);
  });

  it("returns £0 for NT regardless of income", () => {
    const parsed = parseTaxCode("NT", DEFAULT_PA);
    expect(computeIncomeTaxFromCode(parsed, 30_000, config)).toBe(0);
    expect(computeIncomeTaxFromCode(parsed, 200_000, config)).toBe(0);
  });

  it("adds the K-code negative allowance to taxable income", () => {
    // K475 on £30k → taxable = 30,000 + 4,750 = 34,750 (all basic band).
    // Tax = 34,750 × 20% = 6,950.
    const parsed = parseTaxCode("K475", DEFAULT_PA);
    const tax = computeIncomeTaxFromCode(parsed, 30_000, config);
    expect(tax).toBeCloseTo(6_950, 0);
  });
});

describe("computeIncomeTaxFromCode — Scotland", () => {
  it("charges the six-band Scottish schedule on £50k S1257L", () => {
    // £50k − £12,570 = £37,430 taxable.
    //   Starter 19% × 2,827      = 537.13
    //   Basic   20% × 12,094     = 2,418.80
    //   Interm. 21% × 16,171     = 3,395.91
    //   Higher  42% × 6,338      = 2,661.96
    //   Total ~ 9,013.80
    const parsed = parseTaxCode("S1257L", DEFAULT_PA);
    const tax = computeIncomeTaxFromCode(parsed, 50_000, config);
    expect(tax).toBeCloseTo(9_013.8, 1);
  });

  it("levies more tax on a Scottish £50k than the rUK equivalent", () => {
    // The same £50k under the rUK bands (basic rate only) comes to
    // £7,486. Scotland's higher intermediate + higher rates pull it up.
    const rUK = computeIncomeTaxFromCode(parseTaxCode("1257L", DEFAULT_PA), 50_000, config);
    const scot = computeIncomeTaxFromCode(parseTaxCode("S1257L", DEFAULT_PA), 50_000, config);
    expect(scot).toBeGreaterThan(rUK);
    expect(scot - rUK).toBeCloseTo(1_528, 0);
  });

  it("charges the Scottish top rate 48% above £125,140 for S1257L", () => {
    // £150k on S1257L: PA tapered to 0. Taxable = 150,000.
    // Starter 19% × 2,827 = 537.13
    // Basic   20% × 12,094 = 2,418.80
    // Interm. 21% × 16,171 = 3,395.91
    // Higher  42% × 31,338 = 13,161.96
    // Advan.  45% × 50,140 = 22,563.00
    // Top     48% × 37,430 = 17,966.40
    //  → 60,043.20
    const parsed = parseTaxCode("S1257L", DEFAULT_PA);
    const tax = computeIncomeTaxFromCode(parsed, 150_000, config);
    expect(tax).toBeCloseTo(60_043.2, 1);
  });

  it("applies SD0 as a flat 21% (Scottish intermediate)", () => {
    const parsed = parseTaxCode("SD0", DEFAULT_PA);
    const tax = computeIncomeTaxFromCode(parsed, 30_000, config);
    expect(tax).toBeCloseTo(6_300, 0);
  });

  it("applies SD2 as a flat 45% (Scottish advanced)", () => {
    const parsed = parseTaxCode("SD2", DEFAULT_PA);
    const tax = computeIncomeTaxFromCode(parsed, 30_000, config);
    expect(tax).toBeCloseTo(13_500, 0);
  });
});

describe("computeIncomeTaxFromCode — degenerate inputs", () => {
  it("returns 0 for a zero income", () => {
    const parsed = parseTaxCode("1257L", DEFAULT_PA);
    expect(computeIncomeTaxFromCode(parsed, 0, config)).toBe(0);
    expect(computeIncomeTaxFromCode(parsed, -100, config)).toBe(0);
  });
});
