"use client";



import { useEffect, useState } from "react";



const STORAGE_KEY = "ukpayroll_cookie_consent";



export default function CookieBanner() {

  const [visible, setVisible] = useState(false);



  useEffect(() => {

    const checkVisibility = () => {

      try {

        const stored = window.localStorage.getItem(STORAGE_KEY);

        if (!stored) {

          setVisible(true);

        }

      } catch {

        setVisible(true);

      }

    };

    // Use setTimeout to defer state update outside of render phase

    const timer = setTimeout(checkVisibility, 0);

    return () => clearTimeout(timer);

  }, []);



  const accept = () => {

    try {

      window.localStorage.setItem(STORAGE_KEY, "accepted");

    } catch {

      // ignore

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

            We use essential cookies to keep this calculator secure and to

            understand basic usage. You can review details anytime in our{" "}

            <a

              href="/privacy"

              className="underline decoration-emerald-400/70 underline-offset-2"

            >

              Privacy Policy

            </a>

            .

          </p>

        </div>

        <button

          onClick={accept}

          className="mt-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black shadow-md shadow-emerald-500/30 hover:bg-emerald-400"

          type="button"

        >

          Accept

        </button>

      </div>

    </div>

  );

}

