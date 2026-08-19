# Technical SEO Audit — UK Take Home Calculator (July branch)

Format: Issue / Severity / Fix / Status.

Note: much of the fundamentals were already in place on the July branch when
this sprint started. Only genuinely new fixes are listed as ✅ Fixed. Items
already in place before this sprint are marked ✅ Pre-existing.

## Fundamentals

| Issue | Severity | Fix | Status |
|---|---|---|---|
| Titles / descriptions per route | Critical | Per-route Metadata API on every page (existing + new) | ✅ Pre-existing / extended |
| `sitemap.xml` | High | `app/sitemap.ts` generates the map from `CALC_SCENARIOS`, `CANONICAL_COMPARE_SLUGS`, and now `SALARY_CATALOG` | ✅ Extended this sprint |
| `robots.txt` hard-coded `yourdomain.com` in `public/` | Medium | Replaced with env-aware `app/robots.ts`; legacy static file deleted | ✅ Fixed |
| Canonical URLs | High | `alternates.canonical` on every page | ✅ Pre-existing / extended |
| Open Graph / Twitter cards | High | Per-page OG on the July branch; new pages inherit the pattern; per-salary OG images via `/api/og-salary` | ✅ Extended |
| Structured data | High | FAQPage + SoftwareApplication on `/calc/[scenario]`; extended to FAQPage + BreadcrumbList on `/salary/[slug]-after-tax` and FAQPage on `/100k-tax-trap` | ✅ Extended |
| Server-rendered content | High | All new pages are static or dynamic-SSR; no client-only rendering on indexable pages | ✅ Fixed |

## Crawl / Indexability

| Issue | Severity | Fix | Status |
|---|---|---|---|
| API endpoints crawlable | Medium | `Disallow: /api/` in `robots.ts` | ✅ Fixed |
| `<html lang>` | Low | Existing layout uses `en-GB` | ✅ Pre-existing |
| Internal linking from `/calc` scenarios to new salary pages | High | Each salary page links to `/pay-rise`, `/salary-percentile`, `/100k-tax-trap`, adjacent salary pages and landmark jumps; the `/100k-tax-trap` table links to the four anchor salary pages | ✅ Fixed |

## Content architecture

| Issue | Severity | Fix | Status |
|---|---|---|---|
| Annual-salary intent not covered | High | `/salary/[slug]-after-tax` for 57 curated salaries £18k–£150k | ✅ Fixed |
| Flagship `£100k tax trap` acquisition asset missing | High | `/100k-tax-trap` with deterministic table + FAQ + share-friendly one-number hook | ✅ Fixed |
| Pay-rise intent | High | `/pay-rise?from=X&to=Y` with popular scenarios | ✅ Fixed |
| Percentile only accessible as a tab | Medium | Standalone `/salary-percentile` URL preserving the existing `WealthPercentileTab` component | ✅ Fixed |
| Semantic HTML | Medium | New pages use `<article>`, `<section aria-labelledby>`, `<nav aria-label="Breadcrumb">` | ✅ Fixed |

## Performance

| Item | Note |
|---|---|
| `/salary/[slug]-after-tax` | Statically generated (57 pages) |
| `/100k-tax-trap` | Statically generated |
| `/salary` | Statically generated |
| `/pay-rise` | Dynamic SSR (query-param driven) |
| `/salary-percentile` | Dynamic SSR (query-param driven, uses existing client tab component) |
| `/api/og-salary` | Edge runtime, 24h cache |

## Known non-issues / by-design

- We deliberately do NOT index every possible salary — 57 curated salaries is enough for launch.
- The comparison strip already covers day-rate intent (`/compare/[slug]`) — we did not duplicate that surface.
- Newsletter capture is intentionally deferred (email surfaces were removed on the July branch with an explicit "revisit later" note); we did not re-add it.

## Post-deploy verification checklist

1. Submit `https://uktakehomecalculator.com/sitemap.xml` to Google Search Console + Bing Webmaster Tools.
2. Fetch `/robots.txt` (Next-generated) and confirm sitemap pointer.
3. Fetch `/salary/50000-after-tax` and view page source — deterministic £ values should be present pre-hydration.
4. Fetch `/api/og-salary?salary=50000` and verify the PNG contains the correct numbers.
5. Google Rich Results Test on `/salary/50000-after-tax` — expect FAQPage + BreadcrumbList.
6. Google Rich Results Test on `/100k-tax-trap` — expect FAQPage.
