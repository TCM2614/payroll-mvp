import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import SeoContent from "@/components/SeoContent";
import { WealthInsights } from "@/components/WealthInsights";

export const metadata: Metadata = {
  title: "UK Salary Calculator 2024/25 – Take Home Pay After Tax",
  description:
    "Interactive UK take-home pay calculator with PAYE, Umbrella, Limited Company and Periodic tax checks. Includes student loan, pension and IR35 support.",
  keywords: ["UK Salary Calculator 2024", "Take home pay after tax", "Wage calculator"],
};

export default function Page() {
  return (
    <>
      <HomeClient />
      <section className="mt-16 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            See where you stand nationally
          </h2>
          <p className="text-sm text-white/70">
            Benchmark your income against UK-wide distributions each time the calculator updates.
          </p>
        </div>
        <WealthInsights />
      </section>
      <SeoContent />
    </>
  );
}
