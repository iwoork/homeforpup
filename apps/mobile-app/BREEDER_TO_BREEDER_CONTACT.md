# Breeder-to-Breeder Contact Feature

## Overview

Enhanced the ContactBreederScreen to work for **both dog-parents AND breeders**, enabling professional breeder-to-breeder communication for breeding collaborations, stud services, and networking.

## Implementation Date

October 9, 2025

---

## 🎯 What Changed

### ContactBreederScreen is Now Universal

**File**: `/apps/mobile-app/src/screens/dog-parent/ContactBreederScreen.tsx`

The screen now adapts based on the **logged-in user's type**:

- **Dog Parents**: See adoption-focused templates and tips
- **Breeders**: See collaboration-focused templates and tips

---

## 📝 User-Type Specific Content

### For Dog Parents:

#### Pre-filled Subject:

```
Inquiry about Max
```

#### Pre-filled Message:

```
Hi,

I'm interested in learning more about Max (Golden Retriever).
Could you please provide more information?

Thank you!
```

#### Quick Templates:

- "Tell me more about this puppy"
- "Is this puppy still available?"
- "Can I schedule a visit?"
- "What are the next steps?"

#### Tips:

- Be specific about what you'd like to know
- Mention your experience with dogs
- Ask about health tests and certifications
- Be respectful of their time

---

### For Breeders:

#### Pre-filled Subject:

```
Inquiry about Max - Breeding/Collaboration
```

#### Pre-filled Message:

```
Hello,

I'm a fellow breeder and I'm interested in discussing Max (Golden Retriever).
I'd like to learn more about potential breeding opportunities, stud services,
or collaboration.

Looking forward to connecting with you.

Best regards,
John Smith
```

#### Quick Templates:

- "Interested in breeding collaboration"
- "Inquiring about stud services"
- "Would like to discuss this dog"
- "Can we schedule a call?"

#### Tips:

- Introduce your kennel and experience
- Be specific about your breeding goals
- Discuss health testing and certifications
- Be professional and respectful

---

## 🔄 Updated Button Labels

### DogDetailScreen Updates:

**For Dog Parents** (viewing any dog):

```
[Contact Breeder]
```

