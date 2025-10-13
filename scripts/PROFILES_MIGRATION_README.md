# Profiles Table Migration Scripts

## Overview

These scripts help you migrate from `homeforpup-users` to the new `homeforpup-profiles` table structure.

## Why the Migration?

The new architecture separates concerns:
- **Cognito**: Manages identity fields (firstName, lastName, phone, picture, bio, userType)
- **Profiles Table**: Stores application-specific data (preferences, subscription, role info)

This eliminates duplicate data and follows AWS best practices.

## Scripts

### 1. `setup-profiles-table.js`

**Purpose**: Creates the new `homeforpup-profiles` table

**What it does:**
- Creates table with `userId` as primary key
- Sets up pay-per-request billing
- Enables DynamoDB streams
- Adds appropriate tags

**Run:**
```bash
node scripts/setup-profiles-table.js
```

**Output:**
```
✅ Table 'homeforpup-profiles' created successfully!
✅ Table is now ACTIVE and ready to use!
```

### 2. `migrate-users-to-profiles.js`

**Purpose**: Copies data from `homeforpup-users` to `homeforpup-profiles`

**What it does:**
1. Scans all records from `homeforpup-users`
2. **Removes Cognito-only fields** from each record:
   - firstName, lastName, username
   - phone, phoneNumber, phone_number
   - location, address
   - profileImage, picture
   - bio, profile
   - userType
   - passwordHash, refreshToken (if present)
3. Writes cleaned records to `homeforpup-profiles`
4. Verifies migration success

**Run:**
```bash
node scripts/migrate-users-to-profiles.js
```

**Output:**
```
📊 Migration Summary:
   ✅ Migrated: 150
   ⏭️  Skipped: 0
   ❌ Errors: 0
   📝 Total: 150

✅ Verified 150 profiles in target table
```

## Complete Migration Process

### Prerequisites

1. AWS credentials configured
2. Correct AWS region set
3. DynamoDB tables accessible

```bash
# Set AWS credentials
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret

# Or use AWS profile
export AWS_PROFILE=default
```

### Step-by-Step Guide

#### Step 1: Create Profiles Table

```bash
cd /Users/Efren/repos/homeforpup
node scripts/setup-profiles-table.js
```

**Expected output:**
```
🔍 Checking if table 'homeforpup-profiles' exists...
📝 Creating table 'homeforpup-profiles'...
✅ Table 'homeforpup-profiles' created successfully!
⏰ Waiting for table to become active...
   Status: CREATING
   Status: ACTIVE
✅ Table is now ACTIVE and ready to use!
```

**What happened:**
- New table created in DynamoDB
- Old `homeforpup-users` table untouched
- Both tables can coexist

#### Step 2: Migrate Data (Optional)

⚠️ **Only run if you have existing user data to migrate**

```bash
node scripts/migrate-users-to-profiles.js
```

**Expected output:**
```
📖 Scanning all records from 'homeforpup-users'...
   Scan 1: Found 150 records (Total: 150)
✅ Scan complete. Total records: 150

🔄 Migrating 150 users to profiles table...
   ✓ Batch 1: Migrated 25 profiles
   ✓ Batch 2: Migrated 25 profiles
   ...
   ✓ Batch 6: Migrated 25 profiles

📊 Migration Summary:
   ✅ Migrated: 150
   ⏭️  Skipped: 0
   ❌ Errors: 0

🔍 Verifying migration...
✅ Profiles table contains 150 records

📋 Sample profiles:
   Profile 1:
   - userId: abc123
   - email: user@example.com
   - Has Cognito fields: ✅ NO (CORRECT)
   - Has preferences: ✅
```

**What happened:**
- Copied all user records to profiles table
- Removed Cognito-managed fields automatically
- Verified data integrity
- Old table remains unchanged as backup

#### Step 3: Deploy API

```bash
cd apps/homeforpup-api
npm run build
npx cdk synth
npx cdk deploy
```

**What happens:**
- API now uses `/profiles/:id` endpoints
- Lambda functions access `homeforpup-profiles` table
- Old table remains available as backup

#### Step 4: Test Endpoints

```bash
# Get your user ID from Cognito or database
USER_ID="your-user-id-here"

# Test new profile endpoint
curl https://your-api-url/profiles/$USER_ID

# Should return:
# {
#   "profile": {
#     "userId": "...",
#     "email": "...",
#     "preferences": {...},
#     // No firstName, lastName, phone, etc.
#   }
# }

# Test dog endpoint with kennel join
curl https://your-api-url/dogs/some-dog-id

# Should return:
# {
#   "dog": {...},
#   "kennel": {...}
# }
```

#### Step 5: Verify & Monitor

```bash
# Check CloudWatch logs
aws logs tail /aws/lambda/get-profile --follow

# Monitor DynamoDB
aws dynamodb describe-table --table-name homeforpup-profiles

# Check item count
aws dynamodb scan --table-name homeforpup-profiles --select COUNT
```

#### Step 6: Update Cognito Attributes (If Needed)

If migrating existing users, ensure their Cognito attributes are populated:

```javascript
// Example: Sync old profile data to Cognito
const { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } = require('@aws-sdk/client-cognito-identity-provider');

const cognito = new CognitoIdentityProviderClient({ region: 'us-east-1' });

async function syncToCognito(userId, oldUserData) {
  const attributes = [];
  
  if (oldUserData.firstName) {
    attributes.push({ Name: 'given_name', Value: oldUserData.firstName });
  }
  if (oldUserData.lastName) {
    attributes.push({ Name: 'family_name', Value: oldUserData.lastName });
  }
  if (oldUserData.phone) {
    attributes.push({ Name: 'phone_number', Value: oldUserData.phone });
  }
  if (oldUserData.profileImage) {
    attributes.push({ Name: 'picture', Value: oldUserData.profileImage });
  }
  if (oldUserData.bio) {
    attributes.push({ Name: 'profile', Value: oldUserData.bio });
  }
  if (oldUserData.location) {
    attributes.push({ Name: 'address', Value: oldUserData.location });
  }
  
  if (attributes.length > 0) {
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: userId,
      UserAttributes: attributes,
    });
    
    await cognito.send(command);
  }
}
```

