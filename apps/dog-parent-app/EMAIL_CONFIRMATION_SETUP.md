# Email Confirmation Setup

This document explains the email confirmation flow implemented for the dog-parent app.

## Overview

The email confirmation system ensures that users verify their email addresses before they can access the application. This is handled through AWS Cognito's built-in email verification system.

## Features

- **Email Confirmation Page**: A dedicated page where users can enter their confirmation code
- **Resend Confirmation Code**: Users can request a new confirmation code if needed
- **Automatic Redirects**: Unverified users are automatically redirected to the confirmation page
- **Error Handling**: Comprehensive error handling for various confirmation scenarios
- **User-Friendly UI**: Clean, intuitive interface with proper feedback

## Flow

1. **User Signs Up**: User creates an account through AWS Cognito
2. **Email Sent**: AWS Cognito automatically sends a confirmation email with a 6-digit code
3. **Redirect to Confirmation**: User is redirected to `/auth/confirm` page
4. **Code Entry**: User enters the 6-digit confirmation code
5. **Verification**: Code is verified through AWS Cognito API
6. **Success**: User is redirected to dashboard upon successful verification

## Pages and Components

### `/auth/confirm`
- **Purpose**: Email confirmation page
- **Features**:
  - Code input field (6-digit)
  - Resend code functionality
  - Success/error feedback
  - Automatic redirect after successful confirmation

### `/auth/login`
- **Enhancement**: Shows verification alert if user tries to login without verification
- **Features**:
  - Warning alert for unverified users
  - Direct link to confirmation page

### `/auth/error`
- **Enhancement**: Handles email verification errors
- **Features**:
  - Specific error message for unverified users
  - Direct action button to verify email

## API Endpoints

### `POST /api/auth/confirm`
- **Purpose**: Confirm user's email with verification code
- **Body**: `{ email: string, confirmationCode: string }`
- **Response**: Success/error status with appropriate message

### `POST /api/auth/resend-confirmation`
- **Purpose**: Resend confirmation code to user's email
- **Body**: `{ email: string }`
- **Response**: Success/error status with appropriate message

### `POST /api/auth/check-verification`
- **Purpose**: Check if user's email is verified
- **Body**: `{ email: string }`
- **Response**: Verification status and user status

## Middleware

The `middleware.ts` file handles automatic redirection:
- Checks if authenticated user is verified
- Redirects unverified users to confirmation page
- Preserves email in URL parameters

## Environment Variables

Required environment variables:
```bash
# AWS Cognito
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=your_client_id
AWS_USER_POOL_ID=your_user_pool_id
AWS_REGION=us-east-1

# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## Error Handling

The system handles various error scenarios:

- **Invalid Code**: Clear error message for wrong confirmation codes
- **Expired Code**: Guidance to request a new code
- **User Not Found**: Appropriate error for non-existent users
- **Rate Limiting**: Handles too many attempts gracefully
- **Network Errors**: Fallback error messages for connectivity issues

## User Experience

1. **Clear Instructions**: Users receive clear guidance on what to do
2. **Visual Feedback**: Loading states, success animations, and error messages
3. **Easy Navigation**: Simple back-to-login and resend options
4. **Mobile Friendly**: Responsive design works on all devices
5. **Accessibility**: Proper ARIA labels and keyboard navigation

## Testing

To test the email confirmation flow:

1. Create a new user account
2. Check email for confirmation code
3. Enter code on confirmation page
4. Verify successful redirect to dashboard
5. Test resend functionality
6. Test error scenarios (invalid code, expired code)

## Security Considerations

- Confirmation codes are time-limited (typically 24 hours)
- Rate limiting prevents abuse of resend functionality
- Codes are single-use and expire after use
- All API endpoints validate input parameters
- Error messages don't reveal sensitive information

## Troubleshooting

### Common Issues

1. **Code Not Received**: Check spam folder, verify email address
2. **Invalid Code**: Ensure code is entered correctly, request new one if needed
3. **Expired Code**: Request a new confirmation code
4. **User Already Confirmed**: User can proceed to login normally

### Debug Steps

1. Check AWS Cognito console for user status
2. Verify environment variables are set correctly
3. Check browser console for JavaScript errors
4. Verify AWS credentials have proper permissions
5. Check network tab for API call failures

## Future Enhancements

Potential improvements:
- SMS confirmation as alternative to email
- Custom email templates
- Confirmation code expiration countdown
- Bulk user verification for admin users
- Integration with user onboarding flow
