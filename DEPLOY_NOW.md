# Quick Deployment Guide

## Pre-Deployment Checks

### 1. Run Lint
```bash
cd payroll-mvp
npm run lint
```

### 2. Build Project
```bash
npm run build
```

### 3. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to production
cd payroll-mvp
vercel --prod
```

#### Option B: GitHub + Vercel (Auto-deploy)
```bash
# Commit and push your changes
git add .
git commit -m "Fix calculator components - complete SIPP integration"
git push origin main

# Vercel will auto-deploy if connected to GitHub
```

#### Option C: Vercel Dashboard
1. Go to https://vercel.com
2. Import your GitHub repository
3. Vercel will auto-detect Next.js settings
4. Click "Deploy"

## What Was Fixed

✅ **LimitedCompanyCalculator.tsx**
- Fixed SIPP personal contribution calculation
- Now properly passes `sippPersonal` as annual amount to `calcLimited`

✅ **UmbrellaCalculator.tsx**
- Fixed SIPP personal contribution calculation (was monthly, now annual)
- Optimized revenue calculation

## Post-Deployment Verification

After deployment, test:
- [ ] Limited Company tab - verify SIPP contributions work
- [ ] Umbrella tab - verify SIPP contributions work
- [ ] All calculator tabs load correctly
- [ ] No console errors

## Environment Variables (Optional)

If you need webhook integration later, add in Vercel dashboard:
- `NOTION_WEBHOOK_URL`
- `BREVO_WEBHOOK_URL`
- `MAILCHIMP_WEBHOOK_URL`
- `OPENAI_API_KEY` (for GPT summaries)


