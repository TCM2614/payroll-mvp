# Technical SEO Audit — UK Take Home Calculator

Performed against the branch produced by this growth sprint. Format follows
the growth‑brief spec: Issue / Severity / Fix / Status.

## Fundamentals

| Issue | Severity | Fix | Status |
|---|---|---|---|
| Default `title: "Create Next App"` on every page | Critical | Replaced site‑wide via `buildMetadata` helper and Next.js Metadata API | ✅ Fixed |
| No `sitemap.xml` | High | Added `app/sitemap.ts` — includes core routes, all salary pages and landmark comparisons (200+ URLs) | ✅ Fixed |
| No `robots.txt` | High | Added `app/robots.ts` with sitemap pointer and API/debug disallow | ✅ Fixed |
| No canonical URLs | High | Every page uses `metadataBase` + `alternates.canonical` via `buildMetadata` | ✅ Fixed |
| No Open Graph / Twitter cards | High | Site‑level and per‑salary dynamic OG images via `next/og` at `app/opengraph-image.tsx` and `app/salary/[slug]/opengraph-image.tsx` | ✅ Fixed |
| No structured data | High | JSON‑LD helpers: WebSite, WebApplication, BreadcrumbList, FAQPage, Article. FAQ schema only applied where visible content matches. | ✅ Fixed |
| `/calc` was client‑only with no SSR content | High | Replaced by SSR‑friendly `/calculator` and static `/salary/[slug]-after-tax` pages | ✅ Fixed |

## Crawl / Indexability

| Issue | Severity | Fix | Status |
|---|---|---|---|
| Dual App Router roots (`app/` + `src/app/`) — dead `/calc` route | High | Consolidated to top‑level `app/`, deleted `src/` | ✅ Fixed |
| API endpoints and `_next/` would otherwise be crawlable | Medium | Disallowed under `robots.ts` | ✅ Fixed |
| `<html lang>` was `"en"` (not GB‑specific) | Low | Set to `en-GB` in `app/layout.tsx` | ✅ Fixed |
| Unindexed comparison / salary graph internal navigation | High | Every salary page includes cross‑links to nearest neighbours and landmark jumps; comparison index links to all landmark combos | ✅ Fixed |

## Content architecture

| Issue | Severity | Fix | Status |
|---|---|---|---|
| Thin salary content risk | High | Each salary page has: hero numbers, "where your money goes" breakdown, pay‑rise widget, percentile snippet, adjacent salary graph, comparison links, FAQ. No content is boilerplate — figures come from the deterministic engine. | ✅ Fixed |
| Semantic HTML | Medium | `<article>`, `<section>`, `<nav aria-label>`, proper `<h1>` → `<h2>` hierarchy on every page | ✅ Fixed |
| Breadcrumbs missing | Medium | `<Breadcrumbs>` component on every deep page, emits `BreadcrumbList` JSON‑LD | ✅ Fixed |
| Missing methodology / privacy pages | Medium | `/methodology` and `/privacy` added, linked from footer | ✅ Fixed |

## Performance

| Issue | Severity | Fix | Status |
|---|---|---|---|
| Client‑side calculator on landing pages | Medium | Salary pages render numbers server‑side; only the interactive `<Calculator>` component is a client boundary | ✅ Fixed |
| No image assets shipped yet (heavy assets from old starter) | Low | Unused `next.svg`, `vercel.svg` etc still in `public/` — leave for now, low cost. See backlog. | ⚠ Backlog |
| `recharts` dependency shipped but not yet used | Low | Left in `package.json`; will be used for £100k trap visualisation later. Considered for removal if unused after next sprint. | ⚠ Backlog |

## Mobile / Rendering

| Issue | Severity | Fix | Status |
|---|---|---|---|
| Layout not mobile‑optimised | Medium | Tailwind responsive scale throughout (`sm:`/`md:`/`lg:` grid gaps and typography), header nav horizontally scrolls on narrow screens, breadcrumb wraps | ✅ Fixed |
| Text/background contrast | Medium | Emerald / rose accents against zinc backgrounds; dark mode variants everywhere | ✅ Fixed |

## Known non‑issues / by‑design

- We deliberately do NOT index every possible salary. The catalog is ~85
  curated salaries (£18k–£150k). Expansion is one‑line via
  `lib/content/salary-catalog.ts` and does not require new page components.
- Comparison pages are generated statically for landmark combinations
  (17² / 2 ≈ 136 URLs). `dynamicParams = true` allows arbitrary
  `a-vs-b` combos to render on demand for user‑shared URLs.
- We do NOT auto‑publish content. The 30‑day marketing calendar is a
  deterministic dataset (`content/marketing/30-day-launch-calendar.ts`) — a
  human reviews before posting.

## Post‑deploy manual verification checklist

1. Submit `https://uktakehomecalculator.com/sitemap.xml` to Google Search
   Console and Bing Webmaster Tools.
2. Fetch `https://uktakehomecalculator.com/robots.txt` and confirm sitemap
   pointer.
3. Fetch a sample `/salary/50000-after-tax` and confirm rendered HTML
   contains the £50k values before JavaScript executes.
4. Fetch `/salary/50000-after-tax/opengraph-image` and verify the PNG
   contains the correct numbers.
5. Google Rich Results Test on `/salary/50000-after-tax` — expect valid
   FAQPage, BreadcrumbList, Article and WebSite entries.
