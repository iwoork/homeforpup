# Debugging: Puppies Not Showing (Shows 0 but has 1)

## Issue

The SearchPuppiesScreen shows "0 puppies available" even though there's 1 puppy in the database.

---

## 🔍 Debugging Steps

### Step 1: Check Console Logs

When you open the SearchPuppiesScreen, look for these logs:

```
🔍 Fetching available puppies from endpoint: /dogs?type=puppy&breedingStatus=available&page=1&limit=20
🔍 Full URL: https://your-api.com/dogs?type=puppy&breedingStatus=available...
Full API Response: { success: true, data: {...} }
Puppies from API: { count: 1, pagination: {...}, firstPuppy: {...} }
Puppies fetched: { count: 1, total: 1, hasMore: false }
```

### Step 2: Check the Full API Response

The log `Full API Response:` will show the complete response. Look for:

**Expected Format**:

```json
{
  "success": true,
  "data": {
    "dogs": [
      {
        "id": "dog-123",
        "name": "Max",
        "breed": "Golden Retriever",
        "dogType": "puppy",
        "breedingStatus": "available",
        ...
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### Step 3: Verify Your Puppy Has Required Fields

The API filters for:

- `dogType: 'puppy'` ← Must be exactly 'puppy' (lowercase)
- `breedingStatus: 'available'` ← Must be exactly 'available' (lowercase)

**Check your dog in DynamoDB**:

1. Go to AWS Console → DynamoDB
2. Find your dogs table
3. Look at your puppy record
4. Verify these fields exist and have correct values

**Common Issues**:

- ❌ `dogType: 'Puppy'` (capital P) - won't match
- ❌ `dogType: 'parent'` - filtered out
- ❌ `breedingStatus: 'Available'` (capital A) - won't match
- ❌ `breedingStatus: 'retired'` - filtered out
- ❌ Field is missing entirely

**Should Be**:

- ✅ `dogType: 'puppy'` (lowercase)
- ✅ `breedingStatus: 'available'` (lowercase)

---

## 🛠️ Fixes

### Fix 1: Check Your Dog's Fields

If your dog doesn't have the correct fields, update it:

**Via DynamoDB Console**:

1. Find the dog item
2. Edit the item
3. Set `dogType` to `puppy` (lowercase)
4. Set `breedingStatus` to `available` (lowercase)
5. Save

**Via Mobile App** (if you created it as breeder):

1. Switch to breeder mode
2. Go to Dogs tab
3. Find your dog
4. Edit it
5. Make sure Type is "Puppy" and Status is "Available"

### Fix 2: Verify API Filtering

The hook queries:

```
GET /dogs?type=puppy&breedingStatus=available&page=1&limit=20
```

The backend filters like this:

```javascript
if (type) {
  filteredItems = filteredItems.filter((item: any) => item.dogType === type);
}
if (breedingStatus) {
  filteredItems = filteredItems.filter(
    (item: any) => item.breedingStatus === breedingStatus,
  );
}
```

**Issue**: The query param is `type=puppy` but the field is `dogType`.

Let me check if this is the issue...

---

## 🔧 Quick Fix Applied

I've updated the hook to handle the API's actual response structure:

```typescript
// Now handles pagination object
const pagination = response.data.pagination;
const totalCount = pagination?.total || response.data.total || 0;
const totalPages = pagination?.totalPages || 1;
const hasMorePages = page < totalPages;
```

---

## ✅ What to Check Now

### In Console, Look For:

**Good Signs**:

```
✅ Fetching available puppies from endpoint: /dogs?type=puppy...
✅ Full API Response: { success: true, data: { dogs: [1 item], pagination: {...} } }
✅ Puppies from API: { count: 1, firstPuppy: { id: "...", name: "Max" } }
✅ Puppies fetched: { count: 1, total: 1, hasMore: false }
```

**Bad Signs**:

```
❌ Full API Response: { success: true, data: { dogs: [], pagination: { total: 0 } } }
❌ Puppies from API: { count: 0, firstPuppy: null }
❌ Failed to fetch puppies: [error message]
```

### If Empty Array But No Error:

The dog exists but doesn't match the filters. Check:

1. **In your dog record**, verify:

   ```javascript
   {
     "dogType": "puppy",      // ← Must be lowercase 'puppy'
     "breedingStatus": "available"  // ← Must be lowercase 'available'
   }
   ```

2. **Not**:
   ```javascript
   {
     "dogType": "Puppy",      // ❌ Wrong case
     "dogType": "parent",     // ❌ Wrong value
     "breedingStatus": "Available", // ❌ Wrong case
     "breedingStatus": "sold",      // ❌ Wrong value
   }
   ```

---

## 🧪 Test Data Setup

### To Create a Test Puppy:

**Option 1: Via Mobile App (as Breeder)**:

1. Switch to Breeder mode
2. Dogs tab → Add Dog
3. Select:
   - **Type**: Puppy (not Parent)
   - **Breeding Status**: Available (not Retired or Not Ready)
4. Fill other fields (name, breed, etc.)
5. Save

**Option 2: Via DynamoDB**:

1. Go to DynamoDB console
2. Find dogs table
3. Create/Edit item with:
   ```json
   {
     "id": "test-puppy-1",
     "name": "Test Puppy",
     "breed": "Golden Retriever",
     "dogType": "puppy",
     "breedingStatus": "available",
     "gender": "male",
     "birthDate": "2024-10-01",
     "ownerId": "your-user-id",
     "createdAt": "2024-10-09T12:00:00Z",
     "updatedAt": "2024-10-09T12:00:00Z"
   }
   ```

---

## 🔬 Deep Debugging

### Add Console Logs to Backend

In `/apps/homeforpup-api/src/functions/dogs/list/index.ts`:

```javascript
// After filtering
console.log('All items before filters:', items.length);
console.log('After type filter:', filteredItems.length);
console.log('Type param:', type);
console.log('BreedingStatus param:', breedingStatus);
console.log('Sample item dogType:', filteredItems[0]?.dogType);
console.log('Sample item breedingStatus:', filteredItems[0]?.breedingStatus);
```

This will show you:

- How many dogs total
- How many after filtering
- What the filter values are
- What the actual field values are

---

## 🎯 Common Solutions

### Solution 1: Update Dog Fields

```javascript
// Make sure your dog has:
{
  "dogType": "puppy",           // lowercase
  "breedingStatus": "available" // lowercase
}
```

### Solution 2: Remove Filters Temporarily

For testing, try fetching without filters:

In `apiService.ts`, temporarily comment out the filters:

```typescript
// queryParams.append('type', 'puppy');
// queryParams.append('breedingStatus', 'available');
```

This will show ALL dogs. If you see your dog now, the fields are wrong.

### Solution 3: Check API Response Structure

The hook now handles both:

- `{ dogs: [...], total: 1 }`
- `{ dogs: [...], pagination: { total: 1 } }`

---

## 📊 What the Logs Tell You

### Log Analysis:

**If you see**:

```
Full API Response: { success: true, data: { dogs: [], pagination: { total: 0 } } }
```

→ **Cause**: Dog doesn't match filters (wrong dogType or breedingStatus)

**If you see**:

```
Full API Response: { success: true, data: { dogs: [1 item], pagination: { total: 1 } } }
Puppies from API: { count: 1, firstPuppy: { id: "...", name: "Max" } }
```

→ **Good**: Data is coming through, just displaying issue

**If you see**:

```
Failed to fetch puppies: Network request failed
```

→ **Cause**: API not accessible, check config.ts baseUrl

**If you see**:

```
Failed to fetch puppies: 401 Unauthorized
```

→ **Cause**: Auth token issue, try logout and login again

---

## 🚀 Quick Test

### Verify API Endpoint Manually:

1. Get your auth token from console logs
2. Use Postman or curl:

   ```bash
   curl -X GET \
     'https://your-api.com/dogs?type=puppy&breedingStatus=available' \
     -H 'Authorization: Bearer YOUR_TOKEN'
   ```

3. Check response - should return your puppy

---

## ✅ Checklist

Run through this checklist:

- [ ] Dog exists in DynamoDB
- [ ] Dog has `dogType: 'puppy'` (lowercase)
- [ ] Dog has `breedingStatus: 'available'` (lowercase)
- [ ] API is accessible (check baseUrl in config)
- [ ] Auth token is valid (check console for 401 errors)
- [ ] Console shows "Full API Response" log
- [ ] Response contains dogs array
- [ ] Pagination object exists
- [ ] Hook extracts data correctly

---

## 🔧 Updated Code

I've made the hook more resilient:

- ✅ Handles `pagination` object format
- ✅ Handles both `data.total` and `pagination.total`
- ✅ Calculates `hasMore` from pagination
- ✅ Better logging for debugging

Try the app again and check the console logs. They should now show:

- The exact endpoint being called
- The full API response
- The extracted puppies count
- The pagination details

This will help us identify exactly where the issue is! 🔍
