import type { MetadataRoute } from "next";
import { CALC_SCENARIO_SLUGS } from "@/lib/marketing/calcScenarios";
import { CANONICAL_COMPARE_SLUGS } from "@/lib/marketing/compareSlug";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

/**
 * Next-generated sitemap. Adding a new IR35 scenario to `CALC_SCENARIOS`
 * automatically extends this map — no separate XML maintenance needed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const rootEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${siteUrl}/calc`, lastModified, changeFrequency: "weekly", priority: 1.0 },
  ];

  const scenarioEntries: MetadataRoute.Sitemap = CALC_SCENARIO_SLUGS.map(
    (slug) => ({
      url: `${siteUrl}/calc/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }),
  );

  const compareEntries: MetadataRoute.Sitemap = CANONICAL_COMPARE_SLUGS.map(
    (slug) => ({
      url: `${siteUrl}/compare/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );

  const supportingEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  return [
    ...rootEntries,
    ...scenarioEntries,
    ...compareEntries,
    ...supportingEntries,
  ];
}
