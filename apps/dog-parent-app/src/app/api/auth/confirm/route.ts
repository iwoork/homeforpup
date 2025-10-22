import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export async function POST(request: NextRequest) {
  try {
    const { email, confirmationCode } = await request.json();

    if (!email || !confirmationCode) {
      return NextResponse.json(
        { success: false, error: 'Email and confirmation code are required' },
        { status: 400 }
      );
    }

    const userPoolId = process.env.AWS_USER_POOL_ID;
    if (!userPoolId) {
      console.error('AWS_USER_POOL_ID environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const confirmSignUpCommand = new ConfirmSignUpCommand({
      ClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
    });

    try {
      await cognitoClient.send(confirmSignUpCommand);
      
      console.log('Email confirmation successful for:', email);
      
      return NextResponse.json({
        success: true,
        message: 'Email confirmed successfully! You can now sign in to your account.',
      });
    } catch (cognitoError: any) {
      console.error('Cognito confirmation error:', cognitoError);
      
      // Handle specific Cognito errors
      if (cognitoError.name === 'CodeMismatchException') {
        return NextResponse.json(
          { success: false, error: 'Invalid confirmation code. Please check the code and try again.' },
          { status: 400 }
        );
      } else if (cognitoError.name === 'ExpiredCodeException') {
        return NextResponse.json(
          { success: false, error: 'Confirmation code has expired. Please request a new one.' },
          { status: 400 }
        );
      } else if (cognitoError.name === 'NotAuthorizedException') {
        return NextResponse.json(
          { success: false, error: 'User is already confirmed or does not exist.' },
          { status: 400 }
        );
      } else if (cognitoError.name === 'LimitExceededException') {
        return NextResponse.json(
          { success: false, error: 'Too many attempts. Please try again later.' },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: 'Confirmation failed. Please try again.' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Confirmation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