**For Breeders** (viewing others' dogs):

```
[Contact Owner]
```

**For Owners** (viewing their own dogs):

```
[Edit]  [Delete]
```

---

## 🎨 Visual Examples

### Breeder Viewing Another Breeder's Dog:

```
┌─────────────────────────────────────────┐
│ DOG DETAIL - Max                        │
├─────────────────────────────────────────┤
│ [Photo of Max]                          │
│                                         │
│ [Contact Owner]                         │ ← Shows for breeders
├─────────────────────────────────────────┤
│ Basic Information                       │
│ Breed: Golden Retriever                 │
│ Gender: Male                            │
│ Age: 2 years                            │
└─────────────────────────────────────────┘
```

Then clicking "Contact Owner" opens:

```
┌─────────────────────────────────────────┐
│ SEND MESSAGE                            │
├─────────────────────────────────────────┤
│ [Avatar]  Golden Paws Kennel            │
│           👤 John Smith                 │
│           🐾 Golden Retriever, Labrador │
│           🏆 15 years experience        │
│           📍 California                 │
├─────────────────────────────────────────┤
│ 🐾 ABOUT THIS DOG                      │ ← "Dog" for breeders
│ [Photo] Max - Golden Retriever          │
├─────────────────────────────────────────┤
│ Subject *                               │
│ Inquiry about Max - Breeding/...        │ ← Breeder subject
│                                         │
│ Message *                               │
│ Hello,                                  │
│                                         │
│ I'm a fellow breeder and I'm           │ ← Breeder message
│ interested in discussing Max...         │
│                                         │
│ Quick Templates:                        │
│ [+Breeding collaboration]               │ ← Breeder templates
│ [+Stud services]                        │
│                                         │
│ 💡 Tips for professional breeder        │ ← Breeder tips
│    communication:                       │
│ • Introduce your kennel...              │
└─────────────────────────────────────────┘
```

---

## 🤝 Use Cases for Breeder-to-Breeder Contact

### 1. Stud Services:

- Breeder sees another breeder's male dog
- Wants to use for breeding
- Contacts to discuss terms, health tests, fees

### 2. Breeding Stock Purchase:

- Breeder finds quality breeding dog
- Wants to add to their program
- Contacts to inquire about purchase

### 3. Collaboration:

- Breeders want to co-own a dog
- Share breeding rights
- Collaborate on litters

### 4. Networking:

- Connect with other breeders
- Share knowledge
- Build professional relationships

### 5. Show Dog Inquiries:

- Interest in show-quality dogs
- Co-ownership for showing
- Training collaboration

---

## 🎯 Feature Comparison

### Before:

- ❌ Only dog-parents could contact breeders
- ❌ Breeders had no way to contact other breeders
- ❌ Same generic templates for everyone
- ❌ No professional breeder communication

### After:

- ✅ Both dog-parents and breeders can contact
- ✅ Breeders can network with other breeders
- ✅ User-specific templates and tips
- ✅ Professional breeder-to-breeder tone
- ✅ Adaptive button labels ("Contact Owner" vs "Contact Breeder")
- ✅ Same beautiful kennel information display

---

## 🔧 Technical Implementation

### Permission Logic:

```typescript
// In DogDetailScreen
const canEdit = dog?.ownerId === user?.userId; // Only owner can edit
const canContact = dog?.ownerId && dog?.ownerId !== user?.userId; // Non-owners can contact
```

### Display Logic:

```typescript
// Show appropriate buttons based on ownership
{
  canEdit && (
    <View>
      <Button>Edit</Button>
      <Button>Delete</Button>
    </View>
  );
}

{
  canContact && (
    <Button>
      {user?.userType === 'breeder' ? 'Contact Owner' : 'Contact Breeder'}
    </Button>
  );
}
```

### Message Template Selection:

```typescript
if (user?.userType === 'breeder') {
  // Professional breeder message template
  setMessage(`Hello,\n\nI'm a fellow breeder...`);
} else {
  // Dog Parent message template
  setMessage(`Hi,\n\nI'm interested in...`);
}
```

---

## 📱 User Experience Flow

### Breeder Browsing Dogs Flow:

```
Browse Dogs Tab
  ↓
View Dog (not owned by them)
  ↓
See "Contact Owner" button
  ↓
Tap button
  ↓
ContactBreederScreen opens
  ├─ Shows owner's kennel info
  ├─ Shows dog card
  ├─ Pre-filled professional message
  ├─ Breeder-specific templates
  └─ Professional tips
  ↓
Edit message, add templates
  ↓
Send Message
  ↓
Success → Return to browsing
```

### Dog Parent Flow (Unchanged):

```
Search Puppies
  ↓
View Puppy
  ↓
See "Contact Breeder" button
  ↓
Tap button
  ↓
ContactBreederScreen opens
  ├─ Shows breeder's kennel info
  ├─ Shows puppy card
  ├─ Pre-filled friendly message
  ├─ Adoption-focused templates
  └─ Helpful tips
  ↓
Send Message
  ↓
