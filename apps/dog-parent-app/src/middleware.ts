import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Skip middleware for auth pages and API routes
    if (pathname.startsWith('/auth/') || pathname.startsWith('/api/')) {
      return NextResponse.next();
    }

    // If user is authenticated but not verified, redirect to confirmation page
    if (token && !token.isVerified) {
      const confirmUrl = new URL('/auth/confirm', req.url);
      if (token.email) {
        confirmUrl.searchParams.set('email', token.email);
      }
      return NextResponse.redirect(confirmUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public pages
        if (pathname === '/' || pathname.startsWith('/auth/') || pathname.startsWith('/api/')) {
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
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
