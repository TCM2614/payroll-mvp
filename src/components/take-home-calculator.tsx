"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PayeTab } from "./tabs/PayeTab";
import { UmbrellaTab } from "./tabs/UmbrellaTab";
import { LimitedTab } from "./tabs/LimitedTab";
import { CombinedIncomeTab } from "./tabs/CombinedIncomeTab";



type TabValue = "paye" | "umbrella" | "limited" | "combined";



export function TakeHomeCalculator() {

  const [activeTab, setActiveTab] = useState<TabValue>("paye");



  return (

    <div className="space-y-6">

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>

        {/* Tab bar container with pill-style glassy background */}

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-1 flex gap-1">

          <TabsList className="w-full grid grid-cols-4 gap-1 bg-transparent p-0 h-auto">

            <TabsTrigger 

              value="paye" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white data-[state=active]:bg-emerald-500 data-[state=active]:text-black data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/30"

            >

              <span className="text-base">£</span>

              <span className="flex flex-col leading-tight">

                <span className="text-xs sm:text-sm font-semibold">PAYE</span>

                <span className="hidden text-[10px] text-white/60 sm:block">

                  Standard employment

                </span>

              </span>

            </TabsTrigger>



            <TabsTrigger 

              value="umbrella" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white data-[state=active]:bg-emerald-500 data-[state=active]:text-black data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/30"

            >

              <span className="text-base">☂</span>

              <span className="flex flex-col leading-tight">

                <span className="text-xs sm:text-sm font-semibold">Umbrella</span>

                <span className="hidden text-[10px] text-white/60 sm:block">

                  Contracting via umbrella

                </span>

              </span>

            </TabsTrigger>



            <TabsTrigger 

              value="limited" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white data-[state=active]:bg-emerald-500 data-[state=active]:text-black data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/30"

            >

              <span className="text-base">Ltd</span>

              <span className="flex flex-col leading-tight">

                <span className="text-xs sm:text-sm font-semibold">Limited</span>

                <span className="hidden text-[10px] text-white/60 sm:block">

                  Director/Shareholder route

                </span>

              </span>

            </TabsTrigger>



            <TabsTrigger 

              value="combined" 

              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white data-[state=active]:bg-emerald-500 data-[state=active]:text-black data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/30"

            >

              <span className="text-base">+</span>

              <span className="flex flex-col leading-tight">

                <span className="text-xs sm:text-sm font-semibold">Combined</span>

                <span className="hidden text-[10px] text-white/60 sm:block">

                  Multiple incomes

                </span>

              </span>

            </TabsTrigger>

          </TabsList>

        </div>



        <TabsContent value="paye" className="pt-4">

          <PayeTab />

        </TabsContent>



        <TabsContent value="umbrella" className="pt-4">

          <UmbrellaTab />

        </TabsContent>



        <TabsContent value="limited" className="pt-4">

          <LimitedTab />

        </TabsContent>



        <TabsContent value="combined" className="pt-4">

          <CombinedIncomeTab />

        </TabsContent>

      </Tabs>

    </div>

  );

}
