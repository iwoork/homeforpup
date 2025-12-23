import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Skip middleware for auth pages, API routes, and static assets
    if (pathname.startsWith('/auth/') || pathname.startsWith('/api/') || pathname.startsWith('/images/')) {
      return NextResponse.next();
    }

    // Debug logging
    if (process.env.NODE_ENV === 'development' && token) {
      console.log('Middleware debug:', {
        pathname,
        hasToken: !!token,
        isVerified: token.isVerified,
        email: token.email,
        userType: token.userType
      });
    }

    // Remove custom email verification logic - let Cognito handle it naturally
    // Cognito will automatically handle email verification during the sign-in process
    // We should not interfere with Cognito's built-in verification flow
    
    if (process.env.NODE_ENV === 'development' && token) {
      console.log('Middleware - allowing access for user:', token.email, 'isVerified:', token.isVerified);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public pages and static assets
        if (pathname === '/' || pathname.startsWith('/auth/') || pathname.startsWith('/api/') || pathname.startsWith('/images/')) {
          return true;
        }
        
        // Require authentication for protected pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - images folder (static images)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|images/).*)',
  ],
};
