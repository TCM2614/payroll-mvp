"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import {
  trackShareClick,
  type SharePlatform,
} from "@/lib/analytics";

/**
 * A single, deterministic share bar shared by every acquisition surface.
 *
 * Design goals:
 *  - Reuse rather than duplicate the site's share UX.
 *  - Fire `share_clicked` via the existing analytics abstraction on every
 *    interaction, with `page_type` / `platform` / `content_type` properties.
 *  - Progressive enhancement: on browsers that support Web Share API,
 *    surface a "Share…" button that opens the native sheet. Otherwise the
 *    Copy / WhatsApp / X / LinkedIn buttons still work.
 *
 * The bar accepts an absolute URL and a text so callers can control
 * exactly what gets shared. Never send anything derived from a user's
 * private inputs — the surfaces that render this bar are public pages
 * with public, deterministic figures.
 */
export interface ShareBarProps {
  /** Absolute URL to share. Must be fully-qualified. */
  url: string;
  /** Short share text ("£50k UK salary — £3,208/mo take-home…"). */
  text: string;
  /** Page type for analytics: "salary_page" | "tax_trap" | "pay_rise" | "percentile" | "comparison". */
  pageType: string;
  /** Content identifier for analytics (e.g. "50000-after-tax", "100k-to-125k"). */
  contentType?: string;
  /** Optional label prefix, defaults to "Share". */
  label?: string;
  /** Compact styling (used inside dense hero cards). */
  compact?: boolean;
}

const subscribeNoop = () => () => {};
const getClientSupportsNativeShare = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";
const getServerSupportsNativeShare = (): boolean => false;

const PLATFORMS: Array<{
  id: Exclude<SharePlatform, "native_share">;
  label: string;
}> = [
  { id: "copy", label: "Copy link" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "x", label: "X" },
  { id: "linkedin", label: "LinkedIn" },
];

export function ShareBar({
  url,
  text,
  pageType,
  contentType,
  label = "Share",
  compact = false,
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  // `useSyncExternalStore` is the compile-time-safe way to consume a
  // browser-only capability from a client component. During SSR / initial
  // hydration the server snapshot returns `false`; the client store returns
  // the actual capability after mount. No `setState` in an effect required.
  const supportsNativeShare = useSyncExternalStore(
    subscribeNoop,
    getClientSupportsNativeShare,
    getServerSupportsNativeShare,
  );

  const openIntent = useCallback(
    (
      platform: Exclude<SharePlatform, "native_share" | "copy">,
      shareUrl: string,
      shareText: string,
    ) => {
      const enc = encodeURIComponent;
      let intent = "";
      switch (platform) {
        case "whatsapp":
          intent = `https://wa.me/?text=${enc(`${shareText} ${shareUrl}`)}`;
          break;
        case "x":
          intent = `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}`;
          break;
        case "linkedin":
          intent = `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`;
          break;
      }
      if (intent) {
        window.open(intent, "_blank", "noopener,noreferrer,width=640,height=560");
      }
    },
    [],
  );

  const handleShare = useCallback(
    async (platform: SharePlatform) => {
      trackShareClick({ pageType, platform, contentType });

      if (platform === "native_share") {
        try {
          await navigator.share({ title: text, text, url });
        } catch {
          /* user cancelled or failed silently */
        }
        return;
      }

      if (platform === "copy") {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2_000);
        } catch {
          window.prompt("Copy link:", url);
        }
        return;
      }

      openIntent(platform, url, text);
    },
    [openIntent, pageType, contentType, text, url],
  );

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${compact ? "text-xs" : "text-sm"}`}
      aria-label={`${label} this result`}
    >
      <span className="font-medium text-brand-textMuted">{label}:</span>
      {supportsNativeShare && (
        <button
          type="button"
          onClick={() => handleShare("native_share")}
          className="rounded-md border border-brand-primary/50 bg-brand-primary/10 px-3 py-1.5 font-medium text-brand-primary hover:bg-brand-primary/20"
        >
          Share…
        </button>
      )}
      {PLATFORMS.map((p) => {
        const isCopy = p.id === "copy";
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => handleShare(p.id)}
            aria-label={`Share on ${p.label}`}
            className="rounded-md border border-brand-border/60 bg-brand-bg/40 px-3 py-1.5 font-medium text-brand-text hover:border-brand-primary/60 hover:bg-brand-primary/10"
          >
            {isCopy && copied ? "Copied!" : p.label}
          </button>
        );
      })}
    </div>
  );
}
