# Infrastructure Deployment Guide

This guide walks you through deploying the HomeForPup AWS infrastructure using CDK.

## Prerequisites

Before deploying, ensure you have:

1. **AWS Account** with billing enabled
2. **AWS CLI** installed and configured:
   ```bash
   aws configure
   ```
3. **Node.js** 18+ installed
4. **AWS CDK CLI** installed:
   ```bash
   npm install -g aws-cdk
   cdk --version
   ```

## Step 1: Navigate to Infrastructure Directory

```bash
cd apps/homeforpup-infrastructure
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Configure Environment

Create a `.env` file (or copy from `.env.example`):

```bash
# Copy example
cp .env.example .env

# Edit with your values
vim .env  # or use your preferred editor
```

Required variables:
- `AWS_REGION` - Your AWS region (e.g., `us-east-1`)
- `AWS_ACCOUNT_ID` - Your AWS account ID
- `ENVIRONMENT` - Environment name (`development`, `staging`, or `production`)

Optional variables (if importing existing resources):
- `COGNITO_USER_POOL_ID` - Existing Cognito User Pool ID
- `COGNITO_USER_POOL_ARN` - Existing Cognito User Pool ARN
- `COGNITO_CLIENT_ID` - Existing Cognito Client ID

## Step 4: Bootstrap CDK (First Time Only)

CDK needs to bootstrap your AWS account to store deployment artifacts:

```bash
# Get your AWS account ID
aws sts get-caller-identity --query Account --output text

# Bootstrap CDK
npm run bootstrap
# Or manually:
# cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
```

This creates an S3 bucket and IAM roles needed for CDK deployments.

## Step 5: Review Changes (Optional)

Before deploying, review what will be created:

```bash
# Synthesize CloudFormation templates
npm run synth

# See differences (if updating existing stacks)
npm run diff
```

## Step 6: Deploy Infrastructure

### Deploy All Stacks

```bash
# Deploy to development (default)
npm run deploy:all

# Deploy to specific environment
npm run deploy:all -- --context environment=production
```

### Deploy Individual Stacks

```bash
# DynamoDB tables only
npm run deploy:dynamodb

# S3 buckets only
npm run deploy:s3

# Cognito User Pool only
npm run deploy:cognito

# IAM roles only
npm run deploy:iam
```

### Deploy with Specific Environment

```bash
npm run deploy -- --context environment=staging
```

## Step 7: Verify Deployment

After deployment, verify resources were created:

### Check DynamoDB Tables

```bash
aws dynamodb list-tables --region us-east-1
```

### Check S3 Buckets

```bash
aws s3 ls | grep homeforpup
```

### Check Cognito User Pool

```bash
aws cognito-idp list-user-pools --max-results 10
```

### Check CloudFormation Stacks

```bash
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE
```

## Step 8: Get Output Values

After deployment, CDK outputs important values:

```bash
# View all outputs
aws cloudformation describe-stacks --stack-name homeforpup-dynamodb-development --query 'Stacks[0].Outputs'

# Get specific output
aws cloudformation describe-stacks \
  --stack-name homeforpup-dynamodb-development \
  --query 'Stacks[0].Outputs[?OutputKey==`ProfilesTableName`].OutputValue' \
  --output text
```

## Updating Infrastructure

To update existing infrastructure:

1. Make changes to the CDK code
2. Review changes:
   ```bash
   npm run diff
   ```
3. Deploy updates:
   ```bash
   npm run deploy
   ```

## Destroying Infrastructure

⚠️ **Warning**: This will delete all resources!

```bash
# Destroy all stacks
cdk destroy --all

# Destroy specific stack
cdk destroy DynamoDBStack-development
```

**Note**: Production stacks have `RETAIN` removal policy, so some resources may not be deleted.

## Troubleshooting

### Bootstrap Errors

If you get "CDK toolkit stack not found":
```bash
cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
```

### Permission Errors

Ensure your AWS credentials have:
- `CloudFormation:*` permissions
- `IAM:*` permissions (for role creation)
- `DynamoDB:*` permissions
- `S3:*` permissions
- `Cognito:*` permissions

### Stack Already Exists

If a stack with the same name exists:
- Use `cdk diff` to see differences
- Use `cdk deploy` to update the stack
- Or destroy the existing stack first (if safe to do so)

### Import Existing Resources

To import existing resources (like Cognito):

1. Set environment variables in `.env`:
   ```env
   COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
   COGNITO_USER_POOL_ARN=arn:aws:cognito-idp:...
   COGNITO_CLIENT_ID=xxxxxxxxxxxxx
   ```

2. Deploy the Cognito stack - it will import instead of creating

## Environment-Specific Notes

### Development

- Resources can be destroyed
- No versioning on S3
- No point-in-time recovery on DynamoDB
- Lower cost optimizations

### Staging

- Similar to production but with staging names
- Some cost optimizations enabled

### Production

- Resources are retained (RETAIN policy)
- S3 versioning enabled
- DynamoDB point-in-time recovery enabled
- Lifecycle rules for cost optimization
- Enhanced monitoring recommended

## Next Steps

After deploying infrastructure:

1. **Deploy API**: Navigate to `apps/homeforpup-api` and deploy the API Gateway
2. **Configure Applications**: Update application environment variables with resource names/ARNs
3. **Set Up Monitoring**: Configure CloudWatch alarms and dashboards
4. **Backup Strategy**: Set up automated backups for production

## Related Documentation

- [Infrastructure README](./README.md)
- [API Deployment Guide](../deployment/DEPLOYMENT.md)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)


