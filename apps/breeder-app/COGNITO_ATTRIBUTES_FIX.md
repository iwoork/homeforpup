# Fix: Phone, Location, and Bio Loading from Cognito

## Issue
The profile edit screen was not loading phone, location, and bio (profile) data from Cognito user attributes when displaying the edit form.

## Root Cause
The NextAuth configuration in the breeder app was only extracting basic user information from Cognito (name, email, image, userType, isVerified) but not the additional attributes like `phone_number`, `address`, and `profile`.

## Solution Implemented

### 1. Updated NextAuth Configuration (`src/lib/auth.ts`)

**Profile Function Enhancement:**
```typescript
profile(profile: any) {
  return {
    id: profile.sub,
    name: profile.name || profile.email?.split('@')[0] || 'User',
    email: profile.email,
    image: profile.picture,
    userType: profile['custom:userType'] || 'breeder',
    isVerified: profile.email_verified || false,
    // Additional Cognito attributes
    phone: profile.phone_number,
    location: profile.address,
    bio: profile.profile,
    firstName: profile.given_name,
    lastName: profile.family_name,
  };
},
```

**JWT Callback Enhancement:**
```typescript
async jwt({ token, account, profile }: any) {
  if (account) {
    token.accessToken = account.access_token;
    token.refreshToken = account.refresh_token;
    token.userType = profile?.userType || 'breeder';
    token.isVerified = profile?.isVerified || false;
    // Pass through additional Cognito attributes
    token.phone = profile?.phone;
    token.location = profile?.location;
    token.bio = profile?.bio;
    token.firstName = profile?.firstName;
    token.lastName = profile?.lastName;
  }
  return token;
},
```

**Session Callback Enhancement:**
```typescript
async session({ session, token }: any) {
  if (token) {
    session.user.id = token.sub || token.id;
    session.user.userType = token.userType as string;
    session.user.isVerified = token.isVerified as boolean;
    session.accessToken = token.accessToken as string;
    // Pass through additional Cognito attributes
    session.user.phone = token.phone as string;
    session.user.location = token.location as string;
    session.user.bio = token.bio as string;
    session.user.firstName = token.firstName as string;
    session.user.lastName = token.lastName as string;
  }
  return session;
},
```

### 2. Updated TypeScript Types (`src/types/next-auth.d.ts`)

Added the new Cognito attributes to both Session and User interfaces:
```typescript
interface Session {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    userType?: string
    isVerified?: boolean
    phone?: string | null
    location?: string | null
    bio?: string | null
    firstName?: string | null
    lastName?: string | null
  }
  accessToken?: string
}
```

### 3. Enhanced Profile Loading Logic (`src/app/profile/edit/page.tsx`)

**Data Merging Strategy:**
```typescript
// Merge database data with Cognito session data
// Prefer database data if it exists, otherwise fall back to Cognito data
const mergedData = {
  name: data.user.name || session?.user?.name || '',
  displayName: data.user.displayName || '',
  firstName: data.user.firstName || session?.user?.firstName || '',
  lastName: data.user.lastName || session?.user?.lastName || '',
  phone: data.user.phone || session?.user?.phone || '',
  location: data.user.location || session?.user?.location || '',
  bio: data.user.bio || session?.user?.bio || '',
  // ... other fields
};
```

### 4. Enhanced Profile API (`src/app/api/profile/route.ts`)

**Fallback for New Users:**
```typescript
if (!result.Item) {
  // If user doesn't exist in database, return Cognito session data
  const cognitoUser = {
    userId: userId,
    email: session.user.email,
    name: session.user.name,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    phone: session.user.phone,
    location: session.user.location,
    bio: session.user.bio,
    profileImage: session.user.image,
    userType: session.user.userType || 'breeder',
    verified: session.user.isVerified || false,
    // ... timestamps
  };
  
  return NextResponse.json({ user: cognitoUser });
}
```

## Cognito Attribute Mapping

The system now properly maps these Cognito attributes:
- `phone_number` → `phone`
- `address` → `location`  
- `profile` → `bio`
- `given_name` → `firstName`
- `family_name` → `lastName`

## Data Priority Strategy

1. **Database Data** (Primary): If user exists in database, use database values
2. **Cognito Data** (Fallback): If database field is empty, fall back to Cognito attribute
3. **Default Values**: If both are empty, use empty string

## Benefits

- **Seamless Experience**: Users see their Cognito data immediately when editing profile
- **No Data Loss**: Existing database data is preserved and takes priority
- **New User Support**: New users see their Cognito data even before saving to database
- **Consistent Sync**: Ensures Cognito and database stay in sync
- **Type Safety**: Full TypeScript support for all attributes

## Testing

After these changes:
1. Users with existing database profiles will see their database data
2. Users with only Cognito data will see their Cognito attributes
3. Phone, location, and bio fields will be properly populated
4. Form submission will continue to save to both database and Cognito

## Notes

- Users need to sign out and sign back in for the new session attributes to take effect
- The changes are backward compatible with existing user data
- All profile fields now have proper fallback handling
