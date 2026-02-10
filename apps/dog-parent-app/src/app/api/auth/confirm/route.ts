import { NextRequest, NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
});

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    const clientId = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
    if (!clientId) {
      console.error('Missing NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const command = new ConfirmSignUpCommand({
      ClientId: clientId,
      Username: email,
      ConfirmationCode: code,
    });

    await cognitoClient.send(command);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    console.error('Confirm signup error:', error);

    if (error.name === 'CodeMismatchException') {
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    if (error.name === 'ExpiredCodeException') {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (error.name === 'NotAuthorizedException') {
      return NextResponse.json(
        { error: 'User is already confirmed.' },
        { status: 400 }
      );
    }

    if (error.name === 'UserNotFoundException') {
      return NextResponse.json(
        { error: 'User not found. Please sign up again.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
