# Profile Field Pre-population Fix

## Problem

When editing a profile in the mobile app, certain fields that were already stored in Cognito were not being pre-populated in the edit form:

- Location (stored as `address` in Cognito)
- Bio (stored as `profile` in Cognito)
- Given name (stored as `given_name` in Cognito)
- Family name (stored as `family_name` in Cognito)
- Phone number (stored as `phone_number` in Cognito)
- Profile image (stored as `picture` in Cognito)

## Root Cause

There were **two separate issues**:

### Issue 1: Cognito Attributes Not Extracted During Login

The `authService.ts` was only extracting a limited set of Cognito user attributes during login and session refresh (`name`, `email`, `given_name`, `family_name`, `custom:userType`), but was **not extracting** the other profile fields like `address`, `profile`, `phone_number`, and `picture`.

### Issue 2: API Data Overwriting Cognito Data

The `EditProfileScreen.tsx` was fetching profile data from the API (which only contains database fields) and overwriting the Cognito attributes that were loaded in the user context. Since the API doesn't have Cognito-only fields, they were being replaced with empty strings.

This meant:

1. Cognito attributes existed but weren't being loaded into the User object during login
2. Even when loaded, the API fetch was overwriting them with empty database values
3. Form fields appeared empty even though the data existed in Cognito

## Solution

### 1. Extract All Cognito Attributes on Login/Session Refresh

Updated `authService.ts` to extract all relevant Cognito user attributes:

**In the `login()` method (lines 84-127):**

```typescript
// Extract additional profile fields from Cognito
const location = (userAttributes?.address as string) || undefined;
const bio = (userAttributes?.profile as string) || undefined;
const phone = (userAttributes?.phone_number as string) || undefined;
const profileImage = (userAttributes?.picture as string) || undefined;

// Create user object with proper name and profile data from Cognito attributes
const userData: User = {
  userId: currentUser.username,
  email:
    (userAttributes?.email as string) ||
    currentUser.signInDetails?.loginId ||
    email,
  name: userName,
  firstName: firstName,
  lastName: lastName,
  location: location, // ✅ Now extracted
  bio: bio, // ✅ Now extracted
  phone: phone, // ✅ Now extracted
  profileImage: profileImage, // ✅ Now extracted
  userType: userType,
  verified: true,
  accountStatus: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

**In the `getCurrentUser()` method (lines 302-337):**
Applied the same extraction logic to ensure consistency when fetching the current user.

### 2. Sync Profile Updates Back to Cognito

Added a new method `updateUserAttributes()` to keep Cognito in sync when users update their profile:

```typescript
async updateUserAttributes(attributes: {
  name?: string;
  given_name?: string;
  family_name?: string;
  address?: string;  // location
  profile?: string;  // bio
  phone_number?: string;
  picture?: string;  // profileImage
}): Promise<boolean>
```

This method:

- Updates Cognito user attributes using AWS Amplify's `updateUserAttributes` function
- Filters out undefined/null/empty values
- Updates the local cached User object
- Persists changes to AsyncStorage

### 3. Merge API Data with Cognito Data in EditProfileScreen

**Critical Fix**: Updated `EditProfileScreen.tsx` to properly merge API data with Cognito data instead of overwriting it.

**In the profile fetch useEffect (lines 137-162):**

```typescript
// IMPORTANT: Merge API data with Cognito data from user context
// The API only has database fields, but user context has Cognito attributes
// Prefer API data if it exists, otherwise fall back to user context (Cognito)
const mergedFormData = {
  name: userData.name || user?.name || '',
  firstName: userData.firstName || user?.firstName || '',
  lastName: userData.lastName || user?.lastName || '',
  displayName: userData.displayName || user?.displayName || '',
  email: userData.email || user?.email || '',
  phone: userData.phone || user?.phone || '',
  location: userData.location || user?.location || '',
  bio: userData.bio || user?.bio || '',
  // ... rest of fields
};

console.log('=== FINAL MERGED FORM DATA ===');
console.log('Merged form data:', mergedFormData);

setFormData(mergedFormData);
```

**Key Logic**: `userData.field || user?.field || ''`

- First tries API data (database)
- Falls back to Cognito data from user context
- Finally defaults to empty string

This ensures that:

- Database updates take precedence (if user updated via web app or API)
- Cognito attributes are used if not in database
- Fields are never accidentally cleared

### 4. Call Cognito Sync in EditProfileScreen

Updated `EditProfileScreen.tsx` to sync profile changes back to Cognito:

**When saving profile data (lines 233-247):**

```typescript
// Sync profile changes to Cognito user attributes
console.log('=== SYNCING TO COGNITO ===');
const cognitoAttributes: any = {};

if (updateData.name) cognitoAttributes.name = updateData.name;
if (updateData.firstName) cognitoAttributes.given_name = updateData.firstName;
if (updateData.lastName) cognitoAttributes.family_name = updateData.lastName;
if (updateData.location) cognitoAttributes.address = updateData.location;
if (updateData.bio) cognitoAttributes.profile = updateData.bio;
if (updateData.phone) cognitoAttributes.phone_number = updateData.phone;

