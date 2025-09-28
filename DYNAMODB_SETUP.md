# DynamoDB Setup Guide

This guide will help you set up the required DynamoDB tables for the Home for Pup application.

## Prerequisites

1. **AWS Account**: You need an active AWS account
2. **AWS CLI**: Install and configure AWS CLI with your credentials
3. **Node.js**: Make sure Node.js is installed
4. **AWS Credentials**: Set up your AWS access key and secret key

## Quick Setup

### 1. Configure AWS Credentials

Create a `.env.local` file in the project root:

```bash
cp env.local.example .env.local
```

Update `.env.local` with your AWS credentials:

```env
# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1

# DynamoDB Table Names
USERS_TABLE_NAME=homeforpup-users
DOGS_TABLE_NAME=homeforpup-dogs
BREEDERS_TABLE_NAME=homeforpup-breeders
BREEDS_TABLE_NAME=homeforpup-breeds
MESSAGES_TABLE_NAME=homeforpup-messages
THREADS_TABLE_NAME=homeforpup-message-threads
FAVORITES_TABLE_NAME=homeforpup-favorites

# Cognito Configuration
NEXT_PUBLIC_AWS_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=your_client_id
NEXT_PUBLIC_COGNITO_DOMAIN=your_cognito_domain
NEXT_PUBLIC_AWS_S3_BUCKET=your_s3_bucket_name
```

### 2. Create DynamoDB Tables

Run the setup script to create all required tables:

```bash
node scripts/setup-dynamodb-tables.js
```

This will create the following tables:
- `homeforpup-users` - User profiles and authentication data
- `homeforpup-dogs` - Dog information and breeding records
- `homeforpup-breeders` - Breeder profiles and business information
- `homeforpup-breeds` - Dog breed information
- `homeforpup-messages` - Message content and metadata
- `homeforpup-message-threads` - Message thread organization
- `homeforpup-favorites` - User favorites for puppies

### 3. Verify Tables

You can verify the tables were created by checking the AWS Console or running:

```bash
aws dynamodb list-tables --region us-east-1
```

## Manual Setup (Alternative)

If you prefer to create tables manually through the AWS Console:

### Users Table
- **Table Name**: `homeforpup-users`
- **Partition Key**: `userId` (String)
- **Global Secondary Index**: `EmailIndex` on `email` attribute

### Dogs Table
- **Table Name**: `homeforpup-dogs`
- **Partition Key**: `id` (String)
- **Global Secondary Index**: `BreederIndex` on `breederId` attribute

### Breeders Table
- **Table Name**: `homeforpup-breeders`
- **Partition Key**: `id` (String)
- **Global Secondary Index**: `UserIndex` on `userId` attribute

### Breeds Table
- **Table Name**: `homeforpup-breeds`
- **Partition Key**: `id` (String)

### Messages Table
- **Table Name**: `homeforpup-messages`
- **Partition Key**: `PK` (String)
- **Sort Key**: `SK` (String)

### Message Threads Table
- **Table Name**: `homeforpup-message-threads`
- **Partition Key**: `PK` (String)
- **Global Secondary Index**: `GSI1` on `GSI1PK` attribute

### Favorites Table
- **Table Name**: `homeforpup-favorites`
- **Partition Key**: `userId` (String)
- **Sort Key**: `puppyId` (String)
- **Global Secondary Index**: `GSI1` on `GSI1PK` attribute

## Troubleshooting

### Common Issues

1. **ResourceNotFoundException**: This means the DynamoDB table doesn't exist. Run the setup script to create it.

2. **Access Denied**: Check your AWS credentials and permissions. Make sure your user has DynamoDB permissions.

3. **Region Mismatch**: Ensure your AWS region matches the one configured in your environment variables.

### Checking Table Status

To check if a table exists and its status:

```bash
aws dynamodb describe-table --table-name homeforpup-users --region us-east-1
```

## Cost Considerations

- All tables are created with **On-Demand** billing by default
- For development, consider using **Provisioned** capacity to control costs
- Monitor your usage in the AWS Console

## Next Steps

After setting up the tables:

1. Start the development server: `npm run dev`
2. Test the application functionality
3. Check the browser console for any remaining errors
4. Verify that data can be saved and retrieved from the tables

## Support

If you encounter issues:

1. Check the AWS CloudWatch logs for DynamoDB errors
2. Verify your environment variables are correct
3. Ensure your AWS credentials have the necessary permissions
4. Check the browser console for client-side errors
