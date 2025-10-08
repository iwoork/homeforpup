# API Stage Prefix Fix

## Issue

The mobile app was calling `https://api.homeforpup.com/dogs` but the actual API is at `https://api.homeforpup.com/development/dogs`.

## Root Cause

AWS API Gateway uses **stage-based deployment**. The stage name (`development`) is included in the URL path:

```
https://api.homeforpup.com/[STAGE]/[ENDPOINT]
                            ^^^^^^
                            Stage name required!
```

## The Fix

Added the `/development` stage prefix back to the mobile app configuration.

**Before:**

```typescript
baseUrl: 'https://api.homeforpup.com';
```

**After:**

```typescript
baseUrl: 'https://api.homeforpup.com/development';
```

## Why API Gateway Uses Stages

API Gateway stages allow multiple environments on the same domain:

- `https://api.homeforpup.com/development` - Development
- `https://api.homeforpup.com/staging` - Staging
- `https://api.homeforpup.com/production` - Production

## Correct URLs

### Development

```bash
# Base URL
https://api.homeforpup.com/development

# Example endpoints
https://api.homeforpup.com/development/dogs
https://api.homeforpup.com/development/breeds
https://api.homeforpup.com/development/kennels
https://api.homeforpup.com/development/users/{id}
```

### Production (when deployed)

```bash
# Base URL
https://api.homeforpup.com/production

# Example endpoints
https://api.homeforpup.com/production/dogs
https://api.homeforpup.com/production/breeds
```

## Mobile App Changes

### Updated Files

1. `src/config/config.ts` - Added `/development` to base URLs
2. `API_INTEGRATION.md` - Updated all documentation with stage prefix

### No Rebuild Needed

Since the change is in the config file, just:

1. Restart the mobile app
2. The new URLs will be used automatically

## Testing

### Test the Correct URL

```bash
# This should work (with stage)
curl "https://api.homeforpup.com/development/breeds?limit=5"

# This won't work (without stage)
curl "https://api.homeforpup.com/breeds?limit=5"
```

## Removing the Stage Prefix (Optional)

If you want cleaner URLs without `/development`, you have two options:

### Option 1: Custom Domain Mapping

Configure API Gateway to map the root domain directly to a stage:

```typescript
// In CDK stack
new apigateway.BasePathMapping(this, 'BasePathMapping', {
  domainName: domain,
  restApi: this.api,
  stage: this.api.deploymentStage,
  basePath: '', // Empty = no prefix
});
```

Then set environment-specific domains:

- `dev-api.homeforpup.com` → development stage
- `api.homeforpup.com` → production stage

### Option 2: CloudFront Distribution

Use CloudFront to rewrite URLs:

- Users call: `https://api.homeforpup.com/dogs`
- CloudFront rewrites to: `https://api.homeforpup.com/development/dogs`

## Current Configuration

### Development

```typescript
baseUrl: 'https://api.homeforpup.com/development';
```

### Production (when ready)

```typescript
baseUrl: 'https://api.homeforpup.com/production';
```

## Environment Variables

You can override the base URL using environment variables:

```bash
# .env
NEXT_PUBLIC_API_BASE_URL=https://api.homeforpup.com/development
```

For different environments:

```bash
# Development
NEXT_PUBLIC_API_BASE_URL=https://api.homeforpup.com/development

# Staging
NEXT_PUBLIC_API_BASE_URL=https://api.homeforpup.com/staging

# Production
NEXT_PUBLIC_API_BASE_URL=https://api.homeforpup.com/production
```

## Verification

After the fix, your logs should show:

```javascript
LOG  API request with auth: {
  "endpoint": "/dogs?page=1&limit=100",
  "hasAuth": true,
  "tokenLength": 1071
}

// Full URL being called:
// https://api.homeforpup.com/development/dogs?page=1&limit=100
```

## Common Mistakes

❌ **Wrong:** `https://api.homeforpup.com/dogs`  
✅ **Correct:** `https://api.homeforpup.com/development/dogs`

❌ **Wrong:** `https://api.homeforpup.com//development/dogs` (double slash)  
✅ **Correct:** `https://api.homeforpup.com/development/dogs`

## Summary

✅ **Fixed:** Added `/development` stage prefix to base URL  
🔄 **Action:** Restart mobile app to use new configuration  
⏱️ **Time:** Immediate (no rebuild needed)  
📱 **Impact:** All API calls will now use correct URLs

---

**Last Updated:** October 8, 2025  
**Issue:** Missing `/development` stage prefix  
**Fix:** Added stage prefix to base URL  
**Status:** ✅ Fixed
