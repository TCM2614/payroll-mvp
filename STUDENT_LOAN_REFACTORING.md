# Student Loan Refactoring Documentation

## Overview

This document describes the comprehensive refactoring of the student loan system to support combined undergraduate and postgraduate loans across all calculators in the UK Take-Home Pay Calculator.

## Problem Statement

### Before Refactoring

1. **Mutually Exclusive Plans**: Student loan plans were treated as mutually exclusive alternatives
2. **UI Issues**: Selection state sometimes didn't show correctly
3. **No Combined Loans**: Users couldn't have both an undergraduate plan (Plan 1/2/4/5) AND a postgraduate loan simultaneously
4. **No Per-Plan Breakdown**: Results only showed total student loan deduction, not per-plan breakdowns
5. **Multiple Scenarios**: UI showed separate scenarios side-by-side instead of a single combined calculation

### After Refactoring

1. **Combined Loans Supported**: Users can select one undergraduate plan AND a postgraduate loan
2. **Clear Selection State**: Visual selection always reflects current state
3. **Per-Plan Breakdown**: Results show individual deductions for each plan plus total
4. **Single Combined Calculation**: One scenario with all applicable loans combined
5. **Consistent Across All Calculators**: Same model and UI pattern everywhere

## Data Model

### New Type: `StudentLoanSelection`

```typescript
export interface StudentLoanSelection {
  /** Exactly one undergraduate plan, or "none" */
  undergraduatePlan: "plan1" | "plan2" | "plan4" | "plan5" | "none";
  /** Separate flag for postgraduate loan (can be combined with undergraduate) */
  hasPostgraduateLoan: boolean;
}
```

### Key Features

- **Undergraduate Plan**: Exactly one plan selected (or "none")
- **Postgraduate Loan**: Separate boolean flag, can be combined with undergraduate
- **Combination Support**: Example: Plan 2 + Postgraduate loan

### Helper Functions

```typescript
// Convert selection to loan keys array for calculations
studentLoanSelectionToLoanKeys(selection: StudentLoanSelection): LoanKey[]

// Legacy conversion for backwards compatibility
legacyPlanToSelection(plan: string): StudentLoanSelection
```

## UI Component

### `StudentLoanSelector`

**Location**: `src/components/StudentLoanSelector.tsx`

**Features**:
- Separate controls for undergraduate (radio buttons) and postgraduate (checkbox)
- Clear visual selection state with brand colors
- Summary card showing selected loans
- Accessible with proper labels and focus states

**Props**:
```typescript
interface StudentLoanSelectorProps {
  selection: StudentLoanSelection;
  onChange: (selection: StudentLoanSelection) => void;
}
```

## Calculation Functions

### Updated Functions

#### `calculateStudentLoans` (paye.ts)
- **Before**: Returned only total
- **After**: Returns `{ total: number; breakdown: Array<{ plan, label, amount }> }`
- Supports multiple plans in a single calculation

#### `calculateAnnualTax` (periodTax.ts)
- **Before**: Single `studentLoanPlan` parameter
- **After**: Supports `studentLoanPlans?: string[]` array
- Returns `studentLoanBreakdown` in result
- Backwards compatible with old `studentLoanPlan` parameter

#### `calculateAnnualStudentLoansMultiple` (periodTax.ts)
- **New function**: Calculates multiple student loan plans
- Returns per-plan breakdown and total
- Used internally by `calculateAnnualTax`

### Calculation Logic

1. **Per-Plan Calculation**: Each plan calculated separately on gross income above threshold
2. **Summation**: All applicable deductions summed for total
3. **Breakdown**: Per-plan amounts returned for display

**Example**:
- Plan 2: £30,000 gross - £27,295 threshold = £2,705 × 9% = £243.45/year
- Postgraduate: £30,000 gross - £21,000 threshold = £9,000 × 6% = £540/year
- **Total**: £783.45/year

## Updated Calculators

### 1. PayeTab (`src/components/tabs/PayeTab.tsx`)

**Changes**:
- Replaced `StudentLoanMultiSelect` with `StudentLoanSelector`
- Changed from multiple scenarios to single combined calculation
- Uses `calcPAYECombined` for proper multi-job handling
- Displays per-plan breakdown in results

**Result Display**:
- Main take-home figure
- Period breakdown (annual, weekly)
- Student loan breakdown section (per-plan + total)

### 2. UmbrellaCalculator (`src/components/UmbrellaCalculator.tsx`)

**Changes**:
- Replaced `StudentLoanMultiSelect` with `StudentLoanSelector`
- Single combined calculation instead of multiple scenarios
- Updated to use `studentLoanPlans` array in calculation
- Displays per-plan breakdown in results

### 3. LimitedCompanyCalculator (`src/components/LimitedCompanyCalculator.tsx`)

**Changes**:
- Replaced `StudentLoanMultiSelect` with `StudentLoanSelector`
- Single combined calculation
- Updated to use `studentLoanPlans` array
- Displays per-plan breakdown in results

### 4. PeriodicTaxTab (`src/components/tabs/PeriodicTaxTab.tsx`)

**Changes**:
- Replaced select dropdown with `StudentLoanSelector`
- Updated `PeriodTaxInput` to support `studentLoanPlans` array
- Updated `calculatePeriodTax` to handle multiple loans
- Maintains period-by-period calculation with combined loans

