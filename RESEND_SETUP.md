# Resend Email Setup Guide

## Error: "Email configuration missing"

This error occurs when the required Resend environment variables are not set in Vercel.

## Required Environment Variables

You need to add these 3 environment variables to your Vercel project:

1. **`RESEND_API_KEY`** (Required)
2. **`RESEND_FROM_EMAIL`** (Required)
3. **`BUSINESS_EMAIL`** (Optional, but recommended)

## Step-by-Step Setup

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give it a name (e.g., "UK Take-Home Calculator")
4. Copy the API key (starts with `re_...`)
   - ⚠️ **Important**: Copy it immediately - you won't be able to see it again!

### 3. Verify Your Domain (Required for `RESEND_FROM_EMAIL`)

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides to your domain's DNS settings
5. Wait for verification (usually a few minutes)

**Note**: If you don't have a custom domain yet, you can use Resend's test domain for development:
- Use `onboarding@resend.dev` as your `RESEND_FROM_EMAIL` (only works for testing)

### 4. Add Environment Variables to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (payroll-mvp)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

   **Variable 1:**
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_xxxxxxxxxxxxx` (your API key from step 2)
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

   **Variable 2:**
   - **Name**: `RESEND_FROM_EMAIL`
   - **Value**: `noreply@yourdomain.com` (or `onboarding@resend.dev` for testing)
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

   **Variable 3:**
   - **Name**: `BUSINESS_EMAIL`
   - **Value**: `uktakehomecalculator.proton.me`
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

### 5. Redeploy

After adding environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger a new deployment

## Testing

After redeploying:

1. Visit your production site
2. Use the "Join early access" form
3. Submit your email
4. Check:
   - ✅ You receive "New early access signup" email at `uktakehomecalculator.proton.me`
   - ✅ The email you entered receives the welcome email

## Troubleshooting

### "Email configuration missing" still appears

- ✅ Check that all 3 environment variables are set in Vercel
- ✅ Make sure you selected all environments (Production, Preview, Development)
- ✅ Redeploy after adding variables
- ✅ Check Vercel logs for detailed error messages

### Emails not sending

- ✅ Verify your domain in Resend dashboard
- ✅ Check that `RESEND_FROM_EMAIL` matches a verified domain
- ✅ Check Resend dashboard → Emails for delivery status
- ✅ Check Vercel function logs for errors

### Using Test Domain (Development)

If you don't have a custom domain yet:

1. Use `onboarding@resend.dev` as `RESEND_FROM_EMAIL`
2. This only works for testing - you'll need a verified domain for production
3. Limited to 100 emails/day on free plan

## Quick Reference

```bash
# Required Environment Variables in Vercel:
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
BUSINESS_EMAIL=uktakehomecalculator.proton.me
```

## Next Steps

Once emails are working:
- [ ] Test the early access form
- [ ] Verify welcome emails are received
- [ ] Check Resend dashboard for email analytics
- [ ] Consider upgrading Resend plan if you need more emails

