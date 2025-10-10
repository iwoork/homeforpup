# Contact Breeder Form Implementation

## Overview
Created a dedicated ContactBreederScreen that shows a professional contact form when dog-parents want to message breeders about puppies. This provides a better user experience than directly opening the Messages screen.

## Implementation Date
October 9, 2025

---

## 🎯 What Was Built

### New Screen: ContactBreederScreen
**File**: `/apps/mobile-app/src/screens/dog-parent/ContactBreederScreen.tsx`

#### Features:
✅ **Breeder Info Display** - Shows breeder's name, kennel, location, and avatar
✅ **Puppy Context Card** - Displays which puppy the inquiry is about
✅ **Pre-filled Subject** - Auto-generates subject: "Inquiry about [PuppyName]"
✅ **Pre-filled Message** - Professional template message
✅ **Quick Templates** - 4 common inquiry templates to add to message
✅ **Character Counter** - Shows message length
✅ **Tips Section** - Helpful tips for messaging breeders
✅ **Send/Cancel Buttons** - Clear call-to-actions

---

## 📱 User Flow

### Before:
```
Puppy Card → [Contact Breeder] → Messages Screen (generic)
```

### After:
```
Puppy Card → [Contact Breeder] → Contact Form → Send → Messages Screen
     ↓
  Shows:
  - Breeder's name & avatar
  - Puppy info card
  - Pre-filled subject & message
  - Quick templates
  - Tips
```

---

## 🎨 UI Components

### 1. Breeder Info Card
```
┌────────────────────────────────┐
│ [Avatar] Contacting            │
│          John Smith            │ ← Breeder Name
│          Golden Paws Kennel    │ ← Kennel Name
│          📍 California         │ ← Location
└────────────────────────────────┘
```

**Features**:
- Gradient background (primary + secondary colors)
- Large avatar (64x64) or placeholder with person icon
- Breeder name in bold, large font
- Kennel name (if available)
- Location with icon (if available)
- Fetches breeder data from API

### 2. Puppy Context Card
```
┌────────────────────────────────┐
│ 🐾 ABOUT THIS PUPPY            │
├────────────────────────────────┤
│ [Photo] Max                    │
│         Golden Retriever       │
└────────────────────────────────┘
```

**Features**:
- Only shows if puppy info is provided
- Shows puppy thumbnail (60x60)
- Puppy name and breed
- Primary color border and header
- Provides context for the message

### 3. Subject Field
```
Subject *
┌────────────────────────────────┐
│ Inquiry about Max              │ ← Pre-filled
└────────────────────────────────┘
```

**Auto-generated**:
- Format: "Inquiry about [PuppyName]"
- Editable by user
- Required field

### 4. Message Field
```
Message *
┌────────────────────────────────┐
│ Hi,                            │
│                                │
│ I'm interested in learning     │
│ more about Max (Golden         │
│ Retriever). Could you please   │
│ provide more information?      │
│                                │
│ Thank you!                     │
└────────────────────────────────┘
150 characters
```

**Pre-filled Template**:
```
Hi,

I'm interested in learning more about [PuppyName] ([Breed]). 
Could you please provide more information?

Thank you!
```

**Features**:
- Multiline text area (150px height)
- Character counter
- Auto-capitalizes sentences
- Required field
- Editable

### 5. Quick Templates
```
[+ Tell me more about this puppy]
[+ Is this puppy still available?]
[+ Can I schedule a visit?]
[+ What are the next steps?]
```

**Behavior**:
- Horizontal scrollable list
- Tap to append template to message
- Adds new line before template if message not empty
- Icon + text in each chip
- Primary color border and text

**Templates Provided**:
1. "Tell me more about this puppy"
2. "Is this puppy still available?"
3. "Can I schedule a visit?"
4. "What are the next steps?"

### 6. Tips Card
```
┌────────────────────────────────┐
│ 💡 Tips for messaging breeders:│
│                                │
│ • Be specific about what you'd │
│   like to know                 │
│ • Mention your experience with │
│   dogs                         │
│ • Ask about health tests and   │
│   certifications               │
│ • Be respectful of their time  │
└────────────────────────────────┘
```

