# Quick Fix: Changing Your User Type

## Issue

You logged in as an dog-parent but still see the breeder screen.

## Why This Happens

- The `custom:userType` attribute may not be configured in AWS Cognito yet
- Existing accounts created before the userType feature don't have this attribute set
- The app defaults to 'breeder' if the attribute is missing from the authentication token

## ✅ Solution #1: Use the Account Type Switcher (EASIEST)

I've just added a convenient way to switch your account type directly in the app:

1. **Go to Profile tab** (bottom right)
2. **Look for "Account Type Switcher" card** (right below your profile info)
3. **Tap on the card** - it shows your current type and offers to switch
4. **Confirm the change** when prompted
5. **Done!** The app will immediately switch to show dog-parent features

The card looks like this:

```
┌─────────────────────────────────────┐
│ [Icon] Account Type: Breeder     [⇄]│
│        Tap to switch to Dog Parent mode│
└─────────────────────────────────────┘
```

## Solution #2: Logout and Login Again

Sometimes a fresh login helps:

1. Tap **Profile** tab
2. Scroll to bottom and tap **Logout**
3. Login again with your credentials
4. Check the logs in the console for: `✅ userType from Cognito:` or `⚠️ userType not in Cognito token, using stored value:`

## Solution #3: Create New Account (If Needed)

If you want a completely fresh start:

1. Logout from your current account
2. Tap **Create Account**
3. **Select "Dog Parent"** (heart icon) at the top
4. Complete registration with a new email
5. Login and verify you see the dog-parent dashboard

## ✅ Verifying It Worked

After switching, you should see:

### Dog Parent Dashboard

- Welcome message with puppy emoji 🐾
- 4 colorful action cards:
  - **Search Puppies** (blue)
  - **Matched Puppies** (pink)
  - **My Favorites** (orange)
  - **Edit Preferences** (purple)

### Dog Parent Tab Bar

- **Home** (house icon)
- **Search** (magnifying glass)
- **Favorites** (heart)
- **Messages** (chat bubbles)
- **Profile** (person)

### What You Should NOT See

- ❌ Litters tab
- ❌ "Add Litter" or "Add Dog" buttons
- ❌ Breeder statistics (Total Litters, etc.)

## Technical Details (What Was Fixed)

### Changes Made:

1. **Auth Service** - Now stores userType in AsyncStorage as a fallback
2. **Auth Service** - Checks multiple sources for userType (Cognito, then local storage, then default)
3. **Auth Context** - Added `updateUserType()` method
4. **Profile Screen** - Added account type switcher UI

### How It Works:

```
Login Flow:
1. Check Cognito token for custom:userType
2. If not found → Check AsyncStorage
3. If still not found → Default to 'breeder'
4. Store in AsyncStorage for future sessions
```

### Code Locations:

- User type switcher: `/apps/mobile-app/src/screens/main/ProfileScreen.tsx`
- Auth logic: `/apps/mobile-app/src/services/authService.ts`
- Context: `/apps/mobile-app/src/contexts/AuthContext.tsx`

## Future Configuration (Optional)

To fully support userType from Cognito, configure the custom attribute:

### AWS Cognito Setup:

1. Go to AWS Console > Cognito > User Pools
2. Select your user pool
3. Navigate to "Sign-up experience" > "Custom attributes"
4. Click "Add custom attribute"
5. Configure:
   - **Name**: `userType`
   - **Type**: String
   - **Min length**: 1
   - **Max length**: 20
   - **Mutable**: Yes (allow changes)
6. Save and update your app client settings

**Note**: This is optional - the app now works without it using local storage fallback!

## Debugging

If you're still having issues, check the console logs:

### Good Signs:

```
✅ userType from Cognito: dog-parent
✅ Stored auth data with userType: dog-parent
✅ User type updated in context: dog-parent
```

### Warning Signs (But Still Works):

```
⚠️ userType not in Cognito token, using stored value: dog-parent
```

This warning is normal if Cognito custom attribute isn't configured yet. The app will use the stored value.

### Check Current State:

Look for navigation logs showing which tabs are loaded:

- Dog Parent: "Dog ParentTabs" component
- Breeder: "BreederTabs" component

## Support

If switching doesn't work:

1. Try logout and login again
2. Check console logs for errors
3. Verify the Profile screen shows the switcher card
4. Try the switcher 2-3 times (sometimes needs a refresh)

## Summary

**Immediate Fix**: Go to Profile > Tap "Account Type Switcher" > Confirm
**Result**: You'll instantly see dog-parent features!

The app now has multiple fallback mechanisms to ensure your user type is preserved across sessions, even without Cognito configuration.
