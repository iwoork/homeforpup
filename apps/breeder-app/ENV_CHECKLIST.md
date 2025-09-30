# Vercel Environment Variables Checklist

## 🚨 CRITICAL - These MUST be set on Vercel

### 1. NextAuth Secret
```bash
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
```
**Status on Vercel:** Check logs - if `hasNextAuthSecret: false`, this is missing!

### 2. NextAuth URL
```bash
NEXTAUTH_URL=https://your-exact-production-domain.vercel.app
```
**Must match exactly - no trailing slash!**

### 3. NextAuth Trust Host (Vercel Required)
```bash
NEXTAUTH_TRUST_HOST=true
```
**Required for Vercel and other proxy environments**

## 📋 Full Environment Variables List

Copy these to Vercel Dashboard → Settings → Environment Variables:

```bash
# NextAuth (REQUIRED FOR PRODUCTION)
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXTAUTH_TRUST_HOST=true

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# AWS Cognito (Public)
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=
NEXT_PUBLIC_COGNITO_AUTHORITY=
NEXT_PUBLIC_COGNITO_DOMAIN=

# DynamoDB Tables
ACTIVITIES_TABLE_NAME=homeforpup-activities
KENNELS_TABLE_NAME=homeforpup-kennels
DOGS_TABLE_NAME=homeforpup-dogs
LITTERS_TABLE_NAME=homeforpup-litters
USERS_TABLE_NAME=homeforpup-users

# Environment
NODE_ENV=production
```

## 🔍 Debugging Steps

### Check what's missing from logs:

The enhanced logging now shows:
```json
{
  "env": {
    "hasNextAuthSecret": false,  // ❌ If false, add NEXTAUTH_SECRET
    "hasNextAuthUrl": false,      // ❌ If false, add NEXTAUTH_URL
    "nodeEnv": "production"
  }
}
```

### Test Session Creation:

1. Visit: `https://your-domain.vercel.app/api/auth/session`
2. Expected responses:
   - **Logged in:** `{ "user": { "email": "...", "id": "..." } }`
   - **Not logged in:** `{}`
   - **500 Error:** NEXTAUTH_SECRET is missing or invalid

## ⚡ Quick Fix Commands

### 1. Generate secret:
```bash
openssl rand -base64 32
```

### 2. Set on Vercel (using Vercel CLI):
```bash
vercel env add NEXTAUTH_SECRET
# Paste the generated secret when prompted

vercel env add NEXTAUTH_URL
# Enter: https://your-domain.vercel.app
```

### 3. Redeploy:
```bash
vercel --prod
```

## ✅ Verification

After deploying with correct environment variables:

1. **Check Vercel Function Logs:**
   - Should see: `hasSession: true`
   - Should see: `userId: "cognito-user-id"`

2. **Test API Route:**
   - Visit: `/api/kennels`
   - Should return kennels data instead of 401

3. **Login Flow:**
   - Login should work
   - Dashboard should load
   - All API calls should succeed

## 🎯 Most Common Issue

**99% of the time, it's just missing `NEXTAUTH_SECRET` on Vercel!**

The session logs will confirm:
- `hasNextAuthSecret: false` → Add the secret
- `hasSession: false` → Either secret is missing or wrong

## Need Help?

Check the full `VERCEL_SETUP.md` for detailed configuration and troubleshooting.

