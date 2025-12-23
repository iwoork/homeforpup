# HomeForPup Infrastructure

This directory contains AWS CDK infrastructure as code for deploying and managing all AWS services used by HomeForPup.

## Overview

The infrastructure is organized into separate CDK stacks for different AWS services:

- **DynamoDB Stack**: All database tables
- **S3 Stack**: Storage buckets for images and uploads
- **Cognito Stack**: User authentication and management
- **IAM Stack**: Roles and policies for application access

## Location

The infrastructure code is located in: `apps/homeforpup-infrastructure/`

## Quick Start

### Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured (`aws configure`)
3. **Node.js** 18+ installed
4. **AWS CDK CLI** installed globally:
   ```bash
   npm install -g aws-cdk
   ```

### Initial Setup

1. Navigate to the infrastructure directory:
   ```bash
   cd apps/homeforpup-infrastructure
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your AWS account ID and region
   ```

4. Bootstrap CDK (first time only):
   ```bash
   npm run bootstrap
   # Or manually:
   # cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
   ```

### Deployment

Deploy all infrastructure:
```bash
npm run deploy:all
```

Deploy individual stacks:
```bash
# DynamoDB tables
npm run deploy:dynamodb

# S3 buckets
npm run deploy:s3

# Cognito User Pool
npm run deploy:cognito

# IAM roles and policies
npm run deploy:iam
```

Deploy to specific environment:
```bash
npm run deploy -- --context environment=production
```

## Stack Details

### DynamoDB Stack

Creates all required DynamoDB tables with proper indexes:

- `homeforpup-profiles` - User profile data
- `homeforpup-dogs` - Dog listings
- `homeforpup-kennels` - Kennel management
- `homeforpup-litters` - Litter management
- `homeforpup-messages` - Messaging system
- `homeforpup-message-threads` - Message threads
- `homeforpup-favorites` - User favorites
- `homeforpup-activities` - User activity feed
- `homeforpup-breeds` - Dog breed information
- `homeforpup-breeds-simple` - Simplified breed data
- `homeforpup-vet-visits` - Veterinary visit records
- `homeforpup-veterinarians` - Veterinarian information

**Features:**
- On-demand billing (PAY_PER_REQUEST)
- Point-in-time recovery (production only)
- Global Secondary Indexes (GSIs) for efficient queries
- Streams enabled for profiles table

### S3 Stack

Creates two S3 buckets:

1. **Image Bucket** (`homeforpup-images`)
   - Public read access
   - CORS enabled
   - Versioning (production)
   - Lifecycle rules for cost optimization

2. **Upload Bucket** (`homeforpup-uploads`)
   - Private access only
   - Auto-delete after 7 days
   - For temporary file uploads

### Cognito Stack

Creates or imports AWS Cognito User Pool:

- Email-based authentication
- Custom attributes (userType)
- Password policy enforcement
- Optional MFA
- OAuth configuration
- Custom domain support

**Note:** If you already have a Cognito User Pool, set environment variables to import it instead of creating a new one.

### IAM Stack

Creates IAM roles with least-privilege permissions:

- Application role for Lambda/EC2 services
- DynamoDB read/write access
- S3 bucket access
- Cognito read access
- SES email sending
- CloudWatch Logs

## Environment Configuration

The infrastructure supports three environments:

- **development** (default)
- **staging**
- **production**

Each environment has different:
- Resource names (with environment suffix)
- Retention policies
- Feature flags
- Cost optimizations

## Manual Setup Scripts

For manual setup without CDK, scripts are available in:
`apps/homeforpup-infrastructure/scripts/`

**Note:** CDK is the recommended approach for infrastructure management.

## Cost Considerations

- **Development**: Resources can be destroyed (auto-delete enabled)
- **Production**: Resources are retained, versioning enabled, backups configured
- **Billing**: DynamoDB uses on-demand pricing (pay per request)
- **S3**: Lifecycle rules transition old objects to cheaper storage

## Troubleshooting

### CDK Bootstrap Issues

If you get bootstrap errors:
```bash
cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
```

### Permission Errors

Ensure your AWS credentials have:
- CloudFormation permissions
- IAM role creation permissions
- Resource creation permissions

### Stack Already Exists

If a stack already exists and you want to update it:
```bash
npm run diff  # See what will change
npm run deploy  # Deploy the changes
```

### Import Existing Resources

To import existing resources (like Cognito User Pool), set the appropriate environment variables in `.env` before deploying.

## Related Documentation

- [API Deployment Guide](../deployment/DEPLOYMENT.md)
- [DynamoDB Setup](../setup/DYNAMODB_SETUP.md)
- [AWS IAM Setup](../setup/AWS_IAM_SETUP.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review AWS CloudFormation console for stack errors
3. Check CloudWatch Logs for detailed error messages


