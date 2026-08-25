# Security Headers

Configured in `next.config.ts` via `headers()` for `/:path*`.

`poweredByHeader: false` removes the `X-Powered-By: Next.js` header.

## Header inventory

| Header | Value (summary) | Purpose |
|---|---|---|
| `Content-Security-Policy` | See below | Restrict script/frame/connect origins |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Block MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage (esp. `/pay-rise?from&to`) |
| `X-Frame-Options` | `DENY` | Clickjacking defence (pairs with CSP `frame-ancestors`) |
| `Permissions-Policy` | camera/mic/geo/payment/usb disabled | Reduce browser capability surface |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolate browsing context |

## Content-Security-Policy (pragmatic)

**Not** nonce-based yet. Includes `'unsafe-inline'` (and `'unsafe-eval'` for Next compatibility) because:

- Root layout injects a small Plausible init snippet  
- Next.js App Router hydration historically needs inline scripts  

Domains explicitly allowed for scripts / frames / connect:

- `plausible.io` / `*.plausible.io`
- Google AdSense / DoubleClick / googlesyndication / gstatic / google.com (publisher tags)

`object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`.

### Compatibility notes

| Integration | Status |
|---|---|
| Plausible | Allowed |
| AdSense | Allowed (broad Google publisher surface) |
| Umami | **Not** pre-listed — operator must add the Umami script host to `script-src` / `connect-src` when enabling |
| `next/og` ImageResponse | Server-side; not constrained by browser CSP |
| Dynamic OG `<img>` from same origin | Covered by `'self'` / `img-src https:` |

### Residual CSP risk

- `'unsafe-inline'` / `'unsafe-eval'` reduce XSS mitigation strength  
- Future hardening: nonce/hash CSP once layout scripts are nonce-wired  
- Do **not** use `script-src *`

## Verification

After deploy, check response headers on `https://uktakehomecalculator.com/` and a calculator page. Confirm AdSense still loads **after** consent and Plausible still records pageviews.

This document does **not** claim “CSP makes XSS impossible.”
