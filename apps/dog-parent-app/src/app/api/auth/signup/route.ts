import { NextRequest, NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
});

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, userType = 'dog-parent' } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
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

    const command = new SignUpCommand({
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
        { Name: 'custom:userType', Value: userType },
      ],
    });

    const result = await cognitoClient.send(command);

    return NextResponse.json({
      success: true,
      userSub: result.UserSub,
      codeDeliveryDetails: result.CodeDeliveryDetails,
      message: 'Signup successful. Please check your email for a verification code.',
    });
  } catch (error: any) {
    console.error('Signup error:', error);

    if (error.name === 'UsernameExistsException') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    if (error.name === 'InvalidPasswordException') {
      return NextResponse.json(
        { error: 'Password does not meet requirements: must include uppercase, lowercase, and numbers' },
        { status: 400 }
      );
    }

    if (error.name === 'InvalidParameterException') {
      return NextResponse.json(
        { error: error.message || 'Invalid parameters provided' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
