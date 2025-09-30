import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const cookies = request.cookies.getAll();
    const headers = Object.fromEntries(request.headers.entries());
    
    return NextResponse.json({
      session: session || null,
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      cookies: cookies.map(c => ({
        name: c.name,
        valueLength: c.value?.length || 0,
        hasValue: !!c.value,
      })),
      environment: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV,
        hasTrustHost: !!process.env.NEXTAUTH_TRUST_HOST,
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

