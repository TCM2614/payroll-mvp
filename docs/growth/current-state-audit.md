# Current-State Audit — UK Take Home Calculator

Audit performed on Aug 18, 2026 against `master` (`dd454cb feat: add landing and calculator pages`).

## TL;DR

Despite the growth brief describing a "live" product, the repository is effectively a **Next.js starter scaffold** with a placeholder calculator using a hard‑coded `22% tax + 8% NI` shortcut. There is no real tax engine, no salary content pages, no SEO plumbing, no analytics, no tests, and no growth surface.

This growth sprint therefore has to **build the fundamentals** (deterministic tax engine, SEO plumbing, analytics abstraction, share/social scaffolding) as well as ship the acquisition & discovery surfaces. All work must still be treated as “continuation” of the tiny existing surface (`/` and `/calc`) — URLs are preserved and layered on top of a proper engine.

---

## Already Implemented

- Next.js 16 (App Router) + React 19 + Tailwind v4 (via `@tailwindcss/postcss`).
- ESLint (`eslint-config-next`) and TypeScript strict mode.
- Two routes:
  - `/` — landing page (`app/page.tsx`) that links to `/calc`.
  - `/calc` — placeholder calculator (`src/app/calc/page.tsx`) with a single numeric input and a flat‑rate formula.
- `next-themes` dependency present (unused).
- `recharts` dependency present (unused).
- Geist fonts wired via `next/font`.

## Partially Implemented

- **Calculator route** exists at `/calc` but the calculation is a fixed `gross - 22% - 8%`. It is not deterministic UK tax logic — it ignores Personal Allowance, tax bands, NI thresholds, Scottish rates, student loans, pensions, dividends, IR35, etc.
- **App Router split**: there are *two* App Router roots — top‑level `/app` (holds `/`) and `/src/app` (holds `/calc`). Next.js only reads one, so this is fragile. To be consolidated into top‑level `/app`.
- **Metadata**: only the default create‑next‑app title/description exists (`title: "Create Next App"`). No canonicals, OG, Twitter, or JSON‑LD.

## Missing

Everything the growth brief lists as required. Notably:

- Deterministic UK tax engine (Income Tax, NI, Scottish bands, student loans, pension relief, salary sacrifice, dividends, IR35 umbrella & LtdCo, corp tax, tax codes, period conversions).
- Any test coverage.
- Global site chrome (nav, footer, breadcrumbs, mobile UX).
- `/salary/[slug]-after-tax` programmatic SEO surface.
- Salary comparison page/URL.
- Pay‑rise discovery page.
- £100k tax trap page.
- Salary percentile ("how rich are you?").
- Share bar / shareable URLs.
- Dynamic OG image cards.
- `robots.txt` / `sitemap.xml`.
- Structured data (WebSite, WebApplication, BreadcrumbList, Article, FAQPage).
- Privacy‑conscious analytics abstraction.
- Email capture wiring.
- Content data engine / marketing calendar.
- Growth documentation set.

## Technical Debt Affecting Growth

| Item | Impact | Note |
|---|---|---|
| Dual App Router roots (`/app` and `/src/app`) | High | Only one gets read by Next.js; the other route effectively dead. |
| `.tsx` files use jarring double blank lines everywhere | Low | Cosmetic; will normalise as files are rewritten. |
| Fake tax formula on `/calc` | Critical | Actively misleading. Must be replaced before any acquisition traffic lands. |
| No abstractions (`lib/`) | High | Every stage of the growth brief requires shared modules. |
| No tests / no lint gate | High | Deterministic financial logic must be regression‑tested. |
| `next-themes`, `recharts` shipped but unused | Low | Considered for later. |

## SEO Risks

- Default `title: "Create Next App"` — will index as such if crawled today.
- No canonical URLs → duplicate risk when we introduce query‑stated calculator URLs.
- No `robots.txt` and no `sitemap.xml` — Google has no discovery map.
- No structured data → no rich results.
- No Open Graph / Twitter cards → weak social sharing.
- `/calc` produces different visual output on every render (client‑only) with **no server‑rendered content**. Bad for indexing until we address it.
- No hreflang / language declaration beyond `<html lang="en">` — fine for UK‑only, but should be explicit.

## Analytics Gaps

- No analytics library configured (no GA4, Plausible, PostHog, etc.).
- No event abstraction.
- No privacy policy or cookie posture.

## Growth Opportunities (highest leverage first)

1. **Ship a real deterministic tax engine** — the whole business rests on it. Once it exists, every acquisition surface (salary pages, pay‑rise, £100k trap, comparison, percentile, share cards) can be layered on cheaply.
2. **Programmatic salary landing pages** — `/salary/{n}-after-tax` for ~100 hand‑picked salaries in the £18k–£150k range. Strong long‑tail intent.
3. **£100k tax trap** — flagship shareable acquisition asset; visualises the marginal‑rate cliff between £100k and £125,140.
4. **Pay‑rise discovery** — natural social hook ("how much of a £10k raise do you keep?").
5. **Salary comparison** — `/compare/{a}-vs-{b}` — SEO + share.
6. **Percentile "How rich are you?"** — high shareability. Needs ONS/HMRC data source annotated as such.
7. **Share bar + dynamic OG images** — multiplier on every other surface.
8. **Analytics abstraction** — cheap; unblocks measurement of everything above.
9. **Structured content engine** — enables the marketing calendar and future social/newsletter workflow.

## Recommended Execution Order

1. Consolidate `/src/app` into `/app` and delete the placeholder.
2. Build `lib/tax` engine (Income Tax, NI, student loans, pensions, dividends, IR35) with unit tests against 2025/26 HMRC values.
3. Add `lib/seo`, `lib/analytics`, `lib/share`, `lib/content` shared modules.
4. Rebuild `/` (landing) and `/calculator` (main calculator).
5. Ship `/salary/[slug]-after-tax` with catalog + sitemap.
6. Ship `/pay-rise`, `/compare/[a]-vs-[b]`, `/100k-tax-trap`, `/salary-percentile`.
7. Dynamic OG images at `opengraph-image.tsx` per salary page.
8. `robots.ts`, `sitemap.ts`, JSON‑LD.
9. 30‑day marketing calendar dataset + content templates.
10. Docs (`seo-audit.md`, `analytics-spec.md`, `growth-backlog.md`, `manual-actions.md`, `launch-checklist.md`).
