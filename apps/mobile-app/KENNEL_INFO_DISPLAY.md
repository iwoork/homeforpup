# Enhanced Kennel Information Display

## Contact Breeder Form - Kennel Information

### What Changed

Updated the ContactBreederScreen to prominently display **kennel information** instead of just "Contacting Breeder".

---

## 🎨 New Layout

### With Kennel Information (Preferred):

```
┌──────────────────────────────────────────┐
│  [Avatar/    Golden Paws Kennel          │ ← KENNEL NAME (Large, Bold)
│   Kennel     👤 John Smith               │ ← Breeder name (smaller, with icon)
│   Icon]      🐾 Golden Retriever,        │ ← Specialties (first 2)
│              Labrador, +1 more            │
│              🏆 15 years experience       │ ← Experience
│              📍 California, USA           │ ← Location
│                                           │
│  [View Kennel Profile →]                 │ ← Link to full profile
└──────────────────────────────────────────┘
```

### Without Kennel Information (Fallback):

```
┌──────────────────────────────────────────┐
│  [Avatar]    Contacting                  │ ← Label (small)
│              John Smith                   │ ← BREEDER NAME (Large, Bold)
│              📍 California, USA           │ ← Location
└──────────────────────────────────────────┘
```

---

## 📋 Information Hierarchy

### Priority 1 - Kennel Name (If Available):

- **Font**: 20px, bold, 700 weight
- **Color**: Primary text color
- **Position**: Top of info section
- **Replaces**: "Contacting" label

### Priority 2 - Breeder Name:

- **With Kennel**: 14px, medium weight, secondary color, with person icon
- **Without Kennel**: 20px, bold, primary text color

### Priority 3 - Specialties:

- **Shows**: First 2 breeds
- **Format**: "Golden Retriever, Labrador, +2 more"
- **Icon**: Paw icon
- **Color**: Secondary text

### Priority 4 - Experience:

- **Shows**: Years of breeding experience
- **Format**: "15 years experience"
- **Icon**: Ribbon/award icon
- **Color**: Secondary text

### Priority 5 - Location:

- **Always shown** if available
- **Icon**: Location pin
- **Format**: City, State or full location string

---

## 🔍 Data Sources

### Breeder Info Object:

```typescript
{
  name: "John Smith",
  displayName: "John Smith",
  profileImage?: "https://...",
  location?: "California, USA",
  breederInfo?: {
    kennelName?: "Golden Paws Kennel",
    specialties?: ["Golden Retriever", "Labrador", "Poodle"],
    experience?: 15,
    license?: "ABC-12345",
    website?: "https://goldenpaws.com"
  }
}
```

### Fetched via:

```typescript
const response = await apiService.getUserById(params.receiverId);
```

---

## 🎯 Display Logic

### If Kennel Name Exists:

```
✅ Show kennel name (large, bold)
✅ Show breeder name (small, with icon)
✅ Show specialties (if available)
✅ Show experience (if available)
✅ Show location
✅ Show "View Kennel Profile" button
```

### If No Kennel Name:

```
✅ Show "Contacting" label
✅ Show breeder name (large, bold)
✅ Show location
❌ No specialties or experience
❌ No profile link
```

---

## 📱 UI Examples

### Example 1: Full Kennel Info

```
┌──────────────────────────────────────────┐
│  🏠       Sunshine Golden Retrievers      │
│           👤 Sarah Johnson               │
│           🐾 Golden Retriever            │
│           🏆 20 years experience         │
│           📍 Austin, Texas               │
│           [View Kennel Profile →]        │
└──────────────────────────────────────────┘
```

### Example 2: Partial Info

```
┌──────────────────────────────────────────┐
│  🏠       Happy Tails Kennel             │
│           👤 Mike Williams               │
│           📍 Seattle, Washington         │
│           [View Kennel Profile →]        │
└──────────────────────────────────────────┘
```

### Example 3: No Kennel Info

```
┌──────────────────────────────────────────┐
│  👤       Contacting                     │
│           Emma Davis                     │
│           📍 Portland, Oregon            │
└──────────────────────────────────────────┘
```

---

## 🎨 Visual Styling

### Avatar/Icon:

- **Size**: 64x64
- **Border Radius**: 32 (circular)
- **With Photo**: Shows breeder's profile image
- **Without Photo**: Shows home icon (kennel) in placeholder

### Kennel Name:

