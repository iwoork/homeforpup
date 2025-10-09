# 🚀 Deploy Kennels Endpoint Now!

Quick deployment guide to get `/kennels` endpoint live on `https://api.homeforpup.com`.

## ⚡ Quick Start (2 commands)

```bash
cd apps/homeforpup-api
npm run deploy
```

That's it! The kennels endpoint will be live in ~5-10 minutes.

## 📋 What You Need

### 1. AWS Credentials

```bash
# Verify AWS is configured
aws sts get-caller-identity
```

If not configured, run:
```bash
aws configure
```

### 2. Environment File

```bash
# Check if .env.development exists
ls -la apps/homeforpup-api/.env.development

# If not, create it
cp apps/homeforpup-api/.env.example apps/homeforpup-api/.env.development
```

Must include:
```
COGNITO_USER_POOL_ID=us-east-1_M6uzx1eFZ
COGNITO_USER_POOL_ARN=arn:aws:cognito-idp:us-east-1:ACCOUNT_ID:userpool/us-east-1_M6uzx1eFZ
COGNITO_CLIENT_ID=3d6m93u51ggssrc7t49cjnnk53
```

### 3. DynamoDB Table

Verify the table exists:
```bash
aws dynamodb describe-table --table-name homeforpup-kennels
```

If it doesn't exist:
```bash
aws dynamodb create-table \
  --table-name homeforpup-kennels \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## 🎯 Deployment Steps

### Step 1: Navigate to API Directory

```bash
cd apps/homeforpup-api
```

### Step 2: Install Dependencies (if not done)

```bash
npm install
```

### Step 3: Build TypeScript

```bash
npm run build
```

### Step 4: Preview Changes (optional)

```bash
npx cdk synth
```

This shows what will be deployed without actually deploying.

### Step 5: Deploy!

```bash
npm run deploy
```

Or with explicit environment:
```bash
npx cdk deploy --context environment=development
```

### Step 6: Wait for Completion

You'll see:
```
✅ HomeForPupApiStack-development

Outputs:
HomeForPupApiStack-development.ApiUrl = https://api.homeforpup.com
```

## ✅ Verify Deployment

### Test the Endpoint

```bash
# Login to get a token first (from mobile app or web app)
TOKEN="your-id-token-here"

# Test GET /kennels
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.homeforpup.com/kennels?limit=10"
```

Expected response:
```json
{
  "kennels": [],
  "total": 0,
  "count": 0,
  "hasMore": false
}
```

### Test from Mobile App

1. Restart your mobile app
2. Try accessing the kennels screen
3. Should now load without 401 error!

## 🐛 Troubleshooting

### Error: Missing environment variables

```bash
# Solution: Create .env.development
cp .env.example .env.development
# Edit with your values
```

### Error: User not authorized

```bash
# Solution: Check AWS credentials
aws configure
# Enter your Access Key and Secret Key
```

### Error: Table does not exist

```bash
# Solution: Create the table
aws dynamodb create-table \
  --table-name homeforpup-kennels \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### Error: Module not found 'uuid'

```bash
# Solution: Install dependencies
npm install
```

## 📊 What Gets Deployed

### Lambda Functions (5)
- `list-kennels-development` - GET /kennels
- `get-kennel-development` - GET /kennels/{id}
- `create-kennel-development` - POST /kennels
- `update-kennel-development` - PUT /kennels/{id}
- `delete-kennel-development` - DELETE /kennels/{id}

### API Gateway Routes
- `/kennels` - List and create
- `/kennels/{id}` - Get, update, delete

### Permissions
- DynamoDB access for kennels table
- CloudWatch logs for monitoring
- Cognito authorizer for authentication

## 💰 Cost

~$5-15/month based on usage:
- Lambda: $0.20 per 1M requests
- API Gateway: $3.50 per 1M requests
- DynamoDB: Pay per request
- CloudWatch Logs: $0.50/GB

## 🎉 Success!

After deployment:
1. ✅ Kennels endpoint is live at `https://api.homeforpup.com/kennels`
2. ✅ Mobile app can now fetch kennels
3. ✅ No more 401 Unauthorized errors
4. ✅ Full CRUD operations available

## 🔄 Next Steps

1. Update mobile app documentation
2. Test all kennels operations
3. Monitor CloudWatch logs
4. Deploy other endpoints (activities, messages)

## 📚 More Information

- Full guide: `/apps/homeforpup-api/KENNELS_DEPLOYMENT_GUIDE.md`
- Mobile app fix: `/apps/mobile-app/KENNELS_ENDPOINT_ISSUE.md`
- API docs: `/apps/homeforpup-api/API_ENDPOINTS.md`

---

**Ready to deploy?** Just run:
```bash
cd apps/homeforpup-api && npm run deploy
```

🚀 Let's go!

