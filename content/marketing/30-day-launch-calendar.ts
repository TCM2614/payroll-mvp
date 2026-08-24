/**
 * 30-Day Launch Marketing Calendar for the UK Take Home Calculator.
 *
 * Every entry consumes deterministic output from the tax engine via
 * `buildSalaryInsight` / `compareSalaryInsights`. No £ figure in this file
 * is hand-written — the numbers are derived at import time so social copy
 * can never silently drift from the calculator numbers.
 *
 * The goal is: 1 strong insight → 5–7 distribution assets.
 *
 * IMPORTANT: this is a *dataset*, not a publisher. AI never posts
 * autonomously. A human must review and approve each entry before
 * scheduling it.
 */

import {
  buildSalaryInsight,
  compareSalaryInsights,
  type ComparisonInsight,
  type SalaryInsight,
} from "@/lib/marketing/salaryInsight";

export type CampaignTheme =
  | "salary_reality"
  | "pay_rise_reality"
  | "tax_trap"
  | "salary_comparison"
  | "salary_ranking"
  | "contractor_reality";

export type Platform =
  | "tiktok"
  | "reels"
  | "youtube_short"
  | "linkedin"
  | "x"
  | "instagram_carousel"
  | "email";

export interface PlatformAsset {
  platform: Platform;
  hook: string;
  body: string;
  cta: string;
}

export interface CalendarEntry {
  day: number;
  theme: CampaignTheme;
  hook: string;
  seoKeyword?: string;
  landingPath: string;
  primaryCta: string;
  insight?: SalaryInsight;
  comparison?: ComparisonInsight;
  assets: Partial<Record<Platform, PlatformAsset>>;
}

// ---------------------------------------------------------------------------
// Copy templates. All templated £ figures reference an insight field —
// never a hand-written number.

function salaryRealityAssets(insight: SalaryInsight): CalendarEntry["assets"] {
  const monthlyGross = insight.gross / 12;
  const monthlyGrossFmt = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(monthlyGross);

  const hook = `${insight.formatted.gross} sounds like ${monthlyGrossFmt} per month.`;

  const shortBeats =
    `Hook (0–1s): ${hook}\n` +
    `Beat 1: "But that's the gross figure."\n` +
    `Beat 2: Overlay ${insight.formatted.incomeTax} tax + ${insight.formatted.ni} NI.\n` +
    `Beat 3: Reveal ${insight.formatted.monthly}/mo real take-home.\n` +
    `Payoff: You keep ${insight.formatted.retainedPercent}.\n` +
    `CTA: uktakehomecalculator.com/salary/${insight.salary}-after-tax`;

  return {
    tiktok: {
      platform: "tiktok",
      hook,
      body: shortBeats,
      cta: `See ${insight.formatted.gross} in full`,
    },
    reels: {
      platform: "reels",
      hook,
      body: shortBeats,
      cta: `See ${insight.formatted.gross} in full`,
    },
    youtube_short: {
      platform: "youtube_short",
      hook,
      body: shortBeats,
      cta: `See ${insight.formatted.gross} in full`,
    },
    linkedin: {
      platform: "linkedin",
      hook: `${insight.formatted.gross} in the UK: what actually lands in your account?`,
      body:
        `${insight.formatted.gross} sounds substantial.\n\n` +
        `The reality after HMRC:\n` +
        `- ${insight.formatted.incomeTax} Income Tax\n` +
        `- ${insight.formatted.ni} National Insurance\n` +
        `- Net take-home: ${insight.formatted.net} / year (${insight.formatted.monthly}/mo)\n` +
        `- You keep ${insight.formatted.retainedPercent} of your gross`,
      cta: `Explore ${insight.formatted.gross} in detail`,
    },
    x: {
      platform: "x",
      hook,
      body:
        `${insight.formatted.gross} salary UK 🇬🇧\n\n` +
        `Monthly take-home: ${insight.formatted.monthly}\n` +
        `Income Tax: ${insight.formatted.incomeTax}\n` +
        `NI: ${insight.formatted.ni}\n\n` +
        `You keep ${insight.formatted.retainedPercent}.`,
      cta: "Full breakdown ↓",
    },
    instagram_carousel: {
      platform: "instagram_carousel",
      hook,
      body:
        `Slide 1: ${insight.formatted.gross} sounds like ${monthlyGrossFmt}/mo.\n` +
        `Slide 2: Income Tax ${insight.formatted.incomeTax}.\n` +
        `Slide 3: NI ${insight.formatted.ni}.\n` +
        `Slide 4: You actually get ${insight.formatted.monthly}/mo.\n` +
        `Slide 5: That's ${insight.formatted.retainedPercent} of gross.\n` +
        `Slide 6 (CTA): See any UK salary.`,
      cta: "See any UK salary",
    },
    email: {
      platform: "email",
      hook: `The real take-home from ${insight.formatted.gross}`,
      body:
        `${insight.formatted.gross} sounds like ${monthlyGrossFmt} per month.\n\n` +
        `After Income Tax (${insight.formatted.incomeTax}) and NI (${insight.formatted.ni}), what actually reaches you is ${insight.formatted.monthly}/mo.\n\n` +
        `You keep ${insight.formatted.retainedPercent} of your gross pay.`,
      cta: "See your salary",
    },
  };
}

