# TaxCalc - UK Payroll Tax Calculator

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Lint & Technical Debt

This project currently **builds cleanly for production** (`npm run build`), but `npm run lint`
still reports a set of known issues in legacy code (not in the latest Umbrella calculator work).

These eslint issues are:

- Use of `any` types in a few API / form handlers (e.g. signup, early-access, email signup)
- Unescaped quotes in JSX in some marketing/dashboard components
- React Hooks rule violations in a small number of tab components
- A remaining `any` in `src/lib/analytics.ts`

For now, these are treated as **non-blocking technical debt for deployment**. They will be
addressed in a dedicated “Refactor & Lint Cleanup” sprint so that behaviour remains stable
while the code is cleaned up.

For more detail, see `docs/TECH_DEBT.md`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
