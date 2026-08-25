import type { NextConfig } from "next";

/**
 * Security headers for the public calculator.
 *
 * CSP is intentionally pragmatic: Plausible (hardcoded), optional Umami
 * (any https script URL via env), and Google AdSense require a fairly
 * wide script/frame/img surface. We avoid `script-src *` and list known
 * vendors. `unsafe-inline` remains for Next.js + the small Plausible
 * init snippet until a nonce-based layout is introduced.
 *
 * See docs/security/security-headers.md for rationale and domains.
 */
const ContentSecurityPolicy = [
  "default-src 'self'",
  // Next.js hydration + Plausible inline init; AdSense/Umami remote scripts
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://*.plausible.io https://pagead2.googlesyndication.com https://*.googlesyndication.com https://www.googletagservices.com https://www.google.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://plausible.io https://*.plausible.io https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.google.com https://www.google-analytics.com",
  "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://pagead2.googlesyndication.com https://*.googlesyndication.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