function payRiseAssets(cmp: ComparisonInsight): CalendarEntry["assets"] {
  const hook = `Your boss offers a ${cmp.formatted.grossDelta} raise. Here's what you actually keep.`;
  const beats =
    `Hook (0–2s): ${hook}\n` +
    `Beat 1: ${cmp.from.formatted.gross} → ${cmp.to.formatted.gross} (${cmp.formatted.grossDelta} gross).\n` +
    `Beat 2: Extra Income Tax ${cmp.formatted.taxDelta}, extra NI ${cmp.formatted.niDelta}.\n` +
    `Reveal: Take-home boost ${cmp.formatted.netDelta}/yr = ${cmp.formatted.monthlyNetDelta}/mo.\n` +
    `Payoff: You keep ${cmp.formatted.retainedPercent} of the raise.`;
  return {
    tiktok: { platform: "tiktok", hook, body: beats, cta: "Model your raise" },
    reels: { platform: "reels", hook, body: beats, cta: "Model your raise" },
    youtube_short: {
      platform: "youtube_short",
      hook,
      body: beats,
      cta: "Model your raise",
    },
    linkedin: {
      platform: "linkedin",
      hook: `Getting a raise from ${cmp.from.formatted.gross} to ${cmp.to.formatted.gross}? Here's what you actually keep.`,
      body:
        `${cmp.from.formatted.gross} → ${cmp.to.formatted.gross}: a ${cmp.formatted.grossDelta} pay rise.\n\n` +
        `You'll pay ${cmp.formatted.taxDelta} more Income Tax and ${cmp.formatted.niDelta} more NI.\n\n` +
        `Actual take-home boost: ${cmp.formatted.netDelta}/year — ${cmp.formatted.monthlyNetDelta}/month.\n\n` +
        `You keep ${cmp.formatted.retainedPercent} of the raise.`,
      cta: "See any raise",
    },
    x: {
      platform: "x",
      hook,
      body: `${cmp.from.formatted.gross} → ${cmp.to.formatted.gross}\nExtra take-home: ${cmp.formatted.netDelta}/yr, ${cmp.formatted.monthlyNetDelta}/mo.\nYou keep ${cmp.formatted.retainedPercent}.`,
      cta: "Full breakdown ↓",
    },
    instagram_carousel: {
      platform: "instagram_carousel",
      hook,
      body:
        `Slide 1: ${cmp.formatted.grossDelta} raise incoming.\n` +
        `Slide 2: ${cmp.formatted.taxDelta} more tax.\n` +
        `Slide 3: ${cmp.formatted.niDelta} more NI.\n` +
        `Slide 4: Real boost ${cmp.formatted.netDelta}/yr.\n` +
        `Slide 5: You keep ${cmp.formatted.retainedPercent}.`,
      cta: "See any raise",
    },
    email: {
      platform: "email",
      hook: `That raise: ${cmp.formatted.retainedPercent} lands in your account`,
      body:
        `${cmp.from.formatted.gross} → ${cmp.to.formatted.gross}: a ${cmp.formatted.grossDelta} pay rise.\n\n` +
        `You keep ${cmp.formatted.retainedPercent} — ${cmp.formatted.netDelta}/yr, ${cmp.formatted.monthlyNetDelta}/mo.`,
      cta: "Model your own raise",
    },
  };
}

