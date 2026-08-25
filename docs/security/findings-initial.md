# Initial Findings Table (pre-remediation)

**Audit date:** 2026-08-25  
**Branch audited:** `cursor/growth-phase-continuation-bae3` @ `77417e4` (then branched to `cursor/security-review-hardening-bae3`)  
**Base track:** `cursor/tax-year-2025-26-cc6d`  
**Method:** inspect → verify → classify. No code changes applied before this table.

**Baseline tests:** 163 passed | 4 skipped (167 total) via `vitest run`.

---

## Verified findings

| ID | Severity | Component | Verified evidence | Status before fix |
|---|---|---|---|---|
| SEC-01 | **High** | `src/components/ads/consent.ts` | `hasAcceptedCookieConsent()` returns `true` on `localStorage` throw (“fail open”). AdSenseScript/AdSenseAd use this. | Open |
| SEC-02 | **High** | `app/privacy/page.tsx` vs runtime | Privacy claims no marketing cookies/identifiers; denies advertising cookies. Runtime: Plausible always loads; AdSense after consent; optional Umami; `ads.txt` present. Mentions GA4/Google Analytics; GA4 not implemented. | Open — legal + factual |
| SEC-03 | **Medium** | `SiteFooter.tsx` | Links to `/cookies` and `/terms`; no `app/cookies` or `app/terms` routes → production 404s. | Open |
| SEC-04 | **Medium** | `next.config.ts` | Empty config — no CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame restrictions. | Open |
| SEC-05 | **Medium** | `/api/og-*` | Public edge ImageResponse; salary 1k–10m; comparison slug parsed with guardrails. 24h revalidate. No app-level rate limit. Platform (Vercel) is primary mitigator. | Open — document + mild harden |
| SEC-06 | **Medium** | `/api/meta-summary` | Stub GET; `parseFloat` echo; OpenAI commented. **Zero** app imports/callers (`rg` for `/api/meta` in TS/TSX = none). Dead attack surface. | Open — remove |
| SEC-07 | **Low** | `/api/og-salary` | Bound £1k–£10m is wide vs catalog (£18k–£150k) but compute is O(1) tax calc + fixed-size PNG. Over-broad but low amplification. | Open — tighten toward product max with headroom |
| SEC-08 | **Low** | `app/layout.tsx` | Plausible script URL hardcoded (public site id). Not a secret; reduces env portability; loads without consent. | Open — document; optional env later |
| SEC-09 | **Low** | Legacy docs | `OPENAI_API_KEY`, signup sheet, Logtail, deleted `/api/signup` still in sprint docs. Misleading for operators. | Open — deprecate notes |
| SEC-10 | **Low** | JSON-LD via `dangerouslySetInnerHTML` | `JSON.stringify` of controlled objects. Classic `</script>` breakout risk if user strings ever include `<`. Pay-rise/share content mostly numeric. No active exploit found with current curated data. | Open — safe serialize helper |
| SEC-11 | **Medium** | `SchemaMarkup.tsx` | Hard-coded `aggregateRating` 4.8 / 100 with no evidence source — SEO integrity / trust risk (not XSS). | Open — remove unverified rating |
| SEC-12 | **Medium** | Consent UX | Cookie banner only on `/` (`app/page.tsx`). No reject/revoke UI. Accept-only. Plausible loads regardless of consent. | Open — fail-closed + note; legal for policy |
| SEC-13 | **Low** | `/compare/[slug]` | `generateStaticParams` for 15 canonicals but **no** `dynamicParams = false` (unlike salary/contractor/multi-job). Extra parseable slugs can still SSR/index. | Open — set `dynamicParams = false` |
| SEC-14 | **Low** | `/calc/[scenario]` | No `dynamicParams = false`; invalid scenarios return empty metadata / notFound path depending on code. | Open — set false |
| SEC-15 | **Informational** | `/pay-rise?from&to` | Exact salaries in URL/canonical by design (viral share). Analytics bands only. Privacy trade-off: intentional product state. | Document only |
| SEC-16 | **Medium** (framework) | `next@16.1.1` | `npm audit --omit=dev`: Next advisories (RSC DoS, middleware bypasses, image optimizer, etc.). App has **no middleware**, **no `"use server"`**, **no `next/image` remotePatterns**. Many CVEs not reachable; residual framework risk remains. Fix path: upgrade to patched 16.x with regression. | Owner action preferred; attempt careful bump if build-safe |
| SEC-17 | **Low** | Transitive deps | brace-expansion, flatted, ajv, picomatch mostly **dev** (eslint). Prod omit: nanoid, postcss (via next), sharp (via next). | Document; avoid force-upgrade chain unless next bump |
| SEC-18 | **Informational** | Secrets scan | No `.env` files; `.gitignore` has `.env*`, `*.pem`. Docs show placeholder `OPENAI_API_KEY=sk-...` (literal ellipsis pattern in sprint docs — not a live key). Plausible/AdSense public IDs only. | Clean |
| SEC-19 | **Informational** | Tax engines | Domain modules pure; marketing builders call shared engines; salary pages use `buildSalaryInsight`; OG uses same. No LLM arithmetic. | Confirmed OK — do not refactor |
| SEC-20 | **Low** | Error UX | No `app/error.tsx` / `not-found.tsx` / `global-error.tsx`. Relies on Next defaults. | Optional harden |
| SEC-21 | **Informational** | Storage | Only key: `ukpayroll_cookie_consent` in localStorage. No salary persistence found. | OK |
| SEC-22 | **Informational** | `target=_blank` | ShareBar uses `window.open(..., "noopener,noreferrer,...")` — OK | OK |
| SEC-23 | **Low** | AdSenseAd | Component exists but **unused** in pages (only AdSenseScript in layout). Dead code / future surface. | Informational |
| SEC-24 | **Informational** | SITE_URL | `siteUrl.ts` rejects `yourdomain`, falls back to production HTTPS host. Preview must set env explicitly. | Add unit tests |

