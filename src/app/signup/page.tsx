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
        // Track email signup goal
        if (typeof window !== "undefined" && (window as any).plausible) {
          (window as any).plausible("email_signup", { props: { source: "signup-page" } });
        }
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
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-8 shadow-xl shadow-navy-900/50">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-navy-50 sm:text-4xl">
              Get updates on the UK Take-Home Calculator
            </h1>
            <ul className="mt-4 space-y-2 text-left text-sm text-navy-200">
              <li className="flex items-start gap-2">
                <span className="text-ethereal-300">✓</span>
                <span>Early access to new features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ethereal-300">✓</span>
                <span>Notification when new tax years are supported</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ethereal-300">✓</span>
                <span>Occasional product-only emails, no spam</span>
              </li>
            </ul>
          </div>

          {isSubmitted ? (
            <div className="rounded-xl border border-ethereal-500/30 bg-ethereal-500/10 p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="text-lg font-semibold text-ethereal-300">
                Thank you for signing up!
              </h3>
              <p className="mt-2 text-sm text-navy-200">
                We&apos;ll send you early access details and your discount code soon.
              </p>
              <Link
                href="/calc"
                className="mt-4 inline-block rounded-xl bg-brilliant-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brilliant-500/30 transition hover:bg-brilliant-600"
              >
                Back to Calculator
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-navy-100">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-sea-jet-600/40 bg-sea-jet-800/60 px-4 py-3 text-sm text-navy-50 placeholder:text-navy-400 focus:border-brilliant-400 focus:ring-2 focus:ring-brilliant-400/30"
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
                  className="mt-1 h-4 w-4 rounded border-sea-jet-600/40 bg-sea-jet-800/60 text-brilliant-500 focus:ring-2 focus:ring-brilliant-400/30"
                />
                <label htmlFor="consent" className="text-xs text-navy-200">
                  I consent to receive email updates about early access, product
                  updates, and special offers. I understand I can unsubscribe at any time.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email || !consent}
                className="w-full rounded-xl bg-brilliant-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brilliant-500/30 transition hover:bg-brilliant-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Get Early Access + Discount"}
              </button>
            </form>
          )}

          <div className="pt-4 text-center">
            <Link
              href="/calc"
              className="text-sm text-ethereal-300 hover:text-ethereal-200 transition-colors"
            >
              ← Back to Calculator
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

