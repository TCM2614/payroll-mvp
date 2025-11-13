"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PayeTab } from "./tabs/PayeTab";
import { UmbrellaTab } from "./tabs/UmbrellaTab";
import { LimitedTab } from "./tabs/LimitedTab";
import { PeriodicTaxTab } from "./tabs/PeriodicTaxTab";



type TabValue = "paye" | "umbrella" | "limited" | "periodic";



export function TakeHomeCalculator() {

  const [activeTab, setActiveTab] = useState<TabValue>("paye");



  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        {/* Tab bar container - mobile: horizontal scroll, desktop: grid */}
        <div className="mb-4 sm:mb-6 rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/40 p-1">

          {/* Mobile: horizontal scrollable tabs */}
          <div className="md:hidden overflow-x-auto -mx-1 px-1 scrollbar-hide">
            <TabsList className="inline-flex flex-nowrap gap-2 bg-transparent p-0 h-auto min-w-max">

            <TabsTrigger 

              value="paye" 

              className="min-w-[40%] sm:min-w-[35%] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3 py-2 h-9 text-xs sm:text-sm font-medium transition-colors bg-sea-jet-900/40 text-navy-200 hover:bg-sea-jet-800/50 hover:text-navy-50 data-[state=active]:bg-brilliant-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-brilliant-500/30"

            >

              <span className="text-sm sm:text-base">£</span>

              <span className="text-xs sm:text-sm font-medium">Standard</span>

            </TabsTrigger>



            <TabsTrigger 

              value="umbrella" 

              className="min-w-[40%] sm:min-w-[35%] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3 py-2 h-9 text-xs sm:text-sm font-medium transition-colors bg-sea-jet-900/40 text-navy-200 hover:bg-sea-jet-800/50 hover:text-navy-50 data-[state=active]:bg-brilliant-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-brilliant-500/30"

            >

              <span className="text-sm sm:text-base">☂</span>

              <span className="text-xs sm:text-sm font-medium">Umbrella</span>

            </TabsTrigger>



            <TabsTrigger 

              value="limited" 

              className="min-w-[40%] sm:min-w-[35%] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3 py-2 h-9 text-xs sm:text-sm font-medium transition-colors bg-sea-jet-900/40 text-navy-200 hover:bg-sea-jet-800/50 hover:text-navy-50 data-[state=active]:bg-brilliant-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-brilliant-500/30"

            >

              <span className="text-sm sm:text-base">🏢</span>

              <span className="text-xs sm:text-sm font-medium">Limited</span>

            </TabsTrigger>



            <TabsTrigger 

              value="periodic" 

              className="min-w-[40%] sm:min-w-[35%] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3 py-2 h-9 text-xs sm:text-sm font-medium transition-colors bg-sea-jet-900/40 text-navy-200 hover:bg-sea-jet-800/50 hover:text-navy-50 data-[state=active]:bg-brilliant-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-brilliant-500/30"

            >

              <span className="text-sm sm:text-base">📅</span>

              <span className="text-xs sm:text-sm font-medium">Periodic</span>

            </TabsTrigger>

          </TabsList>
          </div>

          {/* Desktop: grid layout */}
          <TabsList className="hidden md:grid md:grid-cols-4 gap-1 bg-transparent p-0 h-auto">

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

                <span className="text-[10px] text-navy-300">

                  Contracting via umbrella

                </span>

              </span>

            </TabsTrigger>



            <TabsTrigger 

              value="limited" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors bg-transparent text-navy-200 hover:text-navy-50 hover:bg-sea-jet-800/30 data-[state=active]:bg-brilliant-500 data-[state=active]:text-white data-[state=active]:hover:bg-brilliant-600 data-[state=active]:shadow-md data-[state=active]:shadow-brilliant-500/30"

            >

              <span className="text-base">🏢</span>

              <span className="flex flex-col leading-tight">

                <span className="text-sm font-semibold">Limited</span>

                <span className="text-[10px] text-navy-300">

                  Limited company

                </span>

              </span>

            </TabsTrigger>



            <TabsTrigger 

              value="periodic" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors bg-transparent text-navy-200 hover:text-navy-50 hover:bg-sea-jet-800/30 data-[state=active]:bg-brilliant-500 data-[state=active]:text-white data-[state=active]:hover:bg-brilliant-600 data-[state=active]:shadow-md data-[state=active]:shadow-brilliant-500/30"

            >

              <span className="text-base">📅</span>

              <span className="flex flex-col leading-tight">

                <span className="text-sm font-semibold">Periodic</span>

                <span className="text-[10px] text-navy-300">

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



        <TabsContent value="periodic" className="pt-4">

          <PeriodicTaxTab />

        </TabsContent>

      </Tabs>

    </div>

  );

}
