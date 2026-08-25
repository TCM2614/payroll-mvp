# Threat Model — UK Take Home Calculator

**Scope:** Public Next.js calculator at `https://uktakehomecalculator.com`  
**Deployment:** Vercel (assumed)  
**Data posture:** No auth, no application database, no payment, no PII datastore

---

## Assets

| Asset | Why it matters |
|---|---|
| Integrity of tax results | Users make career/pay decisions; wrong figures destroy trust |
| Deterministic engines in `src/domain/tax` | Single source of truth for PAYE/IR35/multi-job |
| Public reputation / brand | Financial tool; privacy mismatches are high-visibility |
| SEO programmatic pages | Acquisition inventory; poisoning or unbounded URLs hurt rankings |
| Edge OG image endpoints | CPU/memory on shared edge; share-preview integrity |
| Analytics integrity | Product decisions depend on clean, non-PII events |
| AdSense configuration | Revenue; consent misuse creates compliance risk |
| GitHub repository | Source integrity; secret leakage |
| Vercel project / env | Production URL, AdSense client id |
| Client privacy | Salary inputs should not become persistent profiles |

## Trust boundaries

1. **Browser ↔ Next.js app** — HTML/JS delivery; client-side tax math  
2. **Browser ↔ Plausible** — always-on analytics script  
3. **Browser ↔ Umami (optional)** — env-gated analytics  
4. **Browser ↔ Google AdSense** — after consent (fail-closed)  
5. **Public query/path params ↔ Edge routes** — OG PNG generation  
6. **Vercel ↔ application** — build, env injection, edge runtime  
7. **Curated catalogues ↔ SEO pages** — must stay bounded (`dynamicParams=false`)  
8. **Developer workstation ↔ GitHub** — code & docs (no live secrets expected)

## Adversaries & realistic capabilities

| Adversary | Relevant capabilities against this app |
|---|---|
| Anonymous abusive user | Flood OG endpoints; fuzz query params; scrape |
| Automated bots | Index spam URLs if dynamicParams open; hammer APIs |
| XSS / input attacker | Break JSON-LD / reflected params (limited surface) |
| Malicious third-party script | If AdSense/analytics compromised — supply-chain |
| Compromised npm dependency | Build-time or runtime RCE in CI/edge (framework risk) |
| Misconfigured deploy | Wrong `SITE_URL`, missing consent env, preview as canonical |
| Accidental developer leakage | Commit `.env`, paste keys in docs |

## Out of scope / not assets

- Stored bank details, passwords, session tokens (do not exist)
- Multi-tenant data isolation (no tenants)
- Privilege escalation between user roles (no roles)

## Primary security objectives

1. Preserve calculation integrity  
2. Minimise data collection  
3. Optional scripts only with reliable consent (fail-closed)  
4. Bound public compute (OG + catalogues)  
5. Prevent injection in HTML/JSON-LD  
6. Keep SEO routes curated  
7. Accurate privacy behaviour vs copy  
8. Avoid unnecessary attack surface (dead APIs)