## Data Comparison

### Before Migration (homeforpup-users)
```json
{
  "userId": "abc123",
  "email": "john@example.com",
  "firstName": "John",         // ❌ Will be removed
  "lastName": "Doe",           // ❌ Will be removed
  "phone": "+1234567890",      // ❌ Will be removed
  "profileImage": "https://...", // ❌ Will be removed
  "bio": "Dog breeder...",     // ❌ Will be removed
  "userType": "breeder",       // ❌ Will be removed
  "preferences": {...},        // ✅ Will be kept
  "isPremium": true,           // ✅ Will be kept
  "breederInfo": {...}         // ✅ Will be kept
}
```

### After Migration (homeforpup-profiles)
```json
{
  "userId": "abc123",
  "email": "john@example.com",
  "name": "John Doe",
  "preferences": {...},        // ✅ Kept
  "isPremium": true,           // ✅ Kept
  "breederInfo": {...},        // ✅ Kept
  "socialLinks": {...},        // ✅ Kept
  "coverPhoto": "https://...", // ✅ Kept
  "createdAt": "2024-01-01T...",
  "updatedAt": "2024-01-01T..."
}
```

### Cognito Attributes (Separate Storage)
```json
{
  "sub": "abc123",             // → userId
  "email": "john@example.com",
  "given_name": "John",        // ← firstName
  "family_name": "Doe",        // ← lastName
  "phone_number": "+1234567890", // ← phone
  "picture": "https://...",    // ← profileImage
  "profile": "Dog breeder...", // ← bio
  "address": "San Francisco, CA", // ← location
  "custom:userType": "breeder" // ← userType
}
```

## Verification Queries

### Check Table Exists
```bash
aws dynamodb describe-table --table-name homeforpup-profiles
```

### Check Record Count
```bash
# Old table
aws dynamodb scan --table-name homeforpup-users --select COUNT

# New table
aws dynamodb scan --table-name homeforpup-profiles --select COUNT

# Should match after migration
```

### Sample Profile Data
```bash
aws dynamodb scan --table-name homeforpup-profiles --limit 3
```

### Verify No Cognito Fields
```bash
# Get a sample profile
aws dynamodb get-item \
  --table-name homeforpup-profiles \
  --key '{"userId": {"S": "your-user-id"}}'

# Check output - should NOT contain:
# - firstName, lastName, phone, profileImage, bio, userType
```

## Troubleshooting

### Issue: Table already exists
```
Error: Table 'homeforpup-profiles' already exists
```
**Solution**: Table is already set up. Skip to migration step or deployment.

### Issue: Source table not found
```
Error: Source table 'homeforpup-users' does not exist!
```
**Solution**: 
- You're in a fresh environment with no existing data
- Skip migration, proceed to deployment
- New profiles will be created as users sign up

### Issue: Permission denied
```
Error: User is not authorized to perform: dynamodb:CreateTable
```
**Solution**: 
- Check AWS credentials
- Ensure IAM user/role has DynamoDB permissions
- Use an admin account for table creation

### Issue: Migration shows errors
```
📊 Migration Summary:
   ✅ Migrated: 145
   ❌ Errors: 5
```
**Solution**:
- Check CloudWatch logs for specific errors
- Verify problematic records manually
- Re-run migration (it's idempotent)

## Rollback

If you need to rollback:

```bash
# 1. Point API back to old table (temporarily)
# Edit lib/config/environments.ts
profiles: 'homeforpup-users',  // Temporarily point back

# 2. Redeploy
cd apps/homeforpup-api
cdk deploy

# 3. Investigate issues

# 4. Delete new table if needed
aws dynamodb delete-table --table-name homeforpup-profiles
```

## Post-Migration Cleanup

After 30 days of successful operation:

```bash
# 1. Verify everything works
# 2. Create final backup of old table
aws dynamodb create-backup \
  --table-name homeforpup-users \
  --backup-name final-users-backup

# 3. Delete old table
aws dynamodb delete-table --table-name homeforpup-users

# 4. Remove backward compatibility code (optional)
# Remove deprecated getUserById() and updateUser() from apiService.ts
```

## Success Criteria

✅ New table created successfully  
✅ Data migrated (if applicable)  
✅ API deployed without errors  
✅ Endpoints responding correctly  
✅ Mobile app functioning normally  
✅ No Cognito fields in profiles table  
✅ Authorization working correctly  
✅ Performance metrics acceptable  

## Support

If you encounter issues:

1. Check the error message carefully
2. Review CloudWatch logs
3. Verify AWS credentials and permissions
4. Check table names in environment config
5. Review the migration documentation
6. Use rollback procedure if needed

## Quick Commands Reference

```bash
# Setup
node scripts/setup-profiles-table.js

# Migrate (optional)
node scripts/migrate-users-to-profiles.js

# Deploy
cd apps/homeforpup-api && cdk deploy

# Test
curl https://api-url/profiles/user-id

# Verify
aws dynamodb describe-table --table-name homeforpup-profiles

# Cleanup (after 30 days)
aws dynamodb delete-table --table-name homeforpup-users
```

---

**Status**: Scripts ready ✅  
**Safe to Run**: Yes ✅  
**Idempotent**: Yes ✅  
**Rollback Available**: Yes ✅

