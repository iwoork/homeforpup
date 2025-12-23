# 🔒 Environment Variables Security Guide

## ⚠️ CRITICAL SECURITY FIX APPLIED

**Issue Found:** AWS credentials (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`) were being exposed to the client-side through Next.js `env` configuration.

**Fix Applied:** Removed AWS credentials from all `next.config.js` files to prevent client-side exposure.

## 🚨 Security Rules

### ❌ NEVER Expose These Variables to Client-Side

These variables should **NEVER** be prefixed with `NEXT_PUBLIC_` or included in `next.config.js` env:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `NEXTAUTH_SECRET`
- `DATABASE_URL`
- `JWT_SECRET`
- `API_SECRET_KEY`
- Any database credentials
- Any private API keys
- Any encryption keys

### ✅ Safe to Expose (NEXT_PUBLIC_ prefix)

These variables are intentionally public and safe to expose:

- `NEXT_PUBLIC_AWS_REGION` - AWS region (not sensitive)
- `NEXT_PUBLIC_AWS_USER_POOL_ID` - Cognito User Pool ID (public identifier)
- `NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID` - Cognito Client ID (public identifier)
- `NEXT_PUBLIC_AWS_S3_BUCKET` - S3 bucket name (public identifier)
- `NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN` - Custom domain (public)
- `NEXT_PUBLIC_API_BASE_URL` - API endpoint URL (public)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key (designed for client use)
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID (public)

## 🔧 How to Use Sensitive Variables Safely

### Server-Side Only (API Routes, Server Components)

```typescript
// ✅ CORRECT - Server-side only
export async function POST(request: Request) {
  const awsCredentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  };
  
  // Use credentials here
}
```

### Client-Side (React Components)

```typescript
// ✅ CORRECT - Use public variables only
const region = process.env.NEXT_PUBLIC_AWS_REGION;
const userPoolId = process.env.NEXT_PUBLIC_AWS_USER_POOL_ID;

// ❌ WRONG - This will be undefined on client-side
const secretKey = process.env.AWS_SECRET_ACCESS_KEY; // undefined
```

## 🛡️ Security Best Practices

1. **Environment Variable Naming:**
   - Use `NEXT_PUBLIC_` prefix ONLY for variables that should be public
   - Never use `NEXT_PUBLIC_` for sensitive data

2. **Next.js Configuration:**
   - Only include public variables in `next.config.js` env section
   - Add security comments explaining why variables are excluded

3. **Code Review Checklist:**
   - [ ] No AWS credentials in client-side code
   - [ ] No `NEXT_PUBLIC_` prefix on sensitive variables
   - [ ] No console.log of sensitive environment variables
   - [ ] No hardcoded credentials in source code

4. **Deployment:**
   - Set sensitive variables in your deployment platform's environment settings
   - Never commit `.env` files with real credentials
   - Use different credentials for different environments

## 🔍 Files Fixed

- `/next.config.js` - Removed AWS credentials exposure
- `/apps/breeder-app/next.config.js` - Removed AWS credentials exposure  
- `/apps/dog-parent-app/next.config.js` - Removed AWS credentials exposure
- `/apps/mobile-app/src/config/config.ts` - Removed hardcoded credentials and console logging

## 🚨 Immediate Action Required

1. **Rotate AWS Credentials:** If these credentials were ever deployed, rotate them immediately
2. **Check Deployment Logs:** Look for any exposure of credentials in client-side bundles
3. **Update Environment Files:** Ensure `.env` files don't contain sensitive data in version control

## 📚 Additional Resources

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [AWS Security Best Practices](https://docs.aws.amazon.com/security/)
- [OWASP Environment Variables Security](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_credentials)
