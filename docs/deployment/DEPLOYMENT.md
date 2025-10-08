# Breeder App Deployment Guide

## Vercel Deployment

### Required Environment Variables

Set the following environment variables in your Vercel project settings:

#### AWS Configuration
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

#### DynamoDB Table Names
```
ACTIVITIES_TABLE_NAME=homeforpup-activities
KENNELS_TABLE_NAME=homeforpup-kennels
DOGS_TABLE_NAME=homeforpup-dogs
LITTERS_TABLE_NAME=homeforpup-litters
```

#### NextAuth Configuration
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
```

#### AWS Cognito Configuration
```
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=your_cognito_client_id
NEXT_PUBLIC_COGNITO_AUTHORITY=https://cognito-idp.us-east-1.amazonaws.com/your_user_pool_id
NEXT_PUBLIC_COGNITO_DOMAIN=your_cognito_domain
```

#### Google Analytics (Optional)
```
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### Build Configuration

The app uses a monorepo structure with shared packages. The Vercel configuration is set up to:

1. Install all dependencies from the root
2. Build shared packages first
3. Build the breeder app

### Troubleshooting

If the build fails:

1. **Check Environment Variables**: Ensure all required environment variables are set in Vercel
2. **Check Build Logs**: Look for specific error messages in the Vercel build logs
3. **Verify Dependencies**: Ensure all shared packages are properly built
4. **Check Node.js Version**: Vercel should use Node.js 18+ for Next.js 15

### Local Development

To run locally:

```bash
# Install dependencies
npm install

# Build shared packages
npm run build --filter="@homeforpup/shared-*"

# Build breeder app
npm run build --filter=breeder-app

# Start development server
npm run dev --filter=breeder-app
```

### Production Build

```bash
# Build everything
npm run build

# Or build specific packages
npm run build --filter="@homeforpup/shared-*"
npm run build --filter=breeder-app
```
