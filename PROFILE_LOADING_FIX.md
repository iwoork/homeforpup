# Profile Loading Fix - EditProfileScreen

## Problem
The EditProfileScreen was not loading existing profile information, showing empty fields instead.

## Root Cause
The component was initializing form state with user data from context at mount time, but if the user object hadn't loaded yet from AuthContext, the form would be initialized with empty strings and never update.

## Solutions Implemented

### 1. Added useEffect to Update Form When User Context Changes
**Location:** Lines 55-85

```typescript
useEffect(() => {
  if (user) {
    console.log('=== Updating form from user context ===');
    console.log('User data:', JSON.stringify(user, null, 2));
    
    setFormData({
      name: user.name || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      displayName: user.displayName || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      facebook: user.userType !== 'breeder' ? user.socialLinks?.facebook || '' : '',
      instagram: user.userType !== 'breeder' ? user.socialLinks?.instagram || '' : '',
      twitter: user.userType !== 'breeder' ? user.socialLinks?.twitter || '' : '',
    });

    setPreferences({
      emailNotifications: user.preferences?.notifications?.email ?? true,
      smsNotifications: user.preferences?.notifications?.sms ?? false,
      pushNotifications: user.preferences?.notifications?.push ?? true,
      showEmail: user.preferences?.privacy?.showEmail ?? false,
      showPhone: user.preferences?.privacy?.showPhone ?? false,
      showLocation: user.preferences?.privacy?.showLocation ?? true,
    });
  }
}, [user]);
```

**What this does:**
- Watches for changes to the `user` object from AuthContext
- When user data is available, updates the form fields
- Ensures form is populated even if user loads after component mounts

### 2. Enhanced Loading State
**Location:** Lines 409-419

```typescript
// Show loading indicator while fetching profile or if no user data
if (fetchingProfile || !user) {
  return (
    <View style={[styles.container, styles.loadingContainer]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>
        {!user ? 'Loading user data...' : 'Loading profile...'}
      </Text>
    </View>
  );
}
```

**What this does:**
- Shows loading indicator if user object doesn't exist yet
- Prevents rendering empty form fields
- Provides clear feedback about what's loading

### 3. Added Detailed Logging
**Location:** Lines 88-93

```typescript
console.log('=== EditProfileScreen useEffect ===');
console.log('User object:', JSON.stringify(user, null, 2));
console.log('User ID:', user?.userId);
console.log('User type:', user?.userType);

if (!user?.userId) {
  console.warn('⚠️ No userId found in user object, skipping API fetch');
  setFetchingProfile(false);
  return;
}
```

**What this does:**
- Logs user object for debugging
- Shows clear warning if userId is missing
- Helps diagnose loading issues

## How It Works Now

1. **Component Mounts:**
   - Initial state uses values from `user` object (may be empty if not loaded yet)
   - Shows loading indicator if `user` is null

2. **User Context Loads:**
   - useEffect (line 56) detects user object is now available
   - Updates all form fields with user data
   - Updates preferences

3. **API Fetch Attempt:**
   - If `userId` exists, tries to fetch fresh data from API
   - If API succeeds, updates form with latest data
   - If API fails or no userId, uses data from context

4. **Form Renders:**
   - Only renders once user data is available
   - Fields are now properly populated

## Testing

To verify the fix works:

1. **Check Console Logs:**
   ```
   === Updating form from user context ===
   User data: { userId: "...", name: "...", email: "...", ... }
   === EditProfileScreen useEffect ===
   User object: { userId: "...", name: "...", ... }
   User ID: abc-123-def
   User type: breeder
   ```

2. **Check Form Fields:**
   - Name field should show user's name
   - Email field should show user's email (grayed out/readonly - cannot be edited)
   - Phone, location, bio should show if available
   - Social media fields only show for non-breeders

3. **Check Loading States:**
   - Should see "Loading user data..." if user not loaded yet
   - Should see "Loading profile..." while fetching from API
   - Should see form once data is available

## Files Modified

- `/apps/mobile-app/src/screens/forms/EditProfileScreen.tsx`
  - Added useEffect to update form when user changes (lines 55-85)
  - Enhanced loading state check (lines 409-419)
  - Added detailed logging (lines 88-93)
  - Made email field readonly/non-editable (lines 504-508)
  - Added editable option to renderInput function (lines 376-426)
  - Added disabled input styles (lines 779-785)

## Related Issues

This fix also addresses:
- Form showing empty even though user is logged in
- Data not syncing from AuthContext
- No feedback when data is loading

## Notes

- The form uses two data sources: AuthContext and API
- AuthContext is the primary source (cached, fast)
- API fetch provides fresh data if available
- If API fails, form still works with AuthContext data
- Social media fields conditionally shown based on userType

### Email Field is Read-Only

The email field is intentionally made non-editable because:
- Email is the primary authentication identifier
- Changing email would require re-verification
- Email changes should go through proper security flow
- Users need to verify ownership of new email address
- Prevents accidental lockout from account

**Visual Indicators:**
- Grayed out background (`backgroundSecondary` color)
- Lighter text color (`textSecondary`)
- Lighter border color (`borderLight`)
- Dimmed icon color (`textTertiary`)

**Implementation:**
- Added `editable?: boolean` option to `renderInput` function
- Email field uses `editable: false`
- TextInput component respects the `editable` prop
- Styling automatically applied when field is not editable

## Future Improvements

1. Add retry logic for failed API calls
2. Add pull-to-refresh functionality
3. Consider caching API responses
4. Add timestamp showing when data was last updated
5. Add "Change Email" feature with proper verification flow:
   - Separate screen/flow for changing email
   - Send verification code to new email
   - Require password confirmation
   - Update authentication on success

