# 403 Error Fix Summary

## Changes Made

### 1. Enhanced Authorizer Configuration
- Added result caching (5 minutes) to improve performance
- Added validation logging for Cognito User Pool ARN
- Added CloudFormation outputs for debugging (AuthorizerId, CognitoUserPoolId)

### 2. Created Diagnostic Tools
- **403_ERROR_DIAGNOSIS.md** - Comprehensive troubleshooting guide
- **scripts/diagnose-403.js** - Automated diagnostic script

## Most Likely Causes

Based on the code review, the 403 errors are most likely caused by:

### 1. **Invalid Cognito User Pool ARN** (Most Common)
The authorizer is configured with `config.cognitoUserPoolArn`. If this ARN is incorrect or doesn't match the actual User Pool, all token validations will fail.

**Check:**
```bash
cd apps/homeforpup-api
cat .env | grep COGNITO_USER_POOL_ARN

# Verify it matches the actual User Pool
aws cognito-idp describe-user-pool \
  --user-pool-id us-east-1_VEufvIU7M \
  --region us-east-1 \
  --query 'UserPool.Arn'
```

**Fix:** Update `COGNITO_USER_POOL_ARN` in `.env` file and redeploy.

### 2. **Missing or Incorrect Authorization Header**
When a Cognito authorizer is attached to a method, it REQUIRES:
```
Authorization: Bearer <jwt-token>
```

**Common Mistakes:**
- Missing "Bearer " prefix: `Authorization: <token>` ❌
- Wrong header name: `Auth: Bearer <token>` ❌
- No header at all for protected endpoints ❌

**Fix:** Ensure all requests to protected endpoints include:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### 3. **Expired or Invalid Tokens**
JWT tokens from Cognito typically expire after 1 hour.

**Check:**
- Decode your JWT token at jwt.io
- Look for the `exp` field - should be a timestamp in the future
- Verify the `iss` (issuer) matches your Cognito User Pool

**Fix:** Refresh tokens before they expire or implement automatic token refresh.

### 4. **Public Endpoints Incorrectly Requiring Auth**
Some endpoints like `GET /dogs` and `GET /breeds` should be public (no auth required).

**Check:** Verify these endpoints don't have authorizers attached in `lib/stacks/api-stack.ts`:
- Line 137: `GET /dogs` - should NOT have authorizer ✅
- Line 156: `GET /dogs/{id}` - should NOT have authorizer ✅
- Line 787: `GET /breeds` - should NOT have authorizer ✅

## Immediate Action Steps

### Step 1: Run Diagnostic Script
```bash
cd apps/homeforpup-api
node scripts/diagnose-403.js
```

This will check:
- ✅ Cognito User Pool exists and ARN matches
- ✅ API Gateway is deployed
- ✅ Public endpoints work without auth
- ✅ Authorizer configuration

### Step 2: Verify Environment Configuration
```bash
cd apps/homeforpup-api

# Check your .env file
cat .env | grep COGNITO

# Should have:
# COGNITO_USER_POOL_ID=us-east-1_XXXXX
# COGNITO_USER_POOL_ARN=arn:aws:cognito-idp:us-east-1:ACCOUNT:userpool/us-east-1_XXXXX
# COGNITO_CLIENT_ID=XXXXX
```

### Step 3: Test Public Endpoint
```bash
# This should work WITHOUT authentication
curl "https://YOUR_API_URL/development/breeds?limit=5"
```

**Expected:** 200 OK  
**If 403:** The authorizer is incorrectly attached to this endpoint

### Step 4: Test with Valid Token
```bash
# Get a valid token (replace with your credentials)
TOKEN=$(aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id YOUR_CLIENT_ID \
  --auth-parameters USERNAME=test@example.com,PASSWORD=Test123! \
  --region us-east-1 \
  --query 'AuthenticationResult.IdToken' \
  --output text)

# Test protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
  "https://YOUR_API_URL/development/profiles/USER_ID"
```

**Expected:** 200 OK or 404  
**If 403:** Token is invalid, expired, or from wrong User Pool

## If Still Getting 403

### Check CloudWatch Logs
```bash
# Enable API Gateway logging if not already enabled
# Then check logs for detailed error messages

aws logs tail /aws/apigateway/homeforpup-api-development --follow
```

### Verify API Gateway Stage
Make sure you're using the correct stage in the URL:
- Development: `https://API_ID.execute-api.us-east-1.amazonaws.com/development`
- Production: `https://API_ID.execute-api.us-east-1.amazonaws.com/production`

### Check Recent Deployments
```bash
# Review recent deployment logs
cat apps/homeforpup-api/deploy.log | tail -50

# Check if authorizer configuration changed
git log --oneline --all -10 -- apps/homeforpup-api/lib/stacks/api-stack.ts
```

## Next Steps

1. **Run the diagnostic script** to identify the specific issue
2. **Review 403_ERROR_DIAGNOSIS.md** for detailed troubleshooting
3. **Check CloudWatch Logs** for specific error messages
4. **Verify token format** - ensure "Bearer " prefix is included
5. **Test with a fresh token** - get a new token from Cognito

## Files Modified

- `lib/stacks/api-stack.ts` - Enhanced authorizer configuration with validation
- `403_ERROR_DIAGNOSIS.md` - Comprehensive troubleshooting guide (NEW)
- `scripts/diagnose-403.js` - Automated diagnostic script (NEW)
- `403_FIX_SUMMARY.md` - This file (NEW)

## Related Documentation

- `DEPLOYMENT.md` - Deployment guide
- `ARCHITECTURE.md` - API architecture overview
- `API_ENDPOINTS.md` - API endpoint documentation

