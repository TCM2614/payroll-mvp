import "./globals.css";

import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";

import { SchemaMarkup } from "@/components/SEO/SchemaMarkup";



export const metadata: Metadata = {

  title: "UK Take-Home Pay Calculator 2024/25 – Salary After Tax in the UK",

  description: "Free UK take-home pay calculator for the 2024/25 tax year. See your salary after tax, National Insurance, pension and student loan deductions in seconds.",

  keywords: ["UK payroll calculator", "take-home pay", "PAYE calculator", "umbrella company calculator", "limited company calculator", "UK tax calculator", "student loan calculator", "UK salary calculator", "salary after tax", "take home pay calculator UK"],

  authors: [{ name: "Payroll MVP" }],

  openGraph: {

    title: "UK Take-Home Pay Calculator 2024/25 – Salary After Tax in the UK",

    description: "Free UK take-home pay calculator for the 2024/25 tax year. See your salary after tax, National Insurance, pension and student loan deductions in seconds.",

    type: "website",

    locale: "en_GB",

    siteName: "UK Take-Home Calculator",

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
