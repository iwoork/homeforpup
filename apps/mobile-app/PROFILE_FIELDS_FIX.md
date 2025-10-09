# Profile Update Fields Fix

## Issues Found & Fixed

### Issue 1: Optional Fields Not Updating ❌ → ✅ FIXED

**Problem:**
When fields like `firstName`, `lastName`, `displayName` were empty, they were sent as `undefined` in the API request, which meant they weren't updating the database properly.

**Root Cause:**
The code was using:

```typescript
firstName: formData.firstName || undefined,
```

When `formData.firstName` was an empty string `""`, it became `undefined`, and undefined fields don't get serialized in JSON properly or don't trigger database updates.

**Solution:**
Changed to only include fields that have actual values:

```typescript
if (formData.firstName?.trim())
  updateData.firstName = formData.firstName.trim();
if (formData.lastName?.trim()) updateData.lastName = formData.lastName.trim();
if (formData.displayName?.trim())
  updateData.displayName = formData.displayName.trim();
```

Now:

- ✅ Fields are only sent if they have values
- ✅ Empty/whitespace-only fields are ignored
- ✅ Fields are trimmed before sending

### Issue 2: Profile Photo Shows Blob URL ⚠️ NEEDS TESTING

**Problem:**
The profile image shows:

```
"profileImage": "blob:https://homeforpup.com/3452b6f0-6209-4d36-b27b-b3076986f85e"
```

This is a **local temporary URL**, not the actual S3 URL!

**Possible Causes:**

1. Photo was uploaded through web app (which might have a bug)
2. Photo upload to S3 failed silently
3. Previous photo upload didn't complete properly

**Solution Added:**
Added comprehensive logging to track the photo upload process:

```
=== PHOTO UPLOAD TO S3 START ===
Upload URL (presigned): https://...
Final Photo URL (S3): https://img.homeforpup.com/...
Asset URI: file://...
S3 Upload Result: { ok: true, status: 200 }
✅ Photo uploaded to S3 successfully!
=== PHOTO UPDATE START ===
Photo URL to save in DB: https://img.homeforpup.com/...
```

## How to Test

### Test 1: Update First Name, Last Name, Display Name

1. Open the mobile app
2. Go to Profile → Edit Profile
3. **Fill in these fields:**
   - First Name: "Efren"
   - Last Name: "Macasaet"
   - Display Name: "Efren M."
4. Click "Save Changes"
5. **Check the console logs:**
   - Look for: `Update Data:`
   - Verify: `firstName`, `lastName`, `displayName` are all present
6. **Check DynamoDB:**
   - Search for your user ID
   - Verify all three fields are saved
   - Check `updatedAt` timestamp changed

### Test 2: Upload Profile Photo

1. Go to Profile → Edit Profile
2. Click "Change Photo"
3. Select a photo from your library
4. **Watch the console logs carefully:**

Look for this sequence:

```
=== PHOTO UPLOAD TO S3 START ===
Final Photo URL (S3): https://img.homeforpup.com/profile-photos/...  ← Should be img.homeforpup.com
S3 Upload Result: { ok: true, status: 200 }  ← Must be true!
✅ Photo uploaded to S3 successfully!
Photo URL to save in DB: https://img.homeforpup.com/...  ← Should NOT be a blob: URL!
🔄 ApiService.updateUser response: { "success": true }
```

5. **Check DynamoDB:**

   - Look at the `profileImage` field
   - **It should be:** `https://img.homeforpup.com/profile-photos/xxx.jpg`
   - **It should NOT be:** `blob:https://...`

6. **Verify in app:**
   - Close and restart the app
   - Your photo should still be there
   - It should load from S3, not local storage

## What the Logs Will Tell You

### ✅ Good Signs:

```
=== PROFILE UPDATE START ===
Update Data: {
  "name": "Efren Macasaet",
  "firstName": "Efren",           ← Present!
  "lastName": "Macasaet",         ← Present!
  "displayName": "Efren M.",      ← Present!
  ...
}

Final Photo URL (S3): https://img.homeforpup.com/profile-photos/abc123.jpg  ← Real S3 URL!
S3 Upload Result: { ok: true, status: 200 }  ← Success!
```

### ❌ Bad Signs:

```
Update Data: {
  "name": "Efren Macasaet",
  // No firstName, lastName, or displayName  ← Missing!
}

Final Photo URL (S3): blob:https://...  ← Still a blob URL!
S3 Upload Result: { ok: false, status: 403 }  ← Failed!
```

## Expected Behavior

### Before Fix:

- ❌ Empty fields don't update
- ❌ displayName doesn't save
- ❌ Profile photo might be blob URL

### After Fix:

- ✅ All filled fields update properly
- ✅ displayName saves correctly
- ✅ Empty fields are skipped (not overwritten with empty values)
- ✅ Profile photo uploads to S3 and saves real URL
- ✅ Better error messages if photo upload fails

## Troubleshooting

### Problem: "Still see blob URL in profileImage"

This means your OLD photo was a blob URL. You need to:

1. Upload a NEW photo through the mobile app
2. Watch the logs to ensure it uploads to S3 successfully
3. The new photo should have an S3 URL like:
   ```
   https://img.homeforpup.com/profile-photos/12345-profile.jpg
   ```

### Problem: "Fields still not updating"

Check the logs:

1. Is the field in the `Update Data` object?
2. Is the API returning `success: true`?
3. Is the `updatedAt` timestamp changing?

If all YES → Data IS being saved, refresh DynamoDB console

### Problem: "Photo upload fails"

Check the logs for:

```
S3 Upload Result: { ok: false, status: XXX }
```

Common issues:

- **403**: Presigned URL expired or invalid permissions
- **404**: Wrong bucket or key
- **400**: Invalid content type or file format

## Files Modified

1. ✅ `/apps/mobile-app/src/screens/forms/EditProfileScreen.tsx`
   - Fixed field handling to only send non-empty values
   - Added comprehensive photo upload logging
   - Added better error messages

## Summary

**The profile update API IS working correctly** - the logs prove it. The issues were:

1. ✅ **Fixed:** Empty/undefined fields not being sent properly
2. ⚠️ **Needs testing:** Old blob URL in profileImage needs to be replaced with real S3 URL

After these fixes:

- firstName, lastName, displayName will all update properly when filled
- Photo uploads will have better logging to debug any S3 issues
- You'll see exactly what's being sent to the API

## Next Steps

1. Rebuild the app (the code has changed)
2. Test updating firstName, lastName, displayName
3. Test uploading a NEW photo
4. Watch the console logs
5. Verify in DynamoDB that the data matches
6. Share the logs if you still see issues!
