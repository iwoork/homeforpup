# Fixing 401 Unauthorized Errors on Vercel

## Problem
All API routes return 401 Unauthorized on Vercel production, but work fine locally.

**Logs show:**
```
Kennels API - Session: {
  hasSession: false,
  hasUser: false,
  userId: undefined,
  userEmail: undefined
}
```

This means NextAuth is not creating/retrieving sessions properly on Vercel.

## Root Causes

1. **Missing `NEXTAUTH_SECRET`** - NextAuth requires this to sign JWTs in production
2. **Missing or incorrect `NEXTAUTH_URL`** - Must match your production domain exactly
3. **Environment variables not set on Vercel** - Local `.env.local` doesn't transfer to Vercel

## Step-by-Step Fix

### Step 1: Generate NEXTAUTH_SECRET

Run this command locally:
```bash
openssl rand -base64 32
```

Copy the output (e.g., `Ab3cD4fG5hI6jK7lM8nO9pQ0rS1tU2vW3xY4zA5bC6d=`)

### Step 2: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your breeder-app project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables (for **Production**, **Preview**, and **Development**):

#### Required Variables:

```bash
# NextAuth (CRITICAL)
NEXTAUTH_SECRET=<paste-the-secret-from-step-1>
NEXTAUTH_URL=https://<your-production-domain>.vercel.app

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>

# AWS Cognito
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=<your-cognito-client-id>
NEXT_PUBLIC_COGNITO_AUTHORITY=https://cognito-idp.us-east-1.amazonaws.com/<your-user-pool-id>
NEXT_PUBLIC_COGNITO_DOMAIN=https://<your-cognito-domain>.auth.us-east-1.amazoncognito.com

# DynamoDB Tables
ACTIVITIES_TABLE_NAME=homeforpup-activities
KENNELS_TABLE_NAME=homeforpup-kennels
DOGS_TABLE_NAME=homeforpup-dogs
LITTERS_TABLE_NAME=homeforpup-litters
USERS_TABLE_NAME=homeforpup-users

# Node Environment
NODE_ENV=production
```

### Step 3: Update AWS Cognito Callback URLs

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito)
2. Select your User Pool
3. Go to **App Integration** → **App clients** → Your app client
4. Add these URLs to **Allowed callback URLs**:
   ```
   https://<your-domain>.vercel.app/api/auth/callback/cognito
   https://<your-domain>.vercel.app/auth/callback
   ```
5. Add these URLs to **Allowed sign-out URLs**:
   ```
   https://<your-domain>.vercel.app/
   https://<your-domain>.vercel.app/auth/login
   ```

### Step 4: Redeploy on Vercel

After adding all environment variables:
1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

### Step 5: Verify the Fix

1. **Check Function Logs:**
   - Go to Vercel → Functions → Click on any API route
   - Look for the session log output
   - Should now show `hasSession: true` and a valid `userId`

2. **Test Authentication:**
   - Clear browser cookies
   - Go to production site
   - Login through Cognito
   - Try accessing `/api/kennels` or the dashboard
   - Should work without 401 errors

## Why This Happens

### Local vs Production Differences:

| Aspect | Local Development | Vercel Production |
|--------|------------------|-------------------|
| Environment | `.env.local` file loaded automatically | Must configure in Vercel UI |
| Cookies | HTTP cookies work | Requires HTTPS secure cookies |
| Secret | Optional (auto-generated) | **Required** |
| URL | `localhost:3000` | Production domain |

### NextAuth Behavior:

- **Local:** NextAuth auto-generates a secret if missing
- **Production:** NextAuth **requires** `NEXTAUTH_SECRET` to be explicitly set
- Without the secret, JWT tokens cannot be signed/verified → No session → 401 errors

## Troubleshooting

### Still Getting 401 After Configuration?

1. **Verify environment variables are set:**
   ```bash
   # In Vercel dashboard, check all variables are present
   ```

2. **Check Vercel function logs:**
   - Look for "Kennels API - Session" log
   - Should show environment variables are present

3. **Clear browser cookies and try again:**
   - Sometimes old cookies cause issues

4. **Check NEXTAUTH_URL format:**
   - Must include `https://`
   - Must NOT have trailing slash
   - Must match exactly: `https://your-domain.vercel.app`

5. **Verify Cognito configuration:**
   - Callback URLs must include production domain
   - Domain must be exactly as configured in Cognito

### Test Session Endpoint

Visit: `https://your-domain.vercel.app/api/auth/session`

- **If logged in:** Should return session object with user info
- **If not logged in:** Should return empty object `{}`
- **If 500 error:** Check `NEXTAUTH_SECRET` is set

## Quick Reference

**Most common fix:** Just add these two variables on Vercel:
```bash
NEXTAUTH_SECRET=<random-32-char-base64-string>
NEXTAUTH_URL=https://your-actual-domain.vercel.app
```

Then redeploy.

