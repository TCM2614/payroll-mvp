"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PayeTab } from "./tabs/PayeTab";
import { UmbrellaTab } from "./tabs/UmbrellaTab";
import { LimitedTab } from "./tabs/LimitedTab";
import { LimitedOutsideIR35Tab } from "./tabs/LimitedOutsideIR35Tab";
import { WealthPercentileTab } from "./tabs/WealthPercentileTab";



export type CalculatorTabValue =
  | "paye"
  | "umbrella"
  | "limited-inside"
  | "limited-outside"
  | "wealth";

interface Props {
  /**
   * Which tab should be selected on first render. Used by the per-scenario
   * SEO landing pages (`/calc/paye`, `/calc/umbrella`, …) so the calculator
   * opens on the right regime for the visitor's intent.
   */
  initialTab?: CalculatorTabValue;
}

export function TakeHomeCalculator({ initialTab = "paye" }: Props = {}) {

  const [activeTab, setActiveTab] = useState<CalculatorTabValue>(initialTab);
  const [wealthDefaultAnnualGross, setWealthDefaultAnnualGross] = useState<number | undefined>();
  const [wealthDefaultNetAnnual, setWealthDefaultNetAnnual] = useState<number | undefined>();

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CalculatorTabValue)}>
        {/* Mobile: stacked full-width buttons */}
        <div className="mb-4 flex flex-col gap-2 md:hidden">
          <TabsTrigger
            value="paye"
            className="w-full rounded-xl border border-brand-border/60 bg-brand-surface/80 px-4 py-3 text-left text-sm font-medium transition-colors text-brand-text hover:bg-brand-surface data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:border-brand-primary"
            aria-pressed={activeTab === "paye"}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">£</span>
              <span>Standard PAYE</span>
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="umbrella"
            className="w-full rounded-xl border border-brand-border/60 bg-brand-surface/80 px-4 py-3 text-left text-sm font-medium transition-colors text-brand-text hover:bg-brand-surface data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:border-brand-primary"
            aria-pressed={activeTab === "umbrella"}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">☂</span>
              <span>Umbrella Company</span>
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                Inside IR35
              </span>
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="limited-inside"
            className="w-full rounded-xl border border-brand-border/60 bg-brand-surface/80 px-4 py-3 text-left text-sm font-medium transition-colors text-brand-text hover:bg-brand-surface data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:border-brand-primary"
            aria-pressed={activeTab === "limited-inside"}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">🏢</span>
              <span>Limited Company</span>
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                Inside IR35
              </span>
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="limited-outside"
            className="w-full rounded-xl border border-brand-border/60 bg-brand-surface/80 px-4 py-3 text-left text-sm font-medium transition-colors text-brand-text hover:bg-brand-surface data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:border-brand-primary"
            aria-pressed={activeTab === "limited-outside"}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">🏢</span>
              <span>Limited Company</span>
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                Outside IR35
              </span>
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="wealth"
            className="w-full rounded-xl border border-brand-border/60 bg-brand-surface/80 px-4 py-3 text-left text-sm font-medium transition-colors text-brand-text hover:bg-brand-surface data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:border-brand-primary"
            aria-pressed={activeTab === "wealth"}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">📊</span>
              <span>How rich are you?</span>
            </span>
          </TabsTrigger>
        </div>

        {/* Desktop: grid layout */}
        <div className="mb-4 sm:mb-6 rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/40 p-1 hidden md:block">
          <TabsList className="hidden md:grid md:grid-cols-5 gap-1 bg-transparent p-0 h-auto">

            <TabsTrigger 

              value="paye" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors bg-transparent text-navy-200 hover:text-navy-50 hover:bg-sea-jet-800/30 data-[state=active]:bg-brilliant-500 data-[state=active]:text-white data-[state=active]:hover:bg-brilliant-600 data-[state=active]:shadow-md data-[state=active]:shadow-brilliant-500/30"

            >

              <span className="text-base">£</span>

              <span className="flex flex-col leading-tight">

                <span className="text-sm font-semibold">Standard</span>

                <span className="text-[10px] text-navy-300">

                  Standard employment

                </span>

              </span>

            </TabsTrigger>



            <TabsTrigger 

              value="umbrella" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors bg-transparent text-navy-200 hover:text-navy-50 hover:bg-sea-jet-800/30 data-[state=active]:bg-brilliant-500 data-[state=active]:text-white data-[state=active]:hover:bg-brilliant-600 data-[state=active]:shadow-md data-[state=active]:shadow-brilliant-500/30"

            >

              <span className="text-base">☂</span>

              <span className="flex flex-col leading-tight">

                <span className="text-sm font-semibold">Umbrella</span>

                <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-300">

                  Inside IR35

                </span>

              </span>

            </TabsTrigger>



            <TabsTrigger 

              value="limited-inside" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors bg-transparent text-navy-200 hover:text-navy-50 hover:bg-sea-jet-800/30 data-[state=active]:bg-brilliant-500 data-[state=active]:text-white data-[state=active]:hover:bg-brilliant-600 data-[state=active]:shadow-md data-[state=active]:shadow-brilliant-500/30"

            >

              <span className="text-base">🏢</span>

              <span className="flex flex-col leading-tight">

                <span className="text-sm font-semibold">Limited</span>

                <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-300">

                  Inside IR35

                </span>

              </span>

            </TabsTrigger>



            <TabsTrigger 

              value="limited-outside" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors bg-transparent text-navy-200 hover:text-navy-50 hover:bg-sea-jet-800/30 data-[state=active]:bg-brilliant-500 data-[state=active]:text-white data-[state=active]:hover:bg-brilliant-600 data-[state=active]:shadow-md data-[state=active]:shadow-brilliant-500/30"

            >

              <span className="text-base">🏢</span>

              <span className="flex flex-col leading-tight">

                <span className="text-sm font-semibold">Limited</span>

                <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300">

                  Outside IR35

                </span>

              </span>

            </TabsTrigger>

            <TabsTrigger 

              value="wealth" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors bg-transparent text-navy-200 hover:text-navy-50 hover:bg-sea-jet-800/30 data-[state=active]:bg-brilliant-500 data-[state=active]:text-white data-[state=active]:hover:bg-brilliant-600 data-[state=active]:shadow-md data-[state=active]:shadow-brilliant-500/30"

            >

              <span className="text-base">📊</span>

              <span className="flex flex-col leading-tight">

                <span className="text-sm font-semibold">Percentile</span>

                <span className="text-[10px] text-navy-300">

                  Compare vs UK peers

                </span>

              </span>

            </TabsTrigger>

          </TabsList>
        </div>



        <TabsContent value="paye" className="pt-4 space-y-4">

          <PayeTab
            onAnnualGrossChange={setWealthDefaultAnnualGross}
            onNetAnnualChange={setWealthDefaultNetAnnual}
            onShowWealthTab={() => setActiveTab("wealth")}
          />

        </TabsContent>



        <TabsContent value="umbrella" className="pt-4">

          <UmbrellaTab />

        </TabsContent>



        <TabsContent value="limited-inside" className="pt-4">

          <LimitedTab />

        </TabsContent>



        <TabsContent value="limited-outside" className="pt-4">

          <LimitedOutsideIR35Tab />

        </TabsContent>



        <TabsContent value="wealth" className="pt-4">
          <WealthPercentileTab
            key={`${wealthDefaultAnnualGross ?? 0}-${wealthDefaultNetAnnual ?? 0}`}
            defaultAnnualIncome={wealthDefaultAnnualGross}
            defaultNetAnnualIncome={wealthDefaultNetAnnual}
            defaultComparisonMode="gross"
          />
        </TabsContent>

      </Tabs>

    </div>

  );

}
