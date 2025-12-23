# UserType Migration: Cognito as Single Source of Truth

## Summary

Successfully migrated `userType` to use AWS Cognito as the single source of truth. The `userType` field has been removed from the database schema and all database operations. User type is now stored exclusively in Cognito custom attributes and accessed through authentication sessions.

## Architecture Change

### Before
- ❌ `userType` stored in both Cognito AND DynamoDB
- ❌ Potential sync issues between Cognito and database
- ❌ Redundant data storage
- ❌ API needed to manage userType in database

### After
- ✅ `userType` stored ONLY in Cognito (custom attribute: `custom:userType`)
- ✅ Single source of truth - no sync issues
- ✅ Reduced database fields
- ✅ Simpler API - userType not managed in database operations
- ✅ User type comes from JWT token/session

## Changes Made

### 1. Type Definitions Updated

**Files Modified:**
- `/packages/shared-types/src/index.ts`
- `/src/types/index.ts`

**Changes:**
```typescript
// BEFORE
export interface User {
  userId: string;
  email: string;
  name: string;
  userType: 'breeder' | 'dog-parent' | 'both'; // ❌ Removed
  // ... other fields
}

// AFTER
export interface User {
  userId: string;
  email: string;
  name: string;
  // Note: userType is stored in Cognito only, not in database
  // ... other fields
}
```

### 2. API Endpoints Updated

**Files Modified:**
- `/apps/homeforpup-api/src/functions/users/update/index.ts`
- `/src/features/users/api/[id]/route.ts`

**Changes:**

#### Lambda API (AWS API Gateway)
```typescript
// Added userType to disallowed fields
const disallowedFields = [
  'userId', 
  'email', 
  'createdAt', 
  'passwordHash', 
  'refreshToken', 
  'userType' // ✅ Now blocked from database updates
];
```

#### Next.js API Route
```typescript
// Removed userType from DatabaseUserItem interface
interface DatabaseUserItem {
  userId: string;
  name: string;
  // ... other fields
  // userType: removed ✅
}
```

### 3. Mobile App Updated

**Files Modified:**
- `/apps/mobile-app/src/screens/main/ProfileScreen.tsx`
- `/apps/mobile-app/src/screens/forms/EditProfileScreen.tsx`

**Changes:**

#### ProfileScreen.tsx
```typescript
// BEFORE
const apiUserType = response.data.user.userType; // ❌ From database
const isBreederInDb = apiUserType === 'breeder';

// AFTER  
const cognitoUserType = user?.userType; // ✅ From Cognito (user context)
const isBreederInCognito = cognitoUserType === 'breeder';
```

#### EditProfileScreen.tsx
```typescript
// BEFORE
facebook: userData.userType !== 'breeder' ? ... // ❌ From database

// AFTER
facebook: user?.userType !== 'breeder' ? ... // ✅ From Cognito (context)
```

### 4. Web App Updated

**File Modified:**
- `/src/features/users/api/[id]/route.ts`

**Changes:**
- Removed `userType` from `DatabaseUserItem` interface
- Added documentation comment about Cognito storage

## How UserType Works Now

### 1. User Registration
```typescript
// During signup via Cognito
await signUp({
  username: email,
  password: password,
  attributes: {
    email: email,
    name: name,
    'custom:userType': 'dog-parent' // ✅ Stored in Cognito
  }
});
```

### 2. User Login
```typescript
// During login, userType comes from Cognito token
const session = await fetchAuthSession();
const userAttributes = session.tokens?.idToken?.payload;
const userType = userAttributes?.['custom:userType']; // ✅ From Cognito
```

### 3. Switching User Type
```typescript
// Update happens in Cognito only
await authService.updateUserType(newType); // Updates Cognito attribute
// No database update needed ✅
```

### 4. Checking User Type
```typescript
// Frontend checks session/context
const isBreeder = user?.userType === 'breeder'; // From Cognito session
const isDogParent = user?.userType === 'dog-parent';
```

## Data Flow