## Type Definitions

### Updated Interfaces

#### `AnnualTaxBreakdown`
```typescript
export interface AnnualTaxBreakdown {
  // ... existing fields
  annualStudentLoan: number;
  studentLoanBreakdown?: Array<{ plan: string; label: string; amount: number }>;
  annualPensionEmployee?: number;
  // ...
}
```

#### `ContractorAnnualResult`
```typescript
export interface ContractorAnnualResult {
  annual?: {
    // ... existing fields
    pensionEmployee: number;  // Normalized with ?? 0
    studentLoan: number;
    studentLoanBreakdown?: Array<{ plan: string; label: string; amount: number }>;
    // ...
  };
}
```

#### `CombinedPayeOutput`
```typescript
export type CombinedPayeOutput = {
  // ... existing fields
  totalStudentLoans: number;
  studentLoanBreakdown: Array<{ plan: LoanKey; label: string; amount: number }>;
  // ...
};
```

## Results Display Pattern

All calculators now show student loan deductions in a consistent format:

```tsx
{/* Student loan breakdown */}
{breakdown.length > 0 && (
  <div className="rounded-xl border ... p-3 space-y-2">
    <h3>Student loan deductions</h3>
    <div className="space-y-1">
      {breakdown.map(({ plan, label, amount }) => (
        <div key={plan}>
          <span>Student loan ({label}):</span>
          <span>{formatGBP(amount / 12)}/month</span>
        </div>
      ))}
      <div className="border-t ...">
        <span>Total student loans:</span>
        <span>{formatGBP(total / 12)}/month</span>
      </div>
    </div>
  </div>
)}
```

## Backwards Compatibility

### Legacy Support

- Old `studentLoanPlan` parameter still works (marked `@deprecated`)
- `legacyPlanToSelection()` helper for conversion
- Single-plan calculations still function correctly

### Migration Path

1. Old code using single plan: continues to work
2. New code: use `StudentLoanSelection` model
3. Gradual migration: both patterns supported

## Type Safety Fixes

### Normalization at Boundaries

All optional numeric deductions are normalized with `?? 0` when constructing summary objects:

```typescript
// contracting.ts
annual: {
  pensionEmployee: breakdown.annualPensionEmployee ?? 0,
  studentLoan: breakdown.annualStudentLoan,
  // ...
}
```

**Domain Rule**: Missing deductions default to `0`, not `undefined`.

## Testing Scenarios

### Valid Combinations

1. ✅ **Plan 2 only**: `{ undergraduatePlan: "plan2", hasPostgraduateLoan: false }`
2. ✅ **Postgraduate only**: `{ undergraduatePlan: "none", hasPostgraduateLoan: true }`
3. ✅ **Plan 2 + Postgraduate**: `{ undergraduatePlan: "plan2", hasPostgraduateLoan: true }`
4. ✅ **Plan 1 + Postgraduate**: `{ undergraduatePlan: "plan1", hasPostgraduateLoan: true }`
5. ✅ **No loans**: `{ undergraduatePlan: "none", hasPostgraduateLoan: false }`

### Calculation Verification

- Each plan calculated on gross income above threshold
- Deductions summed for total
- Net pay reflects all applicable deductions
- Per-plan breakdowns accurate

## Files Changed

### New Files
- `src/lib/student-loans.ts` - Data model and helpers
- `src/components/StudentLoanSelector.tsx` - New UI component

### Modified Files
- `src/lib/calculators/paye.ts` - Updated to return breakdowns
- `src/domain/tax/periodTax.ts` - Multi-plan support
- `src/domain/tax/contracting.ts` - Updated result types
- `src/components/tabs/PayeTab.tsx` - New selector + combined calculation
- `src/components/UmbrellaCalculator.tsx` - New selector + combined calculation
- `src/components/LimitedCompanyCalculator.tsx` - New selector + combined calculation
- `src/components/tabs/PeriodicTaxTab.tsx` - New selector + multi-plan support

## Migration Guide

### For Developers

1. **Replace old selectors**: Use `StudentLoanSelector` instead of `StudentLoanMultiSelect`
2. **Update state**: Change from `StudentLoanPlan[]` to `StudentLoanSelection`
3. **Convert for calculations**: Use `studentLoanSelectionToLoanKeys()` before calling calculation functions
4. **Display breakdowns**: Show `studentLoanBreakdown` array in results

### Example Migration

**Before**:
```typescript
const [selectedPlans, setSelectedPlans] = useState<StudentLoanPlan[]>(["none"]);
// ... calculate per plan
selectedPlans.map(plan => calculateWithPlan(plan))
```

**After**:
```typescript
const [selection, setSelection] = useState<StudentLoanSelection>({
  undergraduatePlan: "none",
  hasPostgraduateLoan: false,
});
// ... single combined calculation
const loans = studentLoanSelectionToLoanKeys(selection);
calculateWithLoans(loans) // Returns breakdown
```

## Summary

This refactoring enables users to accurately model their real-world student loan situation where they may have both an undergraduate plan and a postgraduate loan. The system now:

- ✅ Supports combined loans
- ✅ Shows clear per-plan breakdowns
- ✅ Maintains backwards compatibility
- ✅ Provides consistent UX across all calculators
- ✅ Ensures type safety with proper normalization

All changes are production-ready and have been tested.

