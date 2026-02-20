import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const cookies = request.cookies.getAll();
    const headers = Object.fromEntries(request.headers.entries());

    return NextResponse.json({
      hasSession: !!userId,
      hasUser: !!user,
      userId: userId,
      userEmail: user?.primaryEmailAddress?.emailAddress || '',
      userName: user?.fullName || '',
      cookies: cookies.map(c => ({
        name: c.name,
        valueLength: c.value?.length || 0,
        hasValue: !!c.value,
      })),
      environment: {
        hasClerkKey: !!process.env.CLERK_SECRET_KEY,
        nodeEnv: process.env.NODE_ENV,
      },
      headers: {
        host: headers['host'],
        'x-forwarded-host': headers['x-forwarded-host'],
        'x-forwarded-proto': headers['x-forwarded-proto'],
        origin: headers['origin'],
        referer: headers['referer'],
      },
      url: request.url,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Debug session error:', error);
    return NextResponse.json({
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
