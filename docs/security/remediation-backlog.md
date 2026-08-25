# Remediation Backlog

Prioritised outstanding work after the 2026-08-25 hardening pass.

| Priority | ID | Item | Owner |
|---|---|---|---|
| P0 | SEC-02 | Legal review of Privacy / Cookies / Terms wording | Owner + counsel |
| P0 | SEC-12 | Decide whether Plausible requires consent under PECR; implement Reject/Revoke if required | Owner + eng |
| P1 | SEC-08 | Consider env-driven Plausible loader (still public site id) | Eng |
| P1 | CSP | Move to nonce-based CSP; remove `'unsafe-eval'` if verified unused | Eng |
| P1 | Umami | If enabling Umami, extend CSP allowlist for its host | Eng / ops |
| P2 | SEC-05 | Optional Vercel WAF / rate limit on `/api/og-*` | Ops |
| P2 | SEC-20 | Richer `error.tsx` boundary if product wants branded errors | Eng |
| P2 | SEC-23 | Remove or use unused `AdSenseAd` component | Eng |
| P3 | Docs hygiene | Archive/mark stale sprint docs referencing deleted `/api/signup` and OpenAI | Eng |
| P3 | Consent versioning | Bump consent key if policy materially changes | Eng |

## Completed in this pass

- SEC-01 fail-closed consent  
- SEC-03 `/cookies` + `/terms`  
- SEC-04 security headers + CSP  
- SEC-06 remove `/api/meta-summary`  
- SEC-07 tighten OG salary upper bound  
- SEC-10 safe JSON-LD serialization  
- SEC-11 remove unverified aggregateRating  
- SEC-13/14 `dynamicParams=false` on compare + calc scenarios  
- SEC-16 Next 16.3.3 upgrade  
- Security regression tests  
- `not-found.tsx`  
- Privacy factual rewrite (legal review still required)
