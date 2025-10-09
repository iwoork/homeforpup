# Dashboard Update: Kennels → Litters

## Summary

Updated the dashboard to focus on litters instead of kennels, reflecting the new app structure where litters are the primary breeding management unit.

## Changes Made

### 1. API Service (`apiService.ts`)

#### DashboardStats Interface

```typescript
// Before
export interface DashboardStats {
  totalKennels: number;
  totalDogs: number;
  activeMessages: number;
  newInquiries: number;
}

// After
export interface DashboardStats {
  totalLitters: number;
  totalDogs: number;
  activeMessages: number;
  newInquiries: number;
}
```

#### getDashboardStats Method

```typescript
// Before - fetched kennels
const [kennelsResponse, dogsResponse] = await Promise.all([
  this.getKennels({ page: 1, limit: 100 }),
  this.getDogs({ page: 1, limit: 100, ownerId: userId }),
]);

const stats: DashboardStats = {
  totalKennels: userKennels.length,
  // ...
};

// After - fetches litters
const [littersResponse, dogsResponse] = await Promise.all([
  this.getLitters({ page: 1, limit: 100, breederId: userId }),
  this.getDogs({ page: 1, limit: 100, ownerId: userId }),
]);

const stats: DashboardStats = {
  totalLitters: littersResponse.data?.litters?.length || 0,
  // ...
};
```

### 2. Dashboard Screen (`DashboardScreen.tsx`)

#### Stats Display

```typescript
// Before
{
  title: 'Total Kennels',
  value: stats?.totalKennels?.toString() || '0',
  icon: 'home',
  colors: [theme.colors.primary, theme.colors.primaryDark],
}

// After
{
  title: 'Total Litters',
  value: stats?.totalLitters?.toString() || '0',
  icon: 'albums',
  colors: [theme.colors.primary, theme.colors.primaryDark],
}
```

#### Quick Actions

```typescript
// Before
{
  title: 'Add Kennel',
  subtitle: 'Create a new kennel',
  icon: 'add-circle',
  iconColor: theme.colors.primary,
  screen: 'CreateKennel',
}

// After
{
  title: 'Add Litter',
  subtitle: 'Create a new litter',
  icon: 'add-circle',
  iconColor: theme.colors.primary,
  screen: 'CreateLitter',
}
```

#### Header Text

```typescript
// Before
<Text style={styles.subtitle}>Here's your kennel overview</Text>

// After
<Text style={styles.subtitle}>Here's your breeding overview</Text>
```

#### Activity Section

```typescript
// Before
<Text style={styles.activitySubtext}>
  Your recent kennel activities will appear here
</Text>

// After
<Text style={styles.activitySubtext}>
  Your recent breeding activities will appear here
</Text>
```

---

## What This Achieves

### ✅ **Consistent Terminology**

- Dashboard now uses "litters" terminology throughout
- Aligns with the new navigation structure (Litters tab)
- Matches the primary breeding workflow

### ✅ **Accurate Data**

- Dashboard now shows actual litter count from the API
- Uses the litters endpoint we built earlier
- Filters by `breederId` for user-specific data

### ✅ **Better User Experience**

- Quick action leads to "Create Litter" instead of "Create Kennel"
- Icon changed from 'home' to 'albums' (more appropriate for litters)
- Language reflects breeding focus rather than kennel management

### ✅ **Navigation Alignment**

- Dashboard quick action navigates to `CreateLitter` screen
- Matches the main navigation structure
- Consistent with the litters-focused workflow

---

## Technical Details

### Data Flow

```
Dashboard loads →
  useDashboardStats hook →
    apiService.getDashboardStats() →
      Fetches litters via getLitters() →
        Returns totalLitters count →
          Displays in dashboard card
```

### API Integration

- Uses existing `getLitters()` method
- Filters by `breederId` for user-specific data
- Maintains same error handling and loading states

### Icon Changes

- **Before**: `home` icon (represented kennels/buildings)
- **After**: `albums` icon (represents collections/litters)

---

## Testing

### Verify Dashboard Updates

1. ✅ Open the app and go to Dashboard
2. ✅ Check that "Total Litters" card shows correct count
3. ✅ Verify "Add Litter" quick action works
4. ✅ Confirm header says "breeding overview"
5. ✅ Check that litter count updates when you add/remove litters

### Data Accuracy

1. ✅ Create a new litter
2. ✅ Return to dashboard
3. ✅ Verify count increases by 1
4. ✅ Delete a litter
5. ✅ Verify count decreases by 1

---

## Related Files Modified

- `apps/mobile-app/src/services/apiService.ts`
- `apps/mobile-app/src/screens/main/DashboardScreen.tsx`

## No Breaking Changes

- All existing functionality preserved
- API contracts maintained
- Navigation still works as expected

---

**Status**: ✅ **COMPLETE**
**Impact**: Dashboard now accurately reflects litter-focused breeding workflow
**User Experience**: More intuitive and consistent with app navigation
