import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'No authenticated user' },
        { status: 401 }
      );
    }

    // Force a session refresh by returning a success response
    // The client should then refresh the session
    return NextResponse.json({
      success: true,
      message: 'Session refresh requested',
      email: session.user.email
    });
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
