# Kennels Endpoint Issue

## Current Issue

**Error:** 401 Unauthorized when accessing `https://api.homeforpup.com/kennels`

## Root Cause

The kennels endpoint is **not deployed** to the AWS API Gateway (`api.homeforpup.com`). It only exists in the breeder-app (Next.js application), which is hosted separately.

### Endpoint Locations

| Endpoint   | Available On             | URL                                           | Status             |
| ---------- | ------------------------ | --------------------------------------------- | ------------------ |
| `/kennels` | Breeder App (Next.js)    | `https://breeders.homeforpup.com/api/kennels` | ✅ Working         |
| `/kennels` | API Gateway (AWS Lambda) | `https://api.homeforpup.com/kennels`          | 🚀 Ready to deploy |

## Why the Error Occurs

1. **Mobile app** is configured to use: `https://api.homeforpup.com`
2. **Kennels endpoint** only exists at: `https://breeders.homeforpup.com/api/kennels`
3. When the mobile app calls `https://api.homeforpup.com/kennels`, it gets a 404 or 401 because the endpoint doesn't exist

## Token Type Fix

Additionally, I've fixed the token type issue:

### Before (Incorrect)

```typescript
// Was using access token
const tokenObj = session.tokens?.accessToken;
```

### After (Correct)

```typescript
// Now using ID token
const tokenObj = session.tokens?.idToken;
```

The kennels endpoint (and most backend endpoints) expect an **ID token**, not an access token. ID tokens contain user identity information, while access tokens are for resource authorization.

## Solutions

### Option 1: Wait for Deployment (Recommended)

Wait for the kennels endpoint to be deployed to AWS API Gateway following the migration guide.

**Status:** Pending deployment

### Option 2: Use Breeder App Endpoint (Temporary)

Temporarily point the mobile app to the breeder-app for kennels.

**Implementation:**

```typescript
// src/config/config.ts
export const config = {
  api: {
    // Primary API for dogs, breeds, users
    baseUrl: Config.NEXT_PUBLIC_API_BASE_URL || 'https://api.homeforpup.com',

    // Temporary: Breeder app for kennels, activities
    breederAppUrl: 'https://breeders.homeforpup.com',

    timeout: 30000,
  },
};
```

```typescript
// src/services/apiService.ts
async getKennels(params: any): Promise<ApiResponse<KennelsResponse>> {
  const queryParams = new URLSearchParams();
  // ... build params

  // Temporarily use breeder app URL
  const url = `${config.api.breederAppUrl}/api/kennels?${queryParams.toString()}`;

  return this.makeRequest<KennelsResponse>(url);
}
```

**Note:** This requires CORS to be configured on the breeder-app to allow requests from the mobile app.

### Option 3: Deploy Kennels to API Gateway ✅ READY

Deploy the kennels endpoint to AWS API Gateway so it's available at `https://api.homeforpup.com/kennels`.

**Status:** Lambda functions and API Gateway configuration are complete! Just needs deployment.

**Quick Deploy:**

```bash
cd apps/homeforpup-api
npm run deploy
```

**Detailed Guide:** See `/apps/homeforpup-api/KENNELS_DEPLOYMENT_GUIDE.md` or `/apps/homeforpup-api/DEPLOY_NOW.md`

**What's Included:**

- ✅ GET /kennels - List kennels (with auth)
- ✅ GET /kennels/{id} - Get kennel by ID
- ✅ POST /kennels - Create kennel (with auth)
- ✅ PUT /kennels/{id} - Update kennel (with auth)
- ✅ DELETE /kennels/{id} - Delete kennel (with auth)

## Temporary Workaround

For now, the mobile app will handle the error gracefully:

```typescript
// src/screens/main/KennelsScreen.tsx
const { data, loading, error } = useKennels();

if (error?.includes('404') || error?.includes('Unauthorized')) {
  return (
    <View>
      <Text>Kennels feature is currently being deployed.</Text>
      <Text>Please check back soon or contact support.</Text>
    </View>
  );
}
```

## Testing the Fix

### 1. Test ID Token

```typescript
// Check that we're now using ID token
const token = await authService.getAuthToken();
console.log('Token type:', token?.includes('idToken') ? 'ID' : 'Access');
```

### 2. Test Endpoint Availability

```bash
# This should work (breeder app)
curl -H "Authorization: Bearer YOUR_ID_TOKEN" \
  "https://breeders.homeforpup.com/api/kennels"

# This will fail (API Gateway - not deployed yet)
curl -H "Authorization: Bearer YOUR_ID_TOKEN" \
  "https://api.homeforpup.com/kennels"
```

### 3. Verify Token Format

ID tokens contain user claims:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "cognito:username": "username",
  "name": "User Name",
  ...
}
```

Access tokens contain scopes:

```json
{
  "sub": "user-id",
  "scope": "aws.cognito.signin.user.admin",
  "token_use": "access",
  ...
}
```

## What's Changed

### 1. Token Type (`src/services/authService.ts`)

**Before:**

```typescript
const tokenObj = session.tokens?.accessToken; // Wrong token type
```

**After:**

```typescript
const tokenObj = session.tokens?.idToken; // Correct token type
console.log('Token extracted:', {
  tokenType: 'idToken', // Added logging
});
```

### 2. API Service Documentation (`src/services/apiService.ts`)

Updated comment to clarify endpoint status:

```typescript
// Kennels API
// Note: Currently only available on breeder-app, not on AWS API Gateway
// Will return 404 until deployed to api.homeforpup.com
```

## Available Endpoints

| Endpoint      | Status          | URL                                     |
| ------------- | --------------- | --------------------------------------- |
| `/dogs`       | ✅ Deployed     | `https://api.homeforpup.com/dogs`       |
| `/breeds`     | ✅ Deployed     | `https://api.homeforpup.com/breeds`     |
| `/users/{id}` | ✅ Deployed     | `https://api.homeforpup.com/users/{id}` |
| `/kennels`    | ❌ Not deployed | N/A                                     |
| `/activities` | ❌ Not deployed | N/A                                     |
| `/messages`   | ❌ Not deployed | N/A                                     |

## Next Steps

### For Immediate Use

1. ✅ **Fixed:** Now using ID token instead of access token
2. 🔄 **In Progress:** Deploy kennels endpoint to API Gateway
3. ⏳ **Pending:** Update mobile app once deployment is complete

### For Full Functionality

Deploy all missing endpoints to API Gateway:

- `/kennels` - Kennel management
- `/activities` - Activity tracking
- `/messages` - Messaging system
- `/favorites` - User favorites
- `/litters` - Litter management

Follow the migration guide: `/apps/homeforpup-api/MIGRATION_GUIDE.md`

## References

- [API Endpoints Documentation](../homeforpup-api/API_ENDPOINTS.md)
- [Migration Guide](../homeforpup-api/MIGRATION_GUIDE.md)
- [Breeder App Kennels Route](../breeder-app/src/app/api/kennels/route.ts)
- [AWS Cognito Token Types](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)

## Summary

✅ **Fixed:**

- Changed from access token to ID token
- Added logging for token type
- Updated documentation

⚠️ **Current Limitation:**

- Kennels endpoint not available on API Gateway
- Will return 404/401 until deployed

🚀 **Next Actions:**

- Deploy kennels endpoint to AWS API Gateway
- Test with ID token authentication
- Update mobile app UI to handle missing endpoints gracefully

---

**Last Updated:** October 8, 2025
**Issue:** Kennels endpoint 401 Unauthorized
**Root Cause:** Endpoint not deployed + wrong token type
**Status:** Token type fixed ✅ | Endpoint deployment pending ⏳
