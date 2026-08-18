import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { LANDMARK_SALARIES, SALARY_CATALOG, salaryPath } from "@/lib/content/salary-catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const core: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/calculator`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/salary`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/pay-rise`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/compare`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/100k-tax-trap`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/salary-percentile`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/methodology`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
  const salaryPages: MetadataRoute.Sitemap = SALARY_CATALOG.map((e) => ({
    url: `${SITE_URL}${salaryPath(e.salary)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: e.landmark ? 0.8 : 0.6,
  }));
  const compareCombos: MetadataRoute.Sitemap = [];
  for (let i = 0; i < LANDMARK_SALARIES.length; i++) {
    for (let j = i + 1; j < LANDMARK_SALARIES.length; j++) {
      compareCombos.push({
        url: `${SITE_URL}/compare/${LANDMARK_SALARIES[i]}-vs-${LANDMARK_SALARIES[j]}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }
  return [...core, ...salaryPages, ...compareCombos];
}
