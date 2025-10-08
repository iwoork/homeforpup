# Litters API Deployment Guide

## Overview
This guide will help you deploy the Litters API endpoints to save and retrieve litter data from DynamoDB.

## What Was Built

### Backend Components
1. **5 Lambda Functions**:
   - `create-litter` - POST /litters
   - `list-litters` - GET /litters
   - `get-litter` - GET /litters/{id}
   - `update-litter` - PUT /litters/{id}
   - `delete-litter` - DELETE /litters/{id}

2. **DynamoDB Table**: `homeforpup-litters`
   - Primary Key: `id` (String)
   - GSI 1: `BreederIndex` (breederId, expectedDate)
   - GSI 2: `StatusIndex` (status, expectedDate)

3. **API Gateway Routes**: All authenticated with Cognito

### Frontend Components
- **LittersScreen** - Uses real API via `useLitters()` hook
- **CreateLitterScreen** - Saves to DynamoDB via API
- **EditLitterScreen** - Updates DynamoDB via API
- **LitterDetailScreen** - Deletes from DynamoDB via API

---

## Prerequisites

### 1. AWS Credentials Configured
```bash
aws configure
# Or ensure environment variables are set:
# AWS_ACCESS_KEY_ID
# AWS_SECRET_ACCESS_KEY
# AWS_REGION (should be us-east-1)
```

### 2. Required Environment Variables
Make sure you have a `.env.development` or `.env.production` file in the API directory with:
```bash
COGNITO_USER_POOL_ARN=arn:aws:cognito-idp:us-east-1:xxx:userpool/us-east-1_xxx
COGNITO_USER_POOL_ID=us-east-1_xxx
COGNITO_CLIENT_ID=xxx
AWS_REGION=us-east-1
```

---

## Deployment Steps

### Step 1: Create the DynamoDB Table

Run the setup script to create the litters table:

```bash
# From the project root
node scripts/setup-litters-table.js
```

**What this does:**
- Creates `homeforpup-litters` table
- Sets up BreederIndex (query litters by breederId)
- Sets up StatusIndex (query litters by status)
- Uses provisioned billing (5 RCU, 5 WCU)

**Expected output:**
```
🏠 Home for Pup - Litters Table Setup
=====================================

🔍 Checking if table homeforpup-litters exists...

🚀 Creating table homeforpup-litters...
✅ Table homeforpup-litters created successfully!

📋 Table Details:
   - Primary Key: id (String)
   - GSI 1: BreederIndex (breederId, expectedDate)
   - GSI 2: StatusIndex (status, expectedDate)
   - Billing Mode: Provisioned (5 RCU, 5 WCU)

⏳ Note: It may take a minute for the table to become active.
```

**Verify in AWS Console:**
https://console.aws.amazon.com/dynamodbv2/home?region=us-east-1#table?name=homeforpup-litters

### Step 2: Deploy the API

From the `apps/homeforpup-api` directory:

```bash
cd apps/homeforpup-api

# Install dependencies if needed
npm install

# Synthesize CloudFormation template
npm run synth

# Deploy to AWS
npm run deploy
```

**What this does:**
- Compiles TypeScript Lambda functions
- Creates CloudFormation stack
- Deploys all 5 litter Lambda functions
- Creates API Gateway routes
- Sets up IAM permissions
- Configures Cognito authentication

### Step 3: Verify Deployment

After deployment, you should see output like:
```
✅  homeforpup-api-development

Outputs:
homeforpup-api-development.ApiUrl = https://abc123.execute-api.us-east-1.amazonaws.com/development/

Stack ARN:
arn:aws:cloudformation:us-east-1:xxx:stack/homeforpup-api-development/xxx
```

**Test the API:**
```bash
# Get your auth token from the app or Cognito
export TOKEN="your-cognito-id-token"

# List litters (should return empty array initially)
curl -H "Authorization: Bearer $TOKEN" \
  https://your-api-url.amazonaws.com/development/litters

# Should return:
# {
#   "litters": [],
#   "total": 0,
#   "count": 0,
#   "page": 1,
#   "limit": 20,
#   "hasMore": false
# }
```

---

## Testing the Full Flow

### 1. Create a Litter from the App

