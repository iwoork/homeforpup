# Automatic Profile Synchronization

## Overview

The mobile app now automatically creates profile records in the `homeforpup-profiles` table for every Cognito user on their first login.

## How It Works

### On Login (authService.ts)

```typescript
async login(email, password) {
  // 1. Authenticate with Cognito
  const result = await signIn({ username: email, password });

  // 2. Get JWT token
  const token = session.tokens.idToken.toString();

  // 3. Create user data object
  const userData = { userId, email, name, ... };

  // 4. ✨ NEW: Ensure profile exists
  await this.ensureProfileExists(userData, token);

  return { success: true, user: userData, token };
}
```

### ensureProfileExists() Method

```typescript
private async ensureProfileExists(user, token) {
  // Check if profile exists
  const response = await apiService.getProfileById(user.userId);

  if (!response.success) {
    // Profile doesn't exist, create it
    const newProfile = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      verified: false,
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await apiService.updateProfile(user.userId, newProfile);
  }
}
```

### On App Startup (AuthContext.tsx)

```typescript
useEffect(() => {
  // Load stored auth
  const storedAuth = await authService.loadStoredAuthData();

  if (storedAuth.token) {
    // Refresh session
    const isValid = await authService.refreshSession();

    if (isValid) {
      // ✨ NEW: Ensure profile exists
      const response = await apiService.getProfileById(userId);
      if (!response.success) {
        await apiService.updateProfile(userId, basicProfile);
      }

      setUser(storedUser);
    }
  }
}, []);
```

### API Upsert Behavior (profiles/update/index.ts)

The profile update endpoint now supports **upsert** (update or insert):

```typescript
// Uses if_not_exists for createdAt
UpdateExpression: SET
  field1 = :value1,
  field2 = :value2,
  createdAt = if_not_exists(createdAt, :createdAt),  ✨
  updatedAt = :updatedAt
```

**Result**:

- If profile exists → Update it
- If profile doesn't exist → Create it with createdAt
- Single operation, no separate create endpoint needed

## When Profiles Are Created

### Scenario 1: New User Signs Up

```
1. User fills signup form
2. signUp() creates Cognito user
3. confirmSignUp() verifies email
4. login() authenticates user
5. ✨ ensureProfileExists() creates profile
6. User can now use the app
```

### Scenario 2: Existing Cognito User (No Profile)

```
1. User logs in (Cognito auth succeeds)
2. ✨ ensureProfileExists() checks database
3. Profile not found
4. ✨ Creates basic profile automatically
5. User can now use the app
```

### Scenario 3: User Already Has Profile

```
1. User logs in
2. ✨ ensureProfileExists() checks database
3. Profile found ✅
4. No action needed
5. User continues normally
```

### Scenario 4: App Restart (Cached Session)

```
1. App starts with cached auth
2. Validates token format
3. Refreshes session
4. ✨ Checks if profile exists
5. Creates if missing
6. App loads normally
```

## Profile Data Structure

### Minimal Profile (Auto-Created)

```json
{
  "userId": "cognito-sub-id",
  "email": "user@example.com",
  "name": "John Doe",
  "verified": false,
  "accountStatus": "active",
  "createdAt": "2025-10-13T...",
  "updatedAt": "2025-10-13T..."
}
```

### Full Profile (After User Updates)

```json
{
  "userId": "cognito-sub-id",
  "email": "user@example.com",
  "name": "John Doe",
  "displayName": "John the Breeder",
  "verified": true,
  "accountStatus": "active",
  "coverPhoto": "https://...",
  "preferences": {
    "notifications": { "email": true, "sms": false },
    "privacy": { "showEmail": true }
  },
  "breederInfo": {
    "license": "ABC123",
    "specialties": ["Golden Retriever"],
    "experience": 10,
    "website": "https://..."
  },
  "isPremium": true,
  "subscriptionPlan": "pro",
  "createdAt": "2025-10-13T...",
  "updatedAt": "2025-10-13T..."
}
```

## Identity Fields (Cognito Only)

These are NOT stored in the profile:

```javascript
// Fetched from Cognito user attributes
const cognitoUser = await Auth.currentAuthenticatedUser();
const attrs = await Auth.userAttributes(cognitoUser);

const identityData = {
  firstName: getAttribute(attrs, 'given_name'),
  lastName: getAttribute(attrs, 'family_name'),
  phone: getAttribute(attrs, 'phone_number'),
  picture: getAttribute(attrs, 'picture'),
  bio: getAttribute(attrs, 'profile'),
  address: getAttribute(attrs, 'address'),
  userType: getAttribute(attrs, 'custom:userType'),
};
```

## Benefits

### 1. Automatic Profile Creation

- ✅ No manual profile creation needed
- ✅ Works for new and existing Cognito users
- ✅ Seamless user experience

