# User Name Display Fix

## Issue

The home screen was displaying the user's ID/email instead of their actual name after logging in.

## Root Cause

The auth service was using `currentUser.username` as the display name, but in AWS Cognito, `username` is typically the user's email or unique ID, not their actual name.

## Solution

Updated `authService.ts` to properly extract the user's name from Cognito user attributes (stored in the ID token payload).

## Changes Made

### Updated `login()` method

```typescript
// Get user attributes to extract the actual name
const userAttributes = session.tokens?.idToken?.payload;
const userName =
  (userAttributes?.name as string) ||
  (userAttributes?.email as string) ||
  currentUser.username;
const firstName =
  (userAttributes?.given_name as string) || userName.split(' ')[0];
const lastName =
  (userAttributes?.family_name as string) ||
  userName.split(' ').slice(1).join(' ');
```

### Updated `getCurrentUser()` method

Similar changes to extract name from user attributes when loading stored user session.

## How It Works

1. **Login Flow**: When a user logs in, we now:

   - Fetch the ID token from the auth session
   - Extract user attributes from `idToken.payload`
   - Get the `name`, `given_name`, and `family_name` attributes
   - Use these for display instead of the `username`

2. **Session Restoration**: When loading a stored session:

   - Same process to extract name from attributes
   - Ensures consistent display across app restarts

3. **Fallback Chain**:
   - First try: `name` attribute (full name set during signup)
   - Second try: `email` attribute
   - Last resort: `username` (Cognito user ID)

## Dashboard Display

The DashboardScreen already uses `user?.name`:

```typescript
<Text style={styles.greeting}>Welcome back, {user?.name || 'Breeder'}!</Text>
```

With the updated auth service, this will now show:

- ✅ **User's actual name** (if set in Cognito)
- ✅ **User's email** (if name not set)
- ✅ **"Breeder"** (fallback if no user data)

## Testing

1. Log out of the app
2. Log back in
3. The home screen should now display your actual name instead of your email

## Example

**Before**: "Welcome back, user@example.com!"
**After**: "Welcome back, John Doe!"

## Related Files

- `/apps/mobile-app/src/services/authService.ts` - Updated auth logic
- `/apps/mobile-app/src/screens/main/DashboardScreen.tsx` - Already using user?.name
- `/apps/mobile-app/src/contexts/AuthContext.tsx` - Passes user object from auth service

## Future Enhancements

- Add a profile screen where users can update their display name
- Sync name changes back to Cognito user attributes
- Allow users to set a preferred display name different from their legal name