Success → Return to browsing
```

---

## 🎨 UI Differences

### Button Labels:

| User Type | Viewing     | Button Text       |
| --------- | ----------- | ----------------- |
| Dog Parent   | Any dog     | "Contact Breeder" |
| Breeder   | Own dog     | "Edit" / "Delete" |
| Breeder   | Other's dog | "Contact Owner"   |

### Card Titles:

| User Type | Card Title         |
| --------- | ------------------ |
| Dog Parent   | "About This Puppy" |
| Breeder   | "About This Dog"   |

### Message Tone:

| User Type | Tone                        |
| --------- | --------------------------- |
| Dog Parent   | Friendly, inquisitive       |
| Breeder   | Professional, business-like |

---

## 🎯 Benefits

### For Breeders:

✅ **Network with peers** - Connect with other breeders
✅ **Find breeding stock** - Contact about quality dogs
✅ **Stud services** - Inquire about breeding opportunities
✅ **Professional communication** - Business-appropriate templates
✅ **Kennel credibility** - See other kennels' info before contacting

### For Dog Parents:

✅ **Easy contact** - Simple, guided process
✅ **Professional presentation** - Makes good impression
✅ **Helpful templates** - Know what to ask
✅ **See kennel info** - Understand who they're contacting

### For Platform:

✅ **Increased engagement** - More connections = more activity
✅ **Professional image** - Supports business relationships
✅ **Network effects** - Breeders attract more breeders
✅ **Quality control** - Structured communication

---

## 📊 Message Templates Comparison

### Dog Parent Templates:

1. "Tell me more about this puppy" → General inquiry
2. "Is this puppy still available?" → Availability check
3. "Can I schedule a visit?" → Meeting request
4. "What are the next steps?" → Process inquiry

### Breeder Templates:

1. "Interested in breeding collaboration" → Partnership
2. "Inquiring about stud services" → Breeding rights
3. "Would like to discuss this dog" → General business
4. "Can we schedule a call?" → Professional meeting

---

## 🧪 Testing Scenarios

### Test as Breeder:

1. **Login as Breeder**

   ```
   Profile → Account Type → Select Breeder
   ```

2. **Browse Available Dogs**

   ```
   Search Tab (if you add browse all dogs feature)
   OR
   View dog detail for another breeder's dog
   ```

3. **Contact Another Breeder**

   ```
   Tap "Contact Owner" button
   ```

4. **Verify Contact Form**:

   - [ ] Shows "About This Dog" (not "Puppy")
   - [ ] Subject includes "Breeding/Collaboration"
   - [ ] Message mentions "fellow breeder"
   - [ ] Templates are breeder-focused
   - [ ] Tips are professional
   - [ ] Kennel info displayed same as for dog-parents

5. **Send Message**:
   - [ ] Validation works
   - [ ] Success message appears
   - [ ] Returns to previous screen

### Test as Dog Parent:

1. **Login as Dog Parent**

   ```
   Profile → Account Type → Select Dog Parent
   ```

2. **Search Puppies**

   ```
   Search Tab → Browse puppies
   ```

3. **Contact Breeder**

   ```
   Tap "Contact Breeder" on any puppy
   ```

4. **Verify Contact Form**:
   - [ ] Shows "About This Puppy"
   - [ ] Subject is simple inquiry
   - [ ] Message is friendly
   - [ ] Templates are adoption-focused
   - [ ] Tips are helpful for dog-parents

---

## 🔄 Code Changes Summary

### Modified Files (2):

1. **ContactBreederScreen.tsx**:

   - Added user type check for message templates
   - Different subject for breeders
   - Different message template for breeders
   - User-specific quick templates
   - User-specific tips
   - Adaptive card title

2. **DogDetailScreen.tsx**:

   - Changed from `user?.userType === 'dog-parent'` to `canContact`
   - Now shows contact button for ANY non-owner
   - Adaptive button text based on user type
   - Added console log showing user type

3. **AppNavigator.tsx**:
   - Changed screen title from "Contact Breeder" to "Send Message" (more generic)

---

## 📋 Quick Reference

### When Contact Button Shows:

| User Type | Dog Owner | Shows Button?             | Button Text       |
| --------- | --------- | ------------------------- | ----------------- |
| Dog Parent   | Self      | ❌ No                     | N/A               |
| Dog Parent   | Other     | ✅ Yes                    | "Contact Breeder" |
| Breeder   | Self      | ❌ No (shows Edit/Delete) | N/A               |
| Breeder   | Other     | ✅ Yes                    | "Contact Owner"   |

### Message Template Used:

| User Type | Template Type                               |
| --------- | ------------------------------------------- |
| Dog Parent   | Friendly inquiry about puppy                |
| Breeder   | Professional breeding/collaboration inquiry |

### Quick Templates Shown:

| User Type | Templates                                          |
| --------- | -------------------------------------------------- |
| Dog Parent   | Puppy-focused (availability, visit, steps)         |
| Breeder   | Business-focused (collaboration, stud, discussion) |

---

## 💼 Professional Communication

### Why This Matters:

1. **Breeder Networking**:

   - Breeders need to connect with peers
   - Different tone than dog-parent communication
   - Business relationships require professionalism

2. **Credibility**:

   - Professional templates set right tone
   - Kennel information builds trust
   - Experience shows expertise

3. **Appropriate Context**:

   - Breeders discuss breeding, not adoption
   - Different questions and goals
   - Business terms and agreements

4. **Platform Value**:
   - Supports full breeding ecosystem
   - Not just dog-parent-breeder connections
   - Breeder-to-breeder adds network effects

---

## 🎯 Use Cases

### Dog Parent → Breeder:

- "I want to adopt this puppy"
- Focus: Family fit, puppy care, pricing
- Tone: Friendly, inquisitive

### Breeder → Breeder:

- "I want to use your stud"
- "Interested in breeding collaboration"
- "Would like to purchase breeding stock"
- Focus: Genetics, health tests, business terms
- Tone: Professional, business-like

---

## ✅ Features Working

### Kennel Information Display (Both User Types):

✅ Kennel name (large, bold)
✅ Owner/breeder name (smaller, with icon)
✅ Breed specialties (first 2 + count)
✅ Years of experience
✅ Location
✅ View Profile link

### Contact Form (Adaptive):

✅ Pre-filled subject (user-type specific)
✅ Pre-filled message (user-type specific)
✅ Quick templates (user-type specific)
✅ Tips (user-type specific)
✅ Dog/puppy card title (adaptive)
✅ Character counter
✅ Validation
✅ Send/Cancel buttons

### DogDetailScreen (Permission-Based):

✅ Owners see Edit/Delete
✅ Non-owners see Contact button
✅ Button text adapts to user type
✅ Navigation passes all context

---

## 🧪 Complete Testing Checklist

### Test Breeder-to-Breeder:

1. **Setup**:

   - [ ] Login as Breeder A
   - [ ] View a dog owned by Breeder B
   - [ ] Verify "Contact Owner" button shows

2. **Contact Form**:

   - [ ] Tap "Contact Owner"
   - [ ] See ContactBreederScreen
   - [ ] Verify kennel info shows for Breeder B
   - [ ] Verify subject: "...Breeding/Collaboration"
   - [ ] Verify message mentions "fellow breeder"
   - [ ] Verify card says "About This Dog"

3. **Templates**:

   - [ ] See breeder templates (collaboration, stud)
   - [ ] Tap template to add to message
   - [ ] Verify it appends correctly

4. **Tips**:

   - [ ] See "professional breeder communication" tips
   - [ ] Tips mention kennel introduction
   - [ ] Tips mention breeding goals

5. **Send**:
   - [ ] Fill required fields
   - [ ] Tap Send
   - [ ] See success message
   - [ ] Return to dog detail

### Test Dog Parent-to-Breeder:

1. **Setup**:

   - [ ] Login as Dog Parent
   - [ ] Search for puppies
   - [ ] Tap "Contact Breeder" on any puppy

2. **Contact Form**:

   - [ ] See ContactBreederScreen
   - [ ] Verify kennel info shows
   - [ ] Verify subject: "Inquiry about [Name]"
   - [ ] Verify friendly message tone
   - [ ] Verify card says "About This Puppy"

3. **Templates**:

   - [ ] See dog-parent templates (puppy-focused)
   - [ ] Different from breeder templates

4. **Tips**:
   - [ ] See "messaging breeders" tips
   - [ ] Tips mention experience with dogs
   - [ ] Tips helpful for dog-parents

---

## 🎨 Screen Title

Changed from:

```
"Contact Breeder" (dog-parent-centric)
```

To:

```
"Send Message" (universal)
```

**Why**: More inclusive, works for both user types

---

## 📊 Message Template Logic

### Code Implementation:

```typescript
if (user?.userType === 'breeder') {
  setSubject(`Inquiry about ${puppyName} - Breeding/Collaboration`);
  setMessage(`Hello,\n\nI'm a fellow breeder...`);
} else {
  setSubject(`Inquiry about ${puppyName}`);
  setMessage(`Hi,\n\nI'm interested in...`);
}
```

### Template Arrays:

```typescript
const templates =
  user?.userType === 'breeder'
    ? [
        'Interested in breeding collaboration',
        'Inquiring about stud services',
        'Would like to discuss this dog',
        'Can we schedule a call?',
      ]
    : [
        'Tell me more about this puppy',
        'Is this puppy still available?',
        'Can I schedule a visit?',
        'What are the next steps?',
      ];
