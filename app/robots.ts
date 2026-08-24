import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * Env-aware robots.txt via Next.js metadata routes.
 *
 * Supersedes the legacy `public/robots.txt` which hard-coded `yourdomain.com`.
 * Uses `NEXT_PUBLIC_SITE_URL` (with a production fallback) so the sitemap
 * pointer stays correct across preview + production deployments.
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
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
