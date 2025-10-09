# Custom Domain Authorization Issue

## Problem

Getting 403 errors with "Invalid key=value pair" when using `api.homeforpup.com`:

```
ERROR: Invalid key=value pair (missing equal-sign) in Authorization header
URL: https://api.homeforpup.com/development/dogs
```

## Root Cause

The custom domain (`api.homeforpup.com`) is configured with **AWS Signature Version 4** (SigV4) authentication, which expects AWS-signed requests, not Bearer tokens.

### Why This Happens

There are two ways to access the API:

1. **Direct API Gateway URL** (works):

   ```
   https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/
   ```

   - Configured for Cognito Bearer token authentication ✅
   - Accepts: `Authorization: Bearer eyJhbGciOi...`

2. **Custom Domain** (broken):
   ```
   https://api.homeforpup.com/development/
   ```
   - Configured for AWS SigV4 signature authentication ❌
   - Expects: `Authorization: AWS4-HMAC-SHA256 Credential=...`
   - Rejects Bearer tokens as invalid signatures

## Quick Fix: Use Direct URL

I've updated the mobile app to use the direct API Gateway URL:

```typescript
baseUrl: 'https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development';
```

**Action Required:**

1. Kill the Metro bundler (Ctrl+C)
2. Restart with cache reset:
   ```bash
   cd apps/mobile-app
   npx react-native start --reset-cache
   ```
3. In another terminal, rebuild the app:
   ```bash
   npm run ios  # or npm run android
   ```

## Long-Term Fix: Configure Custom Domain Properly

The custom domain needs to be configured to pass through Authorization headers instead of treating them as AWS signatures.

### Option 1: Remove AWS_IAM Authorization (Recommended)

The custom domain might have AWS_IAM authorization enabled. This needs to be removed.

**Check current configuration:**

```bash
aws apigatewayv2 get-apis --query 'Items[?Name==`api.homeforpup.com`]'
```

### Option 2: Use API Gateway HTTP API Instead of REST API

HTTP APIs don't have this issue with custom domains.

### Option 3: Use Different Domain for Development

- `api-dev.homeforpup.com` → development (with proper config)
- `api.homeforpup.com` → production

## Testing

### Test Direct URL (Should Work)

```bash
TOKEN="your-id-token"
curl -H "Authorization: Bearer $TOKEN" \
  "https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/dogs"
```

Expected: 200 OK ✅

### Test Custom Domain (Currently Broken)

```bash
TOKEN="your-id-token"
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.homeforpup.com/development/dogs"
```

Expected: 403 Forbidden ❌
Error: "Invalid key=value pair"

## Why Custom Domains Can Have Different Auth

Custom domains in API Gateway can have:

1. Different authorizers
2. Different authentication methods
3. Different CORS settings
4. Different resource policies

The domain mapping layer can override the API configuration.

## How to Fix Custom Domain

### Step 1: Check Domain Configuration

```bash
# Get custom domain info
aws apigateway get-domain-name --domain-name api.homeforpup.com

# Check base path mapping
aws apigateway get-base-path-mappings --domain-name api.homeforpup.com
```

### Step 2: Check API Resource Policy

The API might have a resource policy that requires AWS_IAM auth for custom domains:

```bash
aws apigateway get-rest-api --rest-api-id 822fu3f7bk \
  --query 'policy' --output text
```

### Step 3: Remove AWS_IAM Requirement

If there's a resource policy requiring AWS_IAM, update it:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "execute-api:Invoke",
      "Resource": "arn:aws:execute-api:us-east-1:*:822fu3f7bk/*"
    }
  ]
}
```

### Step 4: Redeploy API

```bash
cd apps/homeforpup-api
npm run deploy
```

## Current Workaround

Using the direct API Gateway URL bypasses the custom domain issues:

```typescript
// Mobile app config
baseUrl: 'https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development';
```

This works perfectly with Bearer token authentication.

## Summary

✅ **Short-term:** Use direct API Gateway URL (already configured)  
⏳ **Long-term:** Fix custom domain to support Bearer tokens  
🚀 **Action:** Restart app with cache reset to pick up URL change

---

**Status:** Using direct URL as workaround  
**Custom Domain:** Needs configuration fix  
**Direct URL:** Working ✅