**Features**:
- Info color background (light blue)
- Bulb icon
- 4 helpful tips
- Professional guidance

### 7. Action Buttons
```
[Cancel]  [Send Message →]
  ↑            ↑
 Flex 1     Flex 2
            Gradient
```

**Cancel Button**:
- White/surface background
- Border style
- Navigates back
- Flex 1 (smaller)

**Send Button**:
- Primary gradient background
- White text
- Send icon
- Loading spinner when sending
- Flex 2 (larger, more prominent)
- Disabled during send

---

## 🔄 Data Flow

### Navigation Parameters:
```typescript
{
  receiverId: string;      // Breeder's user ID (REQUIRED)
  breederName?: string;    // Breeder's display name
  puppyId?: string;        // Puppy being inquired about
  puppyName?: string;      // Puppy's name
  puppyBreed?: string;     // Breed name
  puppyPhoto?: string;     // Photo URL
}
```

### On Screen Load:
1. Parse route params
2. Fetch breeder info from API (if receiverId provided)
3. Pre-fill subject with puppy name
4. Pre-fill message with template
5. Display puppy card (if puppy info provided)

### On Send:
1. Validate subject and message
2. Call send message API (TODO)
3. Show success alert
4. Navigate back to previous screen
5. (Future) Create new message thread

---

## 📍 Navigation Updates

### All "Contact Breeder" buttons now navigate to ContactBreederScreen:

#### From SearchPuppiesScreen:
```typescript
navigation.navigate('ContactBreeder', {
  receiverId: item.ownerId,
  breederName: item.breederName,
  puppyId: item.id,
  puppyName: item.name,
  puppyBreed: item.breed,
  puppyPhoto: item.photoUrl,
});
```

#### From MatchedPuppiesScreen:
```typescript
navigation.navigate('ContactBreeder', {
  receiverId: puppy.ownerId,
  breederName: puppy.breederName,
  puppyId: puppy.id,
  puppyName: puppy.name,
  puppyBreed: puppy.breed,
  puppyPhoto: puppy.imageUrl,
});
```

#### From FavoritePuppiesScreen:
```typescript
navigation.navigate('ContactBreeder', {
  receiverId: item.ownerId,
  breederName: item.breederName,
  puppyId: item.id,
  puppyName: item.name,
  puppyBreed: item.breed,
  puppyPhoto: item.imageUrl,
});
```

#### From DogDetailScreen:
```typescript
navigation.navigate('ContactBreeder', {
  receiverId: dog.ownerId,
  breederName: dog.breederName,
  puppyId: dog.id,
  puppyName: dog.name,
  puppyBreed: dog.breed,
  puppyPhoto: dog.photoUrl,
});
```

---

## 💡 User Experience

### Scenario: Dog Parent Finds a Puppy

1. **Search** → Browse puppies in SearchPuppiesScreen
2. **Tap** puppy card OR view detail screen
3. **Tap** "Contact Breeder" button
4. **See** ContactBreederScreen with:
   - Breeder's name and photo
   - Puppy info card
   - Pre-written message
5. **Edit** message or use quick templates
6. **Tap** "Send Message"
7. **Receive** confirmation
8. **Return** to browsing

### Benefits:
✅ **Professional** - Shows breeder's credentials
✅ **Contextual** - Clear which puppy is being discussed
✅ **Convenient** - Pre-filled content saves time
✅ **Helpful** - Templates and tips guide users
✅ **Clear** - No confusion about who they're contacting

---

## 🔧 Technical Details

### Breeder Info Fetching:
```typescript
useEffect(() => {
  const fetchBreederInfo = async () => {
    if (params?.receiverId) {
      const response = await apiService.getUserById(params.receiverId);
      if (response.success) {
        setBreederInfo(response.data);
      }
    }
  };
  fetchBreederInfo();
}, [params]);
```

