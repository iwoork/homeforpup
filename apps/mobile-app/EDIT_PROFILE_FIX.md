# Edit Profile Screen Prefill Fix

## Issue

The Edit Profile screen was not prefilling user information from the API and DynamoDB when the screen loaded. The form fields were empty or showed stale data from the AuthContext.

## Root Causes

### 1. Missing API Fetch on Mount

The `EditProfileScreen` component was initializing form data only from the `user` object in AuthContext during component mount, but never fetched the latest data from the API/DynamoDB.

### 2. Type Mismatch in API Response

The Users API returns user data in the format `{ user: User }`, but the mobile app's API service was typed to expect just `User` directly. This caused TypeScript type errors and incorrect data access.

## Changes Made

### 1. Added Profile Data Fetching (`EditProfileScreen.tsx`)

- Added `fetchingProfile` state to track loading status
- Added `useEffect` hook that:
  - Fetches latest user data from API on component mount
  - Updates form fields with fresh data from DynamoDB
  - Updates local AuthContext with latest data
  - Shows loading indicator while fetching
  - Handles errors gracefully with fallback to cached data

### 2. Fixed API Response Types (`apiService.ts`)

Changed the return types to match the actual API response structure:

**Before:**

```typescript
async getUserById(id: string): Promise<ApiResponse<User>>
async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>>
```

**After:**

```typescript
async getUserById(id: string): Promise<ApiResponse<{ user: User }>>
async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<{ user: User }>>
```

### 3. Updated Response Handling

Updated all places in `EditProfileScreen.tsx` that access user data from API responses to use `response.data.user` instead of `response.data`:

- Profile data fetch in `useEffect`
- Profile update in `handleSubmit`
- Photo update in `handlePhotoUpload`

## Benefits

1. **Fresh Data**: Profile screen now always shows the latest data from DynamoDB
2. **Type Safety**: Proper TypeScript types prevent runtime errors
3. **Better UX**: Loading indicator shows while fetching data
4. **Error Handling**: Graceful fallback to cached data if API fails
5. **Consistency**: Local state is synced with backend data

## Testing Recommendations

1. **Profile Load Test**

   - Navigate to Edit Profile screen
   - Verify loading indicator appears briefly
   - Verify all fields are populated with correct data
   - Check console logs for successful API fetch

2. **Profile Update Test**

   - Change profile fields
   - Save changes
   - Navigate away and back to Edit Profile
   - Verify changes were persisted

3. **Photo Update Test**

   - Upload a profile photo
   - Verify photo appears immediately
   - Navigate away and back
   - Verify photo is still showing

4. **Error Handling Test**
   - Disable network
   - Navigate to Edit Profile
   - Verify error message appears
   - Verify cached data is shown (if available)

## API Endpoints Used

- `GET /users/{id}` - Fetch user profile (apps/homeforpup-api/src/functions/users/get/index.ts)
- `PUT /users/{id}` - Update user profile (apps/homeforpup-api/src/functions/users/update/index.ts)

Both endpoints are properly configured in the API stack and deployed.

## Files Modified

1. `apps/mobile-app/src/screens/forms/EditProfileScreen.tsx`

   - Added profile fetching on mount
   - Added loading state
   - Fixed response data access
   - Removed kennel name field (managed in separate Kennel Management feature)
   - Added link to Kennel Management with helpful info card

2. `apps/mobile-app/src/services/apiService.ts`
   - Fixed return types for `getUserById` and `updateUser`

## Console Logs

The fix includes detailed console logging for debugging:

- Profile fetch start/complete
- API responses
- Data updates
- Error conditions

Look for these log prefixes:

- `=== FETCHING USER PROFILE ===`
- `=== PROFILE UPDATE START ===`
- `=== PHOTO UPDATE START ===`