---

## Route enumeration (filesystem)

| Route | Class |
|---|---|
| `/` | Landing / static+client |
| `/calc` | Client-heavy calculator |
| `/calc/[scenario]` | SEO + calculator deep-link |
| `/salary`, `/salary/[slug]` | SEO programmatic (`dynamicParams=false`) |
| `/contractor`, `/contractor/[slug]` | SEO programmatic (`dynamicParams=false`) |
| `/multiple-jobs`, `/multiple-jobs/[slug]` | SEO programmatic (`dynamicParams=false`) |
| `/compare/[slug]` | SEO/share (canonical list; dynamicParams **unset**) |
| `/pay-rise` | Query-driven tool (indexable canonical with query) |
| `/100k-tax-trap` | SEO/education |
| `/salary-percentile` | Client tool wrapper |
| `/about`, `/contracting`, `/privacy` | Content |
| `/cookies`, `/terms` | **Missing** (footer links) |
| `/robots.txt`, `/sitemap.xml` | Metadata routes |
| `/api/og-comparison`, `/api/og-salary`, `/api/meta-summary` | Edge APIs |

No other `app/**/page.tsx` or `route.ts(x)` found.

---

## Critical findings

**None** identified with credible exploit path to data compromise or tax-result integrity failure.

---

## Planned automatic remediations (this branch)

1. Consent fail-closed (SEC-01)  
2. Remove unused `/api/meta-summary` (SEC-06)  
3. Security headers + pragmatic CSP (SEC-04)  
4. `/cookies` + `/terms` factual pages (SEC-03)  
5. Privacy page factual corrections + **REQUIRES OWNER/LEGAL REVIEW** markers (SEC-02)  
6. Safe JSON-LD serialize helper (SEC-10)  
7. Remove unverified aggregateRating (SEC-11)  
8. `dynamicParams = false` on compare + calc scenario (SEC-13/14)  
9. Tighten og-salary upper bound with headroom (SEC-07)  
10. SITE_URL + consent + API validation regression tests  
11. Minimal `not-found.tsx`  
12. Full `docs/security/*` pack  

**Out of automatic scope:** AdSense removal, Plausible consent gating (legal/product), Next major force-upgrade without owner approval if build breaks, tax engine changes.
