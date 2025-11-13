"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !consent) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, consent }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const error = await response.json();
        console.error("Signup error:", error);
        alert("Failed to sign up. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Failed to sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-black/40 p-8 shadow-xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Get updates on the UK Take-Home Calculator
            </h1>
            <ul className="mt-4 space-y-2 text-left text-sm text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Early access to new features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Notification when new tax years are supported</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Occasional product-only emails, no spam</span>
              </li>
            </ul>
          </div>

          {isSubmitted ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="text-lg font-semibold text-emerald-300">
                Thank you for signing up!
              </h3>
              <p className="mt-2 text-sm text-white/70">
                We&apos;ll send you early access details and your discount code soon.
              </p>
              <Link
                href="/calc"
                className="mt-4 inline-block rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                Back to Calculator
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-white/15 bg-black/40 text-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                />
                <label htmlFor="consent" className="text-xs text-white/70">
                  I consent to receive email updates about early access, product
                  updates, and special offers. I understand I can unsubscribe at any time.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email || !consent}
                className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Get Early Access + Discount"}
              </button>
            </form>
          )}

          <div className="pt-4 text-center">
            <Link
              href="/calc"
              className="text-sm text-white/60 hover:text-white/90 transition-colors"
            >
              ← Back to Calculator
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

