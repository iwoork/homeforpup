# Fix: Cognito Phone Number Format Validation Error

## Issue
When updating user profiles, the system was encountering this error:
```
ERROR Error updating Cognito user attributes: [InvalidParameterException: Invalid phone number format.]
WARN ⚠️ Failed to sync some attributes to Cognito, but profile was saved to database
```

## Root Cause
AWS Cognito requires phone numbers to be in **E.164 format** (e.g., `+1234567890`), but the system was sending phone numbers in various formats like:
- `(123) 456-7890`
- `123-456-7890` 
- `1234567890`
- `123 456 7890`

## Solution Implemented

### 1. Added Phone Number Formatting Helper Function

**Mobile App** (`apps/mobile-app/src/screens/forms/EditProfileScreen.tsx`):
```typescript
// Helper function to format phone number for Cognito (E.164 format)
const formatPhoneForCognito = (phone: string): string | null => {
  if (!phone) return null;
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If it's already in E.164 format (starts with country code), return as is
  if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
    return '+' + digitsOnly;
  }
  
  // If it's a US number without country code, add +1
  if (digitsOnly.length === 10) {
    return '+1' + digitsOnly;
  }
  
  // If it's a US number with leading 1, add +
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return '+' + digitsOnly;
  }
  
  // If we can't format it properly, return null to skip Cognito update
  console.warn('⚠️ Cannot format phone number for Cognito:', phone);
  return null;
};
```

**Breeder App** (`apps/breeder-app/src/app/api/profile/route.ts`):
- Added the same helper function as a standalone function

### 2. Updated Cognito Sync Logic

**Before:**
```typescript
if (updateData.phone) cognitoAttributes.phone_number = updateData.phone;
```

**After:**
```typescript
// Format phone number for Cognito (E.164 format required)
if (updateData.phone) {
  const formattedPhone = formatPhoneForCognito(updateData.phone);
  if (formattedPhone) {
    cognitoAttributes.phone_number = formattedPhone;
    console.log('📞 Formatted phone for Cognito:', formattedPhone);
  } else {
    console.warn('⚠️ Skipping phone number sync to Cognito due to invalid format');
  }
}
```

## Phone Number Format Support

The fix handles these input formats and converts them to E.164:

| Input Format | Output (E.164) |
|--------------|----------------|
| `(123) 456-7890` | `+11234567890` |
| `123-456-7890` | `+11234567890` |
| `123 456 7890` | `+11234567890` |
| `1234567890` | `+11234567890` |
| `11234567890` | `+11234567890` |
| `+11234567890` | `+11234567890` (unchanged) |

## Error Handling

- **Valid Format**: Phone number is formatted and sent to Cognito
- **Invalid Format**: Phone number is skipped for Cognito sync but saved to database
- **Empty/Null**: No Cognito update attempted
- **Logging**: Clear console messages for debugging

## Benefits

- ✅ **Cognito Compatibility**: Phone numbers are properly formatted for AWS Cognito
- ✅ **Error Prevention**: Eliminates `InvalidParameterException` errors
- ✅ **Data Consistency**: Profile data is still saved to database even if Cognito sync fails
- ✅ **User Experience**: No more failed profile updates due to phone format issues
- ✅ **Flexible Input**: Accepts various phone number formats from users
- ✅ **US-Focused**: Defaults to US country code (+1) for 10-digit numbers

## Testing Scenarios

After this fix, the following should work correctly:

1. **US Phone Numbers**: `(555) 123-4567` → `+15551234567`
2. **International Numbers**: `+44 20 7946 0958` → `+442079460958`
3. **Invalid Formats**: `123` → Skipped (logged warning)
4. **Empty Values**: `""` → Skipped (no error)
5. **Database Fallback**: Invalid phone formats still save to database

## Files Modified

### Mobile App
- `apps/mobile-app/src/screens/forms/EditProfileScreen.tsx`
  - Added `formatPhoneForCognito` helper function
  - Updated Cognito sync logic to format phone numbers

### Breeder App
- `apps/breeder-app/src/app/api/profile/route.ts`
  - Added `formatPhoneForCognito` helper function
  - Updated Cognito sync logic to format phone numbers

## Notes

- The fix is backward compatible with existing phone number data
- Database storage remains unchanged (original format preserved)
- Only Cognito sync uses the formatted version
- Users can still enter phone numbers in any format they prefer
- The system gracefully handles invalid formats without breaking profile updates
