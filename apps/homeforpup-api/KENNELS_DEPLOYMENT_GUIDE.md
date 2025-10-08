# Kennels Endpoint Deployment Guide

This guide will help you deploy the kennels endpoint to AWS API Gateway so it's available at `https://api.homeforpup.com/kennels`.

## What Was Created

### Lambda Functions

| Function | Method | Path | Auth Required |
|----------|--------|------|---------------|
| `list-kennels` | GET | `/kennels` | ✅ Yes (Cognito) |
| `get-kennel` | GET | `/kennels/{id}` | No |
| `create-kennel` | POST | `/kennels` | ✅ Yes (Cognito) |
| `update-kennel` | PUT | `/kennels/{id}` | ✅ Yes (Cognito) |
| `delete-kennel` | DELETE | `/kennels/{id}` | ✅ Yes (Cognito) |

### Files Created

```
apps/homeforpup-api/src/functions/kennels/
├── list/
│   └── index.ts       # GET /kennels
├── get/
│   └── index.ts       # GET /kennels/{id}
├── create/
│   └── index.ts       # POST /kennels
├── update/
│   └── index.ts       # PUT /kennels/{id}
└── delete/
    └── index.ts       # DELETE /kennels/{id}
```

### API Stack Updated

- `lib/stacks/api-stack.ts` - Added complete kennels API implementation

## Prerequisites

Before deploying, ensure you have:

### 1. AWS Credentials Configured

```bash
# Check if AWS credentials are set
aws sts get-caller-identity
```

If not configured:
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region: us-east-1
```

### 2. Environment Variables

Create or verify your `.env.development` file:

```bash
cd apps/homeforpup-api

# Check if file exists
ls -la .env.development

# If not, create from example
cp .env.example .env.development
```

Required variables:
```bash
# AWS Configuration
AWS_REGION=us-east-1

# Cognito
COGNITO_USER_POOL_ID=us-east-1_M6uzx1eFZ
COGNITO_USER_POOL_ARN=arn:aws:cognito-idp:us-east-1:YOUR_ACCOUNT_ID:userpool/us-east-1_M6uzx1eFZ
COGNITO_CLIENT_ID=3d6m93u51ggssrc7t49cjnnk53

# Optional: Custom Domain
API_DOMAIN_NAME=api.homeforpup.com
ACM_CERTIFICATE_ARN=arn:aws:acm:us-east-1:YOUR_ACCOUNT_ID:certificate/YOUR-CERT-ID
```

### 3. Dependencies Installed

```bash
cd apps/homeforpup-api
npm install
```

### 4. DynamoDB Table Exists

Verify the kennels table exists:

```bash
aws dynamodb describe-table --table-name homeforpup-kennels
```

If it doesn't exist, create it:

```bash
aws dynamodb create-table \
  --table-name homeforpup-kennels \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Deployment Steps

### Step 1: Bootstrap CDK (First Time Only)

If you haven't deployed CDK stacks before:

```bash
cd apps/homeforpup-api
npx cdk bootstrap aws://ACCOUNT-ID/us-east-1
```

Replace `ACCOUNT-ID` with your AWS account ID.

### Step 2: Synthesize the Stack

Build and verify the CloudFormation template:

```bash
npm run build
npx cdk synth
```

This will show you what will be deployed. Check for any errors.

### Step 3: Deploy to Development

```bash
npm run deploy
```

Or explicitly:

```bash
npx cdk deploy --context environment=development
```

### Step 4: Monitor Deployment

The deployment will:
1. Create Lambda functions for kennels
2. Create API Gateway routes
3. Set up IAM roles and permissions
4. Configure Cognito authorization

Watch for:
```
✅ HomeForPupApiStack-development
```

### Step 5: Get the API URL

After deployment completes, note the outputs:

```
Outputs:
HomeForPupApiStack-development.ApiUrl = https://api.homeforpup.com
HomeForPupApiStack-development.ApiId = abc123xyz
```

## Verify Deployment

### 1. Test the Endpoint

```bash
# Set your API URL
export API_URL="https://api.homeforpup.com"

# Get a JWT token (you'll need to login first)
# This is just the endpoint structure - you need a real token
export TOKEN="your-id-token-here"

# Test GET /kennels
curl -H "Authorization: Bearer $TOKEN" \
  "$API_URL/kennels?limit=10"
```

### 2. Check Lambda Functions

```bash
# List Lambda functions
aws lambda list-functions --query 'Functions[?contains(FunctionName, `kennel`)].FunctionName'
```

Expected functions:
- `list-kennels-development`
- `get-kennel-development`
- `create-kennel-development`
- `update-kennel-development`
- `delete-kennel-development`

### 3. Check API Gateway

