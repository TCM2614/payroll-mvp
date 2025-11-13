"use client";

import AppShell from "@/components/layout/AppShell";
import { CombinedIncomeTab } from "@/components/tabs/CombinedIncomeTab";
import { AdditionalJobsTab } from "@/components/tabs/AdditionalJobsTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ContractingPage() {
  return (
    <AppShell>
      <section className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Advanced Contracting Tools
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Compare different contracting structures and model multiple income sources side by side.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-xl sm:p-6">
        <Tabs defaultValue="compare" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="compare" className="rounded-full">
              Compare Structures
            </TabsTrigger>
            <TabsTrigger value="additional-jobs" className="rounded-full">
              Additional Jobs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compare" className="pt-4">
            <CombinedIncomeTab />
          </TabsContent>

          <TabsContent value="additional-jobs" className="pt-4">
            <AdditionalJobsTab />
          </TabsContent>
        </Tabs>
      </section>
    </AppShell>
  );
}

