# Email Hashing & Welcome Email Setup

This guide explains how to set up email hashing, storage, and welcome emails for all form submissions.

## Overview

All form fields (emails, feedback) are now:
1. **Hashed** using SHA-256 before storage (privacy-compliant)
2. **Stored** in Vercel KV (or PostgreSQL later)
3. **Welcome emails** sent via Resend API

## Setup Steps

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Required for welcome emails
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
BUSINESS_EMAIL=uktakehomecalculator.proton.me

# Required for storage (Vercel KV)
KV_REST_API_URL=https://your-kv-instance.vercel.app
KV_REST_API_TOKEN=your-kv-token

# Site URL (for email links)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. Set Up Resend

1. Sign up at [resend.com](https://resend.com)
2. Create an API key in your dashboard
3. Verify your domain (for `RESEND_FROM_EMAIL`)
4. Add `RESEND_API_KEY` to your `.env.local` and Vercel environment variables

### 3. Set Up Vercel KV

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create Database** → **KV**
3. Create a new KV database
4. Copy the `KV_REST_API_URL` and `KV_REST_API_TOKEN`
5. Add them to your `.env.local` and Vercel environment variables

### 4. Deploy

After setting environment variables in Vercel:

```bash
git add .
git commit -m "Add email hashing and welcome emails"
git push origin main
```

Vercel will automatically deploy with the new environment variables.

## How It Works

### Email Hashing

- All emails are hashed using SHA-256 (Web Crypto API)
- Hash is one-way (cannot be reversed)
- Used for duplicate detection and privacy-compliant storage
- Original email is kept temporarily for welcome email, then should be removed

### Storage

- Signups stored in Vercel KV with key: `signup:{emailHash}`
- Feedback stored with key: `feedback:{timestamp}:{emailHash}`
- TTL: 1 year for signups, 90 days for feedback
- Falls back to logging in development mode

### Welcome Emails

- Sent automatically when users sign up via:
  - Landing page email signup
  - `/signup` page
- Email includes:
  - "Thanks for joining early access! 🎉"
  - "Here's what to expect" section
  - "You're on the 50% Lifetime Discount List" highlight
- Email failures don't break signup (non-blocking)

## Form Endpoints

### `/api/signup`

- **Input**: `{ email, consent, featureRequest?, source? }`
- **Process**:
  1. Validates email format
  2. Hashes email
  3. Checks for duplicates
  4. Stores in KV
  5. Sends welcome email
- **Output**: `{ success: true, message: "Signup successful" }`

### `/api/dashboard-feedback`

- **Input**: `{ email?, feedback, source? }`
- **Process**:
  1. Validates feedback is present
  2. Hashes email if provided
  3. Stores in KV
- **Output**: `{ success: true, message: "Feedback submitted successfully" }`

## Testing

### Development Mode

In development, the system:
- Logs all operations to console
- Skips actual email sending (logs instead)
- Skips KV storage (logs instead)

### Production Mode

In production:
- Emails are sent via Resend
- Data is stored in Vercel KV
- Errors are logged but don't break requests

## Email Template

The welcome email template includes:
- Gradient header: "Thanks for joining early access! 🎉"
- "Here's what to expect" section
- "50% Lifetime Discount" highlight box
- Contact information and privacy policy link

To customize, edit `src/lib/email.ts` → `getWelcomeEmailTemplate()`.

## Privacy & Security

- ✅ Emails are hashed before storage (SHA-256)
- ✅ One-way hashing (cannot be reversed)
- ✅ Duplicate detection without exposing emails
- ✅ Email failures don't expose errors to users
- ✅ All sensitive data is hashed

## Troubleshooting

### Emails not sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify domain is verified in Resend dashboard
3. Check Resend API logs for errors
4. Ensure `RESEND_FROM_EMAIL` matches verified domain

### Storage not working

1. Check `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set
2. Verify KV database exists in Vercel
3. Check Vercel logs for KV errors
4. In development, storage is skipped (expected)

### Build errors

1. Ensure all TypeScript types are correct
2. Check that `@/lib/hash`, `@/lib/storage`, `@/lib/email` are imported correctly
3. Verify Edge runtime compatibility (using Web Crypto API)

## Next Steps

- [ ] Set up Resend account and verify domain
- [ ] Create Vercel KV database
- [ ] Add environment variables to Vercel
- [ ] Test signup flow end-to-end
- [ ] Monitor email delivery rates
- [ ] Consider adding email unsubscribe functionality
- [ ] Set up PostgreSQL migration path (optional)


