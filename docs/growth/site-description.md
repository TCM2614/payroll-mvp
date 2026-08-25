# Complete Site Description — UK Take Home Calculator

**Purpose:** Single reference for security review, codebase audit, and prompt generation.  
**Product:** Free UK PAYE / contractor take-home calculator  
**Production URL:** `https://uktakehomecalculator.com`  
**Repo:** `TCM2614/payroll-mvp`  
**Documented against branch:** `cursor/growth-phase-continuation-bae3` (continuation of production-track `cursor/tax-year-2025-26-cc6d`)  
**Tax year displayed:** **2026/27** (6 April 2026 – 5 April 2027)

---

## 1. Product summary

A Next.js App Router site that computes UK take-home pay for:

- PAYE employment
- Umbrella company
- Limited company **Inside IR35**
- Limited company **Outside IR35** (salary + dividends + corporation tax)

Calculations are **deterministic TypeScript** (no AI arithmetic). Interactive calculators run primarily **client-side**. Marketing/SEO pages precompute results at build/request time using the same engines. There is **no user accounts, payments, database, email ESP, or auth** in the current dependency tree.

Monetisation posture: core calculator stays free; AdSense is gated behind cookie consent; optional consumer premium max £0.99 is a product constraint, **not implemented**.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js **16.1.1** (App Router) |
| UI | React **19.2**, Tailwind CSS **v4** |
| Language | TypeScript (strict) |
| Charts | `recharts` |
| Icons | `lucide-react` |
| Validation | `zod` |
| Theme | `next-themes` (present; dark/light toggle components exist) |
| Tests | Vitest (`npm test` / `vitest run`) |
| Deploy target | Vercel (assumed; env vars documented for Vercel) |
| Path alias | `@/*` → `./src/*` |

**Not present:** Prisma/ORM, auth libraries, Stripe/Resend, Redis, OpenAI SDK (commented stub only), middleware.

`next.config.ts` is empty of security headers / CSP / redirects.

---

## 3. Repository layout

```
app/                    Next.js App Router (pages, layouts, APIs, sitemap, robots)
  api/                  Edge route handlers
  lib/taxYear.ts        Display constant "2026/27"
src/
  components/           UI: calculators, tabs, ads, SEO, share, landing
  domain/tax/           Pure tax engines (source of truth for complex PAYE/IR35)
  lib/                  Calculators wrappers, marketing catalogs, analytics, siteUrl
  data/                 Static percentile tables
content/marketing/      Launch calendar + week-1 copy (not runtime-critical)
docs/growth/            Growth/SEO/analytics docs (this file lives here)
public/                 Static assets + ads.txt
```

Legacy root docs (`TECH_DEBT.md`, `TECHNICAL_DOD_CHECKLIST.md`, sprint deploy notes) may reference **removed** surfaces (signup, dashboard, OpenAI). Prefer this file + live code over those checklists.

---

## 4. Route inventory

### 4.1 Interactive / product

| Route | Role |
|---|---|
| `/` | Landing: CTAs, comparison strip, Explore discovery strip, CookieBanner |
| `/calc` | Main multi-tab calculator shell |
| `/calc/[scenario]` | SEO landings that deep-link into a tab: `paye`, `umbrella`, `limited-inside-ir35`, `limited-outside-ir35` |
| `/salary-percentile` | Standalone wrapper around `WealthPercentileTab` |
| `/pay-rise` | Query-driven `?from=&to=` viral pay-rise retention calculator |
| `/100k-tax-trap` | Educational PA-taper explainer + chart/table (effective vs marginal) |

### 4.2 Programmatic SEO / acquisition

| Route | Count | Catalog |
|---|---|---|
| `/salary` | hub | — |
| `/salary/[n]-after-tax` | **57** | `src/lib/marketing/salaryCatalog.ts` (£18k–£150k curated) |
| `/contractor` | hub | — |
| `/contractor/[n]-take-home` | **14** | `contractorCatalog.ts` — 4 regimes side-by-side via `computeLandingComparison` |
| `/multiple-jobs` | hub | — |
| `/multiple-jobs/{a}k-plus-{b}k` | **8** | `multiJobInsight.ts` |
| `/compare/[slug]` | **15** canonical | `CANONICAL_COMPARE_SLUGS` (day/hour/month rates) |

