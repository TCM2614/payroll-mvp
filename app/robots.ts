import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

/**
 * Env-aware robots.txt via Next.js metadata routes.
 *
 * Supersedes the legacy `public/robots.txt` which hard-coded `yourdomain.com`.
 * Uses `NEXT_PUBLIC_SITE_URL` so the sitemap pointer stays correct across
 * preview + production deployments.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