**Displays**:
- Profile image or placeholder
- Name or displayName
- breederInfo.kennelName (if breeder)
- location (if available)

### Message Pre-filling:
```typescript
if (params?.puppyName) {
  setSubject(`Inquiry about ${params.puppyName}`);
  setMessage(`Hi,

I'm interested in learning more about ${params.puppyName}${
    params.puppyBreed ? ` (${params.puppyBreed})` : ''
  }. Could you please provide more information?

Thank you!`);
}
```

### Template Insertion:
```typescript
onPress={() =>
  setMessage(prev =>
    `${prev}${prev ? '\n\n' : ''}${template}`
  )
}
```

**Behavior**:
- Adds blank line before template if message exists
- Appends template text
- User can continue editing

---

## 🎨 Styling

### Colors:
- **Breeder card background**: Gradient (primary + secondary with 20% opacity)
- **Puppy card border**: Primary color at 40% opacity
- **Tips card background**: Info light color
- **Send button**: Primary gradient
- **Cancel button**: Surface with border

### Spacing:
- Card margins: lg (16px)
- Internal padding: lg (16px)
- Input groups: lg spacing between
- Footer padding: lg all around
- Template chips: sm gap (8px)

### Typography:
- Breeder name: 20px, bold
- Puppy name: 18px, bold
- Labels: 15px, semi-bold
- Inputs: 16px, regular
- Tips: 13px, regular
- Templates: 13px, semi-bold

---

## 🚀 Next Steps (Backend Integration)

### Message API Endpoint Needed:
```
POST /messages
```

**Request Body**:
```typescript
{
  senderId: string;        // From auth token
  receiverId: string;      // Breeder ID
  subject: string;         // From form
  content: string;         // From form
  messageType: 'inquiry';  // Auto-set
  metadata: {
    puppyId?: string;      // Link to puppy
    puppyName?: string;    // For display
    puppyBreed?: string;   // For context
  }
}
```

**Response**:
```typescript
{
  success: boolean;
  data?: {
    messageId: string;
    threadId: string;
    createdAt: string;
  };
  error?: string;
}
```

### Update ContactBreederScreen:
Replace this section:
```typescript
// TODO: Implement send message API
console.log('Sending message:', { ... });
await new Promise(resolve => setTimeout(resolve, 1000));
```

With:
```typescript
const response = await apiService.sendMessage({
  receiverId: params.receiverId,
  subject: subject.trim(),
  content: message.trim(),
  messageType: 'inquiry',
  metadata: {
    puppyId: params.puppyId,
    puppyName: params.puppyName,
    puppyBreed: params.puppyBreed,
  },
});

if (response.success) {
  // Navigate to the new thread
  navigation.navigate('MessageDetail', { 
    threadId: response.data.threadId 
  });
}
```

---

## 📊 Feature Comparison

### Old Approach:
- ❌ Direct to Messages screen
- ❌ No context about puppy
- ❌ No breeder info shown
- ❌ User has to write everything
- ❌ No guidance provided

### New Approach:
- ✅ Dedicated contact form
- ✅ Puppy card shows context
- ✅ Breeder info prominently displayed
- ✅ Pre-filled professional message
- ✅ Quick templates available
- ✅ Helpful tips provided
- ✅ Clear send/cancel actions

---

## 🧪 Testing Guide

### Test Flow:

1. **Login as Dog Parent**
   - Use account type switcher if needed

2. **Search for Puppies**
   - Go to Search tab
   - View available puppies

3. **Contact Breeder**
   - Tap "Contact Breeder" on any puppy card
   - Verify ContactBreederScreen opens

4. **Verify Contact Form**:
   - [ ] Breeder info card shows at top
   - [ ] Breeder name displays correctly
   - [ ] Avatar loads (or shows placeholder)
   - [ ] Kennel name shows (if breeder has one)
   - [ ] Location shows (if available)

5. **Verify Puppy Card**:
   - [ ] Puppy card shows below breeder info
   - [ ] Puppy photo displays (or not if no photo)
   - [ ] Puppy name shows correctly
   - [ ] Breed name shows correctly
   - [ ] Card has primary color border

