# Navigation Reorganization - Litters Feature

## Overview

This document outlines the major navigation reorganization in the Breeder iOS App, which introduces a new Litters feature and restructures kennel management into the Profile screen.

## Changes Made

### 1. Navigation Structure Changes

#### Before

- **Main Tabs**: Dashboard | **Kennels** | Dogs | Messages | Profile

#### After

- **Main Tabs**: Dashboard | **Litters** | Dogs | Messages | Profile

The Kennels tab has been replaced with a Litters tab, and kennel management is now accessible through the Profile screen.

---

## New Features

### 1. Litters Management System

#### **LittersScreen** (`src/screens/main/LittersScreen.tsx`)

Main screen showing a list of all litters with:

- **Visual status indicators** with color-coded gradients
- **Statistics display**: Total puppies, available, males, females
- **Date tracking**: Expected birth date and actual birth date
- **Status badges**: Planned, Expecting, Born, Weaning, Ready, All Placed
- **Price range display**
- **Empty state** with CTA to create first litter
- **Pull-to-refresh** functionality

#### **LitterDetailScreen** (`src/screens/details/LitterDetailScreen.tsx`)

Detailed view of individual litters with:

- **Statistics Dashboard**: 4 gradient cards showing:
  - Total puppies
  - Available puppies
  - Reserved puppies
  - Placed puppies
- **Important Dates Section**: Breeding date, expected birth, actual birth
- **Gender Distribution**: Visual breakdown of males vs females
- **Pricing Information**: Price range display
- **Puppies List**: Manage individual puppies in the litter
- **Action Buttons**: Edit and Delete litter
- **Add Puppies**: Direct link to add puppies to the litter

#### **CreateLitterScreen** (`src/screens/forms/CreateLitterScreen.tsx`)

Form to create new litters with:

- **Basic Information**:
  - Breed (required)
  - Season (Spring, Summer, Fall, Winter)
  - Status (Planned, Expecting, Born, Weaning, Ready, Sold Out)
  - Description
- **Important Dates**:
  - Breeding date (required)
  - Expected birth date (required)
  - Actual birth date (optional)
- **Puppy Details**:
  - Total puppy count
  - Male count
  - Female count
  - Available puppies
- **Pricing** (optional):
  - Minimum price
  - Maximum price
- **Validation**: Form validation with error messages

#### **EditLitterScreen** (`src/screens/forms/EditLitterScreen.tsx`)

Similar to CreateLitterScreen but pre-populated with existing litter data for editing.

---

### 2. Profile Screen Enhancements

#### **Subscription Plan Section**

Added a beautiful subscription card showing:

- **Plan Type**: Basic or Premium
- **Plan Badge**: Visual indicator with icon
- **Features List**:
  - Kennel limits (1 for Basic, 10 for Premium)
  - Litter management capabilities
  - Support level
- **Upgrade Button**: For Basic users to upgrade to Premium
- **Pricing Info**: Shows upgrade cost ($29.99/month)

#### **Business Management Section**

New section in profile for business operations:

- **Manage Kennels**: Quick access to kennel management
  - Shows current kennel count (e.g., "1 of 1 kennels")
  - Navigates to ManageKennelsScreen

#### **Updated Statistics**

Changed profile stats to reflect new structure:

- Changed "Kennels" stat to "Litters" stat

---

### 3. Kennel Management

#### **ManageKennelsScreen** (`src/screens/forms/ManageKennelsScreen.tsx`)

Comprehensive kennel management interface:

- **Header Section**:
  - Gradient header with icon
  - Information card explaining plan limitations
  - Upgrade prompt for Basic users
- **Kennel List**:
  - Visual cards with kennel photos
  - Status indicators (Active/Inactive, Public)
  - Location display
  - Quick actions: Edit and Delete
- **Empty State**: Encourages creation of first kennel
- **Add Kennel Button**: Create new kennels
- **Pull-to-refresh** functionality

---

## API Integration

### New API Methods Added

#### **apiService.ts** (`src/services/apiService.ts`)

Added Litter API methods:

```typescript
- getLitters(params): Fetch list of litters with filtering
- getLitterById(id): Get specific litter details
- createLitter(data): Create new litter
- updateLitter(id, data): Update existing litter
- deleteLitter(id): Delete a litter
```