**Compare slugs:**  
`300-a-day`, `400-a-day`, `500-a-day`, `600-a-day`, `700-a-day`, `750-a-day`, `1000-a-day`, `40-per-hour`, `50-per-hour`, `70-per-hour`, `75-per-hour`, `100-per-hour`, `5000-a-month`, `8000-a-month`, `10000-a-month`.

### 4.3 Content / legal

| Route | Status |
|---|---|
| `/about` | Exists |
| `/contracting` | Exists (contractor education) |
| `/privacy` | Exists — claims no ads cookies / no marketing identifiers (see §9 conflicts) |
| `/cookies` | **Linked in footer but route missing** |
| `/terms` | **Linked in footer but route missing** |

### 4.4 Metadata routes

| Route | Behaviour |
|---|---|
| `/sitemap.xml` | `app/sitemap.ts` — home, calc, salary/contractor/multi-job hubs + all catalog pages, compare, about, contracting, privacy |
| `/robots.txt` | `app/robots.ts` — allow `/`, **disallow `/api/`**, sitemap + host from `SITE_URL` |

### 4.5 Header nav (discoverability)

Home, Calculator, Salary, Contractor, Multiple jobs, Pay rise, £100k trap, Percentile, About.

---

## 5. API / edge surfaces (security-relevant)

All under `app/api/`. `robots.txt` disallows crawling `/api/`.

### 5.1 `GET /api/og-comparison`

- **Runtime:** edge  
- **Input:** `?slug=` (optional; default `500-a-day`)  
- **Behaviour:** Parses slug via `parseCompareSlug`; runs `computeLandingComparison`; returns PNG via `next/og` `ImageResponse`  
- **Cache:** `revalidate = 86400`  
- **Risk notes:** Deterministic compute + image render. Invalid slug → 400 (or fallback to default). No auth. Public. CPU/memory DoS via repeated edge renders is the main concern (no rate limit in-app).

### 5.2 `GET /api/og-salary`

- **Runtime:** edge  
- **Input:** `?salary=` integer  
- **Guardrails:** reject if not finite or outside **£1,000 – £10,000,000**  
- **Behaviour:** `buildSalaryInsight` → OG PNG  
- **Cache:** `revalidate = 86_400`  
- **Risk notes:** Same as above; salary bound reduces absurd work.

### 5.3 `GET /api/meta-summary`

- **Runtime:** edge  
- **Input:** `hourly`, `takeHome` query params (required)  
- **Behaviour:** Returns JSON stub string; **OpenAI call is commented out** (`OPENAI_API_KEY` not used)  
- **Risk notes:** Reflects user-supplied numbers into JSON with `parseFloat` (no sanitisation beyond presence). No secrets. Potential for abuse as a free echo endpoint; low sensitivity. Legacy deploy docs still mention enabling GPT — **do not treat as live**.

**No other API routes** in tree. No webhooks, no form POSTs, no file upload.

---

## 6. Tax / calculation architecture

### 6.1 Domain engines (`src/domain/tax/`) — do not invent HMRC numbers

| Module | Responsibility |
|---|---|
| `periodTax.ts` | Period PAYE + NI; PA taper at £100k+; years `2025-26` / `2026-27` |
| `taxCode.ts` | Tax code parser: `1257L`, K, Scottish S*, Welsh C*, BR/D0/D1/D2, NT, 0T, M/N, X, T |
| `contracting.ts` | Annual contractor engine for comparison scenarios |
| `outsideIR35.ts` | Director salary + dividends + CT marginal relief |
| `multiJob.ts` | Combined PAYE across jobs / per-stream codes |
| `periodActuals.ts` | Cumulative vs non-cumulative reconciliation |

Config bands live in `src/lib/tax/uk2025.ts` (includes Scottish schedule). Student loans: `src/lib/student-loans.ts` + UI selectors.

