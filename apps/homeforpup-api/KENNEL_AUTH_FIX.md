# Kennel Authorization Fix

## Changes Made

### Problem
Users were getting "Forbidden: You do not have permission to update this kennel" errors when trying to edit kennels they own.

### Root Cause
The authorization check was using `Array.includes()` on fields that might not be arrays, or checking against user IDs that might not match the kennel's ownership fields.

### Solution

Updated three Lambda functions with improved authorization logic:

1. **kennels/update** - Edit kennel authorization
2. **kennels/delete** - Delete kennel authorization  
3. **kennels/list** - List kennels filter

### Key Changes

#### 1. Array Handling
```typescript
// Handle both array and string cases for owners/managers
const ownersArray = Array.isArray(existingKennel.owners) 
  ? existingKennel.owners 
  : (existingKennel.owners ? [existingKennel.owners] : []);
```

#### 2. Multiple Ownership Field Checks
```typescript
const isOwner = 
  ownersArray.includes(userId) ||      // New format: owners array
  existingKennel.ownerId === userId ||  // Legacy format: ownerId field
  existingKennel.createdBy === userId;  // Creator field
```

#### 3. Debug Logging
Added console logging to help diagnose authorization issues:
```typescript
console.log('Checking kennel ownership:', {
  userId,
  kennelId,
  owners: existingKennel.owners,
  ownerId: existingKennel.ownerId,
  createdBy: existingKennel.createdBy,
  managers: existingKennel.managers,
});
```

## Deployment

These Lambda functions need to be redeployed for the changes to take effect:

```bash
cd apps/homeforpup-api
npm run build
npm run deploy
```

Or deploy specific functions:
```bash
cdk deploy --hotswap
```

## Debugging

If the issue persists after deployment:

1. **Check CloudWatch Logs** for the update function to see the logged ownership data
2. **Verify the kennel data** in DynamoDB:
   - Does it have `owners` array?
   - Does it have `ownerId` field?
   - Does it have `createdBy` field?
3. **Check the user ID** from the auth token matches one of these fields

## Testing Checklist

After deployment:
- [ ] Try editing a kennel in the mobile app
- [ ] Check CloudWatch logs for ownership debug output
- [ ] Verify kennel data structure in DynamoDB
- [ ] Test with different kennels (new vs old format)
- [ ] Test delete functionality
- [ ] Test list functionality

## Files Modified

- `/apps/homeforpup-api/src/functions/kennels/update/index.ts`
- `/apps/homeforpup-api/src/functions/kennels/delete/index.ts`
- `/apps/homeforpup-api/src/functions/kennels/list/index.ts`

## Next Steps

If kennels in the database don't have proper ownership fields:

1. **Option A**: Update existing kennels to add ownership fields
2. **Option B**: Migrate old kennels to new format with a script
3. **Option C**: Update kennel creation to always set all ownership fields

Recommend checking a few kennels in DynamoDB first to understand the data structure.