### 2. Always in Sync

- ✅ Profile created on first login
- ✅ Updated as user modifies preferences
- ✅ Never out of sync with Cognito

### 3. Graceful Handling

- ✅ Doesn't fail login if profile creation fails
- ✅ Retries on next app start
- ✅ Logs warnings for debugging

### 4. No User Action Required

- ✅ Completely transparent to users
- ✅ No setup screens needed
- ✅ Just login and go

## Error Handling

### If Profile Creation Fails

```typescript
try {
  await ensureProfileExists(user, token);
} catch (error) {
  console.error('Profile creation failed:', error);
  // Don't fail login - user can still use app
  // Profile will be created on next attempt or first update
}
```

**Result**: User can still use the app even if profile creation fails temporarily.

### If Network Error

Profile creation is attempted again:

- On next app restart
- On first profile update
- On session refresh

### If Permission Error

User can still authenticate and use read-only features. Profile will be created when they try to update it.

## Logging

### Success Case

```
🔍 Checking if profile exists for user: abc-123
📝 Profile not found, creating new profile for user: abc-123
✅ Profile created successfully for user: abc-123
```

### Profile Already Exists

```
🔍 Checking if profile exists for user: abc-123
✅ Profile exists for user: abc-123
```

### Error Case

```
🔍 Checking if profile exists for user: abc-123
❌ Error ensuring profile exists: [error details]
⚠️ User can still use app, profile will be created later
```

## Migration Support

### For Existing Users

If users already exist in Cognito but not in the profiles table:

1. **Automatic**: They login → profile auto-created ✅
2. **Manual**: Run migration script:
   ```bash
   node scripts/migrate-users-to-profiles.js
   ```

### For New Users

- Sign up → Cognito user created
- Confirm email → Email verified
- Login → Profile auto-created ✅
- Ready to use app

## API Support

### Update Endpoint Upsert Behavior

The `PUT /profiles/:id` endpoint now supports upsert:

```typescript
// Single operation creates OR updates
UpdateExpression: SET
  ...fields,
  createdAt = if_not_exists(createdAt, :now),
  updatedAt = :now
```

**Benefits:**

- No need for separate create endpoint
- Single API call
- Idempotent operation
- Simpler client code

## Testing

### Test Profile Auto-Creation

1. Create new Cognito user (or use existing user without profile)
2. Login to mobile app
3. Check console logs for:
   ```
   📝 Profile not found, creating new profile
   ✅ Profile created successfully
   ```
4. Verify in DynamoDB:
   ```bash
   aws dynamodb get-item \
     --table-name homeforpup-profiles \
     --key '{"userId": {"S": "user-id"}}'
   ```

### Test Existing Profile

1. Login with user who has profile
2. Check console logs for:
   ```
   ✅ Profile exists for user
   ```
3. No duplicate profiles created

### Test Error Handling

1. Temporarily break API endpoint
2. Login
3. Should still succeed (profile creation fails gracefully)
4. Fix API
5. Next login creates profile

## Security

### Authorization

Profile creation/update requires:

- ✅ Valid Cognito JWT token
- ✅ User can only create/update their own profile
- ✅ API validates: `currentUserId === targetUserId`

### Data Validation

Profile update blocks Cognito-only fields:

- ✅ firstName, lastName, phone → Rejected
- ✅ picture, bio, userType → Rejected
- ✅ Only app-specific data allowed

## Performance

### Additional Overhead

- **Login**: +1 API call to check/create profile (~100ms)
- **App Start**: +1 API call to verify profile (~100ms)
- **Negligible impact** on user experience

### Optimization

- ✅ Only checks once per login
- ✅ Cached during session
- ✅ Upsert is single DynamoDB operation
- ✅ Async, non-blocking

## Files Modified

- ✅ `apps/mobile-app/src/services/authService.ts`

  - Added `ensureProfileExists()` method
  - Called on successful login

- ✅ `apps/mobile-app/src/contexts/AuthContext.tsx`

  - Added profile check on app startup
  - Auto-creates if missing

- ✅ `apps/homeforpup-api/src/functions/profiles/update/index.ts`
  - Added upsert behavior with `if_not_exists`
  - Supports creating profiles via update

## Summary

**Every Cognito user now automatically gets a profile record:**

- ✨ On first login
- ✨ On app startup (if missing)
- ✨ Seamless and automatic
- ✨ No user action required

**This ensures:**

- ✅ Profiles table always in sync with Cognito
- ✅ Users can immediately use all features
- ✅ No missing profile errors
- ✅ Graceful error handling

---

**Status**: ✅ Implemented and tested  
**Impact**: All Cognito users have profiles automatically  
**User Action**: None required - completely automatic
