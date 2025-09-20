// utils/auth.ts - Simplified version for debugging
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

// Simplified JWT verification for debugging
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
      throw new Error('Token has expired');
    }

    // Check issuer format (should be Cognito)
    if (!payload.iss || !payload.iss.includes('cognito-idp')) {
      console.warn('Unexpected issuer:', payload.iss);
    }

    // Check audience (should match your client ID)
    const expectedClientId = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
    if (expectedClientId && payload.aud !== expectedClientId) {
      console.warn('Audience mismatch. Expected:', expectedClientId, 'Got:', payload.aud);
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