# Testing Guide: Dual User Experience

## Quick Start Testing Guide

### Prerequisites

1. Mobile app is running on simulator/device
2. AWS Cognito custom attribute `custom:userType` is configured (see notes below)
3. Backend API is accessible

---

## Testing Dog Parent Experience

### 1. Register as Dog Parent

1. Launch the app
2. Tap "Create Account"
3. Select **"Dog Parent"** user type (heart icon)
4. Fill in:
   - Full Name
   - Email
   - Phone Number
   - Password
5. Tap "Create Account"
6. Verify email (if required)
7. Login with credentials

### 2. Dog Parent Dashboard

**Expected Results:**

- ✅ See welcome message with puppy emoji
- ✅ See 4 gradient action cards:
  - Search Puppies (blue gradient)
  - Matched Puppies (pink gradient)
  - My Favorites (orange gradient)
  - Edit Preferences (purple gradient)
- ✅ See statistics for Favorites and Messages
- ✅ See tips for finding a puppy

### 3. Set Preferences

1. From dashboard, tap "Edit Preferences"
2. Select preferred breeds (tap multiple)
3. Choose experience level
4. Select housing type
5. Choose yard size
6. Toggle "I have other pets" if applicable
7. Enter location
8. Tap "Save Preferences"

**Expected Results:**

- ✅ All selections highlight in blue
- ✅ Success message appears
- ✅ Returns to previous screen
- ✅ Preferences saved to user profile

### 4. Search Puppies

1. From dashboard, tap "Search Puppies"
2. Try the search bar
3. Filter by popular breeds
4. View puppy cards (empty state if no data)

**Expected Results:**

- ✅ Search UI loads properly
- ✅ Breed chips can be selected/deselected
- ✅ If no puppies: see "No puppies found" message
- ✅ Empty state shows "Set Your Preferences" button

### 5. Matched Puppies

1. Navigate to "Matched Puppies" tab
2. If no preferences set: see prompt to set preferences
3. If preferences set but no matches: see "No matches yet"

**Expected Results:**

- ✅ UI prompts to set preferences if not done
- ✅ Link to preferences screen works
- ✅ Empty state shows appropriate message
- ✅ (Future) Match cards show percentage and reasons

### 6. Favorites

1. Navigate to "Favorites" tab
2. View empty state or saved puppies

**Expected Results:**

- ✅ Empty state shows heart icon and message
- ✅ "Explore Puppies" button navigates to search
- ✅ (Future) Favorited puppies display correctly

### 7. Navigation (Dog Parent)

**Expected Tab Bar:**

- ✅ Home (house icon)
- ✅ Search (search icon)
- ✅ Favorites (heart icon)
- ✅ Messages (chat bubbles icon)
- ✅ Profile (person icon)

**NOT Visible:**

- ❌ Litters tab (breeder only)
- ❌ Dogs tab (breeder only - shows as "Search" for dog-parents)

### 8. Profile (Dog Parent)

1. Navigate to Profile tab
2. Tap "Edit Profile"
3. Scroll through sections

**Expected Results:**

- ✅ Personal Information section visible
- ✅ "Adoption Preferences" section visible with link to detailed preferences
- ❌ "Breeder Information" section NOT visible
- ✅ Social Media section visible
- ✅ Privacy Settings visible
- ✅ Notifications visible

---

## Testing Breeder Experience

### 1. Register as Breeder

1. Launch the app (or logout)
2. Tap "Create Account"
3. Select **"Breeder"** user type (paw icon)
4. Fill in registration details
5. Complete signup and login

### 2. Breeder Dashboard

**Expected Results:**

- ✅ See "Welcome back, [Name]!" greeting
- ✅ See subtitle "Here's your breeding overview"
- ✅ See 4 stat cards:
  - Total Litters
  - Total Dogs
  - Active Messages
  - New Inquiries
- ✅ See Quick Actions:
  - Add Litter
  - Add Dog
- ✅ See Recent Activity section

### 3. Navigation (Breeder)

**Expected Tab Bar:**

- ✅ Home (stats icon)
- ✅ Litters (albums icon)
- ✅ Dogs (paw icon)
- ✅ Messages (chat bubbles icon)
- ✅ Profile (person icon)

**NOT Visible:**

- ❌ Search tab (dog-parent only)
- ❌ Favorites tab (dog-parent only)

### 4. Breeder Features

1. Navigate to Litters tab
2. Navigate to Dogs tab
3. Try creating a litter
4. Try adding a dog

**Expected Results:**

- ✅ All breeder-specific screens load
- ✅ Can navigate to management screens
- ✅ Forms work correctly

### 5. Profile (Breeder)

1. Navigate to Profile tab
2. Tap "Edit Profile"
3. Scroll through sections

**Expected Results:**

- ✅ Personal Information section visible
- ✅ "Breeder Information" section visible with:
  - Kennel Name
  - Website
  - License Number
  - Years of Experience
  - Specialties
- ❌ "Adoption Preferences" section NOT visible
- ✅ Social Media section visible
- ✅ Privacy Settings visible
- ✅ Notifications visible

