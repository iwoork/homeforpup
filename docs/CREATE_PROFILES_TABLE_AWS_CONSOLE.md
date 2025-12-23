# Create homeforpup-profiles Table - AWS Console

## ⚠️ You need to create this table manually

Your IAM user doesn't have `dynamodb:CreateTable` permission, so you need to create it via AWS Console or ask an admin.

## 🚀 Quick Steps (AWS Console)

### 1. Go to DynamoDB Console

https://console.aws.amazon.com/dynamodbv2/home?region=us-east-1#tables

### 2. Click "Create table"

### 3. Enter Table Details

**Table name:**
```
homeforpup-profiles
```

**Partition key:**
```
userId (String)
```

**Sort key:**
```
Leave empty (no sort key)
```

### 4. Table Settings

**Table class:** DynamoDB Standard

**Capacity mode:** On-demand

### 5. Optional: Enable Streams

Scroll down to **DynamoDB Streams**:
- Enable: ✅ Yes
- View type: New and old images

### 6. Click "Create table"

Wait ~30 seconds for table to become ACTIVE.

## ✅ Verification

After creating, verify:

```bash
aws dynamodb describe-table --table-name homeforpup-profiles
```

Should show:
```json
{
  "Table": {
    "TableName": "homeforpup-profiles",
    "KeySchema": [
      {
        "AttributeName": "userId",
        "KeyType": "HASH"
      }
    ],
    "TableStatus": "ACTIVE",
    ...
  }
}
```

## 🔄 Then Test Your Mobile App

After creating the table:

1. **Restart your mobile app**
2. **Login again**
3. **Should work now!**

Expected logs:
```
🔍 Checking if profile exists for user: c4e84488-a0c1-70ac-8376-ee8b6151167b
📝 Profile not found, creating new profile
API Response Status: { status: 200, ok: true }  ✅
✅ Profile created successfully
```

## Alternative: Ask Admin to Create Table

Send this to your AWS admin:

```
Please create a DynamoDB table with these settings:
- Table name: homeforpup-profiles
- Partition key: userId (String)
- Billing mode: On-demand
- Streams: Enabled (New and old images)
- Region: us-east-1
```

## Or: Use Existing homeforpup-users Table Temporarily

If you can't create the table right now, you can temporarily point back to the old table:

```typescript
// In apps/homeforpup-api/lib/config/environments.ts (line 154)
profiles: 'homeforpup-users',  // Temporary - point to existing table
```

Then redeploy:
```bash
cd apps/homeforpup-api
npx cdk deploy
```

This will let you use the app immediately while you get the new table created.

---

**Bottom line:** The table needs to exist for the API to work. Create it via AWS Console, then test the app!

