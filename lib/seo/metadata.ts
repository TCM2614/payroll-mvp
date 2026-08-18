import type { Metadata } from "next";
import {
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TWITTER,
  SITE_URL,
} from "./site";

/**
 * Build a standard {@link Metadata} object for a page. Uses Next.js metadata
 * conventions: canonical URLs, Open Graph, and Twitter/X cards are always
 * produced consistently.
 */
export function buildMetadata(opts: {
  title: string;
  description?: string;
  /** Path relative to site root, e.g. "/salary/50000-after-tax". */
  path: string;
  ogImage?: string;
  ogImageAlt?: string;
  noindex?: boolean;
  keywords?: string[];
  breadcrumbLabel?: string;
}): Metadata {
  const canonical = new URL(opts.path, SITE_URL).toString();
  const description = opts.description ?? SITE_DESCRIPTION;
  const ogImage =
    opts.ogImage ?? new URL("/opengraph-image", SITE_URL).toString();
  return {
    metadataBase: new URL(SITE_URL),
    title: opts.title,
    description,
    keywords: opts.keywords,
    alternates: { canonical },
    robots: opts.noindex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title: opts.title,
      description,
      locale: SITE_LOCALE,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: opts.ogImageAlt ?? opts.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_TWITTER,
      creator: SITE_TWITTER,
      title: opts.title,
      description,
      images: [ogImage],
    },
  };
}
