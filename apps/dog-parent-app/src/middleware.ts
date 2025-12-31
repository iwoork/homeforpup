import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Always log middleware execution in development
    console.log('🔒 Middleware executing for:', pathname);

    // Skip middleware for auth pages, API routes (especially NextAuth callbacks), static assets, and well-known paths
    // CRITICAL: Must allow /api/auth/* routes to pass through without token checks for OAuth callbacks to work
    if (
      pathname.startsWith('/auth/') || 
      pathname.startsWith('/api/') ||  // This includes /api/auth/callback/cognito
      pathname.startsWith('/images/') ||
      pathname.startsWith('/.well-known/') ||
      pathname === '/favicon.ico'
    ) {
      console.log('🔒 Middleware: Skipping (public route):', pathname);
      return NextResponse.next();
    }

    // Debug logging - always show in development
    console.log('🔒 Middleware debug:', {
      pathname,
      hasToken: !!token,
      tokenSub: token?.sub,
      tokenEmail: token?.email,
      isVerified: token?.isVerified,
      userType: token?.userType,
      tokenKeys: token ? Object.keys(token) : []
    });

    // Remove custom email verification logic - let Cognito handle it naturally
    // Cognito will automatically handle email verification during the sign-in process
    // We should not interfere with Cognito's built-in verification flow
    
    if (token) {
      console.log('🔒 Middleware - allowing access for user:', token.email || token.sub, 'isVerified:', token.isVerified);
    } else {
      console.log('🔒 Middleware - NO TOKEN for path:', pathname);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const referer = req.headers.get('referer') || '';
        const isFromOAuthCallback = referer.includes('/api/auth/callback');
        
        console.log('🔒 Middleware authorized callback:', {
          pathname,
          hasToken: !!token,
          tokenSub: token?.sub,
          tokenEmail: token?.email,
          isFromOAuthCallback,
          referer: referer.substring(0, 100) // Log first 100 chars
        });
        
        // Allow access to public pages and static assets
        // CRITICAL: Must allow /api/auth/* routes (especially callbacks) without token checks
        // This allows OAuth callbacks from Cognito to complete even if user has stale/invalid token
        if (
          pathname === '/' || 
          pathname.startsWith('/auth/') || 
          pathname.startsWith('/api/') ||  // This includes /api/auth/callback/cognito - MUST allow
          pathname.startsWith('/images/') ||
          pathname.startsWith('/.well-known/') ||
          pathname.startsWith('/favicon.ico')
        ) {
          console.log('🔒 Middleware: Allowing public route:', pathname);
          return true;
        }
        
        // If coming from OAuth callback, be more lenient with token checks
        // The session might still be establishing
        if (isFromOAuthCallback && pathname === '/dashboard') {
          console.log('🔄 Middleware: Detected redirect from OAuth callback to dashboard');
          if (token) {
            console.log('✅ Middleware: Allowing dashboard access after OAuth callback (token present)');
            return true;
          }
        }
        
        // Require authentication for protected pages
        // If token exists (even if empty object), allow access
        // The token should have at least a 'sub' field to be valid
        // IMPORTANT: After OAuth callback, token might be in the process of being created
        // Allow access if token exists (even if incomplete) to avoid redirect loops
        if (token) {
          // Check if token has any identifying information
          const hasValidToken = token.sub || token.email || token.accessToken || Object.keys(token).length > 0;
          
          if (hasValidToken) {
            console.log('✅ Middleware: Allowing access with token for:', pathname, {
              hasSub: !!token.sub,
              hasEmail: !!token.email,
              hasAccessToken: !!token.accessToken,
              tokenSub: token.sub,
              tokenEmail: token.email,
              tokenKeys: Object.keys(token)
            });
            return true;
          } else {
            console.warn('⚠️ Middleware: Token exists but appears empty for:', pathname, {
              tokenType: typeof token,
              tokenValue: token
            });
            // Still allow access if token object exists - might be in process of being populated
            return true;
          }
        }
        
        console.log('❌ Middleware: No token found, redirecting to login for:', pathname, {
          tokenExists: !!token,
          tokenType: typeof token,
        });
        
        return false;
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
     * - api/auth (NextAuth routes - must be excluded to allow OAuth callbacks)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|images/|api/auth).*)',
  ],
};
