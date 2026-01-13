# UK Payroll Calculator - TypeScript Files

## 📁 Calculator Files Structure

```
src/lib/
├── calculators/
│   ├── paye.ts              # PAYE calculation logic
│   ├── umbrella.ts          # Umbrella company calculation
│   ├── limited.ts           # Limited company calculation
│   └── __tests__/
│       └── example-scenarios.ts  # Test scenarios
├── tax/
│   └── uk2025.ts           # UK tax rates and thresholds for 2024/25
└── format.ts               # Currency formatting utilities
```

## 📄 Key Files

### 1. `src/lib/tax/uk2025.ts`
Contains all UK tax rates and thresholds for the 2024/25 tax year:
- Personal allowance: £12,570
- Income tax bands and rates
- National Insurance rates
- Corporation tax: 19%
- Dividend tax rates
- Student loan thresholds and rates

### 2. `src/lib/calculators/paye.ts`
PAYE calculation functions:
- `calcPayeMonthly()` - Simple monthly PAYE calculation
- `calcPAYECombined()` - Multi-job PAYE calculation
- Handles tax codes (1257L, BR, D0, D1, 0T, NT)
- Salary sacrifice support
- SIPP personal contributions

### 3. `src/lib/calculators/umbrella.ts`
Umbrella company calculation:
- `calcUmbrella()` - Full umbrella calculation
- Handles umbrella margin and employer costs
- Converts day/hourly rates to annual
- Applies PAYE after umbrella deductions

### 4. `src/lib/calculators/limited.ts`
Limited company calculation:
- `calcLimited()` - Full limited company calculation
- Corporation tax on profits
- Dividend tax calculations
- Optimal salary recommendations

## 🧪 Example Test Scenarios

See `src/lib/calculators/__tests__/example-scenarios.ts` for 4 test scenarios:

1. **Standard PAYE Employee**: £5k/month, Plan 2 loan, 5% pension
2. **Umbrella Contractor**: £500/day, 5 days/week, 46 weeks/year
3. **Limited Company**: £500/day, optimal salary, 5% employer pension
4. **Multi-Job PAYE**: Primary £4k (1257L) + Secondary £1.5k (BR)

### Running Test Scenarios

```typescript
import { runAllScenarios } from "@/lib/calculators/__tests__/example-scenarios";

// Run all scenarios
runAllScenarios();
```

Or run individual scenarios:
```typescript
import { 
  scenario1_PAYE_Standard,
  scenario2_Umbrella_Contractor,
  scenario3_Limited_Company 
} from "@/lib/calculators/__tests__/example-scenarios";

scenario1_PAYE_Standard();
scenario2_Umbrella_Contractor();
scenario3_Limited_Company();
```

## 📊 Calculation Flow

### PAYE Flow:
1. Convert income to annual
2. Apply salary sacrifice (if any)
3. Allocate personal allowance
4. Calculate income tax by band
5. Calculate employee NI
6. Apply student loan deductions
7. Return net take-home

### Umbrella Flow:
1. Calculate annual assignment value
2. Deduct umbrella margin and employer costs
3. Apply PAYE to remaining gross
4. Return net take-home

### Limited Company Flow:
1. Calculate annual revenue
2. Deduct salary, expenses, employer pension
3. Apply corporation tax on profit
4. Calculate dividend tax on distributions
5. Return net (salary + dividends)



