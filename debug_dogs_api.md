# Dogs API Debug Guide

## Issue
Dogs are being added successfully but not showing in the listing.

## Potential Causes
1. **Filtering Issue**: The shared dogs API might be filtering out the user's dogs incorrectly
2. **Field Mismatch**: The dogs might be missing required fields like `ownerId`
3. **Response Format**: The API response format might not match what the frontend expects

## Changes Made
1. ✅ Fixed filtering to use `ownerId` instead of `kennelOwners`
2. ✅ Added `callName` field to Dog interface
3. ✅ Updated API to handle `callName` in create/update operations

## Testing Steps

### 1. Test the Dogs API Directly
```bash
# Start the breeder-app in development mode
cd /Users/Efren/repos/homeforpup/apps/breeder-app
npm run dev

# In another terminal, test the API (replace with actual session)
curl -H "Cookie: your-session-cookie" http://localhost:3001/api/dogs
```

### 2. Check DynamoDB Logs
Look for console logs in the API that show:
- DynamoDB query parameters
- Number of dogs found
- Filtering results

### 3. Verify Dog Creation
When creating a dog, check:
- Is `ownerId` being set correctly?
- Are all required fields present?
- Is the dog actually being saved to DynamoDB?

### 4. Frontend Debugging
In the browser console:
- Check Network tab for API calls to `/api/dogs`
- Look for any JavaScript errors
- Verify the API response format

## Expected API Response Format
```json
{
  "dogs": [
    {
      "id": "dog-123",
      "ownerId": "user-456",
      "name": "Buddy",
      "callName": "Bud",
      "breed": "Golden Retriever",
      "gender": "male",
      "birthDate": "2023-01-01",
      "weight": 25,
      "color": "Golden",
      "description": "Friendly dog",
      "breedingStatus": "available",
      "healthStatus": "excellent",
      "dogType": "parent",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "count": 1,
  "page": 1,
  "limit": 20,
  "hasMore": false
}
```

## Next Steps
1. Test API directly with curl or Postman
2. Check browser network tab when adding/listing dogs
3. Verify DynamoDB table structure matches Dog interface
4. Check authentication and session handling
