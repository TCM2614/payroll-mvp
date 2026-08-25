# Security & Codebase Review — UK Take Home Calculator

**Review date:** 2026-08-25  
**Branch:** `cursor/security-review-hardening-bae3`  
**Production URL:** `https://uktakehomecalculator.com`  
**Repo:** `TCM2614/payroll-mvp`

## Executive assessment

**Rating: Acceptable with remediation**

The application is a mature, low-data-surface public calculator: no auth, no database, no payments, deterministic shared tax engines, curated SEO catalogues. No **Critical** findings with credible paths to stored PII compromise or tax-engine sabotage were identified.

Material issues were found and largely **fixed in-repo**: consent fail-open, missing legal routes, absent security headers, dead meta-summary API, unverified structured-data ratings, JSON-LD serialization hygiene, over-open dynamic compare/calc params, and an outdated Next.js patch line.

**Remaining owner/legal work** (privacy copy, whether analytics needs consent, production header verification) prevents a clean “Strong” rating.

**GO WITH REMEDIATION** for continued public marketing traffic — see final section.

## Critical findings

None.

## High findings

### SEC-01 — Consent fail-open → **Fixed**
- **Evidence:** `hasAcceptedCookieConsent` previously returned `true` on storage errors.  
- **Impact:** AdSense could load without affirmative consent when storage is blocked.  
- **Fix:** Fail-closed (`false`). Regression tests added.

### SEC-02 — Privacy copy vs AdSense/Plausible → **Partially fixed**
- **Evidence:** Privacy denied advertising identifiers while AdSense/`ads.txt` existed; mentioned GA4 unused.  
- **Fix:** Factual privacy rewrite + cookies page.  
- **Residual:** **REQUIRES OWNER/LEGAL REVIEW**; Plausible still loads without consent.

## Medium findings

| ID | Finding | Status |
|---|---|---|
| SEC-03 | Footer `/cookies` `/terms` 404 | **Fixed** — pages added |
| SEC-04 | No security headers | **Fixed** — CSP + HSTS + others |
| SEC-05 | Public OG edge CPU | **Documented** + slug length / salary bound harden; platform rate limit = owner |
| SEC-06 | Dead `/api/meta-summary` | **Fixed** — removed |
| SEC-11 | Fake `aggregateRating` 4.8/100 | **Fixed** — removed |
| SEC-12 | Accept-only banner; Plausible ungated | **Partial** — ads fail-closed; analytics legal decision open |
| SEC-16 | Next 16.1.1 advisories | **Fixed** — upgraded to 16.3.3; prod audit clean |

## Low / informational

- SEC-07 OG salary range tightened to £1k–£500k  
- SEC-08 Hardcoded Plausible (public id) — informational  
- SEC-09 Stale sprint docs — backlog  
- SEC-10 JSON-LD `safeJsonLd` applied  
- SEC-13/14 `dynamicParams=false` on compare + calc scenarios  
- SEC-15 Pay-rise exact salaries in URL — intentional  
- SEC-18 No live secrets found  
- SEC-19 Tax engines shared & deterministic — confirmed  
- SEC-21 Only consent localStorage key  
- SEC-22 ShareBar opener isolation OK  

## Fixes applied (files)

- `src/components/ads/consent.ts` — fail-closed  
- `src/components/landing/CookieBanner.tsx` — shared key, clearer copy  
- `next.config.ts` — security headers + CSP; `poweredByHeader: false`  
- `app/api/meta-summary/route.ts` — **deleted**  
- `app/api/og-salary/route.tsx` — integer + £500k cap  
- `app/api/og-comparison/route.tsx` — slug length + no silent fallback to wrong rate  
- `app/cookies/page.tsx`, `app/terms/page.tsx`, `app/not-found.tsx` — new  
- `app/privacy/page.tsx` — factual rewrite  
- `src/lib/safeJsonLd.ts` + call sites — XSS-hardening for JSON-LD  
- `src/components/SEO/SchemaMarkup.tsx` — remove unverified rating  
- `app/compare/[slug]/page.tsx`, `app/calc/[scenario]/page.tsx` — `dynamicParams=false`  
- `app/sitemap.ts` — cookies/terms  
- `package.json` / lockfile — Next 16.3.3  
- `src/lib/__tests__/security.hardening.spec.ts` — regressions  
- `docs/security/*` — this pack  

