# Dogs List Fix - Breeder iOS App

## Issue

The dogs list in the breeder-ios-app was not showing real dogs from the API. It was displaying mock/dummy data.

## Root Cause

The `DogsScreen.tsx` component had a TODO comment and was using a `setTimeout` to show hardcoded mock data instead of calling the API service.

## Changes Made

### 1. API Updates (Backend)

#### `/apps/homeforpup-api/src/functions/dogs/list/index.ts`

- Added `ownerId` query parameter support
- Added GSI query support for filtering dogs by owner ID
- This allows efficient server-side filtering instead of fetching all dogs

**Changes:**

```typescript
// Added ownerId to query parameters
const { kennelId, ownerId, type, gender, ... } = queryParams;

// Added ownerId query support
if (ownerId) {
  const command = new QueryCommand({
    TableName: DOGS_TABLE,
    IndexName: 'OwnerIdIndex',
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  });
  // ...
}
```

### 2. Mobile App Updates (Frontend)

#### `/apps/breeder-ios-app/src/screens/main/DogsScreen.tsx`

- Removed mock data
- Implemented real API call using `apiService.getDogs()`
- Added authentication context to get current user ID
- Added proper error handling with error banner and retry functionality
- Now filters dogs by `ownerId` on the server
- Added loading states and empty states
- Improved UX with pull-to-refresh

**Key Changes:**

```typescript
// Import API service and auth context
import apiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

// Get current user
const { user } = useAuth();

// Fetch dogs filtered by owner
const response = await apiService.getDogs({
  ownerId: user.id,
  limit: 100,
  page: 1,
});
```

#### `/apps/breeder-ios-app/src/services/apiService.ts`

- Added `ownerId` parameter to `getDogs()` method
- Updated `getDashboardStats()` to accept `userId` parameter
- Now filters dashboard stats by current user's data

**Changes:**

```typescript
async getDogs(params: {
  // ... other params
  ownerId?: string;  // NEW
  // ... other params
}): Promise<ApiResponse<DogsResponse>>

async getDashboardStats(userId?: string): Promise<ApiResponse<DashboardStats>>
```

#### `/apps/breeder-ios-app/src/hooks/useApi.ts`

- Updated `useDashboardStats()` hook to accept and pass `userId`

#### `/apps/breeder-ios-app/src/screens/main/DashboardScreen.tsx`

- Now passes `user?.id` to `useDashboardStats()` hook

## Prerequisites

The API changes require that a DynamoDB Global Secondary Index (GSI) exists:

- **Index Name:** `OwnerIdIndex`
- **Partition Key:** `ownerId`
- **Table:** Dogs table

If this index doesn't exist, you'll need to add it to the DynamoDB table definition.

## Deployment Steps

### 1. Deploy API Changes

```bash
cd apps/homeforpup-api
npm run build
npm run deploy
```

### 2. Test API Endpoint

After deployment, test the new ownerId filter:

```bash
# Replace with your actual user ID and API endpoint
curl "https://api.homeforpup.com/development/dogs?ownerId=YOUR_USER_ID&limit=10"
```

### 3. Test Mobile App

```bash
cd apps/breeder-ios-app
npm start
# Then press 'i' for iOS or 'a' for Android
```

## Testing Checklist

After deploying:

- [ ] API accepts `ownerId` query parameter
- [ ] API returns only dogs owned by the specified user
- [ ] Mobile app shows loading state while fetching
- [ ] Mobile app displays actual dogs from the API
- [ ] Mobile app shows empty state when user has no dogs
- [ ] Mobile app shows error banner if API call fails
- [ ] Pull-to-refresh works correctly
- [ ] Dashboard stats show correct counts for current user

## Troubleshooting

### Issue: "No dogs showing"

**Possible Causes:**

1. User is not logged in
2. User has no dogs in the database
3. API endpoint is failing
4. `OwnerIdIndex` GSI doesn't exist

**Solutions:**

1. Check console logs for API response
2. Verify user is authenticated
3. Check API CloudWatch logs
4. Verify GSI exists in DynamoDB

### Issue: "Cannot query by ownerId"

**Cause:** The `OwnerIdIndex` GSI doesn't exist on the Dogs table.

**Solution:** Add the GSI to the DynamoDB table:

```typescript
// In CDK or CloudFormation
{
  indexName: 'OwnerIdIndex',
  partitionKey: { name: 'ownerId', type: 'S' },
  projectionType: 'ALL'
}
```

### Issue: API returns 401 Unauthorized

**Cause:** Authentication token is invalid or expired.

**Solution:**

1. Re-login in the mobile app
2. Check that token is being sent in Authorization header
3. Verify Cognito configuration

## Benefits

1. ✅ **Real Data:** Shows actual dogs from the database
2. ✅ **User-Specific:** Only shows dogs owned by the current user
3. ✅ **Efficient:** Server-side filtering using DynamoDB GSI
4. ✅ **Better UX:** Proper loading, error, and empty states
5. ✅ **Pull-to-Refresh:** Users can manually refresh the list
6. ✅ **Error Recovery:** Retry button on errors
7. ✅ **Dashboard Fix:** Dashboard now shows user-specific stats

## Related Files

### Backend

- `/apps/homeforpup-api/src/functions/dogs/list/index.ts` - Dogs list Lambda
- `/apps/homeforpup-api/lib/stacks/api-stack.ts` - API Gateway configuration

### Frontend

- `/apps/breeder-ios-app/src/screens/main/DogsScreen.tsx` - Dogs list screen
- `/apps/breeder-ios-app/src/screens/main/DashboardScreen.tsx` - Dashboard screen
- `/apps/breeder-ios-app/src/services/apiService.ts` - API service
- `/apps/breeder-ios-app/src/hooks/useApi.ts` - API hooks
- `/apps/breeder-ios-app/src/contexts/AuthContext.tsx` - Auth context

## Summary

✅ **Fixed:** DogsScreen now fetches real dogs from API  
✅ **Improved:** Added ownerId filtering for efficiency  
✅ **Enhanced:** Better error handling and UX  
🚀 **Action:** Deploy API changes with `cd apps/homeforpup-api && npm run deploy`  
📱 **Testing:** Test mobile app to verify dogs list works

---

**Last Updated:** October 8, 2025  
**Issue:** Dogs list showing mock data  
**Root Cause:** API call not implemented in DogsScreen  
**Fix:** Implemented real API calls with ownerId filtering  
**Status:** ✅ Code complete, ready for deployment
