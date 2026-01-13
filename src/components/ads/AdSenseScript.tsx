"use client";

import Script from "next/script";
import * as React from "react";

import { hasAcceptedCookieConsent } from "@/components/ads/consent";

export function AdSenseScript() {
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    setEnabled(hasAcceptedCookieConsent());
  }, []);

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  if (!enabled || !clientId) return null;

  // Per AdSense docs: https://developers.google.com/publisher-tag/guides/adsense
  return (
    <Script
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`}
      crossOrigin="anonymous"
    />
  );
}