## Calculation integrity

Confirmed: marketing/SEO/OG paths call shared builders (`buildSalaryInsight`, `computeLandingComparison`, domain tax modules). No LLM arithmetic. Tax constants not modified in this review.

## Privacy (summary)

- Storage: consent flag only  
- Analytics: Plausible (+ optional Umami); salary **bands** on custom events  
- AdSense: after accept; fail-closed  
- Exact salaries: public SEO/share URLs by design  

## APIs

| Endpoint | Purpose | Validation | Risk | Status |
|---|---|---|---|---|
| `GET /api/og-comparison` | Share PNG | parseCompareSlug + length≤64 | Edge CPU | Hardened |
| `GET /api/og-salary` | Salary PNG | integer £1k–£500k | Edge CPU | Hardened |
| `GET /api/meta-summary` | Stub echo | n/a | Dead surface | **Removed** |

## Dependencies

- Prod audit after Next bump: **0** vulnerabilities  
- Direct packages unchanged aside from Next/eslint-config-next  

## Security headers

See `security-headers.md`. Implemented via `next.config.ts`.

## Tests

- Baseline: 163 passed / 4 skipped  
- Added: `src/lib/__tests__/security.hardening.spec.ts` (+10)  
- **Final: 173 passed | 4 skipped (177)** — `vitest run`, 13 files  

## Build quality

| Gate | Result |
|---|---|
| `npm test` | Pass (173/4 skip) |
| `npm run build` | Pass — 116 static pages; APIs `og-comparison`, `og-salary` only |
| `npm run lint` | Pass with **0 errors**, 11 pre-existing warnings (PayeTab unused vars, multiJob, analytics) |
| TypeScript (via Next build) | Pass after excluding Vitest specs from `tsconfig` `exclude` |
| `npm audit --omit=dev` | **0** vulnerabilities after Next 16.3.3 |
## Remaining owner actions

1. Legal review of Privacy / Cookies / Terms  
2. Decide Plausible consent posture; add Reject/Revoke if required  
3. Verify response headers on production after deploy  
4. Set `NEXT_PUBLIC_SITE_URL` on Vercel (prod + preview)  
5. If enabling Umami, extend CSP allowlist  
6. Optional: WAF/rate limits on `/api/og-*`  

## Risk register

| ID | Severity | Finding | Status | Owner |
|---|---|---|---|---|
| SEC-01 | High | Consent fail-open | Fixed | Eng |
| SEC-02 | High | Privacy mismatch | Mitigated; legal open | Owner/Legal |
| SEC-03 | Medium | Missing legal routes | Fixed | Eng |
| SEC-04 | Medium | No headers/CSP | Fixed | Eng |
| SEC-05 | Medium | OG exhaustion | Mitigated | Ops |
| SEC-06 | Medium | Dead meta-summary | Fixed | Eng |
| SEC-07 | Low | Broad OG salary | Fixed | Eng |
| SEC-08 | Low | Hardcoded Plausible | Open | Eng |
| SEC-10 | Low | JSON-LD escape | Fixed | Eng |
| SEC-11 | Medium | Fake ratings schema | Fixed | Eng |
| SEC-12 | Medium | Analytics ungated | Open | Owner/Legal |
| SEC-13/14 | Low | dynamicParams | Fixed | Eng |
| SEC-16 | Medium | Next advisories | Fixed | Eng |

## GO / NO-GO

**GO WITH REMEDIATION**

Safe to continue public marketing traffic after deploying this hardening branch, provided owner completes legal review of privacy/cookie/terms copy and verifies production headers. Not **NO-GO**: no critical exploit path against stored financial records (none exist) or tax integrity was demonstrated. Not unconditional **GO**: consent/analytics legal posture and CSP residual `'unsafe-inline'` remain.
