import "./globals.css";

import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";

import { SchemaMarkup } from "@/components/SEO/SchemaMarkup";



export const metadata: Metadata = {

  title: "UK Payroll Take-Home Calculator | Compare PAYE, Umbrella & Limited",

  description: "Instantly compare PAYE, Umbrella and Limited company take-home pay in one place. Built for UK employees, contractors and side-hustlers who want clarity on every payslip.",

  keywords: ["UK payroll calculator", "take-home pay", "PAYE calculator", "umbrella company calculator", "limited company calculator", "UK tax calculator", "student loan calculator"],

  authors: [{ name: "Payroll MVP" }],

  openGraph: {

    title: "UK Payroll Take-Home Calculator",

    description: "Instantly compare PAYE, Umbrella and Limited company take-home pay. Calculate your UK take-home with student loans, pensions, and multi-job support.",

    type: "website",

    locale: "en_GB",

    siteName: "UK Payroll Calculator",

  },

  twitter: {

    card: "summary_large_image",

    title: "UK Payroll Take-Home Calculator",

    description: "Instantly compare PAYE, Umbrella and Limited company take-home pay.",

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



export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (

    <html lang="en" suppressHydrationWarning>

      <body>

        <SchemaMarkup />

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>

          {children}

        </ThemeProvider>

        {/* Analytics - Plausible (replace with your domain) */}
        {/* Uncomment and add your Plausible domain when ready */}
        {/* <Script

          defer

          data-domain="yourdomain.com"

          src="https://plausible.io/js/script.js"

        /> */}

        {/* Alternative: Umami Analytics */}
        {/* Uncomment and add your Umami script URL when ready */}
        {/* <Script

          async

          defer

          data-website-id="your-website-id"

          src="https://analytics.umami.is/script.js"

        /> */}

      </body>

    </html>

  );

}
