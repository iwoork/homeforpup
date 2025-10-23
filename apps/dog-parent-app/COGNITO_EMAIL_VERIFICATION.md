# AWS Cognito Email Verification Setup

## Overview

AWS Cognito handles email verification automatically. When users sign up, Cognito will:

1. **Send verification email** automatically to the user's email address
2. **Block access** until the user clicks the verification link in the email
3. **Allow access** once the user verifies their email

## How It Works

### For New Users:
1. User signs up with email/password
2. Cognito automatically sends verification email
3. User clicks link in email to verify
4. User can then sign in normally

### For Existing Users:
- If already verified: Can sign in immediately
- If not verified: Cognito will handle the verification flow

## Configuration

### AWS Cognito User Pool Settings:
1. **Email Verification**: Enable in User Pool settings
2. **Email Source**: Configure SES or use Cognito's default email
3. **Verification Message**: Customize the verification email template

### Environment Variables:
```bash
# Cognito Configuration
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_DOMAIN=https://your-domain.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_AUTHORITY=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx
```

## What We Removed

We removed our custom email confirmation flow because:
- **Cognito handles this automatically**
- **Our custom flow was interfering** with Cognito's natural process
- **It was causing redirect loops** for existing verified users

## Current Behavior

- **Authenticated users**: Can access the app immediately
- **Unverified users**: Cognito will handle verification during sign-in
- **No custom confirmation page**: Cognito manages the entire flow

## Testing

To test email verification:
1. Create a new user account
2. Check email for verification link from Cognito
3. Click the verification link
4. Sign in normally

## Troubleshooting

If users are still having verification issues:
1. Check AWS Cognito User Pool settings
2. Verify email templates are configured
3. Check SES configuration if using custom email
4. Ensure User Pool has email verification enabled
