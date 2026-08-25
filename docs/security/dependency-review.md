# Dependency Review

**Date:** 2026-08-25  
**Lockfile:** `package-lock.json`  
**Action taken:** Upgraded `next` and `eslint-config-next` from **16.1.1 → 16.3.3** (exact) to pick up framework security patches.  
**Post-upgrade:** `npm audit --omit=dev` → **0 vulnerabilities**.

## Direct runtime dependencies

| Package | Role | Notes |
|---|---|---|
| `next@16.3.3` | Framework | Patched from 16.1.1; many 16.1.x advisories addressed |
| `react` / `react-dom@19.2.0` | UI | No audit flags |
| `recharts` | Charts | Client-only |
| `lucide-react` | Icons | |
| `zod` | Validation | Available; not heavily used yet |
| `next-themes` | Theme | Present |

No auth, ORM, payment, email, or OpenAI SDKs.

## Classification of earlier 16.1.1 findings

### Exploitable / urgent (pre-upgrade)

- Multiple **Next.js** advisories on 16.1.1 (RSC DoS, middleware bypasses, image optimizer, etc.).  
- **Reachability on this app:** no custom middleware, no `"use server"` actions found, no `next/image` remotePatterns. Residual framework risk still justified a patch upgrade.

### Relevant but low risk / transitive

- Pre-upgrade prod audit also flagged `postcss`, `sharp`, `nanoid` via Next — cleared after 16.3.3 bump (`npm audit --omit=dev` clean).

### Dev-only

- `eslint` / typescript-eslint chains (`brace-expansion`, `flatted`, `ajv`, `picomatch`) — not shipped to browsers; fix opportunistically with `npm audit` on full tree if desired.

### Not reachable / not applicable

- Image optimizer remotePatterns SSRF — not configured  
- Middleware auth bypass — no middleware  
- Server Actions CSRF — no server actions found  

## Packages changed in this review

- `next`: 16.1.1 → 16.3.3  
- `eslint-config-next`: 16.1.1 → 16.3.3  

## Residual

- Keep Next on a supported patched line; subscribe to Next security advisories.  
- Avoid `npm audit fix --force` without regression (can jump majors unexpectedly).