#### **useApi.ts** (`src/hooks/useApi.ts`)

Added custom hooks:

```typescript
- useLitters(params): Hook to fetch and manage litters list
- useLitter(id): Hook to fetch and manage single litter
```

---

## Data Structure

### Litter Interface

```typescript
interface Litter {
  id: string;
  breederId: string;
  sireId: string; // Father dog ID
  damId: string; // Mother dog ID
  breed: string;

  // Dates
  breedingDate: string; // When breeding occurred
  expectedDate: string; // Expected birth (63 days from breeding)
  birthDate?: string; // Actual birth date
  season: 'spring' | 'summer' | 'fall' | 'winter';

  // Puppy counts
  puppyCount?: number;
  maleCount?: number;
  femaleCount?: number;
  availablePuppies?: number;

  description: string;
  photos: string[];
  status: 'planned' | 'expecting' | 'born' | 'weaning' | 'ready' | 'sold_out';

  // Pricing
  priceRange?: {
    min: number;
    max: number;
  };

  healthClearances: string[];
  createdAt: string;
  updatedAt: string;
}
```

---

## User Experience Improvements

### Status Terminology

Improved status labels for better clarity:

- **Planned**: Breeding is planned but not yet occurred
- **Expecting**: Breeding occurred, awaiting birth
- **Born**: Puppies have been born
- **Weaning**: Puppies are in weaning phase
- **Ready for Homes**: Puppies ready for adoption
- **All Placed**: All puppies have found homes

### Statistics Display

Each litter card shows:

- **Total**: Total number of puppies
- **Available**: Puppies available for adoption
- **Reserved**: Puppies with pending applications (calculated)
- **Placed**: Puppies that have been homed

### Visual Design

- **Color-coded status indicators**: Each status has unique gradient colors
- **Icon system**: Consistent use of Ionicons throughout
- **Gradient cards**: Modern, attractive visual elements
- **Empty states**: Friendly, encouraging messages with clear CTAs
- **Responsive layout**: Works across different screen sizes

---

## Subscription Model

### Plan Types

#### **Basic Plan** (Default)

- Up to 1 kennel
- Basic litter management
- Standard support
- **Free** (or initial price point)

#### **Premium Plan**

- Up to 10 kennels
- Unlimited litter management
- Priority support
- Advanced features
- **$29.99/month**

### Upgrade Flow

When users click "Upgrade to Premium":

1. Alert displays explaining benefits
2. Shows pricing ($29.99/month)
3. Options: "Maybe Later" or "Upgrade Now"
4. TODO: Navigate to payment/upgrade flow (future implementation)

---

## Navigation Flow

### New User Journey

```
Profile Screen
  └─> Manage Kennels (Business Management)
       └─> Create/Edit/Delete Kennels
       └─> View Kennel Details

  └─> Subscription Section
       └─> View Current Plan
       └─> Upgrade to Premium (if Basic)

Litters Tab (Main Navigation)
  └─> View All Litters
       └─> Create New Litter
       └─> Litter Detail
            └─> Edit Litter
            └─> Delete Litter
            └─> Add Puppies
            └─> Manage Puppies
```

---

## Files Created/Modified

### New Files Created

1. `src/screens/main/LittersScreen.tsx`
2. `src/screens/details/LitterDetailScreen.tsx`
3. `src/screens/forms/CreateLitterScreen.tsx`
4. `src/screens/forms/EditLitterScreen.tsx`
5. `src/screens/forms/ManageKennelsScreen.tsx`

### Modified Files

1. `src/navigation/AppNavigator.tsx` - Updated tab navigation
2. `src/screens/main/ProfileScreen.tsx` - Added subscription and kennel management
3. `src/services/apiService.ts` - Added Litter API methods
4. `src/hooks/useApi.ts` - Added litter hooks

### Unchanged (Referenced)

1. `src/screens/main/KennelsScreen.tsx` - Still exists but not in main nav
2. `src/screens/details/KennelDetailScreen.tsx` - Used by ManageKennelsScreen
3. `src/screens/forms/CreateKennelScreen.tsx` - Used by ManageKennelsScreen

---

