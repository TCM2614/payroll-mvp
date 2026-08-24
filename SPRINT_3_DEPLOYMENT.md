# Sprint 3 Deployment Guide

## Pre-Deployment Checklist

✅ All features implemented
✅ No linting errors
✅ All routes functional
✅ SEO metadata implemented
✅ Schema markup added
✅ Analytics ready
✅ Webhook ready

## Deployment Steps

### 1. Run Lint

```bash
cd payroll-mvp
npm run lint
```

### 2. Build Project

```bash
npm run build
```

### 3. Test Build Locally

```bash
npm start
```

Visit `http://localhost:3000` and test:
- All calculator tabs
- Additional Jobs tab
- Signup page
- Dashboard preview
- API endpoints

### 4. Deploy to Vercel

#### Option A: Via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to production
vercel --prod
```

#### Option B: Via GitHub (Recommended)

1. **Create Branch**:
   ```bash
   git checkout -b sprint-3/multi-employment-and-growth
   git add .
   git commit -m "Sprint 3: Multi-employment + Marketing Growth"
   git push origin sprint-3/multi-employment-and-growth
   ```

2. **Merge to Main**:
   ```bash
   git checkout main
   git merge sprint-3/multi-employment-and-growth
   git push origin main
   ```

3. **Vercel Auto-Deploy**: Vercel will automatically deploy when you push to main

### 5. Configure Environment Variables (Optional)

In Vercel dashboard, add environment variables:

```env
# Newsletter Webhook (choose one)
NOTION_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/...
BREVO_WEBHOOK_URL=https://api.brevo.com/v3/contacts
MAILCHIMP_WEBHOOK_URL=https://us1.api.mailchimp.com/3.0/lists/...

# OpenAI API (for GPT summaries - future)
OPENAI_API_KEY=sk-...

# Analytics (if using custom domain)
PLAUSIBLE_DOMAIN=yourdomain.com
UMAMI_WEBSITE_ID=your-website-id
```

### 6. Enable Analytics (Optional)

#### Plausible Analytics

1. Uncomment in `src/app/layout.tsx`:
   ```tsx
   <Script
     defer
     data-domain="yourdomain.com"
     src="https://plausible.io/js/script.js"
   />
   ```

2. Replace `yourdomain.com` with your actual domain

#### Umami Analytics

1. Uncomment in `src/app/layout.tsx`:
   ```tsx
   <Script
     async
     defer
     data-website-id="your-website-id"
     src="https://analytics.umami.is/script.js"
   />
   ```

2. Replace `your-website-id` with your actual website ID

### 7. Configure Webhook Integration (Optional)

#### Notion Database

1. Create a Notion database for signups
2. Get webhook URL from Zapier or similar
3. Add `NOTION_WEBHOOK_URL` environment variable
4. Uncomment webhook code in `src/app/api/signup/route.ts`

#### Brevo (formerly Sendinblue)

1. Create Brevo account
2. Get API key
3. Add `BREVO_WEBHOOK_URL` environment variable
4. Update `src/app/api/signup/route.ts` to use Brevo API

#### Mailchimp

1. Create Mailchimp account
2. Get API key and list ID
3. Add `MAILCHIMP_WEBHOOK_URL` environment variable
4. Update `src/app/api/signup/route.ts` to use Mailchimp API

### 8. Enable GPT Summaries (Optional)

1. Get OpenAI API key
2. Add `OPENAI_API_KEY` environment variable
3. Uncomment GPT API call in `src/app/api/meta-summary/route.ts`
4. Configure GPT model and prompts

## Post-Deployment Verification

### 1. Test All Routes

- [ ] `/` - Landing page loads
- [ ] `/calc` - Calculator loads with all tabs
- [ ] `/signup` - Signup page loads and submits
- [ ] `/dashboard-preview` - Dashboard preview loads
- [ ] `/api/signup` - API endpoint works
- [ ] `/api/meta-summary` - API endpoint works

### 2. Test Calculator Features

- [ ] PAYE tab works
- [ ] Umbrella tab works
- [ ] Limited tab works
- [ ] Additional Jobs tab works
- [ ] Compare tab works
- [ ] Student loans calculate correctly
- [ ] Multiple jobs aggregate correctly

### 3. Test SEO

- [ ] Meta tags appear in browser dev tools
- [ ] OpenGraph tags work for social sharing
- [ ] Schema markup validated with Google Rich Results Test
- [ ] Twitter card tags work

### 4. Test Marketing Funnel

- [ ] Signup page form submits
- [ ] Redirect banner appears on calculator page
- [ ] Dashboard preview shows lock overlay
- [ ] All CTAs link correctly

### 5. Test Analytics (if enabled)

- [ ] Plausible/Umami tracking works
- [ ] Page views tracked
- [ ] Events tracked (if configured)

## Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### TypeScript Errors

```bash
# Check TypeScript
npx tsc --noEmit
```

### API Errors

- Check environment variables in Vercel dashboard
- Check API endpoint logs in Vercel dashboard
- Verify webhook URLs are correct

### SEO Issues

- Validate schema markup: https://search.google.com/test/rich-results
- Check meta tags: View page source in browser
- Test OpenGraph: https://www.opengraph.xyz/

## Rollback Plan

If deployment fails:

1. **Revert to Previous Version**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Or Deploy Previous Build**:
   - Go to Vercel dashboard
   - Select previous deployment
   - Click "Promote to Production"

## Success Criteria

✅ All routes functional
✅ All calculator features work
✅ Signup flow works
✅ SEO metadata correct
✅ Schema markup valid
✅ Analytics tracking (if enabled)
✅ Webhook integration (if configured)
✅ No errors in production

## Next Steps

1. Monitor analytics for user behavior
2. Collect feedback from signups
3. Iterate on dashboard preview
4. Add more FAQ schema questions
5. Enhance GPT summaries
6. Add more webhook integrations
7. A/B test signup page
8. Add more marketing features