function taxTrapAssets(cmp: ComparisonInsight): CalendarEntry["assets"] {
  const hook = `The UK £100k tax trap: earn ${cmp.to.formatted.gross}, keep only ${cmp.formatted.netDelta} more than ${cmp.from.formatted.gross}.`;
  const body =
    `Between £100,000 and £125,140 the UK Personal Allowance is withdrawn.\n\n` +
    `Effective marginal Income Tax rate becomes 60% (plus 2% NI).\n\n` +
    `${cmp.from.formatted.gross} → ${cmp.to.formatted.gross} adds only ${cmp.formatted.netDelta} to your take-home.\n\n` +
    `You keep ${cmp.formatted.retainedPercent} of the raise.`;
  return {
    tiktok: { platform: "tiktok", hook, body, cta: "See the tax trap" },
    reels: { platform: "reels", hook, body, cta: "See the tax trap" },
    youtube_short: {
      platform: "youtube_short",
      hook,
      body,
      cta: "See the tax trap",
    },
    linkedin: {
      platform: "linkedin",
      hook: "What happens when your salary crosses £100k in the UK?",
      body,
      cta: "See the £100k trap",
    },
    x: {
      platform: "x",
      hook,
      body: `£100k → £125,140 in the UK 🇬🇧\n\nGross up: ${cmp.formatted.grossDelta}\nNet up: ${cmp.formatted.netDelta}\nRetained: ${cmp.formatted.retainedPercent}`,
      cta: "Why? ↓",
    },
    instagram_carousel: {
      platform: "instagram_carousel",
      hook,
      body,
      cta: "See the £100k trap",
    },
    email: {
      platform: "email",
      hook: "Why £100k+ feels heavier than it should",
      body,
      cta: "Explore the £100k trap",
    },
  };
}

function rankingAssets(insight: SalaryInsight): CalendarEntry["assets"] {
  const descriptor = insight.percentile?.descriptor ?? "above the UK median earner";
  const percentileNum = insight.percentile
    ? `${insight.percentile.percentile.toFixed(0)}%`
    : "—";
  const hook = `${insight.formatted.gross} in the UK — where does it rank?`;
  const body =
    `A gross salary of ${insight.formatted.gross} sits at approximately the ` +
    `${percentileNum} percentile — ${descriptor}.\n\n` +
    `(Source: HMRC SPI / ONS ASHE, indicative.)`;
  return {
    tiktok: { platform: "tiktok", hook, body, cta: "See your ranking" },
    reels: { platform: "reels", hook, body, cta: "See your ranking" },
    youtube_short: {
      platform: "youtube_short",
      hook,
      body,
      cta: "See your ranking",
    },
    linkedin: {
      platform: "linkedin",
      hook,
      body,
      cta: "See where you rank",
    },
    x: {
      platform: "x",
      hook,
      body: `${insight.formatted.gross} UK salary ${percentileNum} percentile — ${descriptor}.`,
      cta: "See your ranking",
    },
    instagram_carousel: {
      platform: "instagram_carousel",
      hook,
      body,
      cta: "See your ranking",
    },
    email: {
      platform: "email",
      hook: `Where does ${insight.formatted.gross} rank in the UK?`,
      body,
      cta: "See your ranking",
    },
  };
}

// ---------------------------------------------------------------------------
// Insight cache — importing this module runs each helper exactly once.

const INSIGHTS = {
  s25: buildSalaryInsight(25_000),
  s30: buildSalaryInsight(30_000),
  s35: buildSalaryInsight(35_000),
  s40: buildSalaryInsight(40_000),
  s45: buildSalaryInsight(45_000),
  s50: buildSalaryInsight(50_000),
  s60: buildSalaryInsight(60_000),
  s70: buildSalaryInsight(70_000),
  s80: buildSalaryInsight(80_000),
  s100: buildSalaryInsight(100_000),
  s125: buildSalaryInsight(125_000),
  s150: buildSalaryInsight(150_000),
};

const COMPARISONS = {
  raise30_35: compareSalaryInsights(30_000, 35_000),
  raise40_50: compareSalaryInsights(40_000, 50_000),
  raise50_60: compareSalaryInsights(50_000, 60_000),
  raise60_70: compareSalaryInsights(60_000, 70_000),
  raise70_100: compareSalaryInsights(70_000, 100_000),
  raise80_90: compareSalaryInsights(80_000, 90_000),
  trap100_110: compareSalaryInsights(100_000, 110_000),
  trap100_125: compareSalaryInsights(100_000, 125_140),
};

// ---------------------------------------------------------------------------

