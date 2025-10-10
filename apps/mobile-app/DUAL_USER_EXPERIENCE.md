# Dual User Experience Implementation

## Overview

This document describes the implementation of a dual user experience in the mobile app, supporting both **Dog Parents** and **Breeders** with distinct, tailored interfaces and features.

## Implementation Date

October 9, 2025

---

## Architecture Changes

### 1. User Type System

- Users are identified by the `userType` field in the users table
- Supported values: `'dog-parent'`, `'breeder'`, or `'both'`
- User type is stored in AWS Cognito as a custom attribute (`custom:userType`)
- User type is extracted from the JWT token on login

### 2. Authentication Updates

#### SignupScreen Enhancements

- **Location**: `/apps/mobile-app/src/screens/auth/SignupScreen.tsx`
- Added user type selection during registration
- Users choose between "Dog Parent" and "Breeder" before completing signup
- Visual selection with icons and descriptions:
  - Dog Parent: Heart icon - "Looking for a puppy"
  - Breeder: Paw icon - "Breeding puppies"

#### AuthService Updates

- **Location**: `/apps/mobile-app/src/services/authService.ts`
- Updated signup function to accept `userType` parameter
- User type is stored as custom Cognito attribute
- User type is retrieved during login and stored in user object

---

## Dog Parent-Specific Features

### 3. Dog Parent Dashboard

- **Location**: `/apps/mobile-app/src/screens/main/Dog ParentDashboardScreen.tsx`
- **Features**:
  - Personalized welcome message
  - Quick access cards to key features:
    - Search Puppies
    - Matched Puppies
    - My Favorites
    - Edit Preferences
  - Statistics overview (Favorites, Messages)
  - Tips for finding a puppy

### 4. Search Puppies Screen

- **Location**: `/apps/mobile-app/src/screens/dog-parent/SearchPuppiesScreen.tsx`
- **Features**:
  - Search bar with breed and location filters
  - Popular breeds quick filter chips
  - Grid view of available puppies
  - Puppy cards showing:
    - Photo with favorite button
    - Name, breed, age, gender
    - Location and price
    - Breeder name
  - Empty state with call-to-action to set preferences

### 5. Matched Puppies Screen

- **Location**: `/apps/mobile-app/src/screens/dog-parent/MatchedPuppiesScreen.tsx`
- **Features**:
  - AI-powered matching based on user preferences
  - Match score percentage for each puppy
  - Detailed match reasons (e.g., "Matches your preferred breed")
  - Quick contact breeder button
  - Link to edit preferences
  - Empty state if no preferences set or no matches found

### 6. Dog Parent Preferences Screen

- **Location**: `/apps/mobile-app/src/screens/dog-parent/Dog ParentPreferencesScreen.tsx`
- **Features**:
  - **Preferred Breeds**: Multi-select grid of popular breeds
  - **Experience Level**: First-time, Some Experience, Experienced
  - **Housing Type**: House, Apartment, Condo
  - **Yard Size**: None, Small, Medium, Large
  - **Other Pets**: Toggle for existing pets
  - **Location**: City, state, or zip code input
  - All preferences saved to user profile for matching algorithm

### 7. Favorite Puppies Screen

- **Location**: `/apps/mobile-app/src/screens/dog-parent/FavoritePuppiesScreen.tsx`
- **Features**:
  - List of saved/favorited puppies
  - Quick access to puppy details
  - Remove from favorites option
  - Direct message breeder button
  - Empty state with call-to-action to browse puppies

---

## Breeder-Specific Features

### 8. Breeder Dashboard (Existing)

- **Location**: `/apps/mobile-app/src/screens/main/DashboardScreen.tsx`
- **Features**:
  - Statistics: Total Litters, Dogs, Messages, Inquiries
  - Quick actions: Add Litter, Add Dog
  - Recent activity feed

### 9. Breeder Management Screens (Existing)

- Kennels Management
- Litter Management
- Dog Registration
- Contract Management
- Waitlist Management

---

## Shared Features

### 10. Adaptive Navigation

- **Location**: `/apps/mobile-app/src/navigation/AppNavigator.tsx`
- **Implementation**:
  - Separate tab navigators for each user type
  - **Breeder Tabs**: Home, Litters, Dogs, Messages, Profile
  - **Dog Parent Tabs**: Home, Search, Favorites, Messages, Profile
  - Navigation automatically switches based on `user.userType`
  - All detail screens (Dog Detail, Message Detail) are shared

### 11. Profile Management

- **Location**: `/apps/mobile-app/src/screens/forms/EditProfileScreen.tsx`
- **Features**:
  - Common sections for all users:
    - Profile photo
    - Personal information (name, email, phone, location, bio)
    - Social media links
    - Privacy settings
    - Notification preferences
  - **Breeder-only section**:
    - Kennel name
    - Website
    - License number
    - Years of experience
    - Breed specialties
  - **Dog Parent-only section**:
    - Link to detailed preferences screen
    - Information about preference matching

### 12. Messaging System

- Both user types can send and receive messages
- Shared MessagesScreen component
- Message threads show user type badge

---

## Data Model Enhancements

### User Type Fields

The User type already includes comprehensive fields for both user types:

