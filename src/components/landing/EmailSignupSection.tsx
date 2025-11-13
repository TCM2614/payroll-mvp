"use client";



import { FormEvent, useState } from "react";



interface EmailSignupSectionProps {

  onSuccess?: () => void;

}



export default function EmailSignupSection({

  onSuccess,

}: EmailSignupSectionProps) {

  const [email, setEmail] = useState("");

  const [consent, setConsent] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<"idle" | "submitting" | "success">(

    "idle",

  );



  const handleSubmit = (e: FormEvent) => {

    e.preventDefault();

    setError(null);



    if (!email) {

      setError("Please enter your email address.");

      return;

    }



    if (!consent) {

      setError("Please agree to the privacy terms to continue.");

      return;

    }



    setStatus("submitting");



    // 🔁 Dummy handler – replace with Supabase / Firebase / Mailchimp

    setTimeout(() => {

      console.log("Email signup submitted:", { email, consent });

      setStatus("success");

      if (onSuccess) onSuccess();

    }, 800);

  };



  return (

    <section className="mx-auto mt-10 w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-xl">

      <h2 className="text-lg font-semibold tracking-tight">

        Join the Early Access List

      </h2>

      <p className="mt-1 text-sm text-white/70">

        Get new feature previews, tips and priority access to advanced

        contractor tools.

      </p>



      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>

        <div>

          <label

            htmlFor="email"

            className="block text-xs font-medium uppercase tracking-[0.12em] text-white/60"

          >

            Email address

          </label>

          <input

            id="email"

            type="email"

            className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-emerald-400 focus:bg-black focus:ring-2 focus:ring-emerald-500/50"

            placeholder="you@example.com"

            value={email}

            onChange={(e) => setEmail(e.target.value)}

          />

        </div>



        <label className="flex items-start gap-2 text-xs text-white/70">

          <input

            type="checkbox"

            className="mt-0.5 h-4 w-4 rounded border-white/30 bg-black/60 text-emerald-500 focus:ring-emerald-500"

            checked={consent}

            onChange={(e) => setConsent(e.target.checked)}

          />

          <span>

            I agree to receive emails and confirm I&apos;ve read the{" "}

            <a

              href="/privacy"

              className="underline decoration-emerald-400/70 decoration-2 underline-offset-2 hover:text-white"

            >

              Privacy Policy

            </a>

            .

          </span>

        </label>



        {error && (

          <p className="text-xs font-medium text-rose-400" role="alert">

            {error}

          </p>

        )}



        {status === "success" && (

          <p className="text-xs font-medium text-emerald-400">

            Thanks! You&apos;re on the list.

          </p>

        )}



        <button

          type="submit"

          disabled={status === "submitting" || status === "success"}

          className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/70"

        >

          {status === "submitting" ? "Submitting…" : "Join Now"}

        </button>



        <p className="text-[11px] text-white/50">

          Unsubscribe anytime. We respect your data.

        </p>

      </form>

    </section>

  );

}

