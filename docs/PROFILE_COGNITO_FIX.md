# Profile Edit - Location & Bio Save Fix ✅

## 🐛 Problem

When editing a breeder profile (or any profile), the **location** and **bio** (description) fields were **not being saved**:
- ❌ Not saved to Cognito
- ❌ Not saved to profiles table
- ❌ Data was being lost completely

## 🔍 Root Cause

The API was configured to:
1. **Block** Cognito-managed fields (`location`, `bio`, `phone`, `firstName`, etc.) from being saved to the profiles table ✅ (correct)
2. But **NOT update Cognito** with those values ❌ (missing!)

So the data was being deleted without being saved anywhere.

---

## ✅ Solution Implemented

### 1. **Updated Profile Update API Handler**

**File:** `apps/homeforpup-api/src/functions/profiles/update/index.ts`

**Changes:**
- ✅ Added Cognito SDK import
- ✅ Extract Cognito-only fields BEFORE deletion
- ✅ Update Cognito user attributes with these fields
- ✅ Then update profiles table with remaining fields

**Cognito Fields Managed:**
- `firstName` → Cognito `given_name`
- `lastName` → Cognito `family_name`
- `phone` → Cognito `phone_number`
- `location` → Cognito `address`
- `profileImage` → Cognito `picture`
- `bio` → Cognito `profile`

### 2. **Updated API Stack Configuration**

**File:** `apps/homeforpup-api/lib/stacks/api-stack.ts`

**Changes:**
- ✅ Added `USER_POOL_ID` environment variable to update profile Lambda
- ✅ Granted `cognito-idp:AdminUpdateUserAttributes` permission to Lambda

### 3. **Updated IAM Policy**

**File:** `aws-iam-policy-optimized.json`

**Changes:**
- ✅ Added `cognito-idp:AdminUpdateUserAttributes` action to Cognito permissions

---

## 🚀 Testing the Fix

### Test Steps:

1. **Open your mobile app**
2. **Go to Profile → Edit Profile**
3. **Update the following fields:**
   - Location (e.g., "Los Angeles, CA")
   - Bio/Description (e.g., "Experienced breeder...")
   - Phone number (optional)
4. **Tap "Save Changes"**
5. **Expected Result:** ✅ Success message

### Verification:

Check CloudWatch logs for the update profile Lambda:
```bash
aws logs tail /aws/lambda/update-profile-development --follow
```

You should see:
```
Updating Cognito attributes: ['address', 'profile']
✅ Cognito attributes updated successfully
```

### Alternative Verification (AWS Console):

1. Go to Cognito Console: https://console.aws.amazon.com/cognito/v2/idp/user-pools
2. Select your user pool: `us-east-1_M6uzx1eFZ`
3. Go to Users → Find your user
4. Check that `address` and `profile` attributes are populated ✅

---

## 📊 Data Flow After Fix

### Before (Broken):
```
Mobile App → API → 🚫 DELETED location/bio → Nothing saved ❌
```

### After (Fixed):
```
Mobile App 
    → API
        → Extract location/bio
        → ✅ Save to Cognito (address, profile attributes)
        → ✅ Save remaining fields to profiles table
        → Return success
```

---

## 🔐 Security Considerations

### Why Store in Cognito?

**Benefits:**
- ✅ Single source of truth for identity data
- ✅ Consistent user attributes across apps
- ✅ Leverages Cognito's security features
- ✅ Reduces data duplication

### Profiles Table Purpose

The `homeforpup-profiles` table now stores:
- ✅ Application-specific data (preferences, subscription info)
- ✅ Extended profile data (coordinates, cover photo, gallery)
- ✅ Verification and account status
- ❌ NOT identity data (name, phone, bio, location)

---

## 📝 Field Storage Reference

| Field | Stored In | Why |
|-------|-----------|-----|
| `firstName` | Cognito (`given_name`) | Identity |
| `lastName` | Cognito (`family_name`) | Identity |
| `phone` | Cognito (`phone_number`) | Identity |
| `location` | Cognito (`address`) | Identity |
| `bio` | Cognito (`profile`) | Identity |
| `profileImage` | Cognito (`picture`) | Identity |
| `userType` | Cognito (`custom:userType`) | Identity/Role |
| `email` | Cognito & Profiles | Reference |
| `name` | Profiles | Display override |
| `displayName` | Profiles | Public name |
| `coordinates` | Profiles | Geolocation |
| `verified` | Profiles | App verification |
| `isPremium` | Profiles | Subscription |
| `preferences` | Profiles | App settings |
| `breederInfo` | Profiles | Role-specific |
| `socialLinks` | Profiles | Extended data |

---

## ⚠️ Important Notes

### 1. **Apply IAM Policy**
The API Lambda has the Cognito permission (via CDK), but your CLI user needs it too:

```bash
# Apply the updated policy
aws iam put-user-policy \
  --user-name homeforpup \
  --policy-name HomeForPupApplicationPolicy \
  --policy-document file://aws-iam-policy-optimized.json
```

### 2. **Existing Data Migration**
For users who already have data in the old `homeforpup-users` table:

**Option A:** Manual cleanup
- Old data with `location` and `bio` in DynamoDB table will remain
- New saves will go to Cognito
- Consider migrating old data to Cognito

**Option B:** Migration script (if needed)
We can create a script to:
1. Read existing users from `homeforpup-users` table
2. Extract `location`, `bio`, `phone`, etc.
3. Update Cognito user attributes
4. Clean up old table

### 3. **Backwards Compatibility**
The mobile app's `EditProfileScreen` already sends all the correct fields. No mobile app changes needed! 🎉

---

## 🎯 What's Fixed

✅ **Location field** now saves to Cognito `address` attribute  
✅ **Bio/Description field** now saves to Cognito `profile` attribute  
✅ **Phone field** now saves to Cognito `phone_number` attribute  
✅ **Profile image field** now saves to Cognito `picture` attribute  
✅ **First/Last name fields** now save to Cognito `given_name`/`family_name` attributes  
✅ **Other profile fields** (preferences, etc.) save to profiles table  

---

## 🔄 Next Steps

### For You (User):
1. ✅ **API already deployed** - Changes are live!
2. 📋 **Apply IAM policy** - Run command above
3. 📱 **Test mobile app** - Edit your profile
4. ✅ **Verify Cognito** - Check user attributes in AWS Console

### Optional (Future):
- Create migration script for existing users
- Add Cognito attribute validation
- Add profile completion tracking

---

## 📞 Support

If you see errors:
1. Check CloudWatch logs: `/aws/lambda/update-profile-development`
2. Verify IAM policy is applied
3. Confirm mobile app is sending correct data

**Expected Success Logs:**
```
Updating Cognito attributes: ['address', 'profile', 'phone_number']
✅ Cognito attributes updated successfully
```

---

**Status:** ✅ Deployed and Ready to Test!  
**API URL:** `https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/`

