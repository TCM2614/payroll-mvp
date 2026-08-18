/**
 * 30‑Day Launch Marketing Calendar.
 *
 * Every entry is a *deterministic* insight → many distribution assets. No
 * number in this file is hand‑written — the values are derived at import time
 * from the tax engine via `buildSalaryInsight` / `compareSalaries`.
 *
 * The goal is: 1 strong insight → 5–7 distribution assets.
 *
 * Publishing workflow (per docs/growth/analytics-spec.md and the growth
 * brief): AI never publishes autonomously. Every entry should be reviewed and
 * approved by a human before it goes out.
 */

import {
  buildSalaryInsight,
  compareSalaries,
  type ComparisonInsight,
  type SalaryInsight,
} from "@/lib/content/insights";
import {
  renderForPlatform,
  type ContentPlatform,
  type RenderedContent,
} from "@/lib/content/templates";

export type CampaignTheme =
  | "salary_reality"
  | "pay_rise_reality"
  | "tax_trap"
  | "salary_comparison"
  | "salary_ranking"
  | "contractor_reality"
  | "region_reality";

export interface CalendarEntry {
  day: number;
  theme: CampaignTheme;
  hook: string;
  insight?: SalaryInsight;
  comparison?: ComparisonInsight;
  seoKeyword?: string;
  landingPath: string;
  primaryCta: string;
  assets: Partial<Record<ContentPlatform, RenderedContent>>;
}

// Curated set of insights used across the calendar. Grouping here keeps the
// calendar readable and lets us re‑use the same insight across multiple days.
const INSIGHTS: Record<string, SalaryInsight> = {
  s25: buildSalaryInsight(25_000),
  s30: buildSalaryInsight(30_000),
  s35: buildSalaryInsight(35_000),
  s40: buildSalaryInsight(40_000),
  s50: buildSalaryInsight(50_000),
  s60: buildSalaryInsight(60_000),
  s70: buildSalaryInsight(70_000),
  s80: buildSalaryInsight(80_000),
  s100: buildSalaryInsight(100_000),
  s125: buildSalaryInsight(125_000),
  s150: buildSalaryInsight(150_000),
  s60_scot: buildSalaryInsight(60_000, "scotland"),
};

const COMPARISONS: Record<string, ComparisonInsight> = {
  raise30_35: compareSalaries(30_000, 35_000),
  raise40_50: compareSalaries(40_000, 50_000),
  raise50_60: compareSalaries(50_000, 60_000),
  raise60_70: compareSalaries(60_000, 70_000),
  raise70_100: compareSalaries(70_000, 100_000),
  trap100_110: compareSalaries(100_000, 110_000),
  trap100_125: compareSalaries(100_000, 125_140),
};

const PLATFORMS: ContentPlatform[] = [
  "tiktok",
  "reels",
  "youtube_short",
  "linkedin",
  "x",
  "instagram_carousel",
  "email",
];

function makeEntry(day: number, base: Omit<CalendarEntry, "day" | "assets" | "hook"> & { hook?: string }): CalendarEntry {
  const primaryPlatform = base.comparison ? "tiktok" : "tiktok";
  const seed = renderForPlatform(primaryPlatform, {
    insight: base.insight,
    comparison: base.comparison,
  });
  const assets: Partial<Record<ContentPlatform, RenderedContent>> = {};
  for (const p of PLATFORMS) {
    assets[p] = renderForPlatform(p, {
      insight: base.insight,
      comparison: base.comparison,
    });
  }
  return {
    day,
    theme: base.theme,
    hook: base.hook ?? seed.hook,
    insight: base.insight,
    comparison: base.comparison,
    seoKeyword: base.seoKeyword,
    landingPath: base.landingPath,
    primaryCta: base.primaryCta,
    assets,
  };
}

