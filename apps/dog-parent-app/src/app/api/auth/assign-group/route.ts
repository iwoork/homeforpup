import { NextRequest, NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
});

export async function POST(request: NextRequest) {
  try {
    const { email, group } = await request.json();

    if (!email || !group) {
      return NextResponse.json(
        { error: 'Email and group are required' },
        { status: 400 }
      );
    }

    const allowedGroups = ['breeders'];
    if (!allowedGroups.includes(group)) {
      return NextResponse.json(
        { error: 'Invalid group' },
        { status: 400 }
      );
    }

    const userPoolId = process.env.NEXT_PUBLIC_AWS_USER_POOL_ID;
    if (!userPoolId) {
      console.error('Missing NEXT_PUBLIC_AWS_USER_POOL_ID');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const command = new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: email,
      GroupName: group,
    });

    await cognitoClient.send(command);

    return NextResponse.json({
      success: true,
      message: `User added to ${group} group`,
    });
  } catch (error: any) {
    console.error('Assign group error:', error);

    if (error.name === 'ResourceNotFoundException') {
      return NextResponse.json(
        { error: 'Group does not exist. Please contact support.' },
        { status: 404 }
      );
    }

    if (error.name === 'UserNotFoundException') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to assign user to group' },
      { status: 500 }
    );
  }
}
