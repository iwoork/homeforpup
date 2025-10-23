import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'No authenticated user' },
        { status: 401 }
      );
    }

    // For now, we'll assume users are verified if they have a valid session
    // In a production environment, you might want to check Cognito directly
    const isVerified = session.user.isVerified !== false;
    
    return NextResponse.json({
      success: true,
      isVerified,
      email: session.user.email,
      userType: session.user.userType,
      sessionData: {
        hasSession: !!session,
        isVerified: session.user.isVerified,
        email: session.user.email
      }
    });
  } catch (error) {
    console.error('Verification status check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