```bash
# Get API Gateway REST APIs
aws apigateway get-rest-apis \
  --query 'items[?name==`homeforpup-api-development`]'

# Get API resources (should include /kennels)
API_ID=$(aws apigateway get-rest-apis \
  --query 'items[?name==`homeforpup-api-development`].id' \
  --output text)

aws apigateway get-resources --rest-api-id $API_ID
```

### 4. Test from Mobile App

Update the mobile app and try accessing kennels:

```typescript
// In your mobile app
const result = await apiService.getKennels({ limit: 5 });
console.log('Kennels:', result);
```

## Troubleshooting

### Issue: `Module not found` during deployment

**Solution:** Install dependencies

```bash
cd apps/homeforpup-api
npm install
npm run build
```

### Issue: `User: arn:aws:iam::xxx:user/xxx is not authorized`

**Solution:** Check IAM permissions

```bash
# Your AWS user needs these permissions:
# - CloudFormation
# - Lambda
# - API Gateway
# - IAM (to create roles)
# - DynamoDB
# - CloudWatch Logs
```

### Issue: `Table does not exist`

**Solution:** Create the kennels table (see Prerequisites section)

### Issue: `Cannot find module 'uuid'`

**Solution:** Add uuid as a dependency

```bash
cd apps/homeforpup-api
npm install uuid
npm install --save-dev @types/uuid
```

### Issue: 401 Unauthorized when testing

**Solution:** Ensure you're using an ID token, not an access token

See `/apps/breeder-ios-app/AUTH_TOKEN_FIX.md` for details.

### Issue: Custom domain not working

**Solution:** 

1. Verify certificate exists:
```bash
aws acm list-certificates --region us-east-1
```

2. Update DNS (Route53 or your DNS provider):
```bash
# Get the target domain from deployment output
# Create A/CNAME record pointing to it
```

## Post-Deployment

### 1. Update Mobile App Configuration

The mobile app should now work with the kennels endpoint!

```typescript
// src/services/apiService.ts
// No changes needed - it already points to api.homeforpup.com
```

### 2. Update Documentation

Update the API endpoints documentation:

```bash
# Edit apps/homeforpup-api/API_ENDPOINTS.md
# Change /kennels status from "Not Yet Deployed" to "Deployed"
```

### 3. Test All Endpoints

```bash
# List kennels
curl -H "Authorization: Bearer $TOKEN" "$API_URL/kennels"

# Get kennel
curl "$API_URL/kennels/KENNEL_ID"

# Create kennel
curl -X POST "$API_URL/kennels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Kennel",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    }
  }'

# Update kennel
curl -X PUT "$API_URL/kennels/KENNEL_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Updated description"}'

# Delete kennel
curl -X DELETE "$API_URL/kennels/KENNEL_ID" \
  -H "Authorization: Bearer $TOKEN"
```

## Rolling Back

If something goes wrong:

```bash
# Destroy the stack
npx cdk destroy --context environment=development

# Redeploy previous version
git checkout HEAD~1
npm run deploy
```

## Production Deployment

When ready for production:

```bash
# Ensure .env.production is configured
cp .env.development .env.production
# Edit .env.production with production values

# Deploy to production
npx cdk deploy --context environment=production
```

## Monitoring

### CloudWatch Logs

```bash
# View logs for a function
aws logs tail /aws/lambda/list-kennels-development --follow
```

### Metrics

Check in AWS Console:
- CloudWatch → Metrics → Lambda
- API Gateway → Dashboard
- DynamoDB → Tables → homeforpup-kennels

## Cost Estimate

Expected costs for kennels endpoint:

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| Lambda | 1M requests | $0.20 |
| API Gateway | 1M requests | $3.50 |
| DynamoDB | On-demand | ~$1-10 |
| CloudWatch Logs | 1GB | $0.50 |
| **Total** | | **~$5-15/month** |

## Next Steps

1. ✅ Deploy kennels endpoint
2. Test from mobile app
3. Deploy other endpoints (activities, messages, etc.)
4. Set up monitoring and alerts
5. Configure custom domain (if not done)
6. Set up CI/CD pipeline

## Support

If you encounter issues:

1. Check CloudWatch logs
2. Verify IAM permissions
3. Test Lambda functions individually
4. Check API Gateway configuration
5. Verify Cognito authorizer setup

## Quick Reference

```bash
# Deploy
cd apps/homeforpup-api && npm run deploy

# Check status
aws cloudformation describe-stacks --stack-name HomeForPupApiStack-development

# View logs
aws logs tail /aws/lambda/list-kennels-development --follow

# Test endpoint
curl -H "Authorization: Bearer $TOKEN" "https://api.homeforpup.com/kennels"
```

---

**Last Updated:** October 8, 2025  
**Deployment Status:** Ready to deploy  
**Estimated Deployment Time:** 5-10 minutes

