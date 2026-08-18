"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { shareLink } from "@/lib/share";
import type { SharePlatform } from "@/lib/analytics/events";

interface ShareBarProps {
  url: string;
  text: string;
  surface: string;
  salary?: number;
}

const platforms: { id: SharePlatform; label: string }[] = [
  { id: "copy", label: "Copy link" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "x", label: "X" },
  { id: "linkedin", label: "LinkedIn" },
];

export function ShareBar({ url, text, surface }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (id: SharePlatform) => {
    trackEvent("share_clicked", { share_platform: id, share_surface: surface });
    if (id === "native" && typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: text, text, url });
        return;
      } catch {
        // fall through to copy
      }
    }
    if (id === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        window.prompt("Copy link:", url);
      }
      return;
    }
    const href = shareLink(id, url, text);
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Share this result">
      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Share:</span>
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          type="button"
          onClick={() => handleShare("native")}
          className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          Share…
        </button>
      )}
      {platforms.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => handleShare(p.id)}
          className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          aria-label={`Share on ${p.label}`}
        >
          {p.id === "copy" && copied ? "Copied!" : p.label}
        </button>
      ))}
    </div>
  );
}
