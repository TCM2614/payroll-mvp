# Complete Prompt for Lovable: UK Take-Home Pay Calculator

## PROJECT OVERVIEW

Convert this entire Next.js UK Take-Home Pay Calculator repository into a React component structure that Lovable can build and enhance. This is a production-ready tax calculator application for the UK 2024/25 tax year with multiple calculator modes, domain-driven architecture, and a dark glassmorphism design system.

---

## TECH STACK & DEPENDENCIES

**Framework:** Next.js 16.0.2 (App Router)
**React:** 19.2.0
**TypeScript:** 5.x (strict mode)
**Styling:** Tailwind CSS v4
**Key Libraries:**
- `nanoid` - Unique ID generation
- `lucide-react` - Icons
- `recharts` - Charts (optional, for future features)
- `next-themes` - Theme management

---

## PROJECT STRUCTURE

```
payroll-mvp/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── calc/page.tsx      # Main calculator page (CRITICAL)
│   │   ├── signup/page.tsx    # Email signup (design reference)
│   │   ├── dashboard-preview/ # Coming soon dashboard
│   │   ├── contracting/       # Advanced contracting tools
│   │   └── api/               # API routes (signup, feedback)
│   │
│   ├── components/            # React components
│   │   ├── take-home-calculator.tsx  # Main calculator shell
│   │   ├── tabs/
│   │   │   ├── PayeTab.tsx           # Standard PAYE calculator
│   │   │   ├── UmbrellaCalculator.tsx # Umbrella company calc
│   │   │   ├── LimitedCompanyCalculator.tsx # Limited company calc
│   │   │   └── PeriodicTaxTab.tsx    # Periodic tax checker
│   │   ├── StudentLoanMultiSelect.tsx # Multi-select student loans
│   │   ├── DashboardFeedbackForm.tsx # Feedback form component
│   │   ├── SIPPAndSalarySacrifice.tsx # Pension inputs
│   │   └── layout/
│   │       ├── AppShell.tsx   # Main layout wrapper
│   │       └── MainHeader.tsx  # Navigation header
│   │
│   ├── domain/                # Pure domain logic (CRITICAL - DO NOT MODIFY)
│   │   └── tax/
│   │       ├── periodTax.ts   # Period-based PAYE calculations
│   │       ├── contracting.ts # Contractor calculations
│   │       └── periodActuals.ts # Actual vs expected tax analysis
│   │
│   └── lib/                   # Utilities
│       ├── tax/uk2025.ts     # UK 2024/25 tax constants
│       ├── format.ts          # Currency formatting
│       ├── analytics.ts       # Analytics tracking
│       └── calculators/       # Legacy calculators (can be refactored)
```

---

## CRITICAL: DOMAIN LOGIC (DO NOT MODIFY)

**These files contain pure, tested tax calculation logic. They must be preserved exactly:**

1. **`src/domain/tax/periodTax.ts`**
   - Period-based PAYE calculation engine
   - Handles cumulative tax calculations
   - Detects over-taxation/underpayment
   - Pure functions, no side effects

2. **`src/domain/tax/contracting.ts`**
   - Contractor calculation logic
   - Supports umbrella and limited company
   - IR35 status handling
   - Dependency injection pattern

3. **`src/domain/tax/periodActuals.ts`**
   - Compares actual tax paid vs expected
   - Cumulative variance analysis
   - Warning generation

4. **`src/lib/tax/uk2025.ts`**
   - UK 2024/25 tax year constants
   - Personal allowance, tax bands, NI rates
   - Student loan thresholds and rates

**IMPORTANT:** These domain functions are tested and production-ready. Only modify UI components, not the calculation logic.

---

## KEY COMPONENTS TO CONVERT

### 1. Main Calculator Page (`/calc`)
**File:** `src/app/calc/page.tsx`

**Features:**
- Top-level tab switcher (Calculators, FAQs, Dashboard)
- Dark gradient background
- Wraps `TakeHomeCalculator` component
- FAQ section with JSON-LD
- Dashboard preview section

**Key State:**
- `activeTab`: "calculators" | "faqs" | "dashboard"

### 2. Calculator Shell
**File:** `src/components/take-home-calculator.tsx`

**Features:**
- Tab navigation (Standard, Umbrella, Limited, Periodic)
- Mobile: horizontal scrollable tabs
- Desktop: grid layout
- Renders tab content conditionally

**Key State:**
- `activeTab`: "paye" | "umbrella" | "limited" | "periodic"

### 3. Standard PAYE Calculator
**File:** `src/components/tabs/PayeTab.tsx`

**Features:**
- Primary job income input (multiple frequencies)
- Tax code input
- Multi-select student loan plans
- Pension & SIPP inputs
- Additional jobs support
- Results per student loan scenario

