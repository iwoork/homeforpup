# 🔨 Rebuild Mobile App - Fix 403 Error

## ⚠️ IMPORTANT: You Must Rebuild the App!

The code fixes have been applied, but your app is still running the **old code** with the incorrect token extraction. That's why you're still seeing the 403 error.

## 🚀 Rebuild Steps (Choose Your Platform)

### For iOS (React Native)

```bash
cd /Users/Efren/repos/homeforpup/apps/mobile-app

# Stop any running instances
# Press Ctrl+C in Metro bundler terminal

# Clear cache
rm -rf node_modules/.cache
rm -rf ios/build
rm -rf ios/Pods
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Reinstall pods
cd ios
pod install
cd ..

# Start fresh
npx react-native start --reset-cache

# In a new terminal, run iOS
npx react-native run-ios
```

### For Android (React Native)

```bash
cd /Users/Efren/repos/homeforpup/apps/mobile-app

# Stop any running instances
# Press Ctrl+C in Metro bundler terminal

# Clear cache
rm -rf node_modules/.cache
rm -rf android/app/build
rm -rf android/build

# Start fresh
npx react-native start --reset-cache

# In a new terminal, run Android
npx react-native run-android
```

### For Expo (if using Expo)

```bash
cd /Users/Efren/repos/homeforpup/apps/mobile-app

# Clear cache
expo start -c

# Or
npx expo start --clear
```

## Alternative: Quick Reload (If Metro is Running)

If the Metro bundler is already running:

1. Press `r` in the Metro terminal (reload)
2. Or shake device and tap "Reload"
3. Or press `Cmd+R` (iOS) / `R+R` (Android)

**Note**: This might not be enough if the cache is holding old code. Full rebuild is more reliable.

## After Rebuild

### You Should See These Logs:

**On App Start:**

```
⚠️ Invalid token format detected in cache, clearing auth data...
✅ Cleared auth data
[Login screen appears]
```

**On Login:**

```
Token extracted: {
  hasToken: true,
  tokenLength: 1024,
  isJWT: true,  ✅ ← This should now be TRUE
  tokenPreview: "eyJraWQiOiJ..."  ✅ ← Should start with "eyJ"
}
🔍 Checking if profile exists for user: c4e84488-a0c1-70ac-8376-ee8b6151167b
📝 Profile not found, creating new profile
✅ Profile created successfully
✅ Login successful
```

**On API Call:**

```
API request with auth: {
  endpoint: "/profiles/c4e84488-a0c1-70ac-8376-ee8b6151167b",
  hasAuth: true,
  tokenLength: 1024
}
API Response Status: { status: 200, ok: true }  ✅
```

## Verification

The new code will:

1. ✅ Extract token correctly: `session.tokens.idToken.toString()`
2. ✅ Validate token format: `token.split('.').length === 3`
3. ✅ Clear bad tokens automatically
4. ✅ Create profile record automatically
5. ✅ Send proper JWT in Authorization header

## If Still Getting Errors After Rebuild

### Check Token Format in Logs

Look for this log:

```typescript
Token extracted: {
  isJWT: true,  // ← Must be true
  tokenPreview: "eyJ..."  // ← Must start with "eyJ"
}
```

If `isJWT: false`, the code changes didn't take effect. Try:

1. **Hard reload**: Close Metro, clear cache, restart
2. **Reinstall**: Delete app from device, rebuild completely
3. **Check you're editing the right file**: Verify changes are in the file you're running

### Double-Check the Fix is in Place

Open `apps/mobile-app/src/services/authService.ts` and verify line 337:

```typescript
// Line 337 should be:
const token = session.tokens.idToken.toString();

// NOT:
const token = String(session.tokens.idToken); // ❌ Old (bad)
```

## Why Rebuild is Required

**React Native doesn't hot-reload everything:**

- ❌ Service class changes often require full reload
- ❌ New methods need rebuild
- ❌ Cached modules persist

**After rebuild:**

- ✅ All new code is loaded
- ✅ Token extraction works correctly
- ✅ Profile sync works automatically

## Quick Test After Rebuild

```bash
# After app rebuilds and you login, test the API:
curl -H "Authorization: Bearer YOUR-TOKEN-HERE" \
  https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/profiles/YOUR-USER-ID

# Should get 200 OK with profile data
```

---

## 🎯 Summary

**What's Fixed:**

- ✅ Token extraction (3 locations)
- ✅ Token validation (auto-detect bad tokens)
- ✅ Profile auto-creation (on login + startup)
- ✅ API upsert (create if not exists)

**What You Need to Do:**

1. 🔨 Rebuild the mobile app
2. 🔐 Login again
3. ✅ Everything works!

**Expected Result:**

- No more 403 errors
- Profile auto-created
- All features working

**Just rebuild the app now!** 🚀