### 6.2 Calculator entry points

- `src/lib/calculators/{paye,umbrella,limited}.ts`
- Client shell: `src/components/take-home-calculator.tsx`
- Tabs: `PayeTab`, `UmbrellaTab`, `LimitedTab`, `LimitedOutsideIR35Tab`, `WealthPercentileTab`, `CombinedIncomeTab`, `AdditionalJobsTab`
- Supporting UI: pension/SIPP, student loans, tax-code helper, deductions chart, IR35 badge

### 6.3 Marketing reuse (same engines)

- `landingComparison.ts` — 4-regime comparison (landing, compare pages, OG, contractor pages)
- `salaryInsight.ts` — annual salary after-tax pages + OG salary
- `multiJobInsight.ts` — multi-job worked examples
- `compareSlug.ts` / `deriveComparisonInputs.ts` — slug parse + input derivation with min/max guardrails

**Invariant for any AI/prompt work:** deterministic engine is source of truth; never invent tax rates or replace engine outputs with LLM math.

---

## 7. Client storage, cookies, third parties

### 7.1 First-party storage

| Key | Location | Purpose |
|---|---|---|
| `ukpayroll_cookie_consent` | `localStorage` | Cookie consent for AdSense (`consent.ts` / `CookieBanner`) |

Consent fail-open: if `localStorage` throws, `hasAcceptedCookieConsent()` returns **`true`** (ads may load).

CookieBanner is mounted on the **landing page** (`app/page.tsx`), not globally in root layout.

### 7.2 Third-party scripts

| Vendor | How loaded | Condition |
|---|---|---|
| **Plausible** | Hardcoded script URL + inline init in `app/layout.tsx` | Always (production tracking via `trackEvent` no-ops in non-production) |
| **Umami** | Optional `NEXT_PUBLIC_UMAMI_*` | Only if both website ID + script URL set |
| **Google AdSense** | `AdSenseScript` after consent | Requires consent **and** `NEXT_PUBLIC_ADSENSE_CLIENT_ID` |
| `public/ads.txt` | Static | `google.com, pub-5163287208898205, DIRECT, …` |

Analytics abstraction: `src/lib/analytics.ts` — fires `window.plausible` with custom props; auto-attaches sanitised UTM params (max 60 chars). Salary values sent as **bands** (`<30k`, `30-60k`, `60-100k`, `>100k`), not exact salary, on growth events.

Named events include: `calculator_submit`, `results_view`, `warning_shown`, `cta_click`, comparison strip events, `salary_page_viewed`, `pay_rise_viewed`, `tax_trap_viewed`, `percentile_viewed`, `share_clicked`.

### 7.3 `dangerouslySetInnerHTML` usages

- Plausible init snippet in layout  
- JSON-LD blocks on SEO pages (`SchemaMarkup`, salary/contractor/calc/compare/trap/multi-job) — typically `JSON.stringify` of structured objects  
- Not used for arbitrary user HTML rendering

---

## 8. Environment variables

| Variable | Required? | Use |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Strongly recommended | Canonical origin; `src/lib/siteUrl.ts` falls back to `https://uktakehomecalculator.com` and rejects `yourdomain` literals |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Optional | Enables AdSense script when consent given |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Optional | Umami |
| `NEXT_PUBLIC_UMAMI_SCRIPT_URL` | Optional | Umami |
| `NODE_ENV` | Automatic | Analytics + logger behaviour |

**Documented but not wired in current code:** `OPENAI_API_KEY`, `NEXT_PUBLIC_SIGNUP_SHEET_ENDPOINT`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (Plausible is hardcoded, not env-gated), Logtail token (commented in logger).

**Secrets posture:** No server secrets required for core product. No DB credentials. AdSense/Umami IDs are public by nature (`NEXT_PUBLIC_*`).

---

## 9. Privacy / compliance posture (as implemented vs claimed)

**Implemented intent:** client-side calc; no PII collection; no email signup in current app; analytics anonymised / banded.

**Conflicts / gaps for security or legal review:**

