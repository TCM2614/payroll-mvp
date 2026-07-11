/**
 * Configuration for the per-scenario SEO landing pages under `/calc/*`.
 *
 * Each scenario turns a specific search intent (PAYE calculator, umbrella
 * calculator, inside/outside IR35) into its own landing URL with unique
 * metadata, H1, body copy, and FAQPage structured data. All pages reuse
 * the same shared `TakeHomeCalculator` but pre-select the relevant tab.
 */

import type { CalculatorTabValue } from "@/components/take-home-calculator";

export type CalcScenarioSlug =
  | "paye"
  | "umbrella"
  | "limited-inside-ir35"
  | "limited-outside-ir35";

export interface CalcScenarioFaq {
  question: string;
  answer: string;
}

export interface CalcScenarioConfig {
  slug: CalcScenarioSlug;
  /** Tab pre-selected inside <TakeHomeCalculator />. */
  tab: CalculatorTabValue;
  /** Human-readable IR35 badge shown near the H1. */
  regimeLabel: "PAYE" | "Inside IR35" | "Outside IR35";
  /** <title> tag. */
  metaTitle: string;
  /** <meta name="description">. */
  metaDescription: string;
  /** OpenGraph title/description. Defaults to meta when omitted. */
  ogTitle?: string;
  ogDescription?: string;
  /** H1 shown at the top of the page. */
  h1: string;
  /** Subhead directly below H1 — one to two sentences. */
  subhead: string;
  /** Longer body copy shown below the calculator. Markdown-lite: plain text. */
  intro: string;
  /** FAQPage JSON-LD entries. */
  faq: CalcScenarioFaq[];
  /** Comma-separated meta keywords (kept concise, no keyword stuffing). */
  keywords: string;
}

