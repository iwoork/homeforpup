# Users to Profiles Migration

## Overview
Renaming `homeforpup-users` table to `homeforpup-profiles` and moving user identity fields to Cognito-only storage.

## Fields Migration

### Fields Moved to Cognito Only (Not stored in profiles table)
These fields are managed by Cognito and should NOT be duplicated in the profiles table:
- `firstName` - Cognito attribute
- `lastName` - Cognito attribute  
- `username` - Cognito attribute
- `picture`/`profileImage` - Cognito attribute
- `phone_number` - Cognito attribute
- `address`/`location` - Cognito attribute
- `profile`/`bio` (description) - Cognito attribute
- `userType` - Already in Cognito as `custom:userType`

### Fields Remaining in Profiles Table
Application-specific profile data that extends Cognito:
- `userId` - Primary key (from Cognito sub)
- `email` - For reference (also in Cognito)
- `name` - Display name (can differ from Cognito name)
- `displayName` - Public display name override
- `verified` - Application verification status
- `accountStatus` - Application-level status
- `coverPhoto` - Additional profile imagery
- `galleryPhotos` - Photo gallery
- `coordinates` - Geolocation data
- Premium subscription fields
- Preferences (notifications, privacy)
- Role-specific info (breederInfo, puppyParentInfo)
- Social links
- Profile metadata (createdAt, updatedAt, lastActiveAt, profileViews)

## Changes Required

### 1. Type Definitions
- Create new `Profile` interface without Cognito fields
- Keep `User` interface for backward compatibility (deprecated)
- Update all imports to use `Profile`

### 2. Database Table
- Rename: `homeforpup-users` → `homeforpup-profiles`
- Update all environments (development, staging, production)

### 3. API Endpoints
- Rename: `/users/*` → `/profiles/*`
- `GET /profiles/:id` - Get profile
- `PUT /profiles/:id` - Update profile
- Update Lambda function names and paths

### 4. Lambda Functions
- Rename folder: `src/functions/users/` → `src/functions/profiles/`
- Update environment variable: `USERS_TABLE` → `PROFILES_TABLE`
- Update all table references in code

### 5. CDK Infrastructure
- Update `EnvironmentConfig.tables.users` → `tables.profiles`
- Update `createUsersApi()` → `createProfilesApi()`
- Update all function names and paths

### 6. Mobile App
- Update API service endpoints
- Update type imports
- Update all component references

## Implementation Plan

1. ✅ Document current structure
2. ✅ Update type definitions (Profile interface created, User deprecated)
3. ✅ Update config files (table names changed to profiles)
4. ✅ Update CDK infrastructure (createProfilesApi, updated dogs API)
5. ✅ Rename Lambda function folders (users → profiles)
6. ✅ Update Lambda handlers (PROFILES_TABLE, response keys)
7. ✅ Update mobile app API service (new methods + backward compatibility)
8. ⏳ Update mobile app components (optional - backward compatible)
9. ⏳ Test all endpoints
10. ⏳ Deploy changes
11. ⏳ Data migration (rename table in AWS)

## Breaking Changes

### API Endpoints
- `GET /users/:id` → `GET /profiles/:id`
- `PUT /users/:id` → `PUT /profiles/:id`

### Response Format
- `{ user: {...} }` → `{ profile: {...} }`
- Removed fields will no longer be in response

### Client Updates Required
Clients must:
1. Update endpoint URLs
2. Update response object key from `user` to `profile`
3. Fetch Cognito attributes separately for identity fields
4. Update type imports

## Backward Compatibility

**NOT backward compatible** - this is a breaking change.

Mitigation strategy:
1. Support both endpoints temporarily (redirect old to new)
2. Version the API if needed
3. Clear documentation of migration path

## Data Migration

### New Table Creation Approach (Recommended)

✅ **Safer**: Both tables coexist during transition  
✅ **Zero Downtime**: Switch tables without service interruption  
✅ **Backup**: Old table remains as backup  

**Steps:**
1. Run `node scripts/setup-profiles-table.js` - Creates new table
2. Run `node scripts/migrate-users-to-profiles.js` - Copies and cleans data
3. Deploy API with new table reference
4. Monitor for 30 days
5. Delete old table after verification

**Scripts:**
- `scripts/setup-profiles-table.js` - Creates homeforpup-profiles table
- `scripts/migrate-users-to-profiles.js` - Migrates data with field cleanup
- `scripts/PROFILES_MIGRATION_README.md` - Detailed guide

**Benefits:**
- No risk to existing data
- Can rollback instantly by pointing back to old table
- Old table serves as backup during transition
- Automatic Cognito field cleanup during migration

## Testing Checklist

- [x] Profile type compiles without errors
- [x] CDK infrastructure updated
- [ ] CDK synth succeeds  
- [ ] Deploy to AWS
- [ ] Rename DynamoDB table (homeforpup-users → homeforpup-profiles)
- [ ] GET /profiles/:id returns profile
- [ ] PUT /profiles/:id updates profile
- [ ] Profile response excludes Cognito fields
- [ ] Legacy /users endpoints still work (backward compatibility)
- [ ] Mobile app displays profile correctly
- [ ] Mobile app updates profile successfully
- [ ] Cognito attributes accessible separately
- [ ] Authorization still works correctly
- [ ] Profile views increment correctly
- [ ] Premium features still work
- [ ] Messages API still works with profiles
- [ ] Dog kennel join includes owner profile info

## Rollback Plan

If issues arise:
1. Revert CDK deployment
2. Restore old Lambda functions
3. Switch mobile app back to /users endpoints
4. Keep both tables until stable

## Timeline

1. Development: 2-4 hours
2. Testing: 1-2 hours
3. Deployment: 30 minutes
4. Monitoring: 24 hours
5. Cleanup: After 30 days

## Documentation Updates

- [ ] API documentation
- [ ] Type definitions documentation
- [ ] Mobile app integration guide
- [ ] Cognito integration guide
- [ ] Migration guide for other clients

