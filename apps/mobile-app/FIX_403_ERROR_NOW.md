# 🔧 Fix 403 Error NOW - Simple Steps

## What's Happening

You're seeing this error:

```
ERROR 403: Invalid Authorization header
```

**Why**: An old, incorrectly formatted token is cached in your app's storage.

**Solution**: I've added automatic detection to clear bad tokens.

## ✅ Automatic Fix Applied

I've updated `AuthContext.tsx` to:

1. ✅ Automatically detect invalid tokens on app start
2. ✅ Clear the bad token from cache
3. ✅ Prompt you to login again with a fresh token

## 🚀 What You Need to Do

### Just Restart the Mobile App!

**That's it!** The app will now:

1. Load the cached token
2. Detect it's invalid (not a proper JWT)
3. Automatically clear it
4. Show you the login screen
5. When you login again, store the correct token

### Steps:

1. **Close the mobile app completely**

   - iOS: Swipe up from bottom, swipe app away
   - Android: Recent apps button, swipe app away

2. **Reopen the app**

   - The app will detect the bad token
   - It will automatically clear it
   - You'll see the login screen

3. **Login again**

   - Use your same credentials
   - The app will get a fresh, properly formatted JWT token
   - Store it correctly this time

4. **Test**
   - Profile should load without 403 error
   - All API calls should work

## What the Fix Does

### Before (Old Behavior)

```typescript
// Loads bad token from cache
token = 'rsckcAZBxp8s...'; // ❌ Invalid format
// Uses it anyway → 403 error
```

### After (Fixed Behavior)

```typescript
// Loads token from cache
token = 'rsckcAZBxp8s...';

// NEW: Validates format
isValid = token.split('.').length === 3; // false!

// NEW: Automatically clears
console.warn('Invalid token, clearing cache...');
clearAuthData();
// Shows login screen → You login → Fresh token → Works! ✅
```

## Expected Console Logs

### On App Restart (with bad token):

```
AuthContext: Loaded stored auth data: { hasToken: true }
⚠️ Invalid token format detected in cache, clearing auth data...
Token preview: rsckcAZBxp8sVlA3L11OZAjHq5MizzN+DlH5FHyjjcs=
✅ Cleared auth data
[Login screen appears]
```

### After Re-Login:

```
Token extracted: {
  hasToken: true,
  tokenLength: 1024,
  isJWT: true,  ✅
  tokenPreview: "eyJraWQiOiJ4..."
}
✅ Login successful
```

### On API Call:

```
API request with auth: {
  endpoint: "/profiles/...",
  hasAuth: true,
  tokenLength: 1024
}
API Response Status: { status: 200, ok: true }  ✅
```

## If It Still Doesn't Work

### Manual Cache Clear:

Add this temporary code to clear cache manually:

```typescript
// In a debug screen or console
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear everything
await AsyncStorage.clear();
console.log('✅ Cache cleared');

// Or clear specific items
await AsyncStorage.removeItem('auth_token');
await AsyncStorage.removeItem('user_data');
await AsyncStorage.removeItem('user_type');
```

### Verify Amplify Configuration:

```typescript
// Check Amplify is configured
import { fetchAuthSession } from 'aws-amplify/auth';

const session = await fetchAuthSession();
console.log('Session:', {
  tokens: !!session.tokens,
  idToken: !!session.tokens?.idToken,
  accessToken: !!session.tokens?.accessToken,
});

// Extract token correctly
const token = session.tokens?.idToken?.toString();
console.log('Token:', {
  value: token?.substring(0, 50),
  isJWT: token?.split('.').length === 3,
});
```

## Files Changed

- ✅ `apps/mobile-app/src/contexts/AuthContext.tsx` - Added automatic token validation
- ✅ `apps/mobile-app/src/services/authService.ts` - Fixed token extraction (3 places)

## Summary

**The Fix:**

1. ✅ Code updated to extract tokens correctly
2. ✅ Automatic validation added to detect bad tokens
3. ✅ Auto-clear bad tokens on app start

**Your Action:**

1. 🔄 Restart the mobile app
2. 🔐 Login again when prompted
3. ✅ Everything should work!

**Expected Result:**

- No more 403 errors
- Profile loads correctly
- All authenticated API calls work
- Dog forms show kennel selector
- Everything functions normally

---

**Just restart the app and login again - that's all you need to do!** 🎉
