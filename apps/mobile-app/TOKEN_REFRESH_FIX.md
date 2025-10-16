# Token Refresh 401 Error Fix

## Problem

After token refresh, API requests were still returning 401 Unauthorized errors even though the token was successfully refreshed. The logs showed:

```
LOG  ✅ Session refreshed successfully, new token length: 1383
LOG  ✅ Token refreshed successfully, retrying request...
ERROR  API request failed: {"error": "Unauthorized: Please log in to view your kennels", "status": 401}
```

## Root Cause Analysis

The issue was likely caused by one or more of these factors:

1. **Stale Headers in Retry**: When retrying the request after token refresh, the old headers (with the expired token) were being passed along
2. **Token Type Mismatch**: The API might expect an access token instead of an ID token
3. **Timing Issues**: The token refresh might not have been fully propagated before the retry

## Solution

### 1. Fixed Header Retry Logic

**Problem**: The retry was passing old headers that contained the expired token.

**Fix**: Clear headers when retrying to force fresh token generation:

```typescript
// Retry with fresh options (don't pass old headers)
return this.makeRequest<T>(endpoint, { ...options, headers: {} }, false);
```

### 2. Added Access Token Fallback

**Problem**: Some APIs expect access tokens instead of ID tokens for authorization.

**Fix**: Added fallback to try access token if ID token fails:

```typescript
// If ID token refresh failed, try access token
console.log('🔄 ID token failed, trying access token...');
const accessToken = await authService.getAccessToken();
if (accessToken) {
  this.authToken = accessToken;
  console.log('✅ Using access token, retrying request...');
  return this.makeRequest<T>(endpoint, { ...options, headers: {} }, false);
}
```

### 3. Enhanced Token Debugging

Added comprehensive logging to help diagnose token issues:

**In `apiService.ts`:**

```typescript
console.log('API request with auth:', {
  endpoint,
  hasAuth: true,
  tokenLength: tokenStr.length,
  tokenPreview: tokenStr.substring(0, 50),
  isJWT: tokenStr.split('.').length === 3,
  startsWithEyJ: tokenStr.startsWith('eyJ'),
  tokenParts: tokenStr.split('.').length,
  tokenEnd: tokenStr.substring(tokenStr.length - 20),
});
```

**In `authService.ts`:**

```typescript
console.log('🔍 Session tokens available:', {
  hasIdToken: !!session.tokens?.idToken,
  hasAccessToken: !!session.tokens?.accessToken,
  hasRefreshToken: !!session.tokens?.refreshToken,
});
```

### 4. Added Access Token Method

Created `getAccessToken()` method in `authService.ts` to retrieve access tokens when needed:

```typescript
async getAccessToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    if (session && session.tokens?.accessToken) {
      const accessToken = session.tokens.accessToken;
      // Extract token string (same logic as ID token)
      let token: string;
      if (typeof accessToken === 'string') {
        token = accessToken;
      } else if (typeof accessToken.toString === 'function') {
        token = accessToken.toString();
      } else {
        token = String(accessToken);
      }
      return token;
    }
    return null;
  } catch (error) {
    console.error('Get access token error:', error);
    return null;
  }
}
```

## Token Flow

1. **Initial Request**: Uses ID token (preferred for user identity)
2. **401 Response**: Triggers token refresh
3. **Token Refresh**: Refreshes ID token and updates stored token
4. **Retry with ID Token**: Clears headers and retries with fresh ID token
5. **If ID Token Fails**: Falls back to access token
6. **Final Retry**: Uses access token if ID token doesn't work

## Debugging

The enhanced logging will show:

### Token Refresh Process

```
🔄 Attempting to refresh session...
🔍 Session tokens available: { hasIdToken: true, hasAccessToken: true, hasRefreshToken: true }
✅ Session refreshed successfully, new token length: 1383
🔍 Token details: { tokenType: 'idToken', tokenLength: 1383, ... }
```

### API Request Details

```
API request with auth: {
  endpoint: "/kennels?offset=0&limit=20",
  hasAuth: true,
  tokenLength: 1383,
  tokenPreview: "eyJraWQiOiJ0OHo1YXpoTXRIRjFaSGdlYWRyaFFSK016UHpXSj",
  isJWT: true,
  startsWithEyJ: true,
  tokenParts: 3,
  tokenEnd: "..."
}
```

### Retry Process

```
⚠️ Token expired (401), attempting to refresh...
✅ Token refreshed successfully, retrying request...
🔄 Retry with new token: { tokenLength: 1383, tokenPreview: "eyJraWQiOiJ0OHo1YXpoTXRIRjFaSGdlYWRyaFFSK016UHpXSj" }
```

## Expected Behavior

After this fix:

1. ✅ Token refresh should work properly
2. ✅ Retry requests should use fresh tokens
3. ✅ Access token fallback should handle token type mismatches
4. ✅ Comprehensive logging should help diagnose any remaining issues

## Files Modified

- ✅ `/apps/mobile-app/src/services/apiService.ts` - Fixed retry logic and added access token fallback
- ✅ `/apps/mobile-app/src/services/authService.ts` - Added access token method and enhanced logging

## Testing

To verify the fix:

1. **Login to the app**
2. **Wait for token to expire** (or force refresh)
3. **Make API requests** (like loading kennels)
4. **Check logs** for successful token refresh and retry
5. **Verify requests succeed** after token refresh

The logs should show successful token refresh and retry without 401 errors.
