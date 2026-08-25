"use client";

import { useEffect, useState } from "react";
import { COOKIE_CONSENT_STORAGE_KEY } from "@/components/ads/consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      try {
        const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
        if (!stored) {
          setVisible(true);
        }
      } catch {
        // Storage unavailable — still show the banner so the user can be
        // informed, but advertising remains fail-closed (see consent.ts).
        setVisible(true);
      }
    };
    const timer = setTimeout(checkVisibility, 0);
    return () => clearTimeout(timer);
  }, []);

  const accept = () => {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "accepted");
    } catch {
      // ignore — ads stay disabled if storage cannot persist
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-2">
      <div className="flex w-full max-w-3xl items-start gap-3 rounded-2xl border border-white/15 bg-black/90 p-4 text-xs text-white shadow-2xl">
        <div className="flex-1">
          <p className="font-semibold">Cookies & Privacy</p>
          <p className="mt-1 text-white/70">
            We use privacy-oriented analytics to understand basic usage. Optional
            advertising scripts load only if you accept. Details:{" "}
            <a
              href="/privacy"
              className="underline decoration-emerald-400/70 underline-offset-2"
            >
              Privacy
            </a>
            {" · "}
            <a
              href="/cookies"
              className="underline decoration-emerald-400/70 underline-offset-2"
            >
              Cookies
            </a>
            .
          </p>
        </div>
        <button
          onClick={accept}
          className="mt-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black shadow-md shadow-emerald-500/30 hover:bg-emerald-400"
          type="button"
        >
          Accept ads
        </button>
      </div>
    </div>
  );
}

