"use client";

import { useState } from "react";
import { AdditionalJobsTab } from "./AdditionalJobsTab";

export function FeatureRequestTab() {
  const [email, setEmail] = useState("");
  const [featureRequest, setFeatureRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !featureRequest.trim()) return;

    setIsSubmitting(true);

    try {
      // Submit to signup API with feature request
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          consent: true,
          featureRequest: featureRequest.trim(),
          source: "compare-tab",
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail("");
        setFeatureRequest("");
      } else {
        const error = await response.json();
        console.error("Submission error:", error);
        alert("Failed to submit. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[600px]">
      {/* Blurry background - the additional jobs calculator */}
      <div className="opacity-20 blur-sm pointer-events-none">
        <AdditionalJobsTab />
      </div>

      {/* Overlay with feature request form */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-black/90 backdrop-blur-md p-8 shadow-2xl">
          {isSubmitted ? (
            <div className="text-center space-y-4">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-white">
                Thank you for your feedback!
              </h2>
              <p className="text-white/70">
                We&apos;ve received your feature request and email. We&apos;ll notify you
                when the dashboard feature is released with early access.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-4 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Dashboard Feature Coming Soon
                </h2>
                <p className="text-white/70 mb-1">
                  The side-by-side comparison tool is in development. Request features and
                  we&apos;ll notify you when the dashboard is released.
                </p>
                <p className="text-sm text-emerald-400/80">
                  Get early access to track your take-home, compare roles, and see trends over time.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white/90 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="featureRequest"
                    className="block text-sm font-medium text-white/90 mb-2"
                  >
                    What features would you like to see in the dashboard?
                  </label>
                  <textarea
                    id="featureRequest"
                    value={featureRequest}
                    onChange={(e) => setFeatureRequest(e.target.value)}
                    required
                    rows={6}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40 resize-none"
                    placeholder="E.g., Side-by-side comparison of PAYE, Umbrella, and Limited company scenarios, trend charts, save calculations, export to PDF..."
                  />
                  <p className="mt-1 text-xs text-white/50">
                    Tell us what dashboard features would be most valuable to you.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !email || !featureRequest.trim()}
                  className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Notify Me When Dashboard is Ready"}
                </button>

                <p className="text-center text-xs text-white/50">
                  By submitting, you agree to receive email updates about dashboard
                  feature releases and early access notifications.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