**Key Calculations:**
- Uses `calcPayeMonthly` from `lib/calculators/paye`
- Supports multiple jobs aggregation
- Annual/weekly/monthly breakdowns

### 4. Umbrella Calculator
**File:** `src/components/UmbrellaCalculator.tsx`

**Features:**
- Rate inputs (monthly, day, hourly)
- Days per week, hours per day
- Tax code, pension percentage
- Multi-select student loans
- Results per scenario

**Key Calculations:**
- Uses `calculateContractorAnnual` from `domain/tax/contracting`
- Always inside IR35
- Engagement type: "umbrella"

### 5. Limited Company Calculator
**File:** `src/components/LimitedCompanyCalculator.tsx`

**Features:**
- Same rate inputs as Umbrella
- IR35 status selector (inside/outside)
- Multi-select student loans
- Shows warning for outside IR35 (not supported)

**Key Calculations:**
- Uses `calculateContractorAnnual`
- Engagement type: "limited"
- IR35 status from selector

### 6. Periodic Tax Check
**File:** `src/components/tabs/PeriodicTaxTab.tsx`

**Features:**
- Pay frequency selector
- Tax code input (with per-period overrides)
- Student loan plan selector
- Period-by-period inputs (gross, pension, actual tax)
- YTD summary
- Variance analysis
- Range aggregation

**Key Calculations:**
- Uses `calculatePeriodTax` from `domain/tax/periodTax`
- Uses `analyseActualVsExpectedTax` from `domain/tax/periodActuals`
- Cumulative YTD tracking

### 7. Student Loan Multi-Select
**File:** `src/components/StudentLoanMultiSelect.tsx`

**Features:**
- Multi-select checkbox UI
- Plans: none, plan1, plan2, plan4, plan5, postgrad
- Logic: "none" clears others, deselecting all defaults to "none"

### 8. Dashboard Feedback Form
**File:** `src/components/DashboardFeedbackForm.tsx`

**Features:**
- Email input (optional)
- Feedback textarea
- Light/dark variant support
- API submission to `/api/dashboard-feedback`

---

## DESIGN SYSTEM (CURRENT STATE)

### Color Palette
- **Background:** Dark gradient (`from-slate-900 via-slate-800 to-slate-900`)
- **Cards:** Glass effect (`bg-black/40 border-white/10`)
- **Primary:** Emerald (`emerald-500` for buttons, `emerald-400` for accents)
- **Text:** White with opacity (`white/90` labels, `white/70` body)

### Typography
- **H1:** `text-3xl font-bold tracking-tight text-white sm:text-4xl`
- **H2:** `text-sm font-semibold text-white/90 sm:text-base`
- **Body:** `text-sm text-white/70`
- **Helper:** `text-xs text-white/70`

### Components
- **Cards:** `rounded-2xl border border-white/10 bg-black/40 p-8 shadow-xl`
- **Inputs:** `rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40`
- **Buttons:** `rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400`

### Layout
- **Container:** `max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6`
- **Sections:** `space-y-4 sm:space-y-6`
- **Mobile-first:** Stack on mobile, grid on desktop

---

## CONVERSION INSTRUCTIONS FOR LOVABLE

