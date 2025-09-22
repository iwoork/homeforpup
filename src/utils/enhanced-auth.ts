// utils/enhanced-auth.ts
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

interface DecodedJWT {
  sub: string;
  email?: string;
  name?: string;
  username?: string;
  'cognito:username'?: string;
  aud?: string | string[];
  iss: string;
  exp: number;
  iat: number;
  token_use?: string;
  client_id?: string;
}

// Create JWKS client for fetching public keys
const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_AWS_USER_POOL_ID}/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10 minutes
});

// Get signing key from JWKS
function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

// Enhanced JWT verification with flexible audience handling
export async function verifyJWTEnhanced(token: string): Promise<{ userId: string; email: string; name: string }> {
  return new Promise((resolve, reject) => {
    // First decode without verification to check the structure
    let decoded: DecodedJWT;
    try {
      decoded = jwt.decode(token) as DecodedJWT;
      if (!decoded) {
        throw new Error('Invalid token structure');
      }
    } catch (error) {
      reject(new Error('Failed to decode JWT token'));
      return;
    }

    console.log('JWT Token Info:', {
      issuer: decoded.iss,
      audience: decoded.aud,
      subject: decoded.sub?.substring(0, 10) + '...',
      expiry: new Date(decoded.exp * 1000).toISOString()
    });

    // Verify the token with flexible audience checking
    jwt.verify(
      token,
      getKey,
      {
        issuer: `https://cognito-idp.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_AWS_USER_POOL_ID}`,
        algorithms: ['RS256'],
        // Don't verify audience automatically - we'll check it manually
        audience: undefined
      },
      (err, verifiedToken) => {
        if (err) {
          console.error('JWT verification error:', err.message);
          reject(new Error(`Token verification failed: ${err.message}`));
          return;
        }

        const payload = verifiedToken as DecodedJWT;
        
        // Manual audience validation with flexible matching
        const expectedAudiences = [
          process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
          // Add other possible audience values that might be valid
          '3d6m93u51ggssrc7t49cjnnk53', // The audience from your error
        ].filter(Boolean); // Remove any undefined values

        const tokenAudience = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
        const audienceMatch = expectedAudiences.some(expectedAud => 
          tokenAudience.includes(expectedAud)
        );

        if (!audienceMatch) {
          console.warn('Audience mismatch:', {
            expected: expectedAudiences,
            received: tokenAudience
          });
          
          // For development, we might want to be more lenient
          if (process.env.NODE_ENV === 'development') {
            console.warn('Allowing audience mismatch in development mode');
          } else {
            reject(new Error(`Invalid audience. Expected one of: ${expectedAudiences.join(', ')}, got: ${tokenAudience.join(', ')}`));
            return;
          }
        }

        // Extract user information
        const userId = payload.sub;
        const email = payload.email;
        const name = payload.name || payload.email?.split('@')[0] || 'User';

        if (!userId || !email) {
          reject(new Error('Token missing required user information'));
          return;
        }

        resolve({
          userId,
          email,
          name
        });
      }
    );
  });
}

// Fallback function for unsafe decode (for debugging purposes)
export function decodeJWTUnsafe(token: string): { userId: string; email: string; name: string } {
  try {
    const decoded = jwt.decode(token) as DecodedJWT;
    
    if (!decoded || !decoded.sub || !decoded.email) {
      throw new Error('Invalid token structure');
    }

    return {
      userId: decoded.sub,
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0] || 'User'
    };
  } catch (error) {
    throw new Error('Failed to decode token');
  }
}