## Future Enhancements

### Recommended Next Steps

1. **Backend API Implementation**

   - Create `/litters` endpoint in homeforpup-api
   - Add CRUD operations for litters
   - Link litters to parent dogs (sire/dam)
   - Filter puppies by litter

2. **Payment Integration**

   - Implement subscription upgrade flow
   - Add payment processing (Stripe/PayPal)
   - Create subscription management

3. **Enhanced Litter Management**

   - Add photos to litters
   - Link parent dogs (sire/dam selection)
   - Automated date calculations (birth + 8 weeks = ready date)
   - Vaccination schedule tracking
   - Milestone tracking

4. **Notifications**

   - Remind breeders of important dates
   - Alert when puppies ready for homes
   - Notify of pending reservations

5. **Analytics**

   - Litter success rates
   - Average puppies per litter
   - Revenue tracking
   - Popular breeds

6. **Advanced Features** (Premium Only)
   - Health records per litter
   - Genetic testing results
   - Show results for parents
   - Pedigree builder
   - Contract generation

---

## Testing Notes

### Manual Testing Required

1. **Navigation**

   - Verify Litters tab appears correctly
   - Verify Kennels removed from main navigation
   - Test all navigation flows

2. **Profile Screen**

   - Verify subscription section displays
   - Test "Manage Kennels" navigation
   - Test "Upgrade to Premium" alert

3. **Litters**

   - Test create/edit/delete litter
   - Verify form validation
   - Test empty states
   - Test pull-to-refresh

4. **Kennels Management**
   - Test from Profile screen
   - Verify CRUD operations
   - Test plan limitations display

### API Testing

- Currently using mock data
- Replace with real API calls when backend is ready
- Test error handling and loading states

---

## Migration Notes

### For Existing Users

- No data migration needed yet (new feature)
- Existing kennels remain accessible
- Profile enhancements are additive

### Database Schema

When implementing backend, consider:

```sql
CREATE TABLE litters (
  id UUID PRIMARY KEY,
  breeder_id UUID REFERENCES users(id),
  kennel_id UUID REFERENCES kennels(id),
  sire_id UUID REFERENCES dogs(id),
  dam_id UUID REFERENCES dogs(id),
  breed VARCHAR(100),
  breeding_date DATE,
  expected_date DATE,
  birth_date DATE,
  season VARCHAR(20),
  puppy_count INT,
  male_count INT,
  female_count INT,
  available_puppies INT,
  description TEXT,
  status VARCHAR(20),
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Design Decisions

### Why Move Kennels to Profile?

1. **Simplified Navigation**: Most breeders have 1-2 kennels, doesn't need dedicated tab
2. **Business Context**: Kennels are business settings, fits better in profile
3. **Focus on Core Operations**: Litters and Dogs are day-to-day operations
4. **Premium Upsell**: Creates opportunity to showcase premium features

### Why Create Litters Feature?

1. **Real Breeding Operations**: Breeders think in terms of litters
2. **Better Organization**: Group puppies by birth cohort
3. **Date Tracking**: Critical for breeding schedule
4. **Statistics**: Important for business insights
5. **Marketing**: Easier to announce new litters

### Status Terminology

Chose breeder-friendly terms:

- Avoid technical jargon
- Use industry-standard language
- Clear progression from planning to placement
- Positive framing ("Placed" vs "Sold")

---

## Support & Documentation

### For Breeders

Create user guide covering:

- How to create a litter
- Managing puppy assignments
- Understanding statistics
- Upgrade benefits

### For Developers

- API documentation needed
- Component usage examples
- State management patterns
- Error handling guidelines

---

## Accessibility

- All icons have text labels
- Color is not the only indicator
- Touch targets are appropriate size
- Text is readable at default sizes

## Performance

- Lazy loading for lists
- Pull-to-refresh for data updates
- Optimistic UI updates where possible
- Proper loading states

---

## Conclusion

This reorganization creates a more intuitive structure for breeders, focusing on their day-to-day operations (litters and dogs) while moving configuration settings (kennels) to a more appropriate location. The subscription model sets the foundation for future monetization.

**Status**: ✅ Implementation Complete (Frontend)
**Next**: Backend API implementation required for full functionality
