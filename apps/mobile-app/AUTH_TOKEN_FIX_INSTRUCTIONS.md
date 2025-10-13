# Auth Token 403 Error - Fix Instructions

## Problem

Still getting 403 error even after code fix:

```
ERROR: Invalid key=value pair (missing equal-sign) in Authorization header
Token: rsckcAZBxp8sVlA3L11OZAjHq5MizzN+DlH5FHyjjcs=
```

## Root Cause

The old, incorrectly formatted token is **cached in AsyncStorage**. Even though the code is fixed, the app is loading the old bad token from storage instead of getting a fresh one from Cognito.

## Immediate Solution: Clear Cache and Re-Login

### Option 1: Clear App Data (Recommended)

**iOS (Simulator):**

1. Stop the app
2. Run: `xcrun simctl erase all` (resets simulator)
3. Or: Device Settings → General → iPhone Storage → Your App → Delete App
4. Reinstall and run app
5. Login again → Fresh token will be stored correctly

**iOS (Physical Device):**

1. Settings → Your App → Reset / Clear Data
2. Or uninstall and reinstall the app
3. Login again

**Android:**

1. Settings → Apps → HomeForPup → Storage → Clear Data
2. Or uninstall and reinstall
3. Login again

### Option 2: Add Clear Cache Function (Quick Fix)

Add this to your app to programmatically clear the bad token:

```typescript
// Add to authService.ts or create a debug screen
async clearCachedAuth() {
  await AsyncStorage.clear(); // Clears all cached data
  // Or specifically:
  await AsyncStorage.removeItem('auth_token');
  await AsyncStorage.removeItem('user_data');
  await AsyncStorage.removeItem('user_type');
  this.authToken = null;
  this.currentUser = null;
  console.log('✅ Cleared cached auth data');
}
```

Then call it before logging in:

```typescript
await authService.clearCachedAuth();
await authService.login(email, password);
```

### Option 3: Force Fresh Token on App Start

Add this check to the AuthContext initialization:

```typescript
// In AuthContext.tsx, after loading stored auth
const storedAuth = await authService.loadStoredAuthData();
if (storedAuth.token) {
  // Validate token format - should be JWT with 3 parts
  const isValidJWT = storedAuth.token.split('.').length === 3;

  if (!isValidJWT) {
    console.warn('⚠️ Invalid token format detected, clearing cache...');
    await authService.clearAuthData();
    apiService.setAuthToken(null);
    return; // User needs to login again
  }
}
```

## Permanent Fix: Update Auth Flow

I've already fixed the code in 3 places in `authService.ts`:

1. **Line 125** (login method)
2. **Line 337** (getAuthToken method)
3. **Line 373** (refreshSession method)

All now use: `session.tokens.idToken.toString()` ✅

## Why This Happens

**Old Code:**

```typescript
const token = String(session.tokens.idToken);
// Result: "[object Object]" or hash representation
```

**Fixed Code:**

```typescript
const token = session.tokens.idToken.toString();
// Result: "eyJhbGc...xyz.abc.123" (proper JWT)
```

**But:** If the bad token was already stored in AsyncStorage, it will keep being used until cleared.

## How to Verify Fix is Working

After clearing cache and re-logging in, check the console logs:

**Should See:**

```
Token extracted: {
  hasToken: true,
  tokenLength: 800-1200,
  isJWT: true,  ← Should be TRUE
  tokenPreview: "eyJhbGciOiJIUzI1NiI..." ← Should start with "eyJ"
}
```

**Should NOT See:**

```
Token: "rsckcAZBxp8s..." ← Base64 hash (BAD)
Token: "[object Object]" ← Object toString (BAD)
```

## Quick Test

Add this temporary code to verify token format:

```typescript
// In AuthContext after login or load
const token = await authService.getAuthToken();
console.log('🔍 Token validation:', {
  token: token?.substring(0, 50),
  isJWT: token?.split('.').length === 3,
  format: token?.split('.').length === 3 ? 'VALID JWT' : 'INVALID',
});
```

## Expected Token Format

A valid JWT looks like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Structure:**

- Part 1 (header): `eyJhbGciOiJ...`
- Part 2 (payload): `eyJzdWIiOiI...`
- Part 3 (signature): `SflKxwRJSM...`
- **Separated by dots (.)**: `xxx.yyy.zzz`

Your token should have exactly **3 parts** separated by dots.

## Automated Fix Script

Create a helper to auto-clear bad tokens:

```typescript
// Add to authService.ts
async validateAndFixToken(): Promise<boolean> {
  const token = await AsyncStorage.getItem('auth_token');

  if (token) {
    const isValidJWT = token.split('.').length === 3;
    const startsCorrectly = token.startsWith('eyJ');

    if (!isValidJWT || !startsCorrectly) {
      console.warn('⚠️ Invalid token detected, clearing...');
      await this.clearAuthData();
      this.authToken = null;
      return false;
    }
  }

  return true;
}

// Call on app start
await authService.validateAndFixToken();
```

## Immediate Action Required

**You must do ONE of these:**

1. **Quickest:** Uninstall/reinstall app or clear app data, then login again
2. **Code Fix:** Add token validation to AuthContext to auto-clear bad tokens
3. **Manual:** Add a "Clear Cache" button in settings that calls `clearAuthData()`

After clearing the cache, the next login will store the token correctly using the fixed code.

## Prevention

The code fix is already applied, so **new logins** will work correctly. The issue is only with **already-stored bad tokens** from before the fix.

---

**Status**: Code fixed ✅, Cache needs clearing ⚠️  
**Action**: Clear app data and login again  
**Expected**: 403 errors will be resolved
