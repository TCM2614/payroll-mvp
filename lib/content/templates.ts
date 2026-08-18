/**
 * Content templates that consume deterministic `SalaryInsight` /
 * `ComparisonInsight` objects and produce platform‑specific copy.
 *
 * Rules:
 *  - Templates never invent numbers. Every £ figure references a field on the
 *    insight object.
 *  - Copy is short, punchy, and mobile‑social friendly.
 *  - Every template must have a `landingPath` so marketing can wire the CTA
 *    without inventing routes.
 */

import type { ComparisonInsight, SalaryInsight } from "./insights";

export type ContentPlatform =
  | "tiktok"
  | "reels"
  | "youtube_short"
  | "linkedin"
  | "x"
  | "instagram_carousel"
  | "email";

export interface ContentTemplateInput {
  insight?: SalaryInsight;
  comparison?: ComparisonInsight;
}

export interface RenderedContent {
  platform: ContentPlatform;
  hook: string;
  body: string;
  cta: string;
  landingPath: string;
}

// ---------------------------------------------------------------------------
// Theme: Salary Reality — "£X sounds like £Y — here's what actually reaches you"

export function salaryRealityHook(insight: SalaryInsight) {
  return `${insight.formatted.gross} sounds like ${gbp0(insight.salary / 12)} per month.`;
}

export function salaryRealityBody(insight: SalaryInsight) {
  return [
    `${insight.formatted.gross} sounds like ${gbp0(insight.salary / 12)} per month.`,
    `But after Income Tax (${insight.formatted.incomeTax}) and NI (${insight.formatted.ni}), what actually reaches you is ${insight.formatted.monthly}/mo.`,
    `You keep ${insight.formatted.retainedPercent} of your gross pay.`,
  ].join("\n\n");
}

// Theme: Pay‑Rise Reality

export function payRiseHook(cmp: ComparisonInsight) {
  return `Your boss offers a ${cmp.formatted.grossDelta} raise. Here's what you actually keep.`;
}

export function payRiseBody(cmp: ComparisonInsight) {
  return [
    `${cmp.from.formatted.gross} → ${cmp.to.formatted.gross}: a ${cmp.formatted.grossDelta} pay rise.`,
    `You'll pay ${cmp.formatted.taxDelta} more Income Tax and ${cmp.formatted.niDelta} more NI.`,
    `Actual take‑home boost: ${cmp.formatted.netDelta}/year — ${cmp.formatted.monthlyNetDelta}/month.`,
    `You keep ${cmp.formatted.retainedPercent} of the raise.`,
  ].join("\n\n");
}

// Theme: Tax Trap — universal (no user salary needed)

export function taxTrapBody() {
  return [
    "The UK £100k tax trap:",
    "- Personal Allowance withdraws by £1 for every £2 earned above £100,000.",
    "- Marginal effective Income Tax rate becomes 60% between £100k–£125,140.",
    "- Adding 2% NI, most PAYE earners face ~62% on that range.",
    "- Pension salary sacrifice can bring taxable income back below £100k.",
  ].join("\n");
}

// Theme: Contractor Reality

export function contractorRealityHook() {
  return "£500/day does not mean you take home £500/day.";
}

// ---------------------------------------------------------------------------
// Platform renderers

