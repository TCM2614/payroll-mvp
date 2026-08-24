import type { MetadataRoute } from "next";
import { CALC_SCENARIO_SLUGS } from "@/lib/marketing/calcScenarios";
import { CANONICAL_COMPARE_SLUGS } from "@/lib/marketing/compareSlug";
import { SALARY_CATALOG, salaryPath } from "@/lib/marketing/salaryCatalog";
import {
  CONTRACTOR_CATALOG,
  contractorPath,
} from "@/lib/marketing/contractorCatalog";
import {
  MULTI_JOB_CATALOG,
  multiJobPath,
} from "@/lib/marketing/multiJobInsight";
import { SITE_URL } from "@/lib/siteUrl";


/**
 * Next-generated sitemap. Adding a new IR35 scenario to `CALC_SCENARIOS`,
 * a new comparison slug to `CANONICAL_COMPARE_SLUGS`, or a new salary to
 * `SALARY_CATALOG` automatically extends this map — no separate XML
 * maintenance needed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const rootEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/calc`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/salary`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/contractor`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/multiple-jobs`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/pay-rise`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/100k-tax-trap`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/salary-percentile`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];

  const scenarioEntries: MetadataRoute.Sitemap = CALC_SCENARIO_SLUGS.map(
    (slug) => ({
      url: `${SITE_URL}/calc/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }),
  );

  const salaryEntries: MetadataRoute.Sitemap = SALARY_CATALOG.map((entry) => ({
    url: `${SITE_URL}${salaryPath(entry.salary)}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: entry.landmark ? 0.8 : 0.6,
  }));

  const contractorEntries: MetadataRoute.Sitemap = CONTRACTOR_CATALOG.map(
    (entry) => ({
      url: `${SITE_URL}${contractorPath(entry.salary)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: entry.landmark ? 0.8 : 0.6,
    }),
  );

  const multiJobEntries: MetadataRoute.Sitemap = MULTI_JOB_CATALOG.map(
    (entry) => ({
      url: `${SITE_URL}${multiJobPath(entry.primary, entry.secondary)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }),
  );

  const compareEntries: MetadataRoute.Sitemap = CANONICAL_COMPARE_SLUGS.map(
    (slug) => ({
      url: `${SITE_URL}/compare/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );

  const supportingEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contracting`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  return [
    ...rootEntries,
    ...scenarioEntries,
    ...salaryEntries,
    ...contractorEntries,
    ...multiJobEntries,
    ...compareEntries,
    ...supportingEntries,
  ];
}