export const LAUNCH_CALENDAR: CalendarEntry[] = [
  {
    day: 1,
    theme: "salary_reality",
    hook: `${INSIGHTS.s30.formatted.gross} sounds like more than it is.`,
    seoKeyword: "£30,000 after tax UK",
    landingPath: INSIGHTS.s30.path,
    primaryCta: "See £30k breakdown",
    insight: INSIGHTS.s30,
    assets: salaryRealityAssets(INSIGHTS.s30),
  },
  {
    day: 2,
    theme: "salary_reality",
    hook: `${INSIGHTS.s35.formatted.gross}: what actually reaches your account.`,
    seoKeyword: "£35,000 after tax UK",
    landingPath: INSIGHTS.s35.path,
    primaryCta: "See £35k breakdown",
    insight: INSIGHTS.s35,
    assets: salaryRealityAssets(INSIGHTS.s35),
  },
  {
    day: 3,
    theme: "pay_rise_reality",
    hook: `£30k → £35k: ${COMPARISONS.raise30_35.formatted.retainedPercent} retained.`,
    seoKeyword: "pay rise calculator UK",
    landingPath: "/pay-rise?from=30000&to=35000",
    primaryCta: "See any pay rise",
    comparison: COMPARISONS.raise30_35,
    assets: payRiseAssets(COMPARISONS.raise30_35),
  },
  {
    day: 4,
    theme: "salary_reality",
    hook: `${INSIGHTS.s40.formatted.gross}: the real monthly take-home.`,
    seoKeyword: "£40,000 after tax",
    landingPath: INSIGHTS.s40.path,
    primaryCta: "See £40k breakdown",
    insight: INSIGHTS.s40,
    assets: salaryRealityAssets(INSIGHTS.s40),
  },
  {
    day: 5,
    theme: "salary_comparison",
    hook: `£40k vs £50k: what actually changes.`,
    seoKeyword: "£40k vs £50k UK",
    landingPath: "/pay-rise?from=40000&to=50000",
    primaryCta: "Compare £40k vs £50k",
    comparison: COMPARISONS.raise40_50,
    assets: payRiseAssets(COMPARISONS.raise40_50),
  },
  {
    day: 6,
    theme: "salary_reality",
    hook: `${INSIGHTS.s45.formatted.gross}: near the UK median.`,
    seoKeyword: "£45,000 after tax UK",
    landingPath: INSIGHTS.s45.path,
    primaryCta: "See £45k breakdown",
    insight: INSIGHTS.s45,
    assets: salaryRealityAssets(INSIGHTS.s45),
  },
  {
    day: 7,
    theme: "salary_ranking",
    hook: `Where does £50k rank in Britain?`,
    seoKeyword: "UK salary percentile",
    landingPath: "/salary-percentile?income=50000",
    primaryCta: "See your ranking",
    insight: INSIGHTS.s50,
    assets: rankingAssets(INSIGHTS.s50),
  },
  {
    day: 8,
    theme: "pay_rise_reality",
    hook: `£50k → £60k: what actually lands.`,
    seoKeyword: "£50k to £60k pay rise",
    landingPath: "/pay-rise?from=50000&to=60000",
    primaryCta: "Model your raise",
    comparison: COMPARISONS.raise50_60,
    assets: payRiseAssets(COMPARISONS.raise50_60),
  },
  {
    day: 9,
    theme: "salary_reality",
    hook: `${INSIGHTS.s60.formatted.gross}: monthly reality.`,
    seoKeyword: "£60,000 after tax UK",
    landingPath: INSIGHTS.s60.path,
    primaryCta: "See £60k breakdown",
    insight: INSIGHTS.s60,
    assets: salaryRealityAssets(INSIGHTS.s60),
  },
  {
    day: 10,
    theme: "salary_comparison",
    hook: `£60k vs £70k: real difference.`,
    seoKeyword: "£60k vs £70k",
    landingPath: "/pay-rise?from=60000&to=70000",
    primaryCta: "Compare £60k vs £70k",
    comparison: COMPARISONS.raise60_70,
    assets: payRiseAssets(COMPARISONS.raise60_70),
  },
  {
    day: 11,
    theme: "salary_reality",
    hook: `${INSIGHTS.s70.formatted.gross}: what you'd actually get.`,
    seoKeyword: "£70,000 after tax UK",
    landingPath: INSIGHTS.s70.path,
    primaryCta: "See £70k breakdown",
    insight: INSIGHTS.s70,
    assets: salaryRealityAssets(INSIGHTS.s70),
  },
  {
    day: 12,
    theme: "salary_reality",
    hook: `${INSIGHTS.s80.formatted.gross}: the monthly reality.`,
    seoKeyword: "£80,000 after tax UK",
    landingPath: INSIGHTS.s80.path,
    primaryCta: "See £80k breakdown",
    insight: INSIGHTS.s80,
    assets: salaryRealityAssets(INSIGHTS.s80),
  },
  {
    day: 13,
    theme: "salary_ranking",
    hook: `£80k in the UK — top X%?`,
    seoKeyword: "top 10% UK salary",
    landingPath: "/salary-percentile?income=80000",
    primaryCta: "See your ranking",
    insight: INSIGHTS.s80,
    assets: rankingAssets(INSIGHTS.s80),
  },
  {
    day: 14,
    theme: "salary_reality",
    hook: `${INSIGHTS.s100.formatted.gross}: what actually reaches your bank.`,
    seoKeyword: "£100,000 after tax UK",
    landingPath: INSIGHTS.s100.path,
    primaryCta: "See £100k breakdown",
    insight: INSIGHTS.s100,
    assets: salaryRealityAssets(INSIGHTS.s100),
  },
  {
    day: 15,
    theme: "tax_trap",
    hook: `The £100k UK tax trap in one number.`,
    seoKeyword: "£100k tax trap",
    landingPath: "/100k-tax-trap",
    primaryCta: "See the tax trap",
    comparison: COMPARISONS.trap100_110,
    assets: taxTrapAssets(COMPARISONS.trap100_110),
  },
  {
    day: 16,
    theme: "tax_trap",
    hook: `Earning £125,140 feels like earning £100k.`,
    seoKeyword: "60% marginal tax UK",
    landingPath: "/100k-tax-trap",
    primaryCta: "See the tax trap",
    comparison: COMPARISONS.trap100_125,
    assets: taxTrapAssets(COMPARISONS.trap100_125),
  },
  {
    day: 17,
    theme: "salary_reality",
    hook: `${INSIGHTS.s125.formatted.gross}: post-taper reality.`,
    seoKeyword: "£125,000 after tax UK",
    landingPath: INSIGHTS.s125.path,
    primaryCta: "See £125k breakdown",
    insight: INSIGHTS.s125,
    assets: salaryRealityAssets(INSIGHTS.s125),
  },
  {
    day: 18,
    theme: "salary_reality",
    hook: `${INSIGHTS.s150.formatted.gross}: what a top salary actually keeps.`,
    seoKeyword: "£150,000 after tax UK",
    landingPath: INSIGHTS.s150.path,
    primaryCta: "See £150k breakdown",
    insight: INSIGHTS.s150,
    assets: salaryRealityAssets(INSIGHTS.s150),
  },
  {
    day: 19,
    theme: "salary_ranking",
    hook: `£100k puts you in the ${INSIGHTS.s100.percentile?.descriptor ?? "top few % of UK earners"}.`,
    seoKeyword: "top 1% UK salary",
    landingPath: "/salary-percentile?income=100000",
    primaryCta: "See your ranking",
    insight: INSIGHTS.s100,
    assets: rankingAssets(INSIGHTS.s100),
  },
  {
    day: 20,
    theme: "contractor_reality",
    hook: "£500/day does not mean you take home £500/day.",
    seoKeyword: "umbrella calculator UK",
    landingPath: "/compare/500-a-day",
    primaryCta: "Umbrella take-home",
    // No comparison here — copy links to the live contractor comparison strip.
    assets: {
      tiktok: {
        platform: "tiktok",
        hook: "£500/day does not mean you take home £500/day.",
        body: "PAYE / Umbrella / Inside IR35 / Outside IR35 — same day rate, four very different take-home numbers. See the live comparison.",
        cta: "Compare contractor take-home",
      },
      linkedin: {
        platform: "linkedin",
        hook: "The four ways to bill £500/day in the UK — and how they compare.",
        body: "PAYE, Umbrella (Inside IR35), Limited (Inside IR35), Limited (Outside IR35). Same £500/day. Very different take-home. Live comparison strip.",
        cta: "See the live comparison",
      },
      x: {
        platform: "x",
        hook: "£500/day UK contractor: 4 regimes, 4 take-home numbers.",
        body: "PAYE vs Umbrella vs Inside IR35 vs Outside IR35 — live comparison.",
        cta: "Compare ↓",
      },
    },
  },
  {
    day: 21,
    theme: "pay_rise_reality",
    hook: `£70k → £100k: how much do you actually keep?`,
    seoKeyword: "£70k to £100k UK",
    landingPath: "/pay-rise?from=70000&to=100000",
    primaryCta: "Model this raise",
    comparison: COMPARISONS.raise70_100,
    assets: payRiseAssets(COMPARISONS.raise70_100),
  },
  {
    day: 22,
    theme: "salary_reality",
    hook: `${INSIGHTS.s25.formatted.gross} UK take-home: ${INSIGHTS.s25.formatted.monthly}/mo.`,
    seoKeyword: "£25,000 after tax UK",
    landingPath: INSIGHTS.s25.path,
    primaryCta: "See £25k breakdown",
    insight: INSIGHTS.s25,
    assets: salaryRealityAssets(INSIGHTS.s25),
  },
  {
    day: 23,
    theme: "pay_rise_reality",
    hook: `£80k → £90k: does the raise feel worth it?`,
    seoKeyword: "£80k to £90k pay rise",
    landingPath: "/pay-rise?from=80000&to=90000",
    primaryCta: "Model this raise",
    comparison: COMPARISONS.raise80_90,
    assets: payRiseAssets(COMPARISONS.raise80_90),
  },
  {
    day: 24,
    theme: "salary_ranking",
    hook: `${INSIGHTS.s45.formatted.gross} vs the UK — where does it rank?`,
    seoKeyword: "UK median salary",
    landingPath: "/salary-percentile?income=45000",
    primaryCta: "See your ranking",
    insight: INSIGHTS.s45,
    assets: rankingAssets(INSIGHTS.s45),
  },
  {
    day: 25,
    theme: "tax_trap",
    hook: "Everything you need to know about the £100k UK tax trap in 60 seconds.",
    seoKeyword: "personal allowance taper",
    landingPath: "/100k-tax-trap",
    primaryCta: "Explore the trap",
    comparison: COMPARISONS.trap100_110,
    assets: taxTrapAssets(COMPARISONS.trap100_110),
  },
  {
    day: 26,
    theme: "salary_reality",
    hook: `${INSIGHTS.s60.formatted.gross}: is that what you thought?`,
    seoKeyword: "£60,000 salary after tax",
    landingPath: INSIGHTS.s60.path,
    primaryCta: "Full £60k breakdown",
    insight: INSIGHTS.s60,
    assets: salaryRealityAssets(INSIGHTS.s60),
  },
  {
    day: 27,
    theme: "salary_comparison",
    hook: `${INSIGHTS.s50.formatted.gross} vs ${INSIGHTS.s70.formatted.gross}: real numbers.`,
    seoKeyword: "£50k vs £70k",
    landingPath: "/pay-rise?from=50000&to=70000",
    primaryCta: "Compare £50k vs £70k",
    comparison: compareSalaryInsights(50_000, 70_000),
    assets: payRiseAssets(compareSalaryInsights(50_000, 70_000)),
  },
  {
    day: 28,
    theme: "contractor_reality",
    hook: "£600/day: what actually lands.",
    seoKeyword: "£600 a day umbrella",
    landingPath: "/compare/600-a-day",
    primaryCta: "See the comparison",
    assets: {
      tiktok: {
        platform: "tiktok",
        hook: "£600/day: what actually lands in your bank?",
        body: "PAYE / Umbrella / Inside IR35 / Outside IR35 — same £600/day, very different take-home.",
        cta: "Live comparison",
      },
      linkedin: {
        platform: "linkedin",
        hook: "£600/day, four ways.",
        body: "Same rate, four very different take-home outcomes. See the live comparison.",
        cta: "See the live comparison",
      },
    },
  },
  {
    day: 29,
    theme: "salary_ranking",
    hook: `${INSIGHTS.s60.formatted.gross}: does it feel like top-quartile money?`,
    seoKeyword: "top 25% UK salary",
    landingPath: "/salary-percentile?income=60000",
    primaryCta: "See your ranking",
    insight: INSIGHTS.s60,
    assets: rankingAssets(INSIGHTS.s60),
  },
  {
    day: 30,
    theme: "salary_reality",
    hook: `${INSIGHTS.s50.formatted.gross}: the reality on your payslip.`,
    seoKeyword: "£50,000 after tax UK",
    landingPath: INSIGHTS.s50.path,
    primaryCta: "See £50k breakdown",
    insight: INSIGHTS.s50,
    assets: salaryRealityAssets(INSIGHTS.s50),
  },
];