```typescript
interface User {
  userId: string;
  email: string;
  name: string;
  userType: 'breeder' | 'dog-parent' | 'both';

  // Breeder-specific
  breederInfo?: {
    kennelName?: string;
    license?: string;
    specialties?: string[];
    experience?: number;
    website?: string;
  };

  // Dog Parent-specific
  puppyParentInfo?: {
    housingType?: 'house' | 'apartment' | 'condo';
    yardSize?: 'none' | 'small' | 'medium' | 'large';
    hasOtherPets?: boolean;
    experienceLevel?: 'first-time' | 'some' | 'experienced';
    preferredBreeds?: string[];
  };
}
```

---

## Matching Algorithm (Future Enhancement)

### Current Implementation

- Preferences are stored in user profile
- UI is built to display matches
- Match scoring system is designed but not yet connected to backend

### Recommended Backend Implementation

1. **Breed Matching**: Compare user's `preferredBreeds` with available puppies
2. **Location Matching**: Calculate distance between user location and breeder
3. **Experience Matching**: Match puppy temperament with user experience level
4. **Housing Compatibility**: Match puppy size/energy with housing type and yard size
5. **Score Calculation**: Weighted algorithm to calculate match percentage

### Match Reasons Display

The UI shows specific reasons for matches:

- "Matches your preferred breed"
- "Close to your location"
- "Good for first-time owners" (based on experience level)
- "Compatible with your housing situation"
- "Good with other pets" (if user has pets)

---

## API Endpoints to Implement

### For Dog Parent Features

1. **GET /puppies/search**

   - Query params: breed, location, maxDistance, gender, age, priceRange
   - Returns: List of available puppies with breeder info

2. **GET /puppies/matched/{userId}**

   - Returns: List of puppies matching user's preferences with match scores
   - Includes match reasons

3. **POST /favorites/{userId}/puppies/{puppyId}**

   - Add puppy to user's favorites

4. **DELETE /favorites/{userId}/puppies/{puppyId}**

   - Remove puppy from favorites

5. **GET /favorites/{userId}**

   - Returns: User's favorited puppies

6. **PUT /users/{userId}/preferences**
   - Update dog-parent preferences (puppyParentInfo)

---

## UI/UX Highlights

### Design Principles

1. **Clear User Type Identification**: Visual cues throughout the app
2. **Context-Appropriate Features**: Each user sees only relevant features
3. **Consistent Design Language**: Shared theme and components
4. **Easy Navigation**: Intuitive tab navigation for each user type

### Color Coding

- Primary actions: Theme primary color (teal/blue)
- Favorites/Matches: Pink/Red (#ec4899, #ef4444)
- Search: Primary color
- Success states: Green
- Info cards: Blue tint

### Icons

- Dog Parent: Heart, Search, Star
- Breeder: Paw, Albums (litters), Stats
- Shared: Messages, Profile, Location

---

## Testing Checklist

### Dog Parent Flow

- [ ] Register as dog-parent
- [ ] Login and see dog-parent dashboard
- [ ] Set preferences
- [ ] Search for puppies
- [ ] View matched puppies (when backend ready)
- [ ] Add/remove favorites
- [ ] Contact breeder
- [ ] Edit profile (dog-parent sections only visible)

### Breeder Flow

- [ ] Register as breeder
- [ ] Login and see breeder dashboard
- [ ] Manage kennels
- [ ] Add litters and dogs
- [ ] Respond to messages from dog-parents
- [ ] Edit profile (breeder sections only visible)

### Shared Flow

- [ ] Messages work for both user types
- [ ] Profile photos upload correctly
- [ ] Navigation adapts to user type
- [ ] Dog detail screen accessible to both

---

## Future Enhancements

### Phase 2 - Matching Algorithm

- Implement backend matching algorithm
- Real-time match updates
- Match notifications

### Phase 3 - Advanced Search

- Multiple filter combinations
- Save search preferences
- Search alerts for new matches

### Phase 4 - Social Features

- Reviews and ratings
- Breeder verification badges
- Success stories
- Photo galleries

### Phase 5 - Application Process

- Formal adoption application workflow
- Document upload (vet references, etc.)
- Application status tracking
- Automated breeder notifications

---

## Migration Notes

### Existing Users

- Existing users default to 'breeder' type for backward compatibility
- Users can be migrated in batches via admin tool
- Consider prompt for existing users to verify/update their type

### Database Changes

- No schema changes required (fields already exist)
- May need to backfill `userType` for existing users
- Consider adding indexes on `userType` for queries

---

## Known Limitations

1. **Matching Algorithm**: Not yet implemented on backend
2. **Real Puppies Data**: Currently shows empty states (needs API integration)
3. **Favorites Persistence**: Not yet connected to backend storage
4. **Push Notifications**: Not yet configured for match alerts
5. **Location Services**: Distance calculation not yet implemented

---

## Support and Maintenance

### Code Locations

- **Dog Parent Screens**: `/apps/mobile-app/src/screens/dog-parent/`
- **Main Screens**: `/apps/mobile-app/src/screens/main/`
- **Navigation**: `/apps/mobile-app/src/navigation/AppNavigator.tsx`
- **Auth**: `/apps/mobile-app/src/services/authService.ts`
- **Types**: `/packages/shared-types/src/index.ts`

### Key Dependencies

- React Navigation (tabs and stack)
- React Native Vector Icons (Ionicons)
- React Native Linear Gradient
- AWS Amplify (authentication)

---

## Conclusion

The dual user experience implementation provides a solid foundation for both dog-parents and breeders to use the Home for Pup platform. The architecture is scalable, maintainable, and ready for future enhancements. The next critical step is implementing the backend matching algorithm and connecting the dog-parent features to real puppy data.