```

---

## 🔐 Permissions & Access

### Who Can Contact Whom:

```
Dog Parent → Any Breeder ✅
Breeder → Any Breeder ✅
Breeder → Dog Parent ✅ (via reply)
Owner → Self ❌ (shows Edit instead)
```

### Button Visibility:

```typescript
const canContact = dog?.ownerId && dog?.ownerId !== user?.userId;

{
  canContact && (
    <Button>
      {user?.userType === 'breeder' ? 'Contact Owner' : 'Contact Breeder'}
    </Button>
  );
}
```

---

## 🎊 Benefits Summary

### For All Breeders:

✅ Can contact other breeders professionally
✅ Network with peers
✅ Find breeding stock
✅ Arrange stud services
✅ Build collaborations

### For Platform:

✅ More connections = more engagement
✅ Supports professional community
✅ Network effects (breeders attract breeders)
✅ Business relationships = platform stickiness

### For Code Quality:

✅ One screen serves multiple use cases
✅ Adaptive content, not duplicated code
✅ Type-safe and well-structured
✅ Easy to maintain and extend

---

## 📈 Future Enhancements

### Phase 1 (Current):

- ✅ Contact form works for both user types
- ✅ Adaptive templates and tips
- ✅ Kennel info display
- ⏳ Message sending API

### Phase 2:

- [ ] Breeder verification badges
- [ ] Show breeding credentials
- [ ] Health test results in form
- [ ] Stud service pricing info

### Phase 3:

- [ ] Contract templates for breeding
- [ ] Co-ownership agreements
- [ ] Health guarantee documents
- [ ] Breeding rights management

### Phase 4:

- [ ] Video call scheduling
- [ ] Document sharing
- [ ] Genetic calculator integration
- [ ] Breeding program planning

---

## 🎓 Documentation Updated

### Files Modified:

- `ContactBreederScreen.tsx` - User-type adaptive
- `DogDetailScreen.tsx` - Universal contact button
- `AppNavigator.tsx` - Generic screen title

### Documentation:

- `BREEDER_TO_BREEDER_CONTACT.md` - This file
- `CONTACT_FORM_IMPLEMENTATION.md` - Still relevant
- `KENNEL_INFO_DISPLAY.md` - Still relevant

---

## 🎉 Conclusion

The contact form now serves **both dog-parents and breeders**, providing:

- 🎯 **User-appropriate content** - Templates and tips match user needs
- 🏢 **Professional presentation** - Kennel info for credibility
- 💼 **Business communication** - Supports breeder networking
- 🤝 **Community building** - Enables professional relationships
- 📱 **Consistent UX** - Same beautiful UI for all users

**The form is now truly universal** - supporting adoption inquiries, breeding collaborations, stud services, and professional breeder networking! 🐾

---

**Ready for**: Testing with real breeders and dog-parents
**Impact**: Enables complete ecosystem (dog-parent-breeder + breeder-breeder)
**Code Quality**: Clean, adaptive, maintainable
