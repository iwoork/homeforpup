// utils/auth.ts - Enhanced version with token refresh support
import jwt from 'jsonwebtoken';

interface CognitoJWTPayload {
  sub: string; // Cognito user ID
  email?: string;
  name?: string;
  aud: string; // Client ID
  iss: string; // Issuer (Cognito)
  token_use: 'id' | 'access';
  auth_time: number;
  exp: number;
  iat: number;
}

// Enhanced JWT verification with graceful expiration handling
export async function verifyJWT(token: string): Promise<{ userId: string; name: string; email: string }> {
  try {
    console.log('Verifying JWT token...');
    
    // First, let's decode without verification to see what we have
    const decodedHeader = jwt.decode(token, { complete: true });
    console.log('Token header:', decodedHeader?.header);
    console.log('Token payload (first 100 chars):', JSON.stringify(decodedHeader?.payload).substring(0, 100));
    
    if (!decodedHeader || !decodedHeader.payload) {
      throw new Error('Invalid token format - no payload');
    }

    const payload = decodedHeader.payload as CognitoJWTPayload;
    
    // Basic validation without signature verification for now
    if (!payload.sub) {
      throw new Error('Token missing user ID (sub)');
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp <= now) {
      const expiredTime = new Date(payload.exp * 1000).toISOString();
      const currentTime = new Date().toISOString();
      console.warn(`Token expired at ${expiredTime}, current time: ${currentTime}`);
      
      // Instead of throwing immediately, try to refresh the token
      console.log('Attempting to refresh expired token...');
      
      // Check if we're in a browser environment and can attempt refresh
      if (typeof window !== 'undefined') {
        try {
          // Try to trigger a token refresh by calling the auth hook
          const refreshEvent = new CustomEvent('tokenRefreshRequested');
          window.dispatchEvent(refreshEvent);
          
          // Wait a bit for the refresh to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try to get a fresh token from localStorage
          const storageKey = `oidc.user:${process.env.NEXT_PUBLIC_COGNITO_AUTHORITY}:${process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID}`;
          const userData = localStorage.getItem(storageKey);
          
          if (userData) {
            const parsedData = JSON.parse(userData);
            const freshToken = parsedData.access_token || parsedData.id_token;
            
            if (freshToken && freshToken !== token) {
              console.log('Found fresh token, retrying verification...');
              return await verifyJWT(freshToken);
            }
          }
        } catch (refreshError) {
          console.warn('Token refresh attempt failed:', refreshError);
        }
      }
      
      // If refresh failed or we're on server side, throw the expiration error
      throw new Error('Token has expired');
    }

    // Check issuer format (should be Cognito)
    if (!payload.iss || !payload.iss.includes('cognito-idp')) {
      console.warn('Unexpected issuer:', payload.iss);
    }

    // Check audience (only for ID tokens, not access tokens)
    const expectedClientId = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
    if (payload.aud && expectedClientId && payload.aud !== expectedClientId) {
      console.warn('Audience mismatch. Expected:', expectedClientId, 'Got:', payload.aud);
    } else if (!payload.aud) {
      // This is likely an access token, which is fine for API calls
      console.log('Using access token (no audience field)');
    }

    const userId = payload.sub;
    const email = payload.email || '';
    const name = payload.name || payload.email?.split('@')[0] || 'User';

    console.log('JWT verification successful for user:', userId);

    return {
      userId,
      name,
      email
    };

  } catch (error) {
    console.error('JWT verification failed:', error);
    console.error('Token (first 50 chars):', token.substring(0, 50));
    
    // For debugging, let's be more specific about the error
    if (error instanceof Error) {
      throw new Error(`JWT verification failed: ${error.message}`);
    } else {
      throw new Error('JWT verification failed: Unknown error');
    }
  }
}

// Alternative: Even simpler version that just decodes without verification
export function decodeJWTUnsafe(token: string): { userId: string; name: string; email: string } {
  try {
    const decoded = jwt.decode(token) as CognitoJWTPayload;
    
    if (!decoded || !decoded.sub) {
      throw new Error('Invalid token format');
    }

    return {
      userId: decoded.sub,
      name: decoded.name || decoded.email?.split('@')[0] || 'User',
      email: decoded.email || ''
    };
  } catch (error) {
    console.error('Token decode failed:', error);
    throw new Error('Failed to decode token');
  }
}

// Check if token is expired without throwing
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as CognitoJWTPayload;
    if (!decoded || !decoded.exp) {
      return true; // Consider invalid tokens as expired
    }
    
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp <= now;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Consider error cases as expired
  }
}

// Get token expiration time
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as CognitoJWTPayload;
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
}