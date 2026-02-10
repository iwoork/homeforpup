import { NextRequest, NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  ResendConfirmationCodeCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    const command = new ResendConfirmationCodeCommand({
      ClientId: clientId,
      Username: email,
    });

    const result = await cognitoClient.send(command);

    return NextResponse.json({
      success: true,
      codeDeliveryDetails: result.CodeDeliveryDetails,
      message: 'Verification code resent successfully',
    });
  } catch (error: any) {
    console.error('Resend confirmation error:', error);

    if (error.name === 'UserNotFoundException') {
      return NextResponse.json(
        { error: 'User not found. Please sign up again.' },
        { status: 404 }
      );
    }

    if (error.name === 'LimitExceededException') {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait before trying again.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to resend code. Please try again.' },
      { status: 500 }
    );
  }
}
