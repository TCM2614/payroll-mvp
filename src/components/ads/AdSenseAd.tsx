"use client";

import * as React from "react";

import { hasAcceptedCookieConsent } from "@/components/ads/consent";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  slot: string;
  className?: string;
  style?: React.CSSProperties;
  format?: string;
  fullWidthResponsive?: boolean;
};

export function AdSenseAd({
  slot,
  className,
  style,
  format = "auto",
  fullWidthResponsive = true,
}: Props) {
  const [enabled, setEnabled] = React.useState(false);
  const pushedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    setEnabled(hasAcceptedCookieConsent());
  }, []);

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const canRender = enabled && !!clientId && !!slot;

  React.useEffect(() => {
    if (!canRender) return;
    // Prevent duplicate pushes for the same slot during re-renders.
    if (pushedRef.current === slot) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = slot;
    } catch {
      // Ignore errors (e.g. ad blockers, script not loaded yet)
    }
  }, [canRender, slot]);

  if (!canRender) return null;

  return (
    <ins
      className={`adsbygoogle${className ? ` ${className}` : ""}`}
      style={style ?? { display: "block" }}
      data-ad-client={clientId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
    />
  );
}

