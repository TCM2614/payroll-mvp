import { describe, expect, it } from "vitest";
import {
  parseCompareSlug,
  CANONICAL_COMPARE_SLUGS,
} from "../compareSlug";

describe("parseCompareSlug", () => {
  it("parses canonical day-rate slugs", () => {
    const r = parseCompareSlug("500-a-day");
    expect(r).not.toBeNull();
    expect(r!.cadence).toBe("day");
    expect(r!.rateValue).toBe(500);
    expect(r!.inputs.dayRate).toBe(500);
    expect(r!.compactDisplay).toBe("£500/day");
    expect(r!.annualAssignment).toBe(500 * 5 * 46);
  });

  it("parses hourly slugs", () => {
    const r = parseCompareSlug("50-per-hour");
    expect(r).not.toBeNull();
    expect(r!.cadence).toBe("hour");
    expect(r!.rateValue).toBe(50);
    expect(r!.inputs.dayRate).toBe(50 * 7.5);
  });

  it("parses monthly slugs", () => {
    const r = parseCompareSlug("5000-a-month");
    expect(r).not.toBeNull();
    expect(r!.cadence).toBe("month");
    expect(r!.rateValue).toBe(5000);
    expect(r!.annualAssignment).toBe(60000);
  });

  it("parses annual slugs", () => {
    const r = parseCompareSlug("120000-a-year");
    expect(r).not.toBeNull();
    expect(r!.cadence).toBe("year");
    expect(r!.rateValue).toBe(120000);
    expect(r!.annualAssignment).toBe(120000);
  });

  it("rejects values below the guardrails", () => {
    expect(parseCompareSlug("10-a-day")).toBeNull(); // < £50
    expect(parseCompareSlug("2-per-hour")).toBeNull(); // < £5
    expect(parseCompareSlug("500-a-month")).toBeNull(); // < £1k
    expect(parseCompareSlug("5000-a-year")).toBeNull(); // < £12k
  });

  it("rejects values above the guardrails", () => {
    expect(parseCompareSlug("99999-a-day")).toBeNull();
    expect(parseCompareSlug("999-per-hour")); // 999 is exactly on boundary → keep valid
    expect(parseCompareSlug("9999-per-hour")).toBeNull();
    expect(parseCompareSlug("9999999-a-year")).toBeNull();
  });

  it("rejects unrecognised slugs", () => {
    expect(parseCompareSlug("")).toBeNull();
    expect(parseCompareSlug("hello-world")).toBeNull();
    expect(parseCompareSlug("500-a-fortnight")).toBeNull();
    expect(parseCompareSlug("500")).toBeNull();
  });

  it("parses every canonical slug successfully", () => {
    for (const slug of CANONICAL_COMPARE_SLUGS) {
      const parsed = parseCompareSlug(slug);
      expect(parsed, `expected ${slug} to parse`).not.toBeNull();
      expect(parsed!.annualAssignment).toBeGreaterThan(0);
    }
  });
});
