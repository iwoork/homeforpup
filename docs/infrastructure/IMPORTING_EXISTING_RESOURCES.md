# Importing Existing AWS Resources

When deploying infrastructure, you may encounter errors because resources already exist from previous manual setups. This guide explains how to import existing resources into CDK stacks.

## Common Error: Resource Already Exists

If you see an error like:
```
Resource of type 'AWS::S3::Bucket' with identifier 'homeforpup-images' already exists.
```

This means the resource was created outside of CDK (manually or via another tool) and CDK is trying to create it again.

## Solution: Import Existing Resources

### Option 1: Import S3 Buckets (Recommended)

If your S3 buckets already exist, you can import them instead of creating new ones:

1. **Set environment variable** before deploying:

```bash
export IMPORT_EXISTING_S3_BUCKETS=true
```

Or add to your `.env` file:
```env
IMPORT_EXISTING_S3_BUCKETS=true
```

2. **Deploy the S3 stack**:

```bash
cd apps/homeforpup-infrastructure
npm run deploy:s3
```

The stack will import the existing buckets instead of trying to create them.

### Option 2: Use Different Bucket Names

If you want to keep the existing buckets separate, update the bucket names in your environment configuration:

1. **Edit `.env` file**:

```env
S3_IMAGE_BUCKET=homeforpup-images-new
S3_UPLOAD_BUCKET=homeforpup-uploads-new
```

2. **Deploy**:

```bash
npm run deploy:s3
```

### Option 3: Delete Existing Resources (⚠️ Use with Caution)

**Warning**: This will delete the existing resources and all their data!

Only do this if:
- The resources are not in use
- You have backups
- You're in a development environment

```bash
# Delete existing bucket (WARNING: This deletes all data!)
aws s3 rb s3://homeforpup-images --force

# Then deploy
npm run deploy:s3
```

## Importing DynamoDB Tables

If DynamoDB tables already exist, you have two options:

### Option 1: Use Different Table Names

Update table names in your environment config to use different names:

```env
# In .env or environment config
# Tables will be created with new names
```

### Option 2: Import Tables (Manual Process)

CDK doesn't have built-in support for importing DynamoDB tables. You'll need to:

1. **Delete the existing stack** (if it exists):
```bash
cdk destroy DynamoDBStack-development
```

2. **Manually import** using CloudFormation console, or

3. **Keep existing tables** and reference them by name in your application code

## Importing Cognito User Pool

The Cognito stack already supports importing existing User Pools:

1. **Set environment variables**:

```env
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_USER_POOL_ARN=arn:aws:cognito-idp:us-east-1:ACCOUNT_ID:userpool/us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

2. **Deploy**:

```bash
npm run deploy:cognito
```

The stack will automatically import the existing User Pool instead of creating a new one.

## Checking Existing Resources

Before deploying, check what resources already exist:

### List S3 Buckets

```bash
aws s3 ls | grep homeforpup
```

### List DynamoDB Tables

```bash
aws dynamodb list-tables --region us-east-1
```

### List Cognito User Pools

```bash
aws cognito-idp list-user-pools --max-results 10
```

### List CloudFormation Stacks

```bash
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE
```

## Best Practices

1. **Use Import Mode First**: If resources exist, import them rather than recreating
2. **Check Before Deploying**: Always check what resources exist before deploying
3. **Use Environment-Specific Names**: Use different names for dev/staging/prod
4. **Backup Before Deleting**: Always backup data before deleting resources
5. **Document Existing Resources**: Keep a list of manually created resources

## Troubleshooting

### Error: Cannot import resource

If CDK cannot import a resource, you may need to:

1. **Use CloudFormation Console**: Manually import via AWS Console
2. **Delete and Recreate**: Only if safe to do so
3. **Use Different Names**: Create new resources with different names

### Error: Resource not found when importing

Make sure:
- The resource name is correct
- The resource exists in the same region
- You have permissions to access the resource

### Error: Stack already exists

If a CloudFormation stack already exists:

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name homeforpup-s3-development

# If it's in a failed state, delete it
aws cloudformation delete-stack --stack-name homeforpup-s3-development

# Wait for deletion, then redeploy
npm run deploy:s3
```

## Related Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [AWS Credentials Setup](./AWS_CREDENTIALS_SETUP.md)
- [Infrastructure README](./README.md)


