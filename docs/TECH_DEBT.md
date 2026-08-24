# Lint & Technical Debt Overview

## Current State

- `npm run build` succeeds and produces a valid production build.
- `npm run lint` still reports a set of **known, legacy eslint issues**.
- These issues are **not related** to the latest Umbrella calculator work.

## Eslint Issue Categories

The main categories of eslint findings are:

- **`any` types** in API routes and form handlers  
  - Example areas: `src/app/api/early-access/route.ts`, `src/app/page.tsx`, `src/app/signup/page.tsx`,
    `src/components/EarlyAccessForm.tsx`, `src/components/landing/EmailSignupSection.tsx`.
- **Unescaped quotes in JSX**  
  - Example areas: `src/app/dashboard/page.tsx`, `src/components/DashboardComingSoon.tsx`.
- **React Hooks rules**  
  - Example areas: `src/components/tabs/PayeTab.tsx`, `src/components/tabs/PeriodicTaxTab.tsx`,
    `src/components/tabs/WealthPercentileTab.tsx`.
- **Remaining `any` in analytics**  
  - Example area: `src/lib/analytics.ts`.

These are currently treated as **non-blocking for deployment** as long as:

- The production build (`npm run build`) passes.
- There are no regressions in runtime behaviour.

## Plan: Refactor & Lint Cleanup Sprint

A future “Refactor & Lint Cleanup” sprint will:

1. Remove remaining `any` usages, starting with `src/lib/analytics.ts` and API/entrypoints.
2. Fix JSX quote issues by using proper HTML entities where required.
3. Resolve React Hooks warnings by tightening dependency arrays or refactoring state where needed.
4. Keep user-facing behaviour identical while improving type-safety and maintainability.

Until that sprint is executed, these eslint issues remain **documented technical debt**, not
shipping blockers.


