# Quick Start Guide

Get your API Gateway infrastructure up and running in under 30 minutes.

## Prerequisites

- ✅ AWS Account
- ✅ AWS CLI configured (`aws configure`)
- ✅ Node.js 18+
- ✅ Existing Cognito User Pool
- ✅ Existing DynamoDB tables

## Step 1: Install Dependencies

```bash
cd apps/homeforpup-api
npm install
```

## Step 2: Configure Environment

```bash
# Copy example
cp .env.example .env.development

# Edit with your actual values
vim .env.development
```

**Required values:**
- `AWS_REGION`: Your AWS region (e.g., `us-east-1`)
- `COGNITO_USER_POOL_ARN`: Find in AWS Cognito console
- `COGNITO_USER_POOL_ID`: Find in AWS Cognito console
- `COGNITO_CLIENT_ID`: Your app client ID

**Verify your table names match:**
```bash
# List your DynamoDB tables
aws dynamodb list-tables --region us-east-1
```

## Step 3: Bootstrap CDK (First Time Only)

```bash
# Get your AWS account ID
aws sts get-caller-identity --query Account --output text

# Bootstrap CDK
cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
```

## Step 4: Deploy

```bash
# Build and deploy
npm run build
npm run deploy -- --context environment=development
```

This will create:
- API Gateway REST API
- Multiple Lambda functions
- IAM roles
- CloudWatch log groups

**Deployment takes ~5-10 minutes.**

## Step 5: Get Your API URL

After deployment, you'll see output like:

```
Outputs:
HomeForPupApiStack-development.ApiUrl = https://abc123xyz.execute-api.us-east-1.amazonaws.com/development/
```

Save this URL!

## Step 6: Test Your API

```bash
# Set your API URL
export API_URL="https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/development"

# Test public endpoint (no auth required)
curl "$API_URL/breeds?limit=5"

# Test dogs endpoint
curl "$API_URL/dogs?limit=10"

# Test specific dog
curl "$API_URL/dogs/YOUR_DOG_ID"
```

## Step 7: Update Frontend

```bash
# In dog-parent-app or breeder-app .env.local
echo "NEXT_PUBLIC_API_URL=$API_URL" >> .env.local
```

## What Was Created?

### API Gateway
- REST API: `homeforpup-api-development`
- Stage: `development`
- Cognito authorizer configured

### Lambda Functions
- `list-dogs-development`
- `get-dog-development`
- `create-dog-development`
- `update-dog-development`
- `delete-dog-development`
- `get-user-development`
- `update-user-development`
- `list-breeds-development`

### IAM Roles
- Lambda execution roles with DynamoDB permissions
- CloudWatch Logs permissions

## Next Steps

### 1. Test with Authentication

Get a JWT token from Cognito:

```bash
# Login and get token
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id YOUR_CLIENT_ID \
  --auth-parameters USERNAME=user@example.com,PASSWORD=YourPassword

# Use token in requests
curl "$API_URL/dogs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Monitor Logs

```bash
# Watch Lambda logs in real-time
aws logs tail /aws/lambda/list-dogs-development --follow
```

### 3. Add More Endpoints

See `MIGRATION_GUIDE.md` for migrating additional API endpoints.

## Common Commands

```bash
# Show what will be deployed
npm run synth

# Show differences with deployed stack
npm run diff

# Deploy changes
npm run deploy

# View logs
aws logs tail /aws/lambda/FUNCTION_NAME --follow

# Destroy everything (⚠️ CAREFUL!)
npm run destroy
```

## Troubleshooting

### Error: "Unable to resolve AWS account to use"

Run `aws configure` and verify credentials:
```bash
aws sts get-caller-identity
```

### Error: "Stack does not exist"

Run bootstrap:
```bash
cdk bootstrap
```

### Error: "This stack uses assets..."

Bootstrap CDK in your account:
```bash
cdk bootstrap aws://ACCOUNT_ID/REGION
```

### Lambda function errors

Check CloudWatch logs:
```bash
aws logs tail /aws/lambda/list-dogs-development --follow
```

### CORS errors

Verify `allowedOrigins` in `lib/config/environments.ts` includes your frontend URL.

## File Structure Reference

```
apps/homeforpup-api/
├── bin/
│   └── api.ts                    # CDK app entry
├── lib/
│   ├── config/
│   │   └── environments.ts       # Environment configs
│   ├── constructs/
│   │   └── lambda-api.ts         # Reusable Lambda construct
│   └── stacks/
│       └── api-stack.ts          # Main API stack
├── src/
│   ├── functions/
│   │   ├── dogs/                 # Dog API handlers
│   │   ├── users/                # User API handlers
│   │   └── breeds/               # Breed API handlers
│   ├── middleware/
│   │   ├── auth.ts               # Authentication
│   │   ├── error-handler.ts     # Error handling
│   │   └── cors.ts               # CORS config
│   ├── shared/
│   │   ├── dynamodb.ts           # DynamoDB client
│   │   └── s3.ts                 # S3 client
│   └── types/
│       └── lambda.ts             # Lambda types
├── cdk.json                      # CDK config
├── package.json
└── tsconfig.json
```

## Getting Help

- 📖 Read `MIGRATION_GUIDE.md` for detailed migration steps
- 📖 Read `DEPLOYMENT.md` for production deployment
- 📖 Read `README.md` for architecture overview
- 🔍 Check CloudWatch Logs for errors
- 💬 Ask the team in #engineering-help

## Clean Up

To remove all resources:

```bash
npm run destroy -- --context environment=development
```

**⚠️ Warning:** This deletes the API Gateway and all Lambda functions!