export const LAUNCH_CALENDAR: CalendarEntry[] = [
  makeEntry(1, {
    theme: "salary_reality",
    insight: INSIGHTS.s30,
    seoKeyword: "£30,000 after tax UK",
    landingPath: INSIGHTS.s30.path,
    primaryCta: "See what £30k really takes home",
  }),
  makeEntry(2, {
    theme: "salary_reality",
    insight: INSIGHTS.s35,
    seoKeyword: "£35,000 after tax UK",
    landingPath: INSIGHTS.s35.path,
    primaryCta: "See what £35k really takes home",
  }),
  makeEntry(3, {
    theme: "pay_rise_reality",
    comparison: COMPARISONS.raise30_35,
    seoKeyword: "pay rise calculator UK",
    landingPath: "/pay-rise?from=30000&to=35000",
    primaryCta: "See any pay rise",
  }),
  makeEntry(4, {
    theme: "salary_reality",
    insight: INSIGHTS.s40,
    seoKeyword: "£40,000 after tax",
    landingPath: INSIGHTS.s40.path,
    primaryCta: "See £40k breakdown",
  }),
  makeEntry(5, {
    theme: "salary_comparison",
    comparison: COMPARISONS.raise40_50,
    seoKeyword: "£40k vs £50k UK",
    landingPath: "/compare/40000-vs-50000",
    primaryCta: "Compare £40k vs £50k",
  }),
  makeEntry(6, {
    theme: "salary_reality",
    insight: INSIGHTS.s50,
    seoKeyword: "£50,000 after tax UK",
    landingPath: INSIGHTS.s50.path,
    primaryCta: "See £50k breakdown",
  }),
  makeEntry(7, {
    theme: "salary_ranking",
    insight: INSIGHTS.s50,
    hook: "Where does £50k rank in Britain?",
    seoKeyword: "UK salary percentile",
    landingPath: "/salary-percentile",
    primaryCta: "See your ranking",
  }),
  makeEntry(8, {
    theme: "pay_rise_reality",
    comparison: COMPARISONS.raise50_60,
    seoKeyword: "£50k to £60k pay rise",
    landingPath: "/pay-rise?from=50000&to=60000",
    primaryCta: "Model your raise",
  }),
  makeEntry(9, {
    theme: "salary_reality",
    insight: INSIGHTS.s60,
    seoKeyword: "£60,000 after tax UK",
    landingPath: INSIGHTS.s60.path,
    primaryCta: "See £60k breakdown",
  }),
  makeEntry(10, {
    theme: "region_reality",
    insight: INSIGHTS.s60_scot,
    hook: "£60k in Scotland vs England — the real difference",
    seoKeyword: "Scottish income tax £60k",
    landingPath: INSIGHTS.s60.path,
    primaryCta: "Compare regions",
  }),
  makeEntry(11, {
    theme: "salary_reality",
    insight: INSIGHTS.s70,
    seoKeyword: "£70,000 after tax UK",
    landingPath: INSIGHTS.s70.path,
    primaryCta: "See £70k breakdown",
  }),
  makeEntry(12, {
    theme: "salary_comparison",
    comparison: COMPARISONS.raise60_70,
    seoKeyword: "£60k vs £70k",
    landingPath: "/compare/60000-vs-70000",
    primaryCta: "Compare £60k vs £70k",
  }),
  makeEntry(13, {
    theme: "salary_reality",
    insight: INSIGHTS.s80,
    seoKeyword: "£80,000 after tax",
    landingPath: INSIGHTS.s80.path,
    primaryCta: "See £80k breakdown",
  }),
  makeEntry(14, {
    theme: "salary_ranking",
    insight: INSIGHTS.s80,
    hook: "£80k in the UK — top X%?",
    seoKeyword: "top 10% UK salary",
    landingPath: "/salary-percentile",
    primaryCta: "See your ranking",
  }),
  makeEntry(15, {
    theme: "salary_reality",
    insight: INSIGHTS.s100,
    seoKeyword: "£100,000 after tax UK",
    landingPath: INSIGHTS.s100.path,
    primaryCta: "See £100k breakdown",
  }),
  makeEntry(16, {
    theme: "tax_trap",
    comparison: COMPARISONS.trap100_110,
    hook: "The £100k tax trap — a £10k raise, and half of it disappears.",
    seoKeyword: "£100k tax trap",
    landingPath: "/100k-tax-trap",
    primaryCta: "See the tax trap",
  }),
  makeEntry(17, {
    theme: "tax_trap",
    comparison: COMPARISONS.trap100_125,
    hook: "Earning £125k feels like earning £100k",
    seoKeyword: "60% marginal tax UK",
    landingPath: "/100k-tax-trap",
    primaryCta: "See the tax trap",
  }),
  makeEntry(18, {
    theme: "salary_reality",
    insight: INSIGHTS.s125,
    seoKeyword: "£125,000 after tax UK",
    landingPath: INSIGHTS.s125.path,
    primaryCta: "See £125k breakdown",
  }),
  makeEntry(19, {
    theme: "salary_reality",
    insight: INSIGHTS.s150,
    seoKeyword: "£150,000 after tax UK",
    landingPath: INSIGHTS.s150.path,
    primaryCta: "See £150k breakdown",
  }),
  makeEntry(20, {
    theme: "contractor_reality",
    hook: "£500/day does not mean you take home £500/day.",
    seoKeyword: "umbrella calculator UK",
    landingPath: "/calculator",
    primaryCta: "Umbrella take-home",
  }),
  makeEntry(21, {
    theme: "salary_ranking",
    insight: INSIGHTS.s100,
    hook: "£100k puts you in the top 3% of UK earners. What that means.",
    seoKeyword: "top 1% UK salary",
    landingPath: "/salary-percentile",
    primaryCta: "See your ranking",
  }),
  makeEntry(22, {
    theme: "pay_rise_reality",
    comparison: COMPARISONS.raise70_100,
    hook: "A jump from £70k to £100k: how much do you actually keep?",
    seoKeyword: "£70k to £100k UK",
    landingPath: "/pay-rise?from=70000&to=100000",
    primaryCta: "Model this raise",
  }),
  makeEntry(23, {
    theme: "salary_reality",
    insight: INSIGHTS.s25,
    hook: `£25k UK take-home: ${INSIGHTS.s25.formatted.monthly}/mo.`,
    seoKeyword: "£25,000 after tax UK",
    landingPath: INSIGHTS.s25.path,
    primaryCta: "See £25k breakdown",
  }),
  makeEntry(24, {
    theme: "salary_comparison",
    comparison: compareSalaries(25_000, 30_000),
    seoKeyword: "£25k vs £30k",
    landingPath: "/compare/25000-vs-30000",
    primaryCta: "Compare £25k vs £30k",
  }),
  makeEntry(25, {
    theme: "salary_comparison",
    comparison: compareSalaries(50_000, 75_000),
    seoKeyword: "£50k vs £75k",
    landingPath: "/compare/50000-vs-75000",
    primaryCta: "Compare £50k vs £75k",
  }),
  makeEntry(26, {
    theme: "pay_rise_reality",
    comparison: compareSalaries(80_000, 90_000),
    seoKeyword: "£80k to £90k pay rise",
    landingPath: "/pay-rise?from=80000&to=90000",
    primaryCta: "Model this raise",
  }),
  makeEntry(27, {
    theme: "salary_reality",
    insight: buildSalaryInsight(45_000),
    seoKeyword: "£45k after tax UK",
    landingPath: "/salary/45000-after-tax",
    primaryCta: "See £45k breakdown",
  }),
  makeEntry(28, {
    theme: "salary_ranking",
    insight: buildSalaryInsight(45_000),
    hook: "£45k in the UK — where does it rank?",
    seoKeyword: "UK median salary",
    landingPath: "/salary-percentile",
    primaryCta: "See your ranking",
  }),
  makeEntry(29, {
    theme: "tax_trap",
    hook: "Everything you need to know about the £100k UK tax trap in 60 seconds",
    seoKeyword: "personal allowance taper",
    landingPath: "/100k-tax-trap",
    primaryCta: "Explore the trap",
  }),
  makeEntry(30, {
    theme: "salary_reality",
    insight: INSIGHTS.s60,
    hook: `£60k in the UK: ${INSIGHTS.s60.formatted.monthly}/mo — is that what you thought?`,
    seoKeyword: "£60,000 salary after tax",
    landingPath: INSIGHTS.s60.path,
    primaryCta: "Full £60k breakdown",
  }),
];
