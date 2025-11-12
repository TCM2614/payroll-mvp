import "./globals.css";

import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";



export const metadata: Metadata = {

  title: "Payroll MVP",

  description: "UK take-home calculator",

};



export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (

    <html lang="en" suppressHydrationWarning>

      <body>

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>

          {children}

        </ThemeProvider>

      </body>

    </html>

  );

}
