import './globals.css';

import type { Metadata } from 'next';
import Script from 'next/script';
import { GoogleAnalytics } from '@next/third-parties/google';

import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';

import { SchemaMarkup } from "@/components/SEO/SchemaMarkup";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

export const metadata: Metadata = {
  title: 'UK Take-Home Calculator · 2024/25',
  description: 'High-accuracy UK take-home pay calculator for PAYE, NI, and pensions.',
  alternates: {
    canonical: siteUrl,
  },
  keywords: ["UK payroll calculator", "take-home pay", "PAYE calculator", "umbrella company calculator", "limited company calculator", "UK tax calculator", "student loan calculator", "UK salary calculator", "salary after tax", "take home pay calculator UK"],
  authors: [{ name: "Payroll MVP" }],
  openGraph: {
    title: "UK Take-Home Pay Calculator 2024/25 – Salary After Tax in the UK",
    description: "Free UK take-home pay calculator for the 2024/25 tax year. See your salary after tax, National Insurance, pension and student loan deductions in seconds.",
    type: "website",
    locale: "en_GB",
    siteName: "UK Take-Home Calculator",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "UK Take-Home Pay Calculator 2024/25 – Salary After Tax in the UK",
    description: "Free UK take-home pay calculator for the 2024/25 tax year. See your salary after tax, National Insurance, pension and student loan deductions in seconds.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 text-brand-text antialiased">
        {/* Privacy-friendly analytics by Plausible */}
        <Script
          async
          src="https://plausible.io/js/pa-EfUItWB8oR-Vv2yMj1I_h.js"
          strategy="afterInteractive"
        />
        <Script
          id="plausible-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
              plausible.init()
            `,
          }}
        />
        {/* Umami Analytics - Alternative option */}
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL && (
          <Script
            async
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
        <SchemaMarkup />
        <div className="relative min-h-screen">
          {/* Background gradient */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.20),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(34,197,94,0.18),_transparent_55%)]"
          />

          <Header />

          <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-10 pt-6 sm:pt-8">
            {children}
          </main>
          {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          )}

          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
