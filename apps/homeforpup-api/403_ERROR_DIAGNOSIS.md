# 403 Forbidden Error Diagnosis Guide

If you're getting 403 errors on all API Gateway requests, follow this diagnostic guide.

## Common Causes

### 1. Invalid or Missing Authorization Header

**Symptom:** All requests return 403, even public endpoints

**Cause:** When a Cognito authorizer is attached to a method, it REQUIRES a valid JWT token in the Authorization header.

**Format Required:**
```
Authorization: Bearer <jwt-token>
```

**Fix:**
- Ensure your client is sending the Authorization header with the Bearer token
- For public endpoints (GET /dogs, GET /breeds), these should NOT require auth - verify they don't have authorizers attached
- For protected endpoints, ensure you're including a valid JWT token

### 2. Invalid Cognito User Pool ARN

**Symptom:** 403 errors on all requests, even with valid tokens

**Diagnosis:**
```bash
# Check if the User Pool ARN is correct
aws cognito-idp describe-user-pool \
  --user-pool-id us-east-1_VEufvIU7M \
  --region us-east-1

# Verify the ARN matches your config
echo $COGNITO_USER_POOL_ARN
```

**Fix:**
- Update `.env` file with correct `COGNITO_USER_POOL_ARN`
- Format: `arn:aws:cognito-idp:us-east-1:ACCOUNT_ID:userpool/USER_POOL_ID`
- Redeploy: `npm run deploy`

### 3. Expired or Invalid JWT Token

**Symptom:** 403 errors after some time, or with specific tokens

**Diagnosis:**
```bash
# Decode JWT token to check expiration (use jwt.io or jq)
echo "YOUR_TOKEN" | cut -d. -f2 | base64 -d | jq .

# Check token expiration
# Look for "exp" field - should be in the future
```

**Fix:**
- Refresh your authentication token
- Ensure tokens are not expired (typically valid for 1 hour)
- Re-authenticate with Cognito

### 4. Wrong Cognito User Pool

**Symptom:** 403 errors even with valid tokens from a different app

**Diagnosis:**
```bash
# Check which User Pool your token is from
# Tokens contain the User Pool ID in the "iss" claim

# Verify your config matches
cat apps/homeforpup-api/.env | grep COGNITO_USER_POOL_ID
```

**Fix:**
- Ensure you're using tokens from the correct Cognito User Pool
- Verify `COGNITO_USER_POOL_ID` in your config matches the User Pool that issued the token

### 5. API Gateway Authorizer Configuration Issue

**Symptom:** 403 errors on all requests, authorizer seems misconfigured

**Diagnosis:**
```bash
# Check API Gateway authorizer configuration
aws apigateway get-authorizers \
  --rest-api-id YOUR_API_ID \
  --region us-east-1

# Check if authorizer is attached to methods that shouldn't require auth
aws apigateway get-method \
  --rest-api-id YOUR_API_ID \
  --resource-id RESOURCE_ID \
  --http-method GET
```

**Fix:**
- Verify public endpoints (GET /dogs, GET /breeds) don't have authorizers attached
- Check that the authorizer is correctly configured in `lib/stacks/api-stack.ts`
- Redeploy if configuration changed

## Quick Diagnostic Steps

### Step 1: Test Public Endpoint (No Auth Required)

```bash
# This should work WITHOUT authentication
curl "https://YOUR_API_URL/development/breeds?limit=5"
```

**Expected:** 200 OK with breeds data  
**If 403:** Check if authorizer is incorrectly attached to this endpoint

### Step 2: Test with Valid Token

```bash
# Get a valid JWT token from Cognito
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

**Expected:** 200 OK or 404 if user doesn't exist  
**If 403:** Token is invalid, expired, or from wrong User Pool

### Step 3: Verify Cognito Configuration

```bash
cd apps/homeforpup-api

# Check environment variables
cat .env | grep COGNITO

# Verify User Pool exists
aws cognito-idp describe-user-pool \
  --user-pool-id $(grep COGNITO_USER_POOL_ID .env | cut -d= -f2) \
  --region us-east-1
```

### Step 4: Check API Gateway Logs

```bash
# Enable API Gateway logging if not already enabled
# Then check CloudWatch logs for detailed error messages

aws logs tail /aws/apigateway/homeforpup-api-development --follow
```

## Common Fixes

### Fix 1: Update Cognito User Pool ARN

```bash
cd apps/homeforpup-api

# Edit .env file
vim .env

# Update COGNITO_USER_POOL_ARN
COGNITO_USER_POOL_ARN=arn:aws:cognito-idp:us-east-1:ACCOUNT_ID:userpool/us-east-1_VEufvIU7M

# Redeploy
npm run deploy -- --context environment=development
```

### Fix 2: Ensure Tokens Include Bearer Prefix

```javascript
// ✅ Correct
headers: {
  'Authorization': `Bearer ${token}`
}

// ❌ Wrong - will cause 403
headers: {
  'Authorization': token  // Missing "Bearer " prefix
}
```

### Fix 3: Verify Public Endpoints Don't Require Auth

Check `lib/stacks/api-stack.ts` - public endpoints should NOT have authorizer:

```typescript
// ✅ Public endpoint - no authorizer
dogsResource.addMethod('GET', listDogsFunction.createIntegration());

// ❌ Protected endpoint - has authorizer
dogsResource.addMethod('POST', createDogFunction.createIntegration(), {
  authorizer: this.authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});
```

### Fix 4: Refresh Expired Tokens

If tokens are expired, refresh them:

```javascript
// Using AWS Amplify or Cognito SDK
import { Auth } from 'aws-amplify';

// This will automatically refresh expired tokens
const session = await Auth.currentSession();
const token = session.getIdToken().getJwtToken();
```

## Testing After Fix

```bash
# 1. Test public endpoint (no auth)
curl "https://YOUR_API_URL/development/breeds?limit=5"

# 2. Test protected endpoint (with auth)
curl -H "Authorization: Bearer $VALID_TOKEN" \
  "https://YOUR_API_URL/development/profiles/USER_ID"

# 3. Test CORS preflight (OPTIONS)
curl -X OPTIONS \
  -H "Origin: https://homeforpup.com" \
  -H "Access-Control-Request-Method: GET" \
  "https://YOUR_API_URL/development/breeds"
```

## Still Getting 403?

1. **Check CloudWatch Logs** for detailed error messages
2. **Verify API Gateway Stage** - ensure you're hitting the correct stage (`/development` or `/production`)
3. **Check IAM Permissions** - ensure API Gateway has permission to invoke Cognito
4. **Review Recent Changes** - did you recently update the authorizer configuration?
5. **Test with AWS Console** - use API Gateway test feature to isolate the issue

## Getting Help

If none of these fixes work:

1. Check CloudWatch Logs for the specific error message
2. Verify the exact endpoint and method that's failing
3. Check if the error is consistent or intermittent
4. Review recent deployment logs: `cat deploy.log`

## Related Files

- `lib/stacks/api-stack.ts` - API Gateway and authorizer configuration
- `lib/config/environments.ts` - Environment configuration including Cognito settings
- `src/middleware/auth.ts` - Lambda-side authentication helpers

