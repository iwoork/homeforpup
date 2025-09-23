# HomeForPup - Organized Codebase Structure

This document outlines the new organized folder structure for better maintainability and developer experience.

## 📁 Folder Structure

```
src/
├── types/                    # 🎯 Single source of truth for all types
│   └── index.ts             # Consolidated type definitions
├── features/                 # 🚀 Feature-based organization
│   ├── users/               # User management feature
│   │   ├── pages/           # User-related pages
│   │   ├── components/      # User-specific components
│   │   ├── api/             # User API routes
│   │   └── index.ts         # Feature exports
│   ├── breeders/            # Breeder management feature
│   │   ├── pages/           # Breeder-related pages
│   │   ├── components/      # Breeder-specific components
│   │   ├── api/             # Breeder API routes
│   │   └── index.ts         # Feature exports
│   ├── messaging/           # Messaging feature
│   │   ├── components/      # Messaging components
│   │   ├── api/             # Messaging API routes
│   │   └── index.ts         # Feature exports
│   ├── dashboard/           # Dashboard feature
│   │   ├── pages/           # Dashboard pages
│   │   ├── components/      # Dashboard-specific components
│   │   └── index.ts         # Feature exports
│   └── index.ts             # All features exports
├── components/               # 🧩 Shared components only
│   ├── layout/              # Layout components
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── forms/               # Form components
│   │   ├── AddDogForm.tsx
│   │   ├── UserTypeModal.tsx
│   │   ├── ProfilePhotoUpload.tsx
│   │   ├── CoverPhotoUpload.tsx
│   │   ├── PhotoUpload.tsx
│   │   ├── ImageCropperModal.tsx
│   │   └── DocumentUpload.tsx
│   ├── AuthProvider.tsx     # Core components
│   ├── Providers.tsx
│   ├── GoogleAnalytics.tsx
│   └── index.ts             # Component exports
├── hooks/                    # 🎣 Custom hooks
│   ├── api/                 # API-related hooks
│   │   ├── useAuth.ts
│   │   ├── useAvailableUsers.ts
│   │   ├── useDogs.ts
│   │   ├── useMessages.ts
│   │   └── useMessaging.ts
│   └── index.ts             # Hook exports
├── lib/                      # 📚 Library utilities
│   ├── api/                 # API utilities
│   │   ├── dynamodb.ts
│   │   └── s3.ts
│   ├── config/              # Configuration
│   │   └── auth-config.ts
│   ├── utils/               # Utility functions
│   │   ├── gtag.ts
│   │   ├── auth.ts
│   │   ├── enhanced-auth.ts
│   │   └── jwt-debug.ts
│   └── index.ts             # Library exports
└── app/                      # 📱 Next.js app directory (legacy)
    ├── api/                  # Legacy API routes (to be migrated)
    ├── auth/
    ├── about/
    ├── adoption-guide/
    ├── browse/
    ├── breeds/
    └── layout.tsx
```

## 🎯 Key Principles

### 1. **Feature-Based Organization**
- Each feature has its own folder with pages, API routes, and components
- Related functionality is grouped together
- Easy to find and maintain feature-specific code

### 2. **Single Source of Truth for Types**
- All types consolidated in `src/types/index.ts`
- No duplicate type definitions
- Easy to maintain and update

### 3. **Component Organization by Type**
- **Layout**: Components that define page structure
- **Forms**: Form-related components and inputs
- **Features**: Feature-specific components
- **Core**: Essential app components

### 4. **Hook Organization by Purpose**
- **API**: Hooks that interact with APIs
- **UI**: Hooks for UI state management (future)

### 5. **Library Organization by Function**
- **API**: Database and external API utilities
- **Config**: Configuration files
- **Utils**: General utility functions

## 📦 Import Examples

### Types
```typescript
import { User, Message, Announcement } from '@/types';
```

### Features
```typescript
import { UserProfilePage, UsersListPage } from '@/features/users';
import { BreederProfilePage } from '@/features/breeders';
import { MessagesPage } from '@/features/messaging';
```

### Components
```typescript
// Shared components
import { Layout, Header, Footer } from '@/components';
import { AddDogForm, ProfilePhotoUpload } from '@/components/forms';

// Feature-specific components
import { ProfileHeader } from '@/features/users';
import { ComposeMessage, MessageView } from '@/features/messaging';
import { AnnouncementsFeed } from '@/features/dashboard';
```

### Hooks
```typescript
import { useAuth, useMessages, useDogs } from '@/hooks';
```

### Library
```typescript
import { dynamodb, s3 } from '@/lib/api';
import { authConfig } from '@/lib/config';
```

## 🚀 Benefits

1. **Better Maintainability**: Related code is grouped together
2. **Easier Navigation**: Clear folder structure makes finding code simple
3. **Reduced Duplication**: Single source of truth for types
4. **Scalability**: Easy to add new features without cluttering
5. **Team Collaboration**: Clear conventions for where code belongs
6. **Import Clarity**: Clean, predictable import paths

## 🔄 Migration Status

- ✅ Types consolidated
- ✅ Features organized
- ✅ Components reorganized
- ✅ Hooks organized
- ✅ Library utilities organized
- 🔄 Import paths need updating (in progress)
- ⏳ Legacy app directory cleanup (pending)

## 📝 Next Steps

1. Update all import paths to use new structure
2. Remove old duplicate files
3. Update Next.js app directory to use new structure
4. Add barrel exports for better tree-shaking
5. Add feature-specific README files