1. `/privacy` says no advertising cookies / marketing identifiers, but AdSense loads after consent and `ads.txt` is present.  
2. Privacy mentions “GA4” as an example; live analytics is Plausible (+ optional Umami), not GA4 in code.  
3. Footer links to `/cookies` and `/terms` which **404**.  
4. Consent is `localStorage`-only (not a cookie); fail-open on storage errors.  
5. CookieBanner only on home, while AdSense script component is in root layout (consent check still applies globally once stored).

---

## 10. SEO / sharing

- Per-page metadata + Open Graph; default OG image uses `/api/og-comparison?slug=500-a-day`  
- Salary pages can use `/api/og-salary?salary=`  
- `ShareBar` + `PageViewTracker` on acquisition surfaces  
- JSON-LD: FAQ / SoftwareApplication / Breadcrumb where wired  
- Indexing: `robots` allows all pages except `/api/`

---

## 11. Testing & quality gates

- **Runner:** `npm test` → Vitest  
- **Specs:** domain tax (`periodTax`, `taxCode`, `paTaper`, `contracting`, `periodActuals`), marketing (`landingComparison`, `compareSlug`, `deriveComparisonInputs`, `salaryInsight`, `multiJobInsight`), percentile helpers, period tax-code override  
- **Build:** `npm run build` (must pass for ship)  
- **Lint:** known legacy eslint debt documented in `docs/TECH_DEBT.md` / root `TECH_DEBT.md` (references some deleted paths)

Approximate suite size after growth work: **~163** tests (historically 151 on July base + multi-job/marketing additions).

---

## 12. What is explicitly out of scope / absent

- User authentication / sessions / CSRF tokens  
- Persistent datastore  
- Payment processing  
- Email capture / newsletter / Resend  
- Admin dashboards  
- File uploads  
- Server-side tax calculation APIs (calculations are domain libs imported by pages/OG, not a general calc API)  
- Custom CSP / security headers in `next.config`  
- Rate limiting middleware  

---

## 13. Branch / merge context (for auditors)

| Branch | Role |
|---|---|
| `master` (GitHub default) | Stub / toy — **do not treat as production app** |
| `main` | Older Nov 2025 line; somewhat orphaned |
| `cursor/tax-year-2025-26-cc6d` | July 2026 production-track base (~35 commits ahead of `main`) |
| `cursor/growth-phase-continuation-bae3` | Growth surfaces + this doc (PR onto July branch) |

Recommended path: merge growth PR → July branch → then July → `master` for production. Set `NEXT_PUBLIC_SITE_URL=https://uktakehomecalculator.com` on Vercel.

---

## 14. Security-review checklist (prompt-ready)

Use this as a starter prompt for a security/codebase agent:

1. Enumerate all routes and confirm only three API handlers exist; review each for injection, SSRF, resource exhaustion, reflected content.  
2. Confirm no secrets in repo; scan for hardcoded keys (Plausible script ID is public analytics; AdSense publisher id in `ads.txt`).  
3. Review `dangerouslySetInnerHTML` call sites — ensure only trusted JSON-LD / fixed scripts.  
4. Review consent fail-open and AdSense/privacy policy consistency.  
5. Confirm calculator inputs never leave the browser except as analytics **bands** / page paths.  
6. Check OG endpoints for unbounded compute (salary already capped).  
7. Note missing `/cookies` and `/terms` pages linked from footer.  
8. Confirm no auth/payment/DB attack surface.  
9. Verify tax engines are not bypassed by LLM or client-only forged “official” outputs on SEO pages (pages should call shared builders).  
10. Check dependency surface (`package.json`) for unnecessary network SDKs.

---

## 15. Prompt-generation constraints (product rules)

When generating further engineering prompts:

- Prefer **inspect → reuse → extend** existing `src/domain/tax` and `src/lib/marketing`; do not rebuild engines.  
- AI must **not invent HMRC figures**.  
- Keep core calculator free; no payment infra unless already present.  
- Prefer existing Plausible abstraction; don’t add analytics vendors without need.  
- Growth pages belong in sitemap + header/landing discovery when added.
