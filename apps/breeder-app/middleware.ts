import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/error',
    '/auth/signup',
    '/auth/test',
    '/auth/debug',
    '/docs',
    '/docs/quick-start',
    '/docs/faq',
    '/docs/complete-guide',
    '/docs/visual-guide',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/robots.txt',
    '/sitemap.xml',
    '/sitemap-index.xml'
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For now, allow all routes without authentication
  // TODO: Re-enable authentication checks later
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
