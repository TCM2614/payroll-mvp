# Lovable Conversion Prompt - UK Take-Home Pay Calculator

## PROJECT: UK Take-Home Pay Calculator (Next.js → React Component)

Convert this entire Next.js repository into a React component structure for Lovable. This is a production-ready UK tax calculator for 2024/25 tax year with dark glassmorphism design.

---

## CRITICAL: DO NOT MODIFY THESE FILES

**Domain Logic (Pure TypeScript, tested, production-ready):**
- `src/domain/tax/periodTax.ts` - Period-based PAYE calculations
- `src/domain/tax/contracting.ts` - Contractor calculations  
- `src/domain/tax/periodActuals.ts` - Actual vs expected tax analysis
- `src/lib/tax/uk2025.ts` - UK 2024/25 tax constants

**These contain the core tax calculation logic. Copy exactly as-is.**

---

## KEY COMPONENTS TO CONVERT

### Main Calculator (`/calc`)
- **File:** `src/app/calc/page.tsx`
- Top-level tabs: Calculators, FAQs, Dashboard
- Dark gradient background
- Wraps calculator shell component

### Calculator Shell
- **File:** `src/components/take-home-calculator.tsx`
- 4 tabs: Standard PAYE, Umbrella, Limited, Periodic
- Mobile: horizontal scroll, Desktop: grid

### Calculator Tabs
1. **PayeTab.tsx** - Standard PAYE with multi-jobs, multi-student-loans
2. **UmbrellaCalculator.tsx** - Umbrella company (inside IR35)
3. **LimitedCompanyCalculator.tsx** - Limited company (inside/outside IR35)
4. **PeriodicTaxTab.tsx** - Period-by-period tax checker with variance analysis

### Supporting Components
- `StudentLoanMultiSelect.tsx` - Multi-select student loan plans
- `DashboardFeedbackForm.tsx` - Feedback form (light/dark variants)
- `SIPPAndSalarySacrifice.tsx` - Pension inputs

---

## DESIGN SYSTEM

**Current Theme:** Dark glassmorphism with emerald accents

**Design Tokens:**
```tsx
// Cards
className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-xl"

// Inputs
className="rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"

// Buttons
className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"

// Typography
// H1: text-3xl font-bold tracking-tight text-white sm:text-4xl
// Labels: text-sm font-medium text-white/90
// Body: text-sm text-white/70
```

**Background:** `bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900`

---

## CONVERSION STEPS

1. **Copy domain logic exactly** - No modifications
2. **Convert components** - Update Next.js specific code (Link, useRouter, etc.)
3. **Set up routing** - Use React Router or similar
4. **Apply styling** - Ensure Tailwind config matches
5. **Test calculations** - Verify all calculators work correctly

---

## DESIGN UPGRADE PROMPT

After conversion, apply this design upgrade:

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

## TECH STACK

- Next.js 16.0.2 (App Router)
- React 19.2.0
- TypeScript 5.x (strict)
- Tailwind CSS v4
- nanoid, lucide-react

---

## KEY FEATURES

- ✅ Multi-select student loan comparison
- ✅ Period-by-period tax analysis
- ✅ IR35 status handling
- ✅ Multiple jobs support
- ✅ Anonymous analytics
- ✅ SEO optimized
- ✅ Mobile-first responsive

---

**Ready for Lovable! Copy domain logic exactly, convert components, then apply design upgrades.**