---

## Testing Shared Features

### Messages

1. As either user type, navigate to Messages tab
2. View conversations
3. Send a message

**Expected Results:**

- ✅ Messages screen loads for both user types
- ✅ Can send and receive messages
- ✅ Message detail screen works

### Dog Detail

1. From any screen showing a dog/puppy
2. Tap to view details

**Expected Results:**

- ✅ Detail screen loads for both user types
- ✅ All information displays correctly
- ✅ Photos load properly

---

## Edge Cases to Test

### User Type Switching

1. ⚠️ Currently not supported - user type is set at registration
2. Future: May need admin tool to change user type

### Both User Type

1. If a user has `userType: 'both'`:
   - Should show breeder navigation by default
   - May need toggle feature in future

### Missing Preferences (Dog Parent)

1. Login as dog-parent without setting preferences
2. Navigate to "Matched Puppies"

**Expected:**

- ✅ Prompt to set preferences
- ✅ Clear call-to-action button
- ✅ No crash or error

### Network Errors

1. Disable network
2. Try loading screens

**Expected:**

- ✅ Graceful error handling
- ✅ Appropriate error messages
- ✅ Retry options

---

## Known Issues / Future Work

### Currently Not Implemented (Expected Empty States)

- ✅ Puppy search results (awaiting backend API)
- ✅ Matched puppies (matching algorithm not yet implemented)
- ✅ Favorites persistence (not connected to backend)
- ✅ Real-time match notifications

### Requires Backend Work

1. Puppy search API endpoint
2. Matching algorithm implementation
3. Favorites storage
4. Match scoring calculation

---

## AWS Cognito Configuration

### Required Custom Attribute

To fully support the user type system, add a custom attribute in AWS Cognito:

1. Go to AWS Console > Cognito > User Pools
2. Select your user pool
3. Go to "Sign-up experience" > "Custom attributes"
4. Add custom attribute:

   - **Name**: `userType`
   - **Type**: String
   - **Min/Max length**: Leave defaults or set 1-20
   - **Mutable**: Yes

5. Update your app client to include the custom attribute

**Note**: If custom attribute isn't configured, the app will still work but user type will default to 'breeder' and not persist across sessions from Cognito.

### Temporary Workaround

If you can't configure custom attributes immediately, the user type will still be stored locally but won't sync with Cognito. Users will need to select their type on each new device.

---

## Debugging Tips

### Check User Type

Add console logs to verify user type:

```typescript
console.log('Current user type:', user?.userType);
```

### Verify Navigation

Check which tabs component is being used:

```typescript
console.log('Is Dog Parent:', user?.userType === 'dog-parent');
```

### Inspect Preferences

View saved preferences:

```typescript
console.log('Dog Parent preferences:', user?.puppyParentInfo);
console.log('Breeder info:', user?.breederInfo);
```

---

## Performance Testing

### Load Times

- Dashboard should load within 1-2 seconds
- Tab switching should be instant
- Image loading should be progressive

### Memory Usage

- Monitor for memory leaks during navigation
- Check image caching effectiveness

---

## Accessibility Testing

### Screen Reader

- Test with VoiceOver (iOS) or TalkBack (Android)
- Verify all buttons have proper labels
- Check tab navigation announcements

### Color Contrast

- Verify text readability
- Check button states are distinguishable
- Test with color blindness simulators

---

## Reporting Issues

### Issue Template

```
**User Type**: Dog Parent / Breeder
**Screen**: [Screen name]
**Action**: [What you did]
**Expected**: [What should happen]
**Actual**: [What actually happened]
**Steps to Reproduce**:
1.
2.
3.

**Screenshots**: [If applicable]
**Device**: [iOS/Android version]
```

---

## Success Criteria

### Must Pass

- ✅ Users can register as dog-parent or breeder
- ✅ Correct navigation shows for each user type
- ✅ Profile shows correct sections for user type
- ✅ No crashes during normal usage
- ✅ Empty states display properly

### Should Pass

- ✅ Preferences save and load correctly
- ✅ UI is responsive and smooth
- ✅ Images load efficiently
- ✅ Error messages are helpful

### Nice to Have

- ⏳ Matching algorithm works (future)
- ⏳ Real puppy data loads (future)
- ⏳ Favorites persist (future)
- ⏳ Push notifications (future)

---

## Next Steps After Testing

1. **Fix Critical Bugs**: Address any crashes or blocking issues
2. **Implement Backend APIs**: Connect to real data
3. **Add Matching Algorithm**: Power the matched puppies feature
4. **Test with Real Users**: Beta testing with dog-parents and breeders
5. **Iterate Based on Feedback**: Improve UX based on user testing

---

## Contact

For questions or issues with the dual user experience:

- Review: `/apps/mobile-app/DUAL_USER_EXPERIENCE.md`
- Code: `/apps/mobile-app/src/screens/dog-parent/`
- Navigation: `/apps/mobile-app/src/navigation/AppNavigator.tsx`
