# Profile Update Debugging Guide

## Issue

Profile updates show in the app but don't persist to the API/database.

## Enhanced Logging Added

I've added comprehensive logging to help debug the issue. When you update your profile, you'll now see:

### Console Logs to Watch For:

#### 1. Profile Form Submission:

```
=== PROFILE UPDATE START ===
User ID: <user-id>
Update Data: {...}
🔄 ApiService.updateUser called
  - User ID: <user-id>
  - Base URL: <api-url>
  - Has Auth Token: true/false
  - Update Data: {...}
API request with auth: {...}
API Response: {...}
Response Success: true/false
=== PROFILE UPDATE COMPLETE ===
```

#### 2. Photo Upload:

```
=== PHOTO UPDATE START ===
User ID: <user-id>
Photo URL: <url>
🔄 ApiService.updateUser called
Photo Update API Response: {...}
=== PHOTO UPDATE COMPLETE ===
```

## How to Debug

### Step 1: Restart Metro with Logging

```bash
# Kill old Metro
lsof -ti:8081 | xargs kill -9

# Start Metro
cd apps/mobile-app
npx react-native start --reset-cache
```

### Step 2: Rebuild the App

```bash
# In a new terminal
cd apps/mobile-app
npx react-native run-ios
# or
npx react-native run-android
```

### Step 3: Open Metro Console

Look at the Metro bundler console where you ran `npx react-native start`

### Step 4: Test Profile Update

1. Open the app
2. Go to Profile → Edit Profile
3. Change any field (e.g., your name or bio)
4. Click "Save Changes"
5. **Watch the Metro console logs**

## What to Look For

### ✅ SUCCESS - API is Being Called:

```
🔄 ApiService.updateUser called
  - Has Auth Token: true
API Response: { "success": true, "data": {...} }
```

### ❌ PROBLEM 1 - No Auth Token:

```
🔄 ApiService.updateUser called
  - Has Auth Token: false
```

**Fix:** User needs to log out and log back in

### ❌ PROBLEM 2 - API Returns Error:

```
API Response: { "success": false, "error": "..." }
```

**Fix:** Check the error message - might be:

- 401: Authentication issue
- 403: Permission denied
- 500: Server error

### ❌ PROBLEM 3 - Network Error:

```
API request failed: Network error
```

**Fix:** Check:

- Is the API running?
- Is the API URL correct in config?
- Internet connection?

### ❌ PROBLEM 4 - No Response Data:

```
Response Success: true
No user data in response to update local state
```

**Fix:** API returned success but no user object - check API response format

## Common Issues & Solutions

### Issue 1: API Not Deployed

**Symptoms:** Network errors, 404 responses
**Solution:** Deploy the API

```bash
cd apps/homeforpup-api
npm run deploy
```

### Issue 2: Wrong API URL

**Symptoms:** Network errors, CORS errors
**Check:** `apps/mobile-app/src/config/config.ts`

```typescript
api: {
  baseUrl: 'https://api.homeforpup.com'; // Should match your deployed API
}
```

### Issue 3: Authentication Token Missing/Expired

**Symptoms:** 401 errors
**Solution:**

1. Log out of the app
2. Log back in
3. Try updating profile again

### Issue 4: API Endpoint Not Configured

**Symptoms:** 404 errors
**Check:** The PUT /users/{id} endpoint exists in the API stack

## Testing the API Directly

You can test the API endpoint directly using curl:

```bash
# Get your auth token from the console logs
# Look for: "API request with auth: { ... }"

curl -X PUT https://api.homeforpup.com/users/YOUR_USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Name",
    "bio": "Test bio"
  }'
```

## Next Steps

1. **Follow steps 1-4 above** to get detailed logs
2. **Share the console logs** showing what happens when you update your profile
3. Look for any error messages or warnings
4. Check if the API is actually being called (look for 🔄 emoji logs)

## Expected Flow

```
User clicks "Save"
  → EditProfileScreen.handleSubmit()
    → console.log('=== PROFILE UPDATE START ===')
    → apiService.updateUser()
      → console.log('🔄 ApiService.updateUser called')
      → makeRequest() sends PUT to /users/{id}
        → API receives request
        → API updates DynamoDB
        → API returns updated user
      → console.log('🔄 ApiService.updateUser response')
    → console.log('API Response')
    → Update local state
    → console.log('=== PROFILE UPDATE COMPLETE ===')
  → Show "Success" alert
```

If the flow stops at any point, that's where the issue is!
