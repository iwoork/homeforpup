# AWS IAM Setup for HomeForPup Application

This guide will help you create an AWS IAM user with the necessary permissions to operate the HomeForPup application.

## Overview

The HomeForPup application uses the following AWS services:
- **DynamoDB**: Database for users, dogs, breeders, messages, and other data
- **S3**: File storage for photos and documents
- **SES**: Email sending for contact forms and notifications
- **Cognito**: User authentication and management
- **CloudWatch**: Logging and monitoring

## IAM Policy

The application requires a comprehensive IAM policy that grants permissions to all these services. The policy is defined in `aws-iam-policy.json`.

### Key Permissions Included:

1. **DynamoDB Data Access**: Read, write, update, and delete data in application tables (no table management)
2. **S3 Data Access**: Upload, download, and delete files in the photos bucket (no bucket management)
3. **SES Email Sending**: Send emails and check quotas/statistics
4. **Cognito Read-Only**: Read user information for authentication
5. **CloudWatch Logs**: Write to existing log streams (no log group creation)

## Setup Instructions

### Step 1: Create IAM User

1. Log into the AWS Console
2. Navigate to IAM (Identity and Access Management)
3. Click "Users" in the left sidebar
4. Click "Create user"
5. Enter a username (e.g., `homeforpup-app-user`)
6. Select "Programmatic access" for access type
7. Click "Next: Permissions"

### Step 2: Attach Policy

1. Click "Attach policies directly"
2. Click "Create policy"
3. Switch to the JSON tab
4. Copy and paste the contents of `aws-iam-policy.json`
5. Click "Next: Tags" (optional)
6. Click "Next: Review"
7. Name the policy `HomeForPupApplicationPolicy`
8. Add description: "Full access policy for HomeForPup application"
9. Click "Create policy"
10. Go back to user creation and attach the newly created policy

### Step 3: Create Access Keys

1. Complete user creation
2. Go to the user's "Security credentials" tab
3. Click "Create access key"
4. Select "Application running outside AWS"
5. Click "Next"
6. Add a description tag (optional)
7. Click "Create access key"
8. **IMPORTANT**: Download the CSV file or copy the Access Key ID and Secret Access Key

### Step 4: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
NEXT_PUBLIC_AWS_REGION=us-east-1

# S3 Configuration
NEXT_PUBLIC_AWS_S3_BUCKET=homeforpup-images
NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN=img.homeforpup.com

# Cognito Configuration
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_DOMAIN=https://your-domain.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_AUTHORITY=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx

# SES Configuration
SES_FROM_EMAIL=support@homeforpup.com
SES_SUPPORT_EMAIL=support@homeforpup.com
```

## Security Best Practices

### 1. Principle of Least Privilege
The policy follows security best practices by providing only the minimum permissions needed for the application to function. It explicitly **excludes**:
- ❌ **Table Management**: Cannot create, delete, or modify DynamoDB tables
- ❌ **Bucket Management**: Cannot create, delete, or modify S3 buckets
- ❌ **Administrative Permissions**: No IAM, CloudFormation, or other admin access
- ❌ **Cross-Account Access**: Limited to specific resources only
- ❌ **Log Group Creation**: Cannot create new CloudWatch log groups

### 2. Data-Only Permissions
- **DynamoDB**: Only data operations (GetItem, PutItem, UpdateItem, DeleteItem, Query, Scan)
- **S3**: Only file operations (GetObject, PutObject, DeleteObject, ListBucket)
- **SES**: Only email sending and basic statistics
- **Cognito**: Read-only access for authentication
- **CloudWatch**: Only write to existing log streams

### 3. Resource-Specific Permissions
- DynamoDB permissions are limited to specific table ARNs
- S3 permissions are limited to the application's bucket
- All permissions are scoped to the us-east-1 region

### 4. Regular Security Maintenance
- Rotate access keys every 90 days
- Monitor access key usage in CloudTrail
- Use temporary credentials when possible
- Regular security audits of permissions

## Required AWS Resources

Before using this policy, ensure the following resources exist:

### DynamoDB Tables
- `homeforpup-users`
- `homeforpup-dogs`
- `homeforpup-breeders`
- `homeforpup-breeds`
- `homeforpup-messages`
- `homeforpup-message-threads`
- `homeforpup-favorites`
- `homeforpup-activities`
- `homeforpup-kennels`
- `homeforpup-litters`

### S3 Bucket
- `homeforpup-images` (with appropriate CORS configuration)

### Cognito User Pool
- User pool with appropriate app clients
- Custom attributes for user types

### SES Configuration
- Verified sending domain
- Verified email addresses
- Production access (if sending to unverified emails)

## Troubleshooting

### Common Issues

1. **Access Denied Errors**
   - Verify the IAM policy is attached to the user
   - Check that the resource ARNs match your actual resources
   - Ensure the region is correct (us-east-1)

2. **DynamoDB Errors**
   - Verify all required tables exist
   - Check table names match exactly
   - Ensure proper permissions for indexes

3. **S3 Upload Failures**
   - Verify bucket exists and is accessible
   - Check CORS configuration
   - Ensure proper permissions for the bucket

4. **SES Email Failures**
   - Verify sending domain and email addresses
   - Check if production access is required
   - Verify SES is not in sandbox mode

### Testing the Setup

Run the following commands to test your setup:

```bash
# Test SES configuration
node scripts/test-ses.js

# Test application functionality
npm run dev

# Check application logs for any permission errors
# Note: setup-dynamodb-tables.js requires admin permissions and won't work with this policy
```

**Important**: The `setup-dynamodb-tables.js` script requires administrative permissions to create tables, which this policy does not include. Tables must be created by an administrator before using this policy.

## Cost Considerations

- **DynamoDB**: On-demand billing by default, monitor usage
- **S3**: Standard storage pricing, consider lifecycle policies
- **SES**: Pay per email sent, monitor sending limits
- **Cognito**: Free tier available, monitor user counts

## Monitoring

Set up CloudWatch alarms for:
- DynamoDB throttling
- S3 request errors
- SES bounce rates
- Application errors

## Support

If you encounter issues:
1. Check AWS CloudTrail for permission denials
2. Review application logs
3. Verify all environment variables are set correctly
4. Test individual AWS service access