- **Font Size**: 20px
- **Weight**: 700 (bold)
- **Color**: Text primary (#000 or theme)
- **Margin Bottom**: 6px

### Breeder Name (when kennel shown):

- **Font Size**: 14px
- **Weight**: 500 (medium)
- **Color**: Text secondary (#666 or theme)
- **Icon**: Person icon, 14px
- **Layout**: Row with icon

### Info Rows (Specialties, Experience, Location):

- **Font Size**: 13px
- **Color**: Text secondary
- **Icon Size**: 14px
- **Gap**: 4px between icon and text
- **Margin**: 4px between rows

### View Profile Button:

- **Background**: Surface/white
- **Border**: 1px primary color
- **Padding**: 8px vertical, 12px horizontal
- **Border Radius**: 12px
- **Layout**: Row with text + arrow icon
- **Margin Top**: 12px

---

## 🔄 Navigation Integration

### Added to AppNavigator:

```typescript
<Stack.Screen
  name="ContactBreeder"
  component={ContactBreederScreen}
  options={{ title: 'Contact Breeder' }}
/>
```

### All Entry Points Updated:

✅ SearchPuppiesScreen → ContactBreeder
✅ MatchedPuppiesScreen → ContactBreeder
✅ FavoritePuppiesScreen → ContactBreeder
✅ DogDetailScreen → ContactBreeder

---

## 💼 Professional Presentation

### Why This Matters:

1. **Trust Building**:

   - Seeing kennel name builds credibility
   - Experience years show expertise
   - Specialties show focus/expertise

2. **Informed Decisions**:

   - Dog Parents know who they're talking to
   - Can verify kennel before messaging
   - Specialties help confirm fit

3. **Better Conversations**:

   - Context about breeder's experience
   - Can reference kennel in message
   - More professional interaction

4. **Discoverability**:
   - "View Kennel Profile" encourages exploration
   - Learn more before committing to message
   - Find other puppies from same kennel

---

## 🧪 Testing Scenarios

### Scenario 1: Premium Breeder

**Given**: Breeder has complete profile

- Kennel name: "Golden Paws Kennel"
- Specialties: ["Golden Retriever", "Labrador", "Poodle"]
- Experience: 15 years
- Location: "California"

**Expected**:

```
Golden Paws Kennel
👤 John Smith
🐾 Golden Retriever, Labrador, +1 more
🏆 15 years experience
📍 California
[View Kennel Profile →]
```

### Scenario 2: Basic Breeder

**Given**: Breeder has kennel name only

- Kennel name: "Happy Tails"
- No specialties
- No experience listed
- Location: "Texas"

**Expected**:

```
Happy Tails
👤 Sarah Johnson
📍 Texas
[View Kennel Profile →]
```

### Scenario 3: Individual Breeder

**Given**: No kennel information

- Just personal name: "Mike Williams"
- Location: "Oregon"

**Expected**:

```
Contacting
Mike Williams
📍 Oregon
```

---

## 🔧 Backend Requirements

### User/Breeder Object Must Include:

```typescript
{
  userId: string;
  name: string;
  displayName?: string;
  profileImage?: string;
  location?: string;
  breederInfo?: {
    kennelName?: string;
    specialties?: string[];
    experience?: number;
    license?: string;
    website?: string;
  }
}
```

### API Endpoint:

```
GET /users/{userId}
```

Should return full user object with nested breederInfo.

---

## ✨ Benefits Summary

### For Dog Parents:

✅ **Professional presentation** - Not just a generic form
✅ **Immediate context** - Know kennel credentials
✅ **Informed messaging** - Can reference kennel in message
✅ **Trust building** - See experience and specialties upfront

### For Breeders:

✅ **Professional image** - Kennel branding showcased
✅ **Credibility** - Experience and specialties displayed
✅ **Better leads** - Dog Parents who message know more about them
✅ **Marketing** - Profile link encourages exploration

### For Platform:

✅ **Quality interactions** - Both parties better informed
✅ **Conversion** - Professional presentation increases messages
✅ **Trust** - Transparency builds platform credibility
✅ **Discovery** - Profile links increase engagement

---

## 📊 Information Display Priority

### What's Shown First:

1. **Kennel Name** (if exists) - Most important, largest text
2. **Breeder Name** - Owner/operator
3. **Specialties** - What breeds they focus on
4. **Experience** - Credibility indicator
5. **Location** - Practical information
6. **Profile Link** - Call to action

### What's Hidden (For Now):

- License number (too technical)
- Website (available in profile)
- Contact details (that's what messaging is for)
- Detailed bio (available in profile)

---

## 🎊 Conclusion

The ContactBreederScreen now provides a **professional, information-rich experience** that:

- Prominently displays kennel information
- Shows breeder credentials (specialties, experience)
- Builds trust through transparency
- Encourages informed conversations
- Maintains clean, scannable layout

The enhancement transforms a simple contact form into a **credibility-building, trust-establishing** interaction point between dog-parents and breeders.

---

**File**: `/apps/mobile-app/src/screens/dog-parent/ContactBreederScreen.tsx`
**Status**: Complete and ready for testing
**Next**: Implement message sending API
