# Authorization Token Fix

## Issue

Error: "Invalid key value pair missing equal sign in authorization header"

This error occurred when the mobile app tried to make authenticated API requests to the backend.

## Root Cause

Two issues were identified:

1. **Wrong Token Type:** The code was using the `accessToken` when it should use the `idToken`. Most backend endpoints expect ID tokens for user identity verification.

2. **Improper String Conversion:** The JWT token from AWS Amplify's `fetchAuthSession()` was not being properly converted to a string. When calling `.toString()` on the token object, it sometimes returned `[object Object]` instead of the actual JWT token string, causing the Authorization header to be malformed.

## The Fix

### 1. Use ID Token Instead of Access Token (`src/services/authService.ts`)

**Before:**

```typescript
const token = session.tokens?.accessToken?.toString() || ''; // Wrong token type
```

**After:**

```typescript
// Use ID token for API authentication (not access token)
// The backend expects ID token for user identity verification
const tokenObj = session.tokens?.idToken;
const token = tokenObj ? String(tokenObj) : '';
console.log('Token extracted:', {
  hasToken: !!token,
  tokenLength: token.length,
  tokenType: 'idToken',
});
```

**Why ID Token?**

- **ID Token:** Contains user identity claims (email, name, sub, etc.) - used for authentication
- **Access Token:** Contains authorization scopes - used for accessing AWS resources

The backend endpoints verify ID tokens to authenticate the user, not access tokens.

### 2. Token Validation (`src/services/apiService.ts`)

**Before:**

```typescript
if (this.authToken) {
  headers.Authorization = `Bearer ${this.authToken}`;
}
```

**After:**

```typescript
if (this.authToken) {
  // Ensure token is a valid string and doesn't already have Bearer prefix
  const tokenStr = String(this.authToken).trim();
  if (tokenStr && tokenStr !== '[object Object]') {
    headers.Authorization = `Bearer ${tokenStr}`;
    console.log('API request with auth:', {
      endpoint,
      hasAuth: true,
      tokenLength: tokenStr.length,
    });
  } else {
    console.warn('Invalid auth token detected:', { token: this.authToken });
  }
}
```

### 3. Token Refresh on App Init (`src/contexts/AuthContext.tsx`)

**Before:**

```typescript
if (storedUser && token) {
  apiService.setAuthToken(token);
  const isValid = await authService.refreshSession();
  if (isValid) {
    setUser(storedUser);
  }
}
```

**After:**

```typescript
if (storedUser && token) {
  const isValid = await authService.refreshSession();

  if (isValid) {
    // Get fresh token after refresh
    const freshToken = await authService.getAuthToken();
    console.log('AuthContext: Got fresh token:', {
      hasToken: !!freshToken,
      tokenLength: freshToken?.length,
    });

    // Set the fresh auth token in the API service
    apiService.setAuthToken(freshToken);
    setUser(storedUser);
  }
}
```

## How to Debug Token Issues

### 1. Check Console Logs

The fix adds comprehensive logging. Look for these messages:

```
Token extracted: { hasToken: true, tokenLength: 1234 }
API request with auth: { endpoint: '/dogs', hasAuth: true, tokenLength: 1234 }
```

### 2. Verify Token Format

A valid JWT token should:

- Be a long string (usually 500-2000 characters)
- Have three parts separated by dots (header.payload.signature)
- Start with `eyJ` (Base64 encoded)
- NOT be `[object Object]` or empty string

**Example valid token:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### 3. Check Authorization Header

In the API request logs, you should see:

```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

**NOT:**

```
Authorization: Bearer [object Object]
Authorization: Bearer undefined
Authorization: Bearer
```

### 4. Test Token Manually

You can manually test if the token is valid by making a curl request:

```bash
# Get your token from the console logs
TOKEN="your-token-here"

# Test the API
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.homeforpup.com/dogs?limit=5"
```

If this works, the token is valid. If not, you'll get an authentication error.

### 5. Common Issues

| Issue              | Symptom                    | Fix                                             |
| ------------------ | -------------------------- | ----------------------------------------------- |
| Token is object    | `[object Object]` in logs  | Use `String(tokenObj)` instead of `.toString()` |
| Token is undefined | Empty Authorization header | Check Amplify session is valid                  |
| Token expired      | 401 Unauthorized           | Call `refreshSession()` to get new token        |
| Token not set      | Requests work without auth | Call `apiService.setAuthToken(token)`           |

## Testing the Fix

### 1. Login and Check Token

```typescript
// In React Native debugger console
const token = await authService.getAuthToken();
console.log('Token length:', token?.length);
console.log('Token starts with:', token?.substring(0, 20));
```

Expected output:

```
Token length: 1234
Token starts with: eyJhbGciOiJIUzI1NiI...
```

### 2. Make Authenticated Request

```typescript
// Test kennels endpoint (requires auth)
const result = await apiService.getKennels({ limit: 5 });
console.log('Result:', result);
```

Expected output:

```
API request with auth: { endpoint: '/kennels', hasAuth: true, tokenLength: 1234 }
Result: { success: true, data: { kennels: [...], total: 5 } }
```

### 3. Check Network Tab

In React Native Debugger:

1. Open Network tab
2. Look for API requests
3. Check request headers
4. Verify Authorization header is present and properly formatted

## Prevention

To prevent this issue in the future:

### 1. Always Validate Tokens

```typescript
function isValidToken(token: any): boolean {
  if (!token) return false;
  const tokenStr = String(token);
  return (
    tokenStr.length > 100 &&
    tokenStr !== '[object Object]' &&
    tokenStr.startsWith('eyJ')
  );
}
```

### 2. Add Token Refresh Logic

```typescript
async function getValidToken(): Promise<string | null> {
  let token = await authService.getAuthToken();

  if (!isValidToken(token)) {
    // Token is invalid, try to refresh
    await authService.refreshSession();
    token = await authService.getAuthToken();
  }

  return isValidToken(token) ? token : null;
}
```

### 3. Handle Token Errors Gracefully

```typescript
private async makeRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, { headers });

    if (response.status === 401) {
      // Token expired or invalid
      console.warn('Auth token invalid, refreshing...');
      await authService.refreshSession();
      const newToken = await authService.getAuthToken();
      apiService.setAuthToken(newToken);

      // Retry the request
      return this.makeRequest(endpoint);
    }

    // ... rest of the code
  } catch (error) {
    // ...
  }
}
```

## Related Files

- `src/services/authService.ts` - Token extraction and management
- `src/services/apiService.ts` - Token validation and header construction
- `src/contexts/AuthContext.tsx` - Token initialization and refresh
- `src/config/config.ts` - API configuration

## Additional Resources

- [AWS Amplify Authentication Docs](https://docs.amplify.aws/react-native/build-a-backend/auth/)
- [JWT.io](https://jwt.io/) - Decode and verify JWT tokens
- [API_INTEGRATION.md](./API_INTEGRATION.md) - API integration guide

## Summary

✅ **Fixed:**

- **Changed to ID token** instead of access token (critical fix)
- Token extraction using `String()` instead of `.toString()`
- Token validation before setting Authorization header
- Token refresh on app initialization
- Comprehensive logging for debugging

⚠️ **Monitor:**

- Console logs for token-related messages
- Network requests for proper Authorization headers
- 401 Unauthorized errors (may indicate token expiration)

🔧 **Next Steps:**

- Add token refresh interceptor for automatic retry on 401
- Implement token expiration checking before requests
- Add user-friendly error messages for auth failures

---

**Last Updated:** October 8, 2025
**Issue:** Authorization header malformed
**Status:** ✅ Fixed
