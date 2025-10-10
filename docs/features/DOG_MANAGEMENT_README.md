# Dog Management System

This document describes the new dog and kennel management system for breeders.

## Features

### Kennel Management
- **Create Kennels**: Breeders can create multiple kennels with details like name, location, specialties, etc.
- **Edit Kennels**: Update kennel information including contact details, specialties, and status
- **Delete Kennels**: Remove kennels (with proper validation)
- **View Kennels**: See all kennels owned by the breeder

### Dog Management
- **Create Dogs**: Add parent dogs or puppies with comprehensive details
- **Associate with Kennels**: Link dogs to specific kennels
- **Parent/Puppy Classification**: Distinguish between parent dogs and puppies
- **Parent Information**: Track sire and dam relationships
- **Photo Management**: Upload and manage dog photos
- **Breeding Status**: Track availability for breeding, retirement status, etc.
- **Health Status**: Monitor health conditions

## API Endpoints

### Kennels
- `GET /api/kennels` - Get all kennels for the authenticated user
- `POST /api/kennels` - Create a new kennel
- `GET /api/kennels/[id]` - Get a specific kennel
- `PUT /api/kennels/[id]` - Update a kennel
- `DELETE /api/kennels/[id]` - Delete a kennel

### Dogs (Enhanced)
- `POST /api/dogs` - Create a new dog (now supports kennel association)
- `PUT /api/dogs/[id]` - Update a dog (now supports kennel association)

## Database Schema

### Kennels Table (`homeforpup-kennels`)
```typescript
{
  id: string;           // Primary key
  ownerId: string;      // User ID of the breeder
  name: string;         // Kennel name
  description?: string;
  location?: string;
  website?: string;
  phone?: string;
  email?: string;
  specialties: string[]; // Breeds this kennel specializes in
  establishedDate?: string;
  licenseNumber?: string;
  photoUrl?: string;
  coverPhoto?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Dogs Table (`homeforpup-dogs`) - Enhanced
```typescript
{
  id: string;
  ownerId: string;      // User ID of the breeder
  kennelId?: string;    // Optional kennel association
  name: string;
  breed: string;
  gender: 'male' | 'female';
  birthDate: string;
  weight?: number;
  color: string;
  photoUrl?: string;
  healthTests: string[];
  pedigree?: string;
  description?: string;
  
  // Parent information
  sireId?: string;      // Father's ID
  damId?: string;       // Mother's ID
  
  // Breeding status
  breedingStatus: 'available' | 'retired' | 'not_ready';
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Dog type
  dogType: 'parent' | 'puppy';
  
  // Litter information (for puppies)
  litterId?: string;
  litterPosition?: number;
  
  createdAt: string;
  updatedAt: string;
}
```

## Components

### Core Components
- `DogManagement.tsx` - Main dashboard component for breeders
- `DogForm.tsx` - Form for creating/editing dogs
- `KennelForm.tsx` - Form for creating/editing kennels
- `KennelSelector.tsx` - Dropdown selector for choosing kennels

### Hooks
- `useKennels.ts` - Hook for kennel CRUD operations
- `useDogs.ts` - Enhanced hook for dog operations (existing)

## User Roles

### Breeder Role (`userType: 'breeder'`)
- Can create, edit, and delete kennels
- Can create, edit, and delete dogs
- Can associate dogs with their kennels
- Can manage breeding programs

### Both Role (`userType: 'both'`)
- Can switch between dog-parent and breeder profiles
- When in breeder mode, has all breeder capabilities
- When in dog-parent mode, sees matched puppies

## Dashboard Integration

The dog management system is integrated into the breeder dashboard with:
- **Kennels Section**: Displays all kennels in a card layout
- **Dogs Section**: Shows dogs in a comprehensive table with actions
- **Quick Actions**: Easy access to add dogs and kennels
- **Responsive Design**: Works on desktop and mobile devices

## Usage

1. **For Breeders**: 
   - Access the dashboard and see the new "My Kennels" and "My Dogs" sections
   - Create kennels first, then add dogs and associate them with kennels
   - Manage your breeding program through the comprehensive interface

2. **For Users with Both Roles**:
   - Use the profile switcher in the header to switch between dog-parent and breeder views
   - When in breeder mode, access all kennel and dog management features

## Future Enhancements

- Litter management system
- Breeding pair recommendations
- Health tracking and vaccination records
- Pedigree visualization
- Kennel analytics and reporting
