/**
 * Single source of truth for the site's canonical origin.
 *
 * The production URL is `https://uktakehomecalculator.com`. If the
 * `NEXT_PUBLIC_SITE_URL` environment variable is set (Vercel production
 * and preview environments), we use it as-is; otherwise we fall back to
 * the production URL so a missing env var never produces an unreachable
 * `yourdomain.com` link in canonicals, sitemap, OG cards or JSON-LD.
 *
 * Notes:
 * - We deliberately do NOT allow the value to include a trailing slash
 *   or path prefix — callers concatenate paths directly.
 * - Vercel preview URLs (`*.vercel.app`) should be injected via the env
 *   var explicitly so preview deployments are self-referential.
 */

const PRODUCTION_URL = "https://uktakehomecalculator.com";

function normalise(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

export const SITE_URL: string = (() => {
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_SITE_URL
      : undefined;
  if (fromEnv && fromEnv.length > 0 && !fromEnv.includes("yourdomain")) {
    return normalise(fromEnv);
  }
  return PRODUCTION_URL;
})();

/**
 * Build an absolute URL against the canonical origin. Passing a full URL
 * returns it unchanged so callers can use the helper defensively.
 */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}