6. **Verify Pre-filled Content**:
   - [ ] Subject: "Inquiry about [PuppyName]"
   - [ ] Message includes puppy name and breed
   - [ ] Message is professional and friendly

7. **Test Quick Templates**:
   - [ ] 4 template chips display
   - [ ] Horizontal scroll works
   - [ ] Tapping chip adds text to message
   - [ ] Second tap adds on new line
   - [ ] Templates are helpful and relevant

8. **Test Form Validation**:
   - [ ] Clear subject → shows "Required" alert
   - [ ] Clear message → shows "Required" alert
   - [ ] Empty spaces don't count as valid

9. **Test Send**:
   - [ ] Tap "Send Message"
   - [ ] Loading spinner shows
   - [ ] Success alert appears
   - [ ] Returns to previous screen

10. **Test Cancel**:
    - [ ] Tap "Cancel"
    - [ ] Returns to previous screen immediately
    - [ ] No message sent

### Test from Different Entry Points:

#### From SearchPuppiesScreen:
- [ ] Contact button on puppy card works
- [ ] All puppy info passes correctly

#### From MatchedPuppiesScreen:
- [ ] Contact button works
- [ ] Match context preserved

#### From FavoritePuppiesScreen:
- [ ] Contact button works
- [ ] Favorite info preserved

#### From DogDetailScreen:
- [ ] Large contact button works
- [ ] Full puppy context available

---

## 🎨 Design Details

### Breeder Card:
- **Background**: Gradient (primary + secondary at 20% opacity)
- **Padding**: 16px
- **Border Radius**: Large (12px)
- **Shadow**: Medium shadow
- **Layout**: Row with avatar + info

### Puppy Card:
- **Background**: Surface white
- **Border**: 2px primary color at 40% opacity
- **Padding**: 16px
- **Header**: Icon + uppercase text
- **Layout**: Row with thumbnail + details

### Form Inputs:
- **Background**: Surface white
- **Border**: 2px solid border color
- **Border Radius**: Large (12px)
- **Padding**: 12px
- **Font**: 16px regular

### Message Input:
- **Min Height**: 150px
- **Text Align**: Top
- **Lines**: 8 (approximate)

### Template Chips:
- **Background**: Surface white
- **Border**: 1px primary color
- **Border Radius**: Full (999px)
- **Icon**: Add circle outline
- **Layout**: Horizontal scroll

