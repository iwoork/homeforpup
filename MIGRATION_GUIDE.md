# Migration Guide: Monorepo Transformation

This guide outlines the steps to migrate the existing HomeForPup codebase to the new monorepo structure.

## 🎯 Migration Overview

The migration involves:
1. Moving shared code to packages
2. Creating separate apps for adopters and breeders
3. Updating import paths and dependencies
4. Configuring build and deployment

## 📦 Package Migration

### 1. Shared Types (`packages/shared-types`)

**Status**: ✅ Completed

- Moved `src/types/index.ts` to `packages/shared-types/src/index.ts`
- All type definitions are now centralized
- No dependencies on other packages

### 2. Shared Components (`packages/shared-components`)

**Status**: 🔄 In Progress

**Components to migrate**:
- `BreedSelector` - ✅ Completed
- `ContactBreederModal` - Pending
- `PuppyList` - Pending
- Layout components (Header, Footer) - Pending
- Form components - Pending

**Migration steps**:
```bash
# Copy component files
cp src/components/forms/BreedSelector.tsx packages/shared-components/src/forms/
cp src/components/ContactBreederModal.tsx packages/shared-components/src/
cp src/components/PuppyList.tsx packages/shared-components/src/

# Update imports to use shared packages
# Remove hook dependencies (move to shared-hooks)
```

### 3. Shared Hooks (`packages/shared-hooks`)

**Status**: 🔄 In Progress

**Hooks to migrate**:
- `useAuth` - Pending
- `useMessages` - Pending
- `useBreeds` - Pending
- `useMessaging` - Pending
- `useWebSocket` - Pending

**Migration steps**:
```bash
# Copy hook files
cp src/hooks/api/useAuth.ts packages/shared-hooks/src/auth/
cp src/hooks/api/useMessages.ts packages/shared-hooks/src/api/
cp src/hooks/api/useBreeds.ts packages/shared-hooks/src/api/
cp src/hooks/useWebSocket.ts packages/shared-hooks/src/
```

### 4. Shared Library (`packages/shared-lib`)

**Status**: 🔄 In Progress

**Utilities to migrate**:
- DynamoDB client - Pending
- S3 client - Pending
- Email utilities - Pending
- Auth configuration - Pending

**Migration steps**:
```bash
# Copy library files
cp src/lib/api/dynamodb.ts packages/shared-lib/src/api/
cp src/lib/api/s3.ts packages/shared-lib/src/api/
cp src/lib/email.ts packages/shared-lib/src/
cp src/lib/auth.ts packages/shared-lib/src/auth/
```

## 🏗️ App Migration

### 1. Adopter App (`apps/adopter-app`)

**Status**: 🔄 In Progress

**Features to include**:
- Dog browsing and search
- User profiles (adopter-focused)
- Favorites management
- Messaging with breeders
- Breed selection

**Migration steps**:
```bash
# Copy relevant pages
cp src/app/browse/ apps/adopter-app/src/app/
cp src/app/favorites/ apps/adopter-app/src/app/
cp src/app/users/ apps/adopter-app/src/app/
cp src/app/auth/ apps/adopter-app/src/app/

# Copy app-specific components
cp src/components/PuppyList.tsx apps/adopter-app/src/components/
cp src/components/ContactBreederModal.tsx apps/adopter-app/src/components/

# Update imports to use shared packages
```

### 2. Breeder App (`apps/breeder-app`)

**Status**: 🔄 In Progress

**Features to include**:
- Kennel management
- Dog/puppy management
- Announcement creation
- Message management
- Business analytics

**Migration steps**:
```bash
# Copy breeder-specific pages
cp src/app/kennel-management/ apps/breeder-app/src/app/
cp src/app/dashboard/ apps/breeder-app/src/app/
cp src/components/dogs/ apps/breeder-app/src/components/

# Copy breeder-specific features
cp src/features/breeders/ apps/breeder-app/src/features/
```

## 🔄 Import Path Updates

### Before (Current)
```typescript
import { User, Message } from '@/types';
import { useAuth } from '@/hooks';
import { BreedSelector } from '@/components/forms/BreedSelector';
```

### After (Monorepo)
```typescript
import { User, Message } from '@homeforpup/shared-types';
import { useAuth } from '@homeforpup/shared-hooks';
import { BreedSelector } from '@homeforpup/shared-components';
```

## 📋 Migration Checklist

### Phase 1: Package Setup ✅
- [x] Create monorepo structure
- [x] Set up Turbo configuration
- [x] Create shared packages
- [x] Migrate shared types

### Phase 2: Shared Packages 🔄
- [ ] Migrate shared components
- [ ] Migrate shared hooks
- [ ] Migrate shared library
- [ ] Update component dependencies

### Phase 3: App Migration 🔄
- [ ] Create adopter app structure
- [ ] Create breeder app structure
- [ ] Migrate app-specific code
- [ ] Update import paths

### Phase 4: Configuration 🔄
- [ ] Set up environment variables
- [ ] Configure subdomain routing
- [ ] Update build scripts
- [ ] Test deployment

### Phase 5: Cleanup 🔄
- [ ] Remove old src/ directory
- [ ] Update documentation
- [ ] Test all functionality
- [ ] Deploy to production

## 🚨 Breaking Changes

### Import Paths
All imports need to be updated to use the new package structure.

### Component Dependencies
Components that depend on hooks need to be updated to accept props instead.

### Build Configuration
Each app now has its own build configuration and dependencies.

## 🔧 Development Workflow

### Local Development
```bash
# Start all apps
npm run dev

# Start specific app
npm run dev:adopter
npm run dev:breeder

# Build all packages
npm run build
```

### Testing
```bash
# Run tests for all packages
npm run test

# Run tests for specific package
npm run test --filter=shared-components
```

## 📝 Notes

- The migration should be done incrementally
- Test each package independently before moving to the next
- Keep the old structure until migration is complete
- Update documentation as you go

## 🆘 Troubleshooting

### Common Issues

1. **Import errors**: Check that all imports use the new package names
2. **Build failures**: Ensure all dependencies are properly configured
3. **Type errors**: Verify that shared types are properly exported
4. **Hook dependencies**: Move hook logic to shared-hooks package

### Getting Help

- Check the package.json files for correct dependencies
- Verify tsconfig.json paths are correct
- Ensure all packages are built before running apps
