# User Pool ID Configuration Fix

## Problem

The API Gateway was using an old/incorrect Cognito User Pool ID instead of the one from the root `.env` file, causing all API requests to return 403 Forbidden errors.

## Root Cause

The environment configuration was not properly loading the root `.env` file due to:
1. **Path resolution issue**: When TypeScript compiles, `__dirname` points to `dist/bin` instead of the source location
2. **Missing fallback paths**: Only one path was tried, which failed when running from different locations
3. **Insufficient logging**: No visibility into which values were actually being loaded

## Solution

### 1. Fixed Path Resolution (`bin/api.ts`)

Updated the `.env` file loading to try multiple paths:

```typescript
// Try multiple paths to find the root .env file
const possibleEnvPaths = [
  path.resolve(__dirname, '../../../.env'), // From dist/bin to root
  path.resolve(__dirname, '../../../../.env'), // From dist/bin (if nested deeper)
  path.resolve(process.cwd(), '.env'), // Current working directory
  path.resolve(process.cwd(), '../.env'), // Parent of current directory
  path.resolve(process.cwd(), '../../.env'), // Two levels up
];
```

### 2. Added Debug Logging (`lib/config/environments.ts`)

Added comprehensive logging to show:
- Which `.env` file is being loaded
- What values are found for each environment variable
- Which variable name was used (COGNITO_USER_POOL_ID vs NEXT_PUBLIC_AWS_USER_POOL_ID)

### 3. Created Diagnostic Script

Created `scripts/check-env-config.js` to verify configuration:

```bash
cd apps/homeforpup-api
node scripts/check-env-config.js
```

## How to Verify the Fix

### Step 1: Check Environment Configuration

```bash
cd apps/homeforpup-api
node scripts/check-env-config.js
```

This will show:
- Which `.env` file is being loaded
- What User Pool ID is found
- What Client ID is found
- What User Pool ARN is found

### Step 2: Verify Root .env File

Make sure your root `.env` file contains the correct values:

```bash
# From project root
cat .env | grep -E "(USER_POOL|COGNITO)"
```

Should show something like:
```
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=XXXXXXXXX
```

### Step 3: Test Configuration Loading

When you deploy, you should now see detailed logging:

```bash
cd apps/homeforpup-api
npm run deploy -- --context environment=development
```

Look for output like:
```
📁 Loading environment from: /path/to/.env
✅ Loaded X environment variables from /path/to/.env

🔍 Environment Configuration Debug:
   Region: us-east-1
   User Pool ID: us-east-1_XXXXXXXXX
   User Pool ARN: arn:aws:cognito-idp:...
   Client ID: XXXXXXXXX
```

### Step 4: Redeploy API

After verifying the configuration is correct:

```bash
cd apps/homeforpup-api
npm run build
npm run deploy -- --context environment=development
```

## Expected Behavior

After the fix:

1. **During deployment**, you'll see:
   - Which `.env` file is being loaded
   - What Cognito values are found
   - Clear error messages if values are missing

2. **API Gateway authorizer** will use the correct User Pool ID from your root `.env` file

3. **403 errors should stop** because tokens will be validated against the correct User Pool

## Troubleshooting

### Issue: Still seeing old User Pool ID

**Check:**
1. Which `.env` file is being loaded (check deployment logs)
2. If there's a local `.env` file in `apps/homeforpup-api/` that might override root `.env`
3. If environment variables are set in your shell (they take precedence)

**Fix:**
```bash
# Remove any local .env files that might override
rm apps/homeforpup-api/.env

# Check shell environment variables
env | grep -i cognito

# Unset if needed
unset COGNITO_USER_POOL_ID
unset NEXT_PUBLIC_AWS_USER_POOL_ID
```

### Issue: .env file not found

**Check:**
```bash
# Verify root .env exists
ls -la .env

# Check if it's in the right location
pwd  # Should be in project root
```

**Fix:**
- Ensure `.env` file exists in the project root
- Or create it from `env.local.example`

### Issue: Wrong values still being used

**Check:**
1. Run the diagnostic script: `node scripts/check-env-config.js`
2. Check deployment logs for the "Environment Configuration Debug" section
3. Verify the root `.env` file has the correct values

**Fix:**
- Update root `.env` file with correct values
- Redeploy: `npm run deploy`

## Files Modified

- `bin/api.ts` - Enhanced .env file loading with multiple path fallbacks
- `lib/config/environments.ts` - Added comprehensive debug logging
- `scripts/check-env-config.js` - New diagnostic script (NEW)

## Related Documentation

- `403_ERROR_DIAGNOSIS.md` - General 403 error troubleshooting
- `403_FIX_SUMMARY.md` - Summary of 403 fixes
- `DEPLOYMENT.md` - Deployment guide

