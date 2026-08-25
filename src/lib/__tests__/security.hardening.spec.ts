import { describe, expect, it, vi, afterEach } from "vitest";
import { hasAcceptedCookieConsent, COOKIE_CONSENT_STORAGE_KEY } from "@/components/ads/consent";
import { safeJsonLd } from "@/lib/safeJsonLd";
import { SITE_URL, absoluteUrl } from "@/lib/siteUrl";
import { parseCompareSlug } from "@/lib/marketing/compareSlug";

describe("consent fail-closed (SEC-01)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubWindowLocalStorage(impl: {
    getItem: (k: string) => string | null;
    setItem?: (k: string, v: string) => void;
    removeItem?: (k: string) => void;
  }) {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: impl.getItem,
        setItem: impl.setItem ?? (() => {}),
        removeItem: impl.removeItem ?? (() => {}),
      },
    });
  }

  it("returns true only when localStorage holds accepted", () => {
    const store: Record<string, string> = {
      [COOKIE_CONSENT_STORAGE_KEY]: "accepted",
    };
    stubWindowLocalStorage({
      getItem: (k: string) => store[k] ?? null,
    });
    expect(hasAcceptedCookieConsent()).toBe(true);
  });

  it("returns false when consent is missing", () => {
    stubWindowLocalStorage({
      getItem: () => null,
    });
    expect(hasAcceptedCookieConsent()).toBe(false);
  });

  it("returns false when localStorage throws (fail-closed)", () => {
    stubWindowLocalStorage({
      getItem: () => {
        throw new Error("SecurityError");
      },
    });
    expect(hasAcceptedCookieConsent()).toBe(false);
  });
});

describe("safeJsonLd (SEC-10)", () => {
  it("escapes angle brackets that could break script context", () => {
    const out = safeJsonLd({ text: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script>");
    expect(JSON.parse(out).text).toContain("</script>");
  });

  it("round-trips normal structured data", () => {
    const data = { "@type": "FAQPage", name: "Test" };
    expect(JSON.parse(safeJsonLd(data))).toEqual(data);
  });
});

describe("SITE_URL (SEC-24)", () => {
  it("resolves to an https production host without yourdomain", () => {
    expect(SITE_URL.startsWith("https://")).toBe(true);
    expect(SITE_URL.includes("yourdomain")).toBe(false);
    expect(SITE_URL.endsWith("/")).toBe(false);
  });

  it("absoluteUrl joins paths safely", () => {
    expect(absoluteUrl("/privacy")).toBe(`${SITE_URL}/privacy`);
    expect(absoluteUrl("https://example.com/x")).toBe("https://example.com/x");
  });
});

describe("compare slug guardrails", () => {
  it("rejects nonsense and accepts canonical shapes", () => {
    expect(parseCompareSlug("not-a-rate")).toBeNull();
    expect(parseCompareSlug("1-a-day")).toBeNull();
    expect(parseCompareSlug("500-a-day")?.rateValue).toBe(500);
    expect(parseCompareSlug("x".repeat(80))).toBeNull();
  });
});

/** Mirrors /api/og-salary validation without importing the edge route. */
function isValidOgSalary(raw: unknown): boolean {
  const n = Number(raw);
  return Number.isFinite(n) && Number.isInteger(n) && n >= 1_000 && n <= 500_000;
}

describe("og-salary bounds (SEC-07)", () => {
  it("accepts catalogue-range integers", () => {
    expect(isValidOgSalary(50_000)).toBe(true);
    expect(isValidOgSalary(150_000)).toBe(true);
    expect(isValidOgSalary(500_000)).toBe(true);
  });

  it("rejects pathological and non-integer inputs", () => {
    expect(isValidOgSalary(999)).toBe(false);
    expect(isValidOgSalary(10_000_000)).toBe(false);
    expect(isValidOgSalary(50_000.5)).toBe(false);
    expect(isValidOgSalary("abc")).toBe(false);
    expect(isValidOgSalary(Infinity)).toBe(false);
  });
});
