"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PayeTab } from "./tabs/PayeTab";
import { UmbrellaTab } from "./tabs/UmbrellaTab";
import { LimitedTab } from "./tabs/LimitedTab";
import { CombinedIncomeTab } from "./tabs/CombinedIncomeTab";



export function TakeHomeCalculator() {

  const [activeTab, setActiveTab] = useState("paye");



  return (

    <div className="space-y-6">

      <Tabs value={activeTab} onValueChange={setActiveTab}>

        <TabsList className="grid w-full grid-cols-4">

          <TabsTrigger value="paye">PAYE</TabsTrigger>

          <TabsTrigger value="umbrella">Umbrella</TabsTrigger>

          <TabsTrigger value="limited">Limited</TabsTrigger>

          <TabsTrigger value="combined">Combined incomes</TabsTrigger>

        </TabsList>



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
