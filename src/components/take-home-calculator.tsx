"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PayeTab } from "./tabs/PayeTab";
import { UmbrellaTab } from "./tabs/UmbrellaTab";
import { LimitedTab } from "./tabs/LimitedTab";
import { CombinedIncomeTab } from "./tabs/CombinedIncomeTab";
import { FeatureRequestTab } from "./tabs/FeatureRequestTab";
import { PeriodicTaxTab } from "./tabs/PeriodicTaxTab";



type TabValue = "paye" | "umbrella" | "limited" | "additional-jobs" | "combined" | "periodic";



export function TakeHomeCalculator() {

  const [activeTab, setActiveTab] = useState<TabValue>("paye");



  return (

    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 space-y-4 sm:space-y-6">

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>

        {/* Tab bar container - mobile: horizontal scroll, desktop: grid */}

        <div className="mb-4 sm:mb-6 rounded-2xl border border-white/10 bg-white/5 p-1">

          {/* Mobile: horizontal scrollable tabs */}
          <div className="md:hidden overflow-x-auto -mx-1 px-1 scrollbar-hide">
            <TabsList className="inline-flex flex-nowrap gap-2 bg-transparent p-0 h-auto min-w-max">

            <TabsTrigger 

              value="paye" 

              className="min-w-[40%] sm:min-w-[35%] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3 py-2 h-9 text-xs sm:text-sm font-medium transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"

            >

              <span className="text-sm sm:text-base">£</span>

              <span className="text-xs sm:text-sm font-medium">Standard</span>

            </TabsTrigger>



            <TabsTrigger 

              value="umbrella" 

              className="min-w-[40%] sm:min-w-[35%] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3 py-2 h-9 text-xs sm:text-sm font-medium transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"

            >

              <span className="text-sm sm:text-base">☂</span>

              <span className="text-xs sm:text-sm font-medium">Umbrella</span>

            </TabsTrigger>



            <TabsTrigger 

              value="limited" 

              className="min-w-[40%] sm:min-w-[35%] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3 py-2 h-9 text-xs sm:text-sm font-medium transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"

            >

              <span className="text-sm sm:text-base">🏢</span>

              <span className="text-xs sm:text-sm font-medium">Limited</span>

            </TabsTrigger>



            <TabsTrigger 

              value="additional-jobs" 

              className="min-w-[40%] sm:min-w-[35%] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3 py-2 h-9 text-xs sm:text-sm font-medium transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"

            >

              <span className="text-sm sm:text-base">+</span>

              <span className="text-xs sm:text-sm font-medium">Jobs</span>

            </TabsTrigger>



            <TabsTrigger 

              value="combined" 

              className="min-w-[40%] sm:min-w-[35%] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3 py-2 h-9 text-xs sm:text-sm font-medium transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"

            >

              <span className="text-sm sm:text-base">📊</span>

              <span className="text-xs sm:text-sm font-medium">Compare</span>

            </TabsTrigger>



            <TabsTrigger 

              value="periodic" 

              className="min-w-[40%] sm:min-w-[35%] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3 py-2 h-9 text-xs sm:text-sm font-medium transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"

            >

              <span className="text-sm sm:text-base">📅</span>

              <span className="text-xs sm:text-sm font-medium">Periodic</span>

            </TabsTrigger>

          </TabsList>
          </div>

          {/* Desktop: grid layout */}
          <TabsList className="hidden md:grid md:grid-cols-6 gap-1 bg-transparent p-0 h-auto">

            <TabsTrigger 

              value="paye" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors bg-transparent text-zinc-200 hover:text-emerald-400 hover:border-emerald-500 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:hover:bg-emerald-700 data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/30"

            >

              <span className="text-base">£</span>

              <span className="flex flex-col leading-tight">

                <span className="text-sm font-semibold">Standard</span>

                <span className="text-[10px] text-white/60">

                  Standard employment

                </span>

              </span>

            </TabsTrigger>



            <TabsTrigger 

              value="umbrella" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors bg-transparent text-zinc-200 hover:text-blue-400 hover:border-blue-500 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:hover:bg-blue-700 data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/30"

            >

              <span className="text-base">☂</span>

              <span className="flex flex-col leading-tight">

                <span className="text-sm font-semibold">Umbrella</span>

                <span className="text-[10px] text-white/60">

                  Contracting via umbrella

                </span>

              </span>

            </TabsTrigger>



            <TabsTrigger 

              value="limited" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors bg-transparent text-zinc-200 hover:text-purple-400 hover:border-purple-500 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:hover:bg-purple-700 data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/30"

            >

              <span className="text-base">Ltd</span>

              <span className="flex flex-col leading-tight">

                <span className="text-sm font-semibold">Limited</span>

                <span className="text-[10px] text-white/60">

                  Director/Shareholder route

                </span>

              </span>

            </TabsTrigger>



            <TabsTrigger 

              value="additional-jobs" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors bg-transparent text-zinc-200 hover:text-amber-400 hover:border-amber-500 data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:hover:bg-amber-700 data-[state=active]:shadow-md data-[state=active]:shadow-amber-500/30"

            >

              <span className="text-base">+</span>

              <span className="flex flex-col leading-tight">

                <span className="text-sm font-semibold">Jobs</span>

                <span className="text-[10px] text-white/60">

                  Additional jobs

                </span>

              </span>

            </TabsTrigger>



            <TabsTrigger 

              value="combined" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors bg-transparent text-zinc-200 hover:text-zinc-400 hover:border-zinc-500 data-[state=active]:bg-zinc-700 data-[state=active]:text-white data-[state=active]:hover:bg-zinc-600 data-[state=active]:shadow-md data-[state=active]:shadow-zinc-500/30"

            >

              <span className="text-base">📊</span>

              <span className="flex flex-col leading-tight">

                <span className="text-sm font-semibold">Compare</span>

                <span className="text-[10px] text-white/60">

                  Side by side

                </span>

              </span>

            </TabsTrigger>



            <TabsTrigger 

              value="periodic" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors bg-transparent text-zinc-200 hover:text-indigo-400 hover:border-indigo-500 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:hover:bg-indigo-700 data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/30"

            >

              <span className="text-base">📅</span>

              <span className="flex flex-col leading-tight">

                <span className="text-sm font-semibold">Periodic</span>

                <span className="text-[10px] text-white/60">

                  Periodic tax check

                </span>

              </span>

            </TabsTrigger>

          </TabsList>

        </div>



        <TabsContent value="paye" className="pt-4 space-y-4">

          <PayeTab />

        </TabsContent>



        <TabsContent value="umbrella" className="pt-4">

          <UmbrellaTab />

        </TabsContent>



        <TabsContent value="limited" className="pt-4">

          <LimitedTab />

        </TabsContent>



        <TabsContent value="additional-jobs" className="pt-4">

          <CombinedIncomeTab />

        </TabsContent>



        <TabsContent value="combined" className="pt-4">

          <FeatureRequestTab />

        </TabsContent>



        <TabsContent value="periodic" className="pt-4">

          <PeriodicTaxTab />

        </TabsContent>

      </Tabs>

    </div>

  );

}