const cognitoUpdateSuccess = await authService.updateUserAttributes(
  cognitoAttributes,
);
if (!cognitoUpdateSuccess) {
  console.warn(
    '⚠️ Failed to sync some attributes to Cognito, but profile was saved to database',
  );
}
```

**When uploading profile photo (lines 362-369):**

```typescript
// Sync profile photo to Cognito
console.log('=== SYNCING PHOTO TO COGNITO ===');
const cognitoPhotoUpdateSuccess = await authService.updateUserAttributes({
  picture: photoUrl,
});
if (!cognitoPhotoUpdateSuccess) {
  console.warn(
    '⚠️ Failed to sync photo to Cognito, but photo was saved to database',
  );
}
```

## Cognito Attribute Mapping

| User Object Field | Cognito Attribute | Description                 |
| ----------------- | ----------------- | --------------------------- |
| `name`            | `name`            | Full name                   |
| `firstName`       | `given_name`      | First name                  |
| `lastName`        | `family_name`     | Last name                   |
| `location`        | `address`         | Location/address            |
| `bio`             | `profile`         | Bio/profile description     |
| `phone`           | `phone_number`    | Phone number (E.164 format) |
| `profileImage`    | `picture`         | Profile photo URL           |
| `email`           | `email`           | Email address               |
| `userType`        | `custom:userType` | breeder or dog-parent       |

## Benefits

1. **Two-Way Sync**: Profile data now flows both ways between Cognito and the database
2. **Consistent Data**: User attributes are consistent across Cognito and DynamoDB
3. **Proper Pre-population**: All form fields are now properly pre-populated with existing data
4. **Single Source of Truth**: Cognito serves as the source of truth for identity attributes
5. **Offline Resilience**: Data is cached in AsyncStorage and synced when online

## Testing

To verify the fix works:

1. **Login with an existing user** that has profile data in Cognito
2. **Navigate to Edit Profile** screen
3. **Verify all fields are pre-populated**:
   - ✅ First Name
   - ✅ Last Name
   - ✅ Location
   - ✅ Bio
   - ✅ Phone
   - ✅ Profile Image
4. **Update any field** and save
5. **Logout and login again**
6. **Verify the updated data persists** and is pre-populated correctly

## Files Modified

- ✅ `/apps/mobile-app/src/services/authService.ts` - Extract and sync Cognito attributes
- ✅ `/apps/mobile-app/src/screens/forms/EditProfileScreen.tsx` - Sync updates to Cognito

## Dependencies

No new dependencies added. Uses existing:

- `aws-amplify/auth` - `updateUserAttributes` function
- `@react-native-async-storage/async-storage` - Local caching

## Troubleshooting

If fields are still not showing up, check the logs in your development console:

### 1. Check if Cognito has the data

Look for this log during login:

```
User data created: { name: '...', email: '...' }
```

Check the user object in AuthContext to see if Cognito attributes are present:

```
=== EditProfileScreen useEffect ===
User object: { firstName: '...', lastName: '...', location: '...', bio: '...' }
```

### 2. Check the data merge

Look for these logs when EditProfileScreen loads:

```
=== DATA MERGE DEBUG ===
userData from API: { firstName: undefined, lastName: undefined, location: undefined, bio: undefined, phone: undefined }
user from Cognito context: { firstName: 'John', lastName: 'Doe', location: 'New York', bio: 'Dog lover', phone: '+15551234567' }
=== FINAL MERGED FORM DATA ===
Merged form data: { firstName: 'John', lastName: 'Doe', location: 'New York', bio: 'Dog lover', phone: '+15551234567' }
```

If you see:

- **API data is undefined but Cognito has data** ✅ Working correctly (using Cognito fallback)
- **Both API and Cognito are undefined** ❌ Data is not in Cognito - need to update Cognito attributes
- **Merged data is empty** ❌ Check the merge logic in EditProfileScreen

### 3. Manually update Cognito attributes

If the data is not in Cognito, you need to update it manually. You can do this by:

1. Open the edit profile screen
2. Fill in the fields manually
3. Save the profile
4. The new `updateUserAttributes` method will sync it to Cognito
5. Next time you login, the fields should be pre-populated

### 4. Check Cognito User Pool configuration

Verify that these attributes are enabled in your Cognito User Pool:

- ✅ `address` (for location)
- ✅ `profile` (for bio)
- ✅ `phone_number` (for phone)
- ✅ `picture` (for profile image)
- ✅ `given_name` (for first name)
- ✅ `family_name` (for last name)

If they're not enabled, you'll need to enable them in AWS Cognito console.

## Notes

- Phone numbers must be in E.164 format for Cognito (`+15551234567`)
- Profile image URLs should be publicly accessible (S3 URLs)
- If Cognito sync fails, the profile is still saved to the database (graceful degradation)
- All updates are logged for debugging purposes
- The merge logic prioritizes database data over Cognito data (database is more likely to be up-to-date)
