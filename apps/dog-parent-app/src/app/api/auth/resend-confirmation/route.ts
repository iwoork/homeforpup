import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, ResendConfirmationCodeCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const resendConfirmationCodeCommand = new ResendConfirmationCodeCommand({
      ClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
      Username: email,
    });

    try {
      await cognitoClient.send(resendConfirmationCodeCommand);
      
      console.log('Confirmation code resent to:', email);
      
      return NextResponse.json({
        success: true,
        message: 'A new confirmation code has been sent to your email address.',
      });
    } catch (cognitoError: any) {
      console.error('Cognito resend error:', cognitoError);
      
      // Handle specific Cognito errors
      if (cognitoError.name === 'UserNotFoundException') {
        return NextResponse.json(
          { success: false, error: 'User not found. Please check your email address.' },
          { status: 404 }
        );
      } else if (cognitoError.name === 'InvalidParameterException') {
        return NextResponse.json(
          { success: false, error: 'Invalid email address format.' },
          { status: 400 }
        );
      } else if (cognitoError.name === 'NotAuthorizedException') {
        return NextResponse.json(
          { success: false, error: 'User is already confirmed or account is not in a valid state.' },
          { status: 400 }
        );
      } else if (cognitoError.name === 'LimitExceededException') {
        return NextResponse.json(
          { success: false, error: 'Too many resend attempts. Please wait before requesting another code.' },
          { status: 429 }
        );
      } else if (cognitoError.name === 'InvalidLambdaResponseException') {
        return NextResponse.json(
          { success: false, error: 'Email service temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to resend confirmation code. Please try again.' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Resend confirmation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
