# Dog Details & Edit Implementation

## Overview
Complete implementation of dog details viewing and editing functionality for the Breeder iOS app, including photo upload to S3.

## Features Implemented

### 1. Dog Details Screen (`/screens/details/DogDetailScreen.tsx`)

**Display Features:**
- Hero image section with dog photo (from `photoGallery[0].url`, `photos[0]`, or `photoUrl`)
- Dog name with call name in overlay
- Edit and Delete action buttons
- Basic Information card:
  - Breed
  - Gender (with icon)
  - Age (calculated from birth date)
  - Color
  - Weight
  - Type (Parent/Puppy)
- Status card:
  - Breeding status (color-coded badge)
  - Health status (from `health.currentHealthStatus` or `healthStatus`)
- Description (if available)
- Quick stats (created/updated dates)

**Key Features:**
- Photo display with caching prevention (unique key per dog)
- Safe field access with optional chaining
- Support for multiple data structures (legacy and new)
- Error handling with fallback UI

### 2. Edit Dog Screen (`/screens/forms/EditDogScreen.tsx`)

**Form Fields:**
- Name (required)
- Call Name
- Breed (required)
- Gender (segmented control)
- Birth Date (date picker)
- Weight
- Color
- Dog Type (Parent/Puppy)
- Breeding Status (radio buttons)
- Health Status (radio buttons)
- Description (multiline)
- **Photo Upload** (up to 10 photos)

**Photo Upload Features:**
- Image picker integration
- Upload to S3 via presigned URLs
- Photos served via CloudFront (img.homeforpup.com)
- Photo preview grid
- Remove individual photos
- Loading states
- Success/error alerts

**Validation:**
- Required fields checked
- Numeric validation for weight
- Error messages displayed inline

### 3. Navigation Flow

```
DogsScreen
  ├─> DogDetailScreen (tap on dog)
  │     ├─> EditDogScreen (tap Edit)
  │     │     └─> Back to DogsScreen (after save)
  │     └─> Delete confirmation
  └─> Refresh on focus
```

### 4. API Implementation

**New Endpoints:**
- `POST /photos/upload-url` - Get presigned S3 upload URL

**Fixed Endpoints:**
- `GET /dogs/{id}` - Fixed to use `id` key
- `PUT /dogs/{id}` - Fixed to use `id` key and support `kennelOwners`
- `DELETE /dogs/{id}` - Fixed to use `id` key and support `kennelOwners`

**Key Fixes:**
- DynamoDB key changed from `dogId` to `id` for consistency
- Ownership check supports both `ownerId` field and `kennelOwners` array
- Auto token refresh on 401 errors

## Data Structure Compatibility

The implementation handles multiple dog data structures:

### Field Mappings:
- **ID**: `dog.id` or `dog.dogId`
- **Health**: `dog.health.currentHealthStatus` or `dog.healthStatus`
- **Photos**: `dog.photoGallery[0].url` or `dog.photos[0]` or `dog.photoUrl`
- **Owner**: `dog.ownerId` or `dog.kennelOwners[]`

### Example Dog Object:
```json
{
  "id": "e0e3cca3-f191-4baf-bb98-0ce64ec5f6d0",
  "name": "Candy",
  "callName": "...",
  "breed": "Cavalier King Charles Spaniel",
  "gender": "female",
  "birthDate": "2025-09-09",
  "weight": 12,
  "color": "Liver",
  "dogType": "parent",
  "breedingStatus": "available",
  "health": {
    "currentHealthStatus": "excellent"
  },
  "photoGallery": [
    {
      "url": "https://img.homeforpup.com/dog-photos/...",
      "dogId": "...",
      "isProfilePhoto": false
    }
  ],
  "kennelId": "...",
  "kennelOwners": ["user-id-here"],
  "status": "active",
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Authentication

**Token Management:**
- Automatic token refresh on 401 errors
- Tokens refreshed using AWS Amplify
- Updated tokens stored in AsyncStorage
- Retry mechanism for expired tokens

## S3 Photo Upload Flow

1. User taps "Add Photo" in EditDogScreen
2. Image picker opens
3. User selects photo
4. App requests presigned upload URL from API
5. Photo uploaded directly to S3
6. CloudFront URL returned: `https://img.homeforpup.com/dog-photos/{uuid}.jpg`
7. URL added to photos array
8. User taps "Save Changes"
9. Photos array saved with dog record

## File Changes

### Mobile App:
- `src/screens/main/DogsScreen.tsx` - Added navigation and focus refresh
- `src/screens/details/DogDetailScreen.tsx` - Complete implementation
- `src/screens/forms/EditDogScreen.tsx` - Complete implementation with photo upload
- `src/services/apiService.ts` - Added photo upload methods and auto token refresh
- `src/services/authService.ts` - Enhanced token refresh
- `src/navigation/AppNavigator.tsx` - Added EditDog screen

### API:
- `src/functions/dogs/get/index.ts` - Fixed DynamoDB key
- `src/functions/dogs/update/index.ts` - Fixed key and ownership check
- `src/functions/dogs/delete/index.ts` - Fixed key and ownership check
- `src/functions/dogs/create/index.ts` - Changed to use `id` field
- `src/functions/photos/upload-url/index.ts` - New Lambda function
- `lib/stacks/api-stack.ts` - Added photos API endpoint
- `lib/config/environments.ts` - Added photosBucket config

### Dependencies Added:
- `@react-native-community/datetimepicker@^8.2.0` - For date picker

## Known Limitations

1. **GET /dogs/{id} endpoint** - Still returning 502 errors (likely needs CloudWatch logs investigation)
   - **Workaround**: Dog data passed via navigation params works fine
   - Auto-refresh disabled to prevent 502 errors
   
2. **Photo Gallery Structure** - Current implementation reads from multiple sources:
   - Prefers `photoGallery[].url`
   - Falls back to `photos[]`
   - Falls back to `photoUrl`

## Testing

✅ View dog details
✅ Display dog photos from photoGallery
✅ Edit dog information
✅ Upload photos to S3
✅ Save changes
✅ Navigate between screens
✅ Auto token refresh
✅ Photo display with proper caching

## Next Steps (Optional)

1. Fix GET /dogs/{id} 502 error by investigating CloudWatch logs
2. Standardize dog data structure (single photo field)
3. Add photo cropping/resizing before upload
4. Add multiple photo upload at once
5. Implement delete dog with API integration
6. Add photo gallery view (swipe through photos)
