# Dogs Endpoint 401 Fix

## Issue

Getting 401 Unauthorized when calling `https://api.homeforpup.com/dogs`

## Root Cause

The API Gateway was configured to **require Cognito authentication** for the GET /dogs endpoint, but the Lambda function itself handles authentication **optionally**. This creates a mismatch:

- **API Gateway:** Rejects requests without valid Cognito token (returns 401)
- **Lambda Handler:** Designed to work with OR without authentication (optional)

## The Fix

### Updated API Gateway Configuration

Changed the dogs endpoint from **required auth** to **optional auth** (no authorizer):

**Before:**

```typescript
dogsResource.addMethod('GET', listDogsFunction.createIntegration(), {
  authorizer: this.authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});
```

**After:**

```typescript
// GET /dogs does not require auth (optional auth handled in Lambda)
dogsResource.addMethod('GET', listDogsFunction.createIntegration());
```

### Why This Makes Sense

The dogs listing endpoint should be **public** (browsable without authentication) because:

1. ✅ Dog Parents need to browse dogs without logging in
2. ✅ SEO and discoverability
3. ✅ Better user experience (browse first, login to contact)
4. ✅ The Lambda already handles optional auth (shows more data if authenticated)

### What Still Requires Auth

These endpoints still require authentication:

| Endpoint          | Auth Required | Why                           |
| ----------------- | ------------- | ----------------------------- |
| POST /dogs        | ✅ Yes        | Only breeders can create dogs |
| PUT /dogs/{id}    | ✅ Yes        | Only owner can update         |
| DELETE /dogs/{id} | ✅ Yes        | Only owner can delete         |
| GET /dogs         | ❌ No         | Public browsing               |
| GET /dogs/{id}    | ❌ No         | Public viewing                |

## Deployment

To apply this fix:

```bash
cd apps/homeforpup-api
npm run deploy
```

This will update the API Gateway configuration to allow public access to GET /dogs endpoints.

## Testing

### Without Authentication

```bash
# This should now work without a token
curl "https://api.homeforpup.com/dogs?limit=5"
```

Expected response:

```json
{
  "dogs": [...],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 10,
    "totalPages": 2
  }
}
```

### With Authentication

```bash
# With token, might show more data (private fields)
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.homeforpup.com/dogs?limit=5"
```

## Benefits

1. ✅ **No more 401 errors** for dog listing
2. ✅ **Public access** for browsing dogs
3. ✅ **Optional auth** - more data when authenticated
4. ✅ **Better UX** - users can browse before signing up
5. ✅ **Consistent with web apps** - both allow public dog browsing

## Alternative: Keep Auth Required

If you want to keep authentication required for dogs endpoint:

### Option 1: Update Lambda to Require Auth

```typescript
// src/functions/dogs/list/index.ts
async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  // Require authentication
  let userId: string;
  try {
    userId = requireAuth(getUserIdFromEvent(event as any));
  } catch (error: any) {
    return errorResponse('Unauthorized', 401);
  }

  // Rest of handler...
}
```

### Option 2: Ensure Mobile App Sends Token

Make sure the mobile app is:

1. Using ID token (not access token) ✅ Already fixed
2. Including Authorization header ✅ Already implemented
3. Token is not expired
4. Token format is correct: `Bearer eyJhbG...`

## Current Status

**Recommendation:** Deploy the fix to make dogs endpoint public (matches expected behavior)

**Status:**

- ✅ Code updated in API stack
- ⏳ Needs deployment to take effect
- 🚀 Ready to deploy with: `cd apps/homeforpup-api && npm run deploy`

## Mobile App Impact

**Before Fix:**

```typescript
// Mobile app calls dogs endpoint
const result = await apiService.getDogs({ limit: 5 });
// Result: 401 Unauthorized error
```

**After Fix:**

```typescript
// Mobile app calls dogs endpoint
const result = await apiService.getDogs({ limit: 5 });
// Result: Success! Returns list of dogs
```

No changes needed in mobile app code - it will just work!

## Verification Checklist

After deploying:

- [ ] Test `GET /dogs` without token → should return 200
- [ ] Test `GET /dogs` with token → should return 200
- [ ] Test `GET /dogs/{id}` without token → should return 200
- [ ] Test `POST /dogs` without token → should return 401
- [ ] Test mobile app dogs screen → should load successfully

## Related Files

- `/apps/homeforpup-api/lib/stacks/api-stack.ts` - API Gateway configuration
- `/apps/homeforpup-api/src/functions/dogs/list/index.ts` - Dogs list Lambda
- `/apps/mobile-app/src/services/apiService.ts` - Mobile app API calls

## Summary

✅ **Fixed:** Changed dogs endpoint from required auth to optional auth  
🚀 **Action:** Deploy with `cd apps/homeforpup-api && npm run deploy`  
⏱️ **Time:** ~5 minutes to deploy  
📱 **Mobile App:** No changes needed

---

**Last Updated:** October 8, 2025  
**Issue:** 401 Unauthorized on /dogs  
**Root Cause:** Auth required at gateway, optional in Lambda  
**Fix:** Make auth optional at gateway level  
**Status:** ✅ Code updated, pending deployment
