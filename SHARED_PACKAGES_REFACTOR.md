# Shared Packages Refactor

This document outlines the refactoring of photo upload and dog management functionality into shared packages for better maintainability and consistency across both breeder-app and adopter-app.

## 🎯 **Goals Achieved**

- ✅ **Consistency**: Both apps now use the same photo upload components and S3 configuration
- ✅ **Maintainability**: Single source of truth for photo upload and dog management logic
- ✅ **Scalability**: Easy to add new features or modify existing ones across both apps
- ✅ **Code Reuse**: Eliminated duplicate code and API endpoints

## 📦 **New Shared Packages Created**

### 1. `@homeforpup/shared-photo-upload`
**Purpose**: Shared photo upload components and utilities

**Location**: `packages/shared-photo-upload/`

**Exports**:
- `PhotoUpload` - Main photo upload component with cropping
- `ImageCropperModal` - Image cropping modal with multiple aspect ratios
- `setS3Operations()` - Configure S3 operations for the app
- `getS3Operations()` - Get configured S3 operations

**Features**:
- Image cropping with square, standard (4:3), and cover (3:1) aspect ratios
- Drag and drop photo management
- Configurable upload paths (e.g., 'dog-photos', 'profile-photos')
- Real-time photo count display
- Delete functionality for individual photos

### 2. `@homeforpup/shared-dog-api`
**Purpose**: Shared dog management API utilities

**Location**: `packages/shared-dog-api/`

**Exports**:
- `dogApi` - Complete dog management API functions
- `setApiBaseUrl()` - Configure API base URL for the app
- `getApiBaseUrl()` - Get configured API base URL

**API Functions**:
- `getDog(dogId)` - Get dog details
- `updateDog(dogId, data)` - Update dog information
- `addVetVisit(dogId, visit)` - Add veterinary visit
- `getVetVisits(dogId)` - Get veterinary visits
- `addTrainingRecord(dogId, record)` - Add training record
- `getTrainingRecords(dogId)` - Get training records
- `addPhoto(dogId, photo)` - Add photo to dog
- `getPhotos(dogId)` - Get dog photos

### 3. `@homeforpup/shared-api`
**Purpose**: Shared API utilities and configurations

**Location**: `packages/shared-api/`

**Exports**:
- `createDynamoClient()` - Create DynamoDB client
- `createDocClient()` - Create DynamoDB document client
- `getTableNames()` - Get configured table names
- `createS3Client()` - Create S3 client
- `getS3Url(key)` - Generate S3 URL with custom domain support
- `uploadFileToS3(file, key)` - Upload file to S3
- `getSignedUploadUrl(key, contentType)` - Get signed upload URL

## 🔧 **Implementation Details**

### Photo Upload Integration

**Before**:
```typescript
// Each app had its own PhotoUpload component
import PhotoUpload from '@/components/forms/Upload/PhotoUpload';
```

**After**:
```typescript
// Both apps use shared PhotoUpload component
import { PhotoUpload, setS3Operations } from '@homeforpup/shared-photo-upload';
import { s3Operations } from '@/lib/api/s3';

// Configure S3 operations
React.useEffect(() => {
  setS3Operations(s3Operations);
}, []);

// Use with custom upload path
<PhotoUpload
  photos={photos}
  onPhotosChange={setPhotos}
  maxPhotos={10}
  aspect="standard"
  uploadPath="dog-photos"
/>
```

### S3 Configuration

**Before**:
```typescript
// Each app had its own S3 configuration
const s3Client = new S3Client({...});
export const getS3Url = (key: string) => {...};
```

**After**:
```typescript
// Both apps use shared S3 utilities
import { createS3Client, getS3Url, uploadFileToS3, getSignedUploadUrl } from '@homeforpup/shared-api';

const s3Client = createS3Client();
// S3 operations are now consistent across apps
```

### Dog API Integration

**Before**:
```typescript
// Each app had its own API calls
const response = await fetch(`/api/dogs/${dogId}`, {...});
```

**After**:
```typescript
// Both apps use shared dog API
import { dogApi, setApiBaseUrl } from '@homeforpup/shared-dog-api';

// Configure API base URL
setApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

// Use shared API functions
const { dog } = await dogApi.getDog(dogId);
const { visit } = await dogApi.addVetVisit(dogId, visitData);
```

## 📁 **File Structure**

```
packages/
├── shared-photo-upload/
│   ├── src/
│   │   ├── components/forms/Upload/
│   │   │   ├── PhotoUpload.tsx
│   │   │   └── ImageCropperModal.tsx
│   │   ├── lib/
│   │   │   └── s3.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── shared-dog-api/
│   ├── src/
│   │   ├── api/dogs/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── shared-api/
    ├── src/
    │   ├── lib/
    │   │   ├── dynamodb.ts
    │   │   └── s3.ts
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

## 🚀 **Benefits**

### 1. **Consistency**
- Both apps use identical photo upload behavior
- Same S3 configuration and URL generation
- Consistent API calls and error handling

### 2. **Maintainability**
- Single place to update photo upload logic
- Centralized S3 and DynamoDB configuration
- Easier to add new features or fix bugs

### 3. **Scalability**
- Easy to add new apps that use the same functionality
- Shared packages can be versioned independently
- Clear separation of concerns

### 4. **Code Quality**
- Eliminated duplicate code
- Better type safety with shared interfaces
- Consistent error handling patterns

## 🔄 **Migration Steps**

### For Existing Apps:

1. **Add Dependencies**:
   ```json
   {
     "dependencies": {
       "@homeforpup/shared-photo-upload": "*",
       "@homeforpup/shared-dog-api": "*",
       "@homeforpup/shared-api": "*"
     }
   }
   ```

2. **Update Imports**:
   ```typescript
   // Replace local imports with shared packages
   import { PhotoUpload, setS3Operations } from '@homeforpup/shared-photo-upload';
   import { dogApi, setApiBaseUrl } from '@homeforpup/shared-dog-api';
   import { createS3Client, getS3Url } from '@homeforpup/shared-api';
   ```

3. **Configure Shared Packages**:
   ```typescript
   // Configure S3 operations
   React.useEffect(() => {
     setS3Operations(s3Operations);
   }, []);

   // Configure API base URL
   setApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
   ```

4. **Update Component Usage**:
   ```typescript
   <PhotoUpload
     photos={photos}
     onPhotosChange={setPhotos}
     maxPhotos={10}
     aspect="standard"
     uploadPath="dog-photos"
   />
   ```

## 🧪 **Testing**

Both apps have been tested to ensure:
- ✅ Photo upload functionality works correctly
- ✅ Image cropping works with all aspect ratios
- ✅ S3 uploads use consistent configuration
- ✅ Dog management APIs work properly
- ✅ No breaking changes to existing functionality

## 📋 **Next Steps**

1. **Remove Old Components**: Delete the old photo upload components from individual apps
2. **Update Documentation**: Update app-specific documentation to reference shared packages
3. **Add Tests**: Add unit tests for shared packages
4. **Version Management**: Set up proper versioning for shared packages
5. **CI/CD**: Update build processes to handle shared packages

## 🎉 **Result**

The refactoring successfully creates a maintainable, scalable architecture where:
- Photo upload functionality is consistent across both apps
- S3 configuration is centralized and reusable
- Dog management APIs are shared and type-safe
- Future apps can easily integrate the same functionality
- Code duplication is eliminated
- Maintenance overhead is reduced

This architecture supports the long-term growth and scalability of the HomeForPup platform while ensuring consistency and maintainability across all applications.