export const CALC_SCENARIOS: Record<CalcScenarioSlug, CalcScenarioConfig> = {
  paye: {
    slug: "paye",
    tab: "paye",
    regimeLabel: "PAYE",
    metaTitle: "UK PAYE Take-Home Calculator 2026/27 — Salary After Tax",
    metaDescription:
      "Free UK PAYE calculator for the 2026/27 tax year. See your salary after income tax, National Insurance, pension, SIPP and student loan repayments. Supports multiple jobs and every UK student loan plan.",
    h1: "UK PAYE Take-Home Calculator (2026/27)",
    subhead:
      "The exact PAYE breakdown your payslip should show — updated for the 2026/27 UK tax year, with support for multiple jobs, all student loan plans, salary sacrifice and SIPP.",
    intro:
      "Standard PAYE employment is the default UK tax regime for employees. Your employer deducts income tax and National Insurance from every payslip using your tax code (e.g. 1257L), and pays HMRC on your behalf. This calculator models that flow exactly: personal allowance with the £100k+ taper, basic / higher / additional-rate income tax bands, primary and upper-earnings-limit NI, and every UK student loan plan including Plan 5 (live from April 2026).",
    keywords:
      "UK PAYE calculator, take-home pay calculator UK, salary after tax UK, PAYE 2026/27, National Insurance calculator",
    faq: [
      {
        question: "What is PAYE in the UK?",
        answer:
          "PAYE (Pay As You Earn) is the UK system where employers deduct income tax and National Insurance from your salary before you're paid. HMRC assigns you a tax code (usually 1257L for a full personal allowance) which tells the employer how much tax to withhold each pay period.",
      },
      {
        question: "How is my UK take-home pay calculated for 2026/27?",
        answer:
          "For 2026/27, the personal allowance is £12,570 (tapered by £1 for every £2 earned above £100,000), the basic rate 20% band runs to £37,700 of taxable pay, the higher rate 40% band runs to £125,140 total income, and the additional rate is 45% above that. Employee NI is 8% between £12,570 and £50,270, then 2% above.",
      },
      {
        question: "Does the calculator support multiple jobs and student loans?",
        answer:
          "Yes. You can add additional jobs with their own tax codes (BR, D0, 0T are typical for second jobs), combine any UK student loan plan (Plan 1, 2, 4, 5, or Postgraduate), add workplace pension contributions via salary sacrifice, and personal SIPP contributions with tax relief modelling.",
      },
    ],
  },

  umbrella: {
    slug: "umbrella",
    tab: "umbrella",
    regimeLabel: "Inside IR35",
    metaTitle: "UK Umbrella Company Calculator 2026/27 — Full Payslip Model",
    metaDescription:
      "Umbrella company take-home calculator for the UK 2026/27 tax year. Models the full payslip reconciliation: apprenticeship levy, employer's NI, employer's pension, company margin — then PAYE, NIC and student loans on your wages.",
    h1: "UK Umbrella Company Calculator (2026/27, Inside IR35)",
    subhead:
      "The only UK umbrella calculator that models a real payslip end-to-end — from company income received, through employer's NI, apprenticeship levy and the umbrella's margin, to your net take-home.",
    intro:
      "Umbrella engagements are always inside IR35 — the umbrella acts as your PAYE employer. Your assignment rate has to cover employer's NI, apprenticeship levy, the umbrella's margin and (optionally) employer's pension contributions before the remainder becomes the wages figure on your payslip. Only then is standard PAYE, employee NIC, employee pension and student loans deducted. This calculator solves that whole flow analytically and reconciles to the penny against a real umbrella payslip.",
    keywords:
      "umbrella company calculator UK, umbrella take-home pay, inside IR35 calculator, umbrella payslip calculator, umbrella fee calculator UK",
    faq: [
      {
        question: "Why is my umbrella take-home lower than the calculator suggests?",
        answer:
          "The most common reason is that umbrellas deduct four employer-side costs from your assignment rate before PAYE: employer's NI (15% on wages above £5,000 in 2026/27), apprenticeship levy (0.5% of wages), employer's pension (usually 0% if you've opted out of auto-enrolment) and the umbrella's own margin (typically £15–£30/week). This calculator lets you tune each of those inputs to match your own umbrella's rate card.",
      },
      {
        question: "Is umbrella always inside IR35?",
        answer:
          "Yes. Umbrella companies act as your PAYE employer, so all income is taxed as employment income. If your engagement is outside IR35, you'd typically use a personal service company (limited company) instead — see the Limited Company (Outside IR35) calculator for that case.",
      },
      {
        question: "How is the umbrella fee typically charged?",
        answer:
          "Most umbrellas charge a fixed weekly margin (commonly £15–£30/week), while some charge a monthly fee (typically £60–£120/month). The margin is a pre-tax deduction from the assignment rate, not from your net pay, so it reduces both the wages on which PAYE is calculated and your take-home.",
      },
    ],
  },

  "limited-inside-ir35": {
    slug: "limited-inside-ir35",
    tab: "limited-inside",
    regimeLabel: "Inside IR35",
    metaTitle: "Inside IR35 Calculator 2026/27 — Limited Company via Fee-Payer",
    metaDescription:
      "Take-home calculator for UK contractors caught by IR35 through a personal service company. The fee-payer applies PAYE-style treatment. Updated for the 2026/27 tax year.",
    h1: "Inside IR35 Limited Company Calculator (2026/27)",
    subhead:
      "For contractors operating a personal service company where the engagement is caught by IR35 — the fee-payer applies PAYE, NIC and (indirectly) employer's NI before you're paid.",
    intro:
      "Inside IR35 assignments through your limited company are treated as deemed employment income by the fee-payer (usually the client or agency). PAYE income tax and employee National Insurance are deducted from your assignment rate at source, just like standard payroll. This calculator models that pipeline against the 2026/27 UK tax bands, with configurable weeks worked per year and support for every UK student loan plan.",
    keywords:
      "inside IR35 calculator, IR35 take-home calculator, deemed employment calculator UK, contractor tax calculator inside IR35, PSC IR35 calculator",
    faq: [
      {
        question: "How does IR35 affect my take-home pay?",
        answer:
          "When your engagement is caught by IR35, the fee-payer must apply PAYE and NIC to the assignment income as if you were an employee. The result is very similar to standard PAYE — same tax code, same bands, same NIC — but the contract still flows through your limited company on paper.",
      },
      {
        question: "Should I use umbrella or my limited company inside IR35?",
        answer:
          "Financially the two are close, but umbrella arrangements also deduct the umbrella's margin from your assignment rate (typically £15–£30/week), so umbrella take-home is usually a bit lower than running the assignment inside IR35 through your own limited company. Some agencies mandate umbrella for inside-IR35 engagements though — check your contract.",
      },
      {
        question: "Can I still take dividends from my limited company inside IR35?",
        answer:
          "Yes — but only from other, outside-IR35 income the company holds. The inside-IR35 assignment income has already been taxed as employment via the fee-payer, so paying it out as dividends would double-tax it. For a purely inside-IR35 contractor, umbrella and inside-IR35 PSC are effectively equivalent from a tax standpoint.",
      },
    ],
  },

  "limited-outside-ir35": {
    slug: "limited-outside-ir35",
    tab: "limited-outside",
    regimeLabel: "Outside IR35",
    metaTitle: "Outside IR35 Calculator 2026/27 — Salary + Dividends + Corp Tax",
    metaDescription:
      "Outside IR35 take-home calculator for the UK 2026/27 tax year. Models the full personal service company flow: director's salary, employer's NI, corporation tax (with marginal relief between £50k and £250k), dividends, and personal PAYE + dividend tax.",
    h1: "Outside IR35 Limited Company Calculator (2026/27)",
    subhead:
      "The full PSC flow modelled end-to-end: company income received → director's salary → employer's NI → corporation tax with marginal relief → dividends → your personal PAYE + dividend tax.",
    intro:
      "Outside-IR35 contractors typically pay themselves a small NI-optimal salary (£12,570 in 2026/27) and take the rest as dividends after corporation tax. This calculator models corporation tax accurately for the 2026/27 regime: 19% small-profits rate up to £50,000, 25% main rate above £250,000, and HMRC marginal relief in between using the 3/200 fraction. Dividends stack on top of your salary and are taxed with the £500 dividend allowance plus the 8.75% / 33.75% / 39.35% band structure, respecting whatever the salary has already consumed of your personal allowance and basic-rate band.",
    keywords:
      "outside IR35 calculator, limited company take-home calculator UK, PSC dividend calculator, corporation tax marginal relief calculator, contractor dividend calculator 2026",
    faq: [
      {
        question: "How does the 2026/27 corporation tax marginal relief work?",
        answer:
          "For company profits above £50,000, HMRC starts moving your effective rate towards the 25% main rate. Below £50k you pay the 19% small-profits rate. Above £250k you pay 25% flat. In between, marginal relief tapers your effective rate up. The formula: tax = profit × 25% − (£250,000 − profit) × 3/200. At £100k profit that gives a 22.75% effective rate, at £150k it's ~23.3%, at £200k ~23.9%.",
      },
      {
        question: "What's the best director's salary strategy outside IR35?",
        answer:
          "There are three common choices. (1) NI-optimal: pay yourself £12,570 (full personal allowance) — you pay some employer NI but the salary is corporation-tax deductible, which usually wins overall. (2) Secondary threshold: pay £5,000 and avoid employer NI entirely — simpler, slightly worse mathematically. (3) A custom amount if you have other income or specific pension goals. This calculator lets you compare all three.",
      },
      {
        question: "Are student loans really due on dividends?",
        answer:
          "Yes, if you file self-assessment (which UK company directors typically do). Undergraduate and postgraduate loan repayments are calculated on your total assessable income, which includes both your director's salary and the dividends you draw. This calculator applies student loans to the combined salary + dividends figure.",
      },
      {
        question: "Does the calculator model employer pension contributions?",
        answer:
          "Yes. Employer pension contributions paid by your limited company are fully corporation-tax deductible up to the £60,000 annual allowance (with tapering for very high earners). Enter your annual employer pension contribution and the calculator will deduct it from company profit before computing corporation tax, effectively giving you tax relief at the full corporation-tax rate.",
      },
    ],
  },
};

export const CALC_SCENARIO_SLUGS: CalcScenarioSlug[] = Object.keys(
  CALC_SCENARIOS,
) as CalcScenarioSlug[];
