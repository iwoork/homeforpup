import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

// Export handlers with comprehensive error logging
export async function GET(req: any, res: any) {
  try {
    const url = req?.url || req?.headers?.get?.('url') || '';
    const pathname = url ? new URL(url, 'http://localhost:3000').pathname : 'unknown';
    
    console.log('🔵 NextAuth GET request:', { pathname, url });
    
    // Log callback requests specifically
    // CRITICAL: OAuth callbacks must be processed even if user has a stale/invalid session
    if (pathname.includes('/callback/')) {
      const searchParams = url.includes('?') ? new URL(url, 'http://localhost:3000').searchParams : null;
      const errorParam = searchParams?.get('error');
      const errorDescription = searchParams?.get('error_description');
      
      console.log('🔄 OAuth callback GET request detected:', {
        pathname,
        code: searchParams?.get('code') ? 'present' : 'missing',
        state: searchParams?.get('state') ? 'present' : 'missing',
        error: errorParam || 'none',
        errorDescription: errorDescription || 'none',
        fullUrl: url,
      });
      
      // If there's an error from Cognito, log detailed diagnostics
      if (errorParam) {
        const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const expectedCallbackUrl = `${nextAuthUrl.replace(/\/$/, '')}/api/auth/callback/cognito`;
        
        console.error('❌ Cognito returned an error in callback:', {
          error: errorParam,
          errorDescription,
          expectedCallbackUrl,
          actualRequestUrl: url,
          troubleshooting: [
            `1. Verify callback URL in Cognito matches EXACTLY: ${expectedCallbackUrl}`,
            '2. Check for trailing slashes, protocol (http vs https), port numbers',
            '3. Ensure the URL in Cognito has NO trailing slash',
            '4. Verify NEXTAUTH_URL environment variable is set correctly',
            '5. Check AWS Cognito Console → User Pool → App Integration → App Client → Allowed callback URLs',
          ],
        });
      }
    }
    
    const response = await handler(req, res);
    
    // Check if response indicates an error redirect
    if (response && typeof response === 'object' && 'url' in response) {
      const responseUrl = response.url as string;
      if (responseUrl.includes('/auth/login') && responseUrl.includes('error=')) {
        console.warn('⚠️ NextAuth redirecting to login with error - should redirect to error page instead');
      }
    }
    
    return response;
  } catch (error: any) {
    console.error('❌ NextAuth GET error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      pathname: req?.url ? new URL(req.url, 'http://localhost:3000').pathname : 'unknown',
    });
    
    // If it's an OAuth callback error, provide more context
    if (error.message?.includes('callback') || error.message?.includes('OAuth')) {
      console.error('🔍 OAuth callback error details:', {
        errorMessage: error.message,
        errorStack: error.stack,
        possibleCauses: [
          'Callback URL mismatch in Cognito User Pool settings',
          'PKCE verification failure',
          'State parameter mismatch',
          'Token exchange failure',
          'Missing or incorrect client secret (if required)',
        ],
      });
    }
    
    throw error;
  }
}

export async function POST(req: any, res: any) {
  try {
    const url = req?.url || req?.headers?.get?.('url') || '';
    const pathname = url ? new URL(url, 'http://localhost:3000').pathname : 'unknown';
    
    console.log('🟢 NextAuth POST request:', { pathname, url });
    
    // Log callback requests specifically
    if (pathname.includes('/callback/')) {
      const searchParams = url.includes('?') ? new URL(url, 'http://localhost:3000').searchParams : null;
      console.log('🔄 OAuth callback POST request detected:', {
        pathname,
        code: searchParams?.get('code') ? 'present' : 'missing',
        state: searchParams?.get('state') ? 'present' : 'missing',
        error: searchParams?.get('error') || 'none',
        errorDescription: searchParams?.get('error_description') || 'none',
        fullUrl: url,
      });
    }
    
    const response = await handler(req, res);
    
    // Check if response indicates an error redirect
    if (response && typeof response === 'object' && 'url' in response) {
      const responseUrl = response.url as string;
      if (responseUrl.includes('/auth/login') && responseUrl.includes('error=')) {
        console.warn('⚠️ NextAuth redirecting to login with error - should redirect to error page instead');
      }
    }
    
    return response;
  } catch (error: any) {
    console.error('❌ NextAuth POST error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      pathname: req?.url ? new URL(req.url, 'http://localhost:3000').pathname : 'unknown',
    });
    
    // If it's an OAuth callback error, provide more context
    if (error.message?.includes('callback') || error.message?.includes('OAuth')) {
      console.error('🔍 OAuth callback error details:', {
        errorMessage: error.message,
        errorStack: error.stack,
        possibleCauses: [
          'Callback URL mismatch in Cognito User Pool settings',
          'PKCE verification failure',
          'State parameter mismatch',
          'Token exchange failure',
          'Missing or incorrect client secret (if required)',
        ],
      });
    }
    
    throw error;
  }
}