1. Open the Breeder iOS app
2. Go to the "Litters" tab
3. Tap "Create First Litter" or "New Litter"
4. Fill in the form:
   - Select a breed (e.g., "Akita")
   - Select a sire (male parent dog)
   - Select a dam (female parent dog)
   - Enter breeding date
   - Enter expected date
   - Add optional details
5. Tap "Create Litter"

### 2. Verify in DynamoDB

```bash
# View items in the litters table
aws dynamodb scan \
  --table-name homeforpup-litters \
  --region us-east-1

# Or query by breederId
aws dynamodb query \
  --table-name homeforpup-litters \
  --index-name BreederIndex \
  --key-condition-expression "breederId = :breederId" \
  --expression-attribute-values '{":breederId":{"S":"your-user-id"}}' \
  --region us-east-1
```

### 3. Verify in App

1. Go back to Litters tab
2. Pull down to refresh
3. Your new litter should appear in the list!

---

## API Endpoints

### POST /litters
Create a new litter

**Request:**
```json
{
  "breed": "Golden Retriever",
  "sireId": "dog-uuid-male",
  "damId": "dog-uuid-female",
  "breedingDate": "2024-01-15",
  "expectedDate": "2024-03-18",
  "season": "spring",
  "status": "expecting",
  "description": "Beautiful litter from champion parents",
  "puppyCount": 8,
  "maleCount": 4,
  "femaleCount": 4,
  "availablePuppies": 8,
  "priceRange": {
    "min": 2000,
    "max": 3000
  }
}
```