### Tips Card:
- **Background**: Info light (#e0f2fe or similar)
- **Border**: 1px info color at 40% opacity
- **Icon**: Bulb outline
- **Text**: Bullet points

---

## 📝 Validation Rules

### Subject:
- **Required**: Yes
- **Min Length**: 1 character (after trim)
- **Max Length**: No limit (consider adding 200 char limit)
- **Validation**: Must have non-whitespace characters

### Message:
- **Required**: Yes
- **Min Length**: 1 character (after trim)
- **Max Length**: No limit (consider adding 2000 char limit)
- **Validation**: Must have non-whitespace characters

### Future Enhancements:
- Character limits (prevent spam)
- Profanity filter
- Link detection
- Attachment support

---

## 🔌 API Integration

### Current State:
```typescript
// Simulated send (1 second delay)
await new Promise(resolve => setTimeout(resolve, 1000));
```

### Required API Method:
Add to `apiService.ts`:
```typescript
async sendMessage(params: {
  receiverId: string;
  subject: string;
  content: string;
  messageType: 'inquiry' | 'general' | 'business' | 'urgent';
  metadata?: {
    puppyId?: string;
    puppyName?: string;
    puppyBreed?: string;
  };
}): Promise<ApiResponse<{
  messageId: string;
  threadId: string;
  createdAt: string;
}>> {
  return this.makeRequest('/messages', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
```

### Backend Endpoint:
```
POST /messages
Authorization: Bearer [token]
Content-Type: application/json

Body:
{
  "receiverId": "user-123",
  "subject": "Inquiry about Max",
  "content": "Hi, I'm interested...",
  "messageType": "inquiry",
  "metadata": {
    "puppyId": "dog-456",
    "puppyName": "Max",
    "puppyBreed": "Golden Retriever"
  }
}
```

### Response Handling:
```typescript
if (response.success) {
  Alert.alert('Success', 'Your message has been sent!');
  navigation.navigate('MessageDetail', { 
    threadId: response.data.threadId 
  });
} else {
  Alert.alert('Error', response.error || 'Failed to send');
}
```

---

## 🎯 Benefits

### For Dog Parents:
✅ **Know who they're contacting** - See breeder name and photo upfront
✅ **Context preserved** - Puppy info clearly displayed
✅ **Time-saving** - Pre-filled professional message
✅ **Guided experience** - Templates and tips help them write better messages
✅ **Professional** - Makes a good first impression

### For Breeders:
✅ **Quality inquiries** - Pre-filled subject helps organize
✅ **Context included** - Know which puppy immediately
✅ **Serious dog-parents** - Form filters out casual browsers
✅ **Better information** - Templates encourage complete questions
✅ **Professional interactions** - Sets tone for relationship

### For Platform:
✅ **Better engagement** - Easier to contact means more messages
✅ **Quality leads** - Structured inquiries are more serious
✅ **Data capture** - Can track which puppies get most interest
✅ **User satisfaction** - Smooth experience increases retention

---

## 📈 Future Enhancements

### Phase 1 - Core (Current):
- ✅ Contact form screen
- ✅ Pre-filled content
- ✅ Quick templates
- ✅ Tips and guidance
- ⏳ Send message API (needs backend)

### Phase 2 - Enhanced:
- [ ] Attachment support (photos, documents)
- [ ] Save as draft
- [ ] Schedule send
- [ ] Read receipts
- [ ] Typing indicators

### Phase 3 - Advanced:
- [ ] AI-powered message suggestions
- [ ] Translation support
- [ ] Voice message option
- [ ] Video call scheduling
- [ ] Contract attachment

### Phase 4 - Smart Features:
- [ ] Auto-suggest questions based on puppy breed
- [ ] Breeder availability status
- [ ] Response time estimate
- [ ] Similar puppies recommendation

---

## 🐛 Error Handling

### Scenarios Handled:

1. **No receiverId**:
   - Screen still loads
   - Shows "Breeder" as default name
   - User can still send message

2. **Breeder fetch fails**:
   - Loading state hides
   - Shows default breeder info
   - User can still proceed

3. **Empty subject**:
   - Alert: "Please enter a subject"
   - Form doesn't submit

4. **Empty message**:
   - Alert: "Please enter a message"
   - Form doesn't submit

5. **Send fails**:
   - Alert: "Failed to send message"
   - User can retry
   - Loading state cleared

6. **Network error**:
   - Caught and logged
   - User-friendly error message
   - Retry option

---

## 📱 Responsive Design

### Layout:
- **Scrollable**: Handles keyboards and small screens
- **Fixed footer**: Always visible send/cancel buttons
- **Flexible inputs**: Adapt to content
- **Horizontal scroll**: Templates don't wrap

### Keyboard Handling:
- **Text inputs**: Push content up when keyboard shows
- **Footer**: Stays above keyboard
- **Scroll**: Auto-scrolls to active input
- **Dismiss**: Tap outside to dismiss keyboard

---

## 🎨 Accessibility

### Features:
- ✅ Clear labels for all inputs
- ✅ Sufficient touch target sizes (44+ points)
- ✅ High contrast text
- ✅ Descriptive button text
- ✅ Icons supplement (not replace) text
- ✅ Screen reader friendly labels

### Improvements Needed:
- [ ] Add accessibility labels to icons
- [ ] Add hint text for screen readers
- [ ] Test with VoiceOver/TalkBack
- [ ] Add form error announcements

---

## 📊 Analytics Tracking (Future)

### Events to Track:
1. `contact_form_opened` - Track entry point
2. `template_used` - Which templates are popular
3. `message_sent` - Successful sends
4. `message_failed` - Failed attempts
5. `form_abandoned` - User cancelled

### Metrics to Measure:
- Time to send message
- Message length distribution
- Template usage rate
- Conversion rate (view → contact)
- Response rate from breeders

---

## 🔒 Security & Privacy

### Data Handling:
- ✅ Sender ID from authenticated user
- ✅ Receiver ID from params (validated)
- ✅ No sensitive data logged
- ✅ Messages encrypted in transit (HTTPS)

### Validation:
- ✅ Required field validation
- ✅ Character trimming
- ✅ XSS prevention (React handles)

### Future:
- [ ] Rate limiting (prevent spam)
- [ ] Profanity filter
- [ ] Block list support
- [ ] Report abuse feature

---

## 📂 File Changes

### New Files (1):
- `src/screens/dog-parent/ContactBreederScreen.tsx`

### Modified Files (5):
- `src/navigation/AppNavigator.tsx` - Added route
- `src/screens/dog-parent/SearchPuppiesScreen.tsx` - Updated navigation
- `src/screens/dog-parent/MatchedPuppiesScreen.tsx` - Updated navigation
- `src/screens/dog-parent/FavoritePuppiesScreen.tsx` - Updated navigation
- `src/screens/details/DogDetailScreen.tsx` - Updated navigation

### Documentation (1):
- `CONTACT_FORM_IMPLEMENTATION.md` (this file)

---

## ✅ Success Criteria

### Must Have (Completed):
- ✅ Contact form screen created
- ✅ Breeder info displays
- ✅ Puppy context shows
- ✅ Pre-filled content
- ✅ Quick templates work
- ✅ Tips provided
- ✅ Validation works
- ✅ Navigation integrated
- ✅ All entry points updated

### Should Have (In Progress):
- ⏳ Send message API integration
- ⏳ Thread creation
- ⏳ Success navigation to thread

### Nice to Have (Future):
- ⏳ Attachment support
- ⏳ Draft saving
- ⏳ Smart suggestions
- ⏳ Read receipts

---

## 🎓 For Developers

### To Customize Templates:
Edit the templates array in `ContactBreederScreen.tsx`:
```typescript
{[
  'Tell me more about this puppy',
  'Is this puppy still available?',
  'Can I schedule a visit?',
  'What are the next steps?',
  // Add more templates here
].map((template, index) => ...
```

### To Customize Message Template:
Edit the pre-fill logic:
```typescript
setMessage(
  `Hi,

I'm interested in learning more about ${params.puppyName}...
`);
```

### To Add More Tips:
Edit the tips text:
```typescript
<Text style={styles.tipsText}>
  • Your tip here{'\n'}
  • Another tip{'\n'}
  ...
</Text>
```

---

## 🎊 Summary

The ContactBreederScreen provides a **professional, guided experience** for dog-parents to contact breeders. The implementation includes:

- ✅ **Beautiful UI** - Gradient cards, clear layout
- ✅ **Smart Pre-filling** - Saves user time
- ✅ **Quick Templates** - Common questions ready
- ✅ **Helpful Tips** - Guides users to write better messages
- ✅ **Full Context** - Shows breeder and puppy info
- ✅ **Validation** - Ensures quality messages
- ✅ **Error Handling** - Graceful failures

**Ready for**: Testing and backend integration
**Blocks**: Message API implementation
**Impact**: Increases dog-parent-breeder connections

---

## 🔗 Related Documentation

- Main implementation: `IMPLEMENTATION_SUMMARY.md`
- Contact feature: `CONTACT_BREEDER_FEATURE.md`
- API integration: `PUPPIES_API_INTEGRATION.md`
- Testing: `TESTING_DUAL_USER_EXPERIENCE.md`
- Architecture: `DUAL_USER_EXPERIENCE.md`

---

**Built for better breeder-dog-parent connections 🐾**