export function renderForPlatform(
  platform: ContentPlatform,
  input: ContentTemplateInput,
): RenderedContent {
  const { insight, comparison } = input;
  const landingPath = comparison
    ? `/compare/${Math.min(comparison.from.salary, comparison.to.salary)}-vs-${Math.max(comparison.from.salary, comparison.to.salary)}`
    : insight?.path ?? "/calculator";

  if (insight && !comparison) {
    switch (platform) {
      case "tiktok":
      case "reels":
      case "youtube_short":
        return {
          platform,
          hook: salaryRealityHook(insight),
          body:
            `Hook (0–1s): ${salaryRealityHook(insight)}\n` +
            `Beat 1 (1–4s): "But that's the gross figure."\n` +
            `Beat 2 (4–8s): Overlay ${insight.formatted.incomeTax} tax + ${insight.formatted.ni} NI.\n` +
            `Beat 3 (8–12s): Reveal ${insight.formatted.monthly}/mo real take‑home.\n` +
            `Payoff: "You keep ${insight.formatted.retainedPercent}."\n` +
            `CTA overlay: "See yours → uktakehomecalculator.com"`,
          cta: `See what ${insight.formatted.gross} really takes home`,
          landingPath,
        };
      case "linkedin":
        return {
          platform,
          hook: `${insight.formatted.gross} in the UK: what actually lands in your account?`,
          body:
            `${insight.formatted.gross} sounds substantial.\n\n` +
            `The reality after HMRC:\n` +
            `- ${insight.formatted.incomeTax} Income Tax\n` +
            `- ${insight.formatted.ni} National Insurance\n` +
            `- Net take‑home: ${insight.formatted.net} / year (${insight.formatted.monthly}/mo)\n` +
            `- You keep ${insight.formatted.retainedPercent} of your gross\n\n` +
            `Understanding this changes how you think about your next raise, your pension, and your career move.`,
          cta: `Explore ${insight.formatted.gross} in detail`,
          landingPath,
        };
      case "x":
        return {
          platform,
          hook: salaryRealityHook(insight),
          body:
            `${insight.formatted.gross} salary UK 🇬🇧\n\n` +
            `Monthly take-home: ${insight.formatted.monthly}\n` +
            `Income Tax: ${insight.formatted.incomeTax}\n` +
            `NI: ${insight.formatted.ni}\n\n` +
            `You keep ${insight.formatted.retainedPercent}.`,
          cta: `Full breakdown ↓`,
          landingPath,
        };
      case "instagram_carousel":
        return {
          platform,
          hook: salaryRealityHook(insight),
          body:
            `Slide 1: ${insight.formatted.gross} sounds like ${gbp0(insight.salary / 12)}/mo.\n` +
            `Slide 2: Income Tax takes ${insight.formatted.incomeTax}.\n` +
            `Slide 3: NI takes ${insight.formatted.ni}.\n` +
            `Slide 4: You actually get ${insight.formatted.monthly}/mo.\n` +
            `Slide 5: That's ${insight.formatted.retainedPercent} of gross.\n` +
            `Slide 6 (CTA): See any salary → uktakehomecalculator.com`,
          cta: `See any UK salary`,
          landingPath,
        };
      case "email":
        return {
          platform,
          hook: `The real take-home from ${insight.formatted.gross}`,
          body: salaryRealityBody(insight),
          cta: `See your salary`,
          landingPath,
        };
    }
  }

  if (comparison) {
    const c = comparison;
    switch (platform) {
      case "tiktok":
      case "reels":
      case "youtube_short":
        return {
          platform,
          hook: payRiseHook(c),
          body:
            `Hook (0–2s): ${payRiseHook(c)}\n` +
            `Beat 1: Gross change ${c.from.formatted.gross} → ${c.to.formatted.gross} (${c.formatted.grossDelta}).\n` +
            `Beat 2: Extra tax ${c.formatted.taxDelta}, extra NI ${c.formatted.niDelta}.\n` +
            `Reveal: Real take-home boost ${c.formatted.netDelta}/yr = ${c.formatted.monthlyNetDelta}/mo.\n` +
            `Payoff: You keep ${c.formatted.retainedPercent} of the raise.`,
          cta: `Calculate your own raise`,
          landingPath,
        };
      case "linkedin":
        return {
          platform,
          hook: `Getting a raise from ${c.from.formatted.gross} to ${c.to.formatted.gross}? Here's what you actually keep.`,
          body: payRiseBody(c),
          cta: `See any raise`,
          landingPath,
        };
      case "x":
        return {
          platform,
          hook: payRiseHook(c),
          body: `${c.from.formatted.gross} → ${c.to.formatted.gross}\nExtra take-home: ${c.formatted.netDelta}/yr, ${c.formatted.monthlyNetDelta}/mo.\nYou keep ${c.formatted.retainedPercent}.`,
          cta: `Full breakdown ↓`,
          landingPath,
        };
      case "instagram_carousel":
        return {
          platform,
          hook: payRiseHook(c),
          body:
            `Slide 1: ${c.formatted.grossDelta} raise incoming.\n` +
            `Slide 2: ${c.formatted.taxDelta} more tax.\n` +
            `Slide 3: ${c.formatted.niDelta} more NI.\n` +
            `Slide 4: Real boost: ${c.formatted.netDelta}/yr.\n` +
            `Slide 5: You keep ${c.formatted.retainedPercent} of it.`,
          cta: `See any raise`,
          landingPath,
        };
      case "email":
        return {
          platform,
          hook: `That raise: ${c.formatted.retainedPercent} lands in your account`,
          body: payRiseBody(c),
          cta: `Model your own raise`,
          landingPath,
        };
    }
  }

  return {
    platform,
    hook: "UK take home in 30 seconds",
    body: taxTrapBody(),
    cta: "Explore the calculator",
    landingPath: "/calculator",
  };
}

// ---------------------------------------------------------------------------

function gbp0(n: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}