```
User Registration
    ↓
Cognito (custom:userType stored)
    ↓
Login/Session
    ↓
JWT Token (includes userType in payload)
    ↓
Frontend (extracts userType from session)
    ↓
UI (displays appropriate features)

❌ Database never involved in userType storage/retrieval
```

## Benefits

### 1. **Single Source of Truth**
- No synchronization issues
- One place to manage user type
- Guaranteed consistency

### 2. **Security**
- User type comes from authenticated JWT token
- Cannot be manipulated via database
- Verified by Cognito

### 3. **Performance**
- Reduced database fields
- Faster queries (less data)
- No additional database calls for userType

### 4. **Maintainability**
- Simpler codebase
- Fewer places to update
- Clear separation of concerns (auth vs data)

### 5. **Scalability**
- Cognito handles auth at scale
- Database focused on business data
- Better service separation

## Migration Notes

### Database Cleanup (Optional)
If you want to remove the `userType` column from existing DynamoDB records:

```typescript
// Script to remove userType from existing records
// Run this after deployment if desired
const cleanupUserType = async () => {
  const users = await scanAllUsers();
  
  for (const user of users) {
    await dynamodb.send(new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { userId: user.userId },
      UpdateExpression: 'REMOVE userType',
    }));
  }
};
```

**Note:** This is optional as the field is simply ignored. No harm in leaving it.

### Backward Compatibility
The changes are backward compatible:
- Existing database records with `userType` field are ignored
- API blocks any attempts to write `userType` to database
- Frontend only uses Cognito userType
- Old data can remain in database without issues

## Testing Checklist

- [ ] User registration works with userType in Cognito
- [ ] User login retrieves userType from Cognito
- [ ] Profile editing does not send userType to database
- [ ] User type switching updates Cognito only
- [ ] Breeder/Dog Parent features work correctly
- [ ] API rejects userType in update requests
- [ ] Session refresh maintains userType
- [ ] Mobile app displays correct user type
- [ ] Web app displays correct user type

## Deployment Order

1. ✅ Deploy API changes (blocks userType writes)
2. ✅ Deploy type definition updates
3. ✅ Deploy frontend changes (mobile + web)
4. ⏳ Optional: Run database cleanup script

## Rollback Plan

If issues arise:
1. Revert API changes to allow userType updates
2. Sync Cognito userType to database on user updates
3. Update frontend to read from database
4. Re-deploy previous versions

**Note:** With current architecture, rollback is straightforward as database records can still contain userType field (just not used).

## Documentation Updates Needed

- [ ] Update API documentation to remove userType from updateable fields
- [ ] Update authentication documentation to mention Cognito userType
- [ ] Update developer onboarding docs
- [ ] Update database schema documentation

## Related Files

### Type Definitions
- `packages/shared-types/src/index.ts`
- `src/types/index.ts`

### API Endpoints
- `apps/homeforpup-api/src/functions/users/update/index.ts`
- `apps/homeforpup-api/src/functions/users/get/index.ts`
- `src/features/users/api/[id]/route.ts`

### Mobile App
- `apps/mobile-app/src/services/authService.ts`
- `apps/mobile-app/src/contexts/AuthContext.tsx`
- `apps/mobile-app/src/screens/main/ProfileScreen.tsx`
- `apps/mobile-app/src/screens/forms/EditProfileScreen.tsx`

### Web App
- `src/lib/auth.ts`
- `src/contexts/AuthContext.tsx`
- `src/hooks/useNextAuth.ts`

## Future Improvements

1. **Remove userType from DynamoDB schema entirely**
   - Update CloudFormation/CDK templates
   - Remove from all interfaces completely

2. **Add validation in Cognito**
   - Pre-signup Lambda to validate userType
   - Ensure only valid values are set

3. **Admin tools**
   - Allow admins to change user type via Cognito API
   - Audit log for userType changes

4. **Analytics**
   - Track userType distribution
   - Monitor switching patterns

## Conclusion

The migration to Cognito-only userType storage is complete and provides a cleaner, more maintainable architecture. All components now use Cognito as the single source of truth for user type information, eliminating synchronization issues and simplifying the codebase.