**Response:**
```json
{
  "litter": {
    "id": "generated-uuid",
    "breederId": "current-user-id",
    "breed": "Golden Retriever",
    "sireId": "dog-uuid-male",
    "damId": "dog-uuid-female",
    ...
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### GET /litters
List all litters for the current user

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `breederId` - Filter by breeder (defaults to current user)
- `breed` - Filter by breed
- `status` - Filter by status
- `search` - Search in breed and description

**Response:**
```json
{
  "litters": [...],
  "total": 10,
  "count": 10,
  "page": 1,
  "limit": 20,
  "hasMore": false
}
```

### GET /litters/{id}
Get a specific litter

**Response:**
```json
{
  "litter": { ... }
}
```

### PUT /litters/{id}
Update a litter (must be owner)

**Request:** Same as POST
**Response:** Updated litter object

### DELETE /litters/{id}
Delete a litter (must be owner)

**Response:**
```json
{
  "message": "Litter deleted successfully"
}
```

---

## Security

### Authentication
All endpoints require Cognito authentication:
- User must be logged in
- Valid JWT token in Authorization header
- Token validated by API Gateway Cognito authorizer

### Authorization
- Users can only see their own litters
- Update/Delete operations verify ownership
- breederId automatically set to current user on create

---

## Database Schema

### Table: homeforpup-litters

**Primary Key:**
- `id` (String) - UUID

**Attributes:**
```typescript
{
  id: string;                    // UUID
  breederId: string;             // User ID (from Cognito)
  breed: string;                 // Breed name
  sireId: string;                // Father dog ID
  damId: string;                 // Mother dog ID
  breedingDate: string;          // ISO date
  expectedDate: string;          // ISO date
  birthDate?: string;            // ISO date
  season: 'spring' | 'summer' | 'fall' | 'winter';
  description: string;
  puppyCount?: number;
  maleCount?: number;
  femaleCount?: number;
  availablePuppies?: number;
  status: 'planned' | 'expecting' | 'born' | 'weaning' | 'ready' | 'sold_out';
  priceRange?: {
    min: number;
    max: number;
  };
  photos: string[];              // Array of S3 URLs
  healthClearances: string[];    // Array of document URLs
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

**Global Secondary Indexes:**

1. **BreederIndex** (Most common query pattern)
   - Partition Key: `breederId`
   - Sort Key: `expectedDate`
   - Use case: Get all litters for a breeder, sorted by expected date

2. **StatusIndex** (Admin/filtering)
   - Partition Key: `status`
   - Sort Key: `expectedDate`
   - Use case: Get all litters by status (e.g., all "ready" litters)

---

## Cost Considerations

### DynamoDB
- **Provisioned Mode**: 5 RCU, 5 WCU
- **Estimated Cost**: ~$2.50/month for low traffic
- **GSI Costs**: ~$2.50/month per index

**Recommendation for Production:**
- Consider switching to On-Demand billing if traffic is unpredictable
- Monitor usage and adjust capacity as needed

### Lambda
- **Free Tier**: 1M requests/month, 400,000 GB-seconds
- **Memory**: 512 MB per function
- **Timeout**: 20 seconds
- **Estimated Cost**: Free for moderate usage

### API Gateway
- **Free Tier**: 1M API calls/month (first 12 months)
- **Cost After**: $3.50 per million requests

---

## Troubleshooting

### Issue: "Litter created successfully" but not showing in list

**Possible causes:**
1. DynamoDB table not created
2. Lambda function doesn't have write permissions
3. breederId mismatch
4. Frontend not refreshing

**Solutions:**
```bash
# 1. Verify table exists
aws dynamodb describe-table --table-name homeforpup-litters

# 2. Check Lambda logs
aws logs tail /aws/lambda/create-litter --follow

# 3. Verify item was created
aws dynamodb scan --table-name homeforpup-litters --limit 10

# 4. Check API Gateway logs
# Go to AWS Console > API Gateway > Your API > Logs
```

### Issue: "Failed to create litter"

**Check:**
1. Auth token is valid
2. All required fields provided
3. Lambda has DynamoDB permissions
4. CloudWatch logs for error details

```bash
# View Lambda logs
aws logs tail /aws/lambda/create-litter --follow --format short
```

### Issue: Table already exists error

**Solution:** Table is already created, skip to Step 2 (Deploy API)

### Issue: Insufficient permissions

**Solution:** Update IAM policy to include:
```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:PutItem",
    "dynamodb:GetItem",
    "dynamodb:UpdateItem",
    "dynamodb:DeleteItem",
    "dynamodb:Scan",
    "dynamodb:Query"
  ],
  "Resource": [
    "arn:aws:dynamodb:us-east-1:*:table/homeforpup-litters",
    "arn:aws:dynamodb:us-east-1:*:table/homeforpup-litters/index/*"
  ]
}
```

---

## Monitoring

### CloudWatch Metrics to Watch

1. **Lambda Metrics:**
   - Invocation count
   - Error count
   - Duration
   - Throttles

2. **DynamoDB Metrics:**
   - Read/Write capacity usage
   - Throttled requests
   - Consumed capacity

3. **API Gateway Metrics:**
   - Request count
   - 4xx/5xx errors
   - Latency

### Setting Up Alarms

```bash
# Example: Alert on Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name litter-api-errors \
  --alarm-description "Alert when litter API has errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

---

## Next Steps

### Immediate
1. ✅ Run setup script to create table
2. ✅ Deploy API stack
3. ✅ Test create litter from app
4. ✅ Verify data appears in list

### Future Enhancements
1. **Batch Operations**: Create multiple litters at once
2. **Photo Upload**: Direct S3 upload for litter photos
3. **Parent Validation**: Verify sire/dam exist and are correct gender
4. **Breed Validation**: Ensure breed matches parent breeds
5. **Date Calculations**: Auto-calculate expected date (breeding + 63 days)
6. **Status Automation**: Auto-update status based on dates
7. **Notifications**: Remind breeders of important litter milestones
8. **Analytics**: Litter statistics and trends
9. **Export**: Export litter data to CSV/PDF
10. **Backup**: Automated DynamoDB backups

---

## Quick Reference

### Create Table
```bash
node scripts/setup-litters-table.js
```

### Deploy API
```bash
cd apps/homeforpup-api
npm run deploy
```

### View Logs
```bash
# Create litter
aws logs tail /aws/lambda/create-litter --follow

# List litters
aws logs tail /aws/lambda/list-litters --follow
```

### Check Table
```bash
aws dynamodb describe-table --table-name homeforpup-litters
aws dynamodb scan --table-name homeforpup-litters --limit 5
```

### Delete Table (if needed)
```bash
aws dynamodb delete-table --table-name homeforpup-litters
```

---

## Support

If you encounter issues:
1. Check CloudWatch Logs
2. Verify DynamoDB table exists
3. Confirm IAM permissions
4. Ensure Cognito auth is working
5. Check API Gateway deployment

---

## Summary

✅ **Backend**: 5 Lambda functions deployed with DynamoDB integration
✅ **Database**: Litters table with proper indexes
✅ **API**: REST endpoints with Cognito auth
✅ **Frontend**: Real-time data loading and updates
✅ **Forms**: Breed and parent dog selectors with images

**Status**: Ready for deployment and testing!
