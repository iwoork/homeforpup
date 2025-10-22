import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';

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

    const userPoolId = process.env.AWS_USER_POOL_ID;
    if (!userPoolId) {
      console.error('AWS_USER_POOL_ID environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const adminGetUserCommand = new AdminGetUserCommand({
      UserPoolId: userPoolId,
      Username: email,
    });

    try {
      const result = await cognitoClient.send(adminGetUserCommand);
      
      const isVerified = result.UserStatus === 'CONFIRMED';
      
      return NextResponse.json({
        success: true,
        isVerified,
        userStatus: result.UserStatus,
        message: isVerified 
          ? 'User is verified and can sign in' 
          : 'User needs to confirm their email address',
      });
    } catch (cognitoError: any) {
      console.error('Cognito verification check error:', cognitoError);
      
      if (cognitoError.name === 'UserNotFoundException') {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to check verification status' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Verification check API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