### Step 1: Set Up Project Structure
1. Create a new React project in Lovable
2. Install dependencies: `next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `nanoid`, `lucide-react`
3. Set up Tailwind CSS v4 configuration
4. Create folder structure matching the repo

### Step 2: Copy Domain Logic (Exact Copy)
1. Copy `src/domain/tax/*.ts` files exactly as-is
2. Copy `src/lib/tax/uk2025.ts` exactly as-is
3. Copy `src/lib/format.ts` exactly as-is
4. **DO NOT MODIFY** these files - they are production-ready

### Step 3: Convert Components
1. Copy all component files from `src/components/`
2. Ensure all imports are correct
3. Convert Next.js specific features:
   - Replace `next/link` with React Router or similar if needed
   - Replace `useRouter` with appropriate navigation
   - Handle API routes appropriately

### Step 4: Convert Pages
1. Convert `app/calc/page.tsx` to main calculator page
2. Convert other pages as needed
3. Ensure routing works correctly

### Step 5: Set Up Styling
1. Copy `globals.css` from `src/app/globals.css`
2. Ensure Tailwind config matches
3. Verify all design tokens are applied

### Step 6: Test Calculations
1. Verify all calculators work correctly
2. Test with known tax scenarios
3. Ensure domain logic produces correct results

---

## DESIGN UPGRADE PROMPT (ATTACH THIS)

I need a design upgrade for my UK Take-Home Pay Calculator app. The app currently uses a dark glassmorphism design system with emerald accents, and I want to enhance the visual hierarchy, spacing, and overall polish while maintaining the existing dark theme.

**Current Design System:**
- Dark gradient background (slate-900 to slate-800)
- Glass cards: rounded-2xl, border-white/10, bg-black/40, shadow-xl
- Emerald primary buttons (emerald-500 with black text)
- Dark glass inputs with emerald focus rings
- White text with opacity variations (white/90 for labels, white/70 for body)

**Pages to Upgrade:**
1. `/calc` - Main calculator page with tabbed interface
2. Calculator tabs: Standard PAYE, Umbrella, Limited Company, Periodic Tax Check
3. `/dashboard-preview` - Coming soon page
4. `/signup` - Email signup page (reference design)

**Design Goals:**
1. **Visual Hierarchy**: Improve spacing, typography scale, and content grouping
2. **Polish**: Add subtle animations, better hover states, improved focus indicators
3. **Consistency**: Ensure all calculator tabs use identical spacing, card styles, and input patterns
4. **Mobile-first**: Optimize for mobile while enhancing desktop experience
5. **Accessibility**: Ensure proper contrast ratios and keyboard navigation

**Specific Improvements Needed:**
- Better spacing between sections (currently space-y-4 sm:space-y-6)
- Enhanced card hover states and transitions
- Improved input focus states with better visual feedback
- Better visual separation between different calculator scenarios (student loan plans)
- More polished button states (loading, disabled, hover)
- Improved typography hierarchy for results display
- Better mobile card layouts for period rows in Periodic tab
- Enhanced variance/warning badges with better visual treatment

**Constraints:**
- Keep the dark glassmorphism theme
- Maintain emerald as primary accent color
- Don't change any tax calculation logic
- Keep existing component structure
- Ensure TypeScript strict mode compliance

**Reference Files:**
- `/app/signup/page.tsx` - Reference for card and input styling
- `/app/calc/page.tsx` - Main calculator page
- `/components/tabs/PayeTab.tsx` - Standard PAYE calculator
- `/components/tabs/PeriodicTaxTab.tsx` - Periodic tax checker
- `/components/UmbrellaCalculator.tsx` - Umbrella calculator
- `/components/LimitedCompanyCalculator.tsx` - Limited company calculator

Please review the current implementation and suggest/implement design improvements that enhance the visual polish while maintaining the dark glass aesthetic.

---

## KEY FEATURES TO PRESERVE

1. **Multi-select Student Loans**: All calculators support comparing multiple student loan plans side-by-side
2. **Periodic Tax Analysis**: Period-by-period tax checking with actual vs expected comparison
3. **IR35 Handling**: Limited company calculator shows clear warnings for outside IR35
4. **Multiple Jobs**: Standard PAYE supports additional jobs
5. **Analytics**: Anonymous event tracking (plausible-ready)
6. **SEO**: Metadata, JSON-LD structured data
7. **Responsive**: Mobile-first design throughout

---

## TESTING REQUIREMENTS

The domain logic has test files:
- `src/domain/tax/__tests__/periodTax.spec.ts`
- `src/domain/tax/__tests__/contracting.spec.ts`
- `src/domain/tax/__tests__/periodActuals.spec.ts`

Ensure calculations match expected results from these tests.

---

## API ROUTES (IF NEEDED)

1. `/api/signup` - Email signup endpoint
2. `/api/dashboard-feedback` - Dashboard feedback submission
3. `/api/meta-summary` - Meta information endpoint

These can be converted to appropriate backend endpoints or removed if not needed.

---

## NEXT STEPS AFTER CONVERSION

1. Verify all calculators work correctly
2. Test with real UK tax scenarios
3. Apply design upgrades using the attached prompt
4. Optimize performance
5. Add loading states
6. Enhance error handling
7. Improve accessibility

---

## IMPORTANT NOTES

- **DO NOT** modify domain calculation logic
- **DO** improve UI/UX and visual design
- **DO** maintain TypeScript strict mode
- **DO** preserve all calculation accuracy
- **DO** keep responsive mobile-first approach
- **DO** maintain accessibility standards

---

## QUICK REFERENCE: KEY IMPORTS

```typescript
// Domain logic
import { calculatePeriodTax, createUK2025Config } from "@/domain/tax/periodTax";
import { calculateContractorAnnual } from "@/domain/tax/contracting";
import { analyseActualVsExpectedTax } from "@/domain/tax/periodActuals";

// Utilities
import { formatGBP } from "@/lib/format";
import { UK_TAX_2025 } from "@/lib/tax/uk2025";

// Analytics
import { trackCalculatorSubmit, trackResultsView } from "@/lib/analytics";
```

---

**Ready for Lovable conversion and design upgrade!**


