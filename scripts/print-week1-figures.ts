// Utility script — kept out of production. Prints the deterministic
// week-1 figures used in `content/marketing/week-1-launch.md` so the
// numbers in the markdown file can be regenerated exactly if the tax
// engine changes.
//
// Run with:  npx tsx scripts/print-week1-figures.ts

import {
  buildSalaryInsight,
  compareSalaryInsights,
} from "@/lib/marketing/salaryInsight";
import { computeLandingComparison } from "@/lib/marketing/landingComparison";

function heading(s: string) {
  console.log("\n=== " + s + " ===");
}

heading("Day 1: £50k salary reality");
const s50 = buildSalaryInsight(50_000);
console.log({
  gross: s50.formatted.gross,
  net: s50.formatted.net,
  monthly: s50.formatted.monthly,
  weekly: s50.formatted.weekly,
  tax: s50.formatted.incomeTax,
  ni: s50.formatted.ni,
  retained: s50.formatted.retainedPercent,
  effective: s50.formatted.effectiveRate,
});

heading("Day 2: £30k vs £50k");
const cmp30_50 = compareSalaryInsights(30_000, 50_000);
console.log({
  from: cmp30_50.from.formatted.gross,
  to: cmp30_50.to.formatted.gross,
  grossDelta: cmp30_50.formatted.grossDelta,
  netDelta: cmp30_50.formatted.netDelta,
  monthlyNetDelta: cmp30_50.formatted.monthlyNetDelta,
  taxDelta: cmp30_50.formatted.taxDelta,
  niDelta: cmp30_50.formatted.niDelta,
  retainedShareOfExtra: cmp30_50.formatted.retainedPercent,
});

heading("Day 3: £50k → £60k pay-rise reality");
const cmp50_60 = compareSalaryInsights(50_000, 60_000);
console.log({
  from: cmp50_60.from.formatted.gross,
  to: cmp50_60.to.formatted.gross,
  grossDelta: cmp50_60.formatted.grossDelta,
  netDelta: cmp50_60.formatted.netDelta,
  monthlyNetDelta: cmp50_60.formatted.monthlyNetDelta,
  taxDelta: cmp50_60.formatted.taxDelta,
  niDelta: cmp50_60.formatted.niDelta,
  retainedShareOfRaise: cmp50_60.formatted.retainedPercent,
});

heading("Day 4: £100k tax trap");
const cmp100_110 = compareSalaryInsights(100_000, 110_000);
const cmp100_125 = compareSalaryInsights(100_000, 125_140);
console.log({
  s100: buildSalaryInsight(100_000).formatted,
  s110: buildSalaryInsight(110_000).formatted,
  s125_140: buildSalaryInsight(125_140).formatted,
  gap100_110: cmp100_110.formatted,
  gap100_125: cmp100_125.formatted,
});

heading("Day 5: £70k salary reality");
const s70 = buildSalaryInsight(70_000);
console.log(s70.formatted);
console.log("Percentile:", s70.percentile);

heading("Day 6: PAYE vs contractor comparison (£500/day)");
const contractor = computeLandingComparison({ dayRate: 500 });
for (const s of contractor.scenarios) {
  console.log(s.key, {
    label: s.label,
    regime: s.regime,
    net: s.netAnnual,
    monthly: s.netMonthly,
    effective: s.effectiveTaxRate,
    delta: s.deltaVsPayeAnnual,
    note: s.note,
  });
}
console.log("Best:", contractor.bestScenarioKey, "Worst:", contractor.worstScenarioKey);

heading("Day 7: Salary percentile");
console.log({
  salary30: buildSalaryInsight(30_000).percentile,
  salary50: buildSalaryInsight(50_000).percentile,
  salary80: buildSalaryInsight(80_000).percentile,
  salary100: buildSalaryInsight(100_000).percentile,
});
