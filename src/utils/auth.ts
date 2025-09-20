// src/utils/auth.ts
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// JWKS client for Cognito
const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.amazonaws.com/${process.env.NEXT_PUBLIC_AWS_USER_POOL_ID}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5
});

function getKey(header: any): Promise<string> {
  return new Promise((resolve, reject) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        reject(err);
      } else {
        const signingKey = key?.getPublicKey();
        resolve(signingKey || '');
      }
    });
  });
}

export async function verifyJWT(token: string): Promise<{ userId: string; name: string; email: string }> {
  try {
    // For development - if no token or invalid token format, use mock data
    if (!token || token === 'undefined' || token === 'null' || !token.includes('.')) {
      console.warn('Invalid or missing token, using mock data for development');
      return {
        userId: 'current-user',
        name: 'Current User',
        email: 'user@example.com'
      };
    }

    // Decode the header to get the key ID
    const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString());
    
    // Get the signing key
    const signingKey = await getKey(header);
    
    // Verify the token
    const decoded = jwt.verify(token, signingKey, {
      audience: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
      issuer: `https://cognito-idp.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.amazonaws.com/${process.env.NEXT_PUBLIC_AWS_USER_POOL_ID}`,
      algorithms: ['RS256']
    }) as any;

    return {
      userId: decoded.sub,
      name: decoded.name || decoded.given_name || decoded.cognito_username || 'Unknown User',
      email: decoded.email || 'user@example.com'
    };

  } catch (error) {
    console.error('JWT verification failed:', error);
    
    // In development, fall back to mock data
    if (process.env.NODE_ENV === 'development') {
      console.warn('Falling back to mock data for development');
      return {
        userId: 'current-user',
        name: 'Current User',
        email: 'user@example.com'
      };
    }
    
    // In production, throw the error
    throw new Error('Invalid or expired token');
  }
}

// Get user from browser storage (for client-side) - Fixed for OIDC
export function getCurrentUserFromStorage(): { userId: string; name: string; email: string } | null {
  if (typeof window === 'undefined') {
    return null; // Server-side
  }

  try {
    // First, try to find the OIDC storage key by checking all localStorage keys
    const oidcStorageKey = Object.keys(localStorage).find(key => 
      key.startsWith('oidc.user:') && key.includes(process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID || '')
    );

    if (oidcStorageKey) {
      const oidcStorage = localStorage.getItem(oidcStorageKey);
      console.log('Found OIDC storage:', oidcStorageKey, oidcStorage ? 'Data exists' : 'No data');
      
      if (oidcStorage) {
        const userData = JSON.parse(oidcStorage);
        console.log('OIDC user data:', userData);
        
        const profile = userData.profile;
        if (profile && profile.sub) {
          return {
            userId: profile.sub,
            name: profile.name || profile.given_name || profile.cognito_username || 'Unknown User',
            email: profile.email || 'user@example.com'
          };
        }
      }
    }

    // Alternative: Check if there's a simpler key pattern
    const cognitoAuthority = process.env.NEXT_PUBLIC_COGNITO_AUTHORITY;
    const clientId = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
    
    if (cognitoAuthority && clientId) {
      const specificKey = `oidc.user:${cognitoAuthority}:${clientId}`;
      console.log('Trying specific OIDC key:', specificKey);
      
      const specificStorage = localStorage.getItem(specificKey);
      if (specificStorage) {
        const userData = JSON.parse(specificStorage);
        console.log('Found user with specific key:', userData);
        
        const profile = userData.profile;
        if (profile && profile.sub) {
          return {
            userId: profile.sub,
            name: profile.name || profile.given_name || profile.cognito_username || 'Unknown User',
            email: profile.email || 'user@example.com'
          };
        }
      }
    }

    // Debug: Log all localStorage keys that might contain user data
    console.log('All localStorage keys:', Object.keys(localStorage));
    const oidcKeys = Object.keys(localStorage).filter(key => key.includes('oidc'));
    console.log('OIDC-related keys:', oidcKeys);

    // Fallback: try to get from session storage
    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) {
      console.log('Found user in sessionStorage');
      return JSON.parse(sessionUser);
    }

    console.log('No user found in any storage location');
    return null;
  } catch (error) {
    console.error('Error getting user from storage:', error);
    return null;
  }
}

// Server-side method: Extract user from request headers
export async function getCurrentUserFromRequest(request: Request): Promise<{ userId: string; name: string; email: string }> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authorization header found');
  }

  const token = authHeader.replace('Bearer ', '');
  return await verifyJWT(token);
}

// Enhanced getCurrentUser function with better debugging
export function getCurrentUser(): { userId: string; name: string; email: string } {
  console.log('getCurrentUser called');
  
  // Try to get from storage first (client-side)
  const storageUser = getCurrentUserFromStorage();
  if (storageUser) {
    console.log('Found user from storage:', storageUser);
    return storageUser;
  }

  // Debug environment variables
  console.log('Environment check:', {
    cognitoAuthority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY,
    clientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
    userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
    region: process.env.NEXT_PUBLIC_AWS_REGION
  });

  // Fallback to mock data
  console.warn('No user found in storage, using mock data');
  return {
    userId: 'current-user',
    name: 'Current User',
    email: 'user@example.com'
  };
}

// Utility to check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false; // Server-side
  }

  const user = getCurrentUserFromStorage();
  return user !== null;
}

// Enhanced getAccessToken with better debugging
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null; // Server-side
  }

  try {
    console.log('Getting access token...');
    
    // First, try to find ANY OIDC storage key
    const allOidcKeys = Object.keys(localStorage).filter(key => key.includes('oidc'));
    console.log('All OIDC keys found:', allOidcKeys);

    for (const key of allOidcKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        console.log(`Checking key: ${key}`);
        try {
          const userData = JSON.parse(value);
          console.log('User data structure:', Object.keys(userData));
          
          // Check for access_token in different possible locations
          if (userData.access_token) {
            console.log('Found access_token in root');
            return userData.access_token;
          }
          if (userData.accessToken) {
            console.log('Found accessToken in root');
            return userData.accessToken;
          }
          if (userData.id_token) {
            console.log('Found id_token, using as fallback');
            return userData.id_token;
          }
          if (userData.profile?.access_token) {
            console.log('Found access_token in profile');
            return userData.profile.access_token;
          }
        } catch (parseError) {
          console.log(`Failed to parse ${key}:`, parseError);
        }
      }
    }

    // Try the useAuth hook's stored token pattern
    const userKeys = Object.keys(localStorage).filter(key => 
      key.includes('user') || key.includes('auth') || key.includes('token')
    );
    console.log('User/auth related keys:', userKeys);

    for (const key of userKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const data = JSON.parse(value);
          if (data.access_token || data.accessToken || data.token) {
            console.log(`Found token in ${key}`);
            return data.access_token || data.accessToken || data.token;
          }
        } catch {
          // If it's not JSON, check if it's a raw token
          if (value.includes('.') && value.split('.').length === 3) {
            console.log(`Found raw JWT token in ${key}`);
            return value;
          }
        }
      }
    }

    console.log('No access token found in any storage location');
    return null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

// Function to get token from useAuth hook context (alternative approach)
export function getTokenFromAuthContext(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Check if the useAuth hook stores token differently
    // This pattern is common with react-oidc-context
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('oidc') && key.includes('user')
    );

    for (const key of authKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const userData = JSON.parse(value);
          // Check for different token field names
          const token = userData.access_token || 
                       userData.id_token || 
                       userData.token ||
                       userData.accessToken;
          
          if (token) {
            console.log('Found token via auth context pattern');
            return token;
          }
        } catch (error) {
          console.log('Error parsing auth context data:', error);
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting token from auth context:', error);
    return null;
  }
}

// For development: Set a mock token manually
export function setMockToken(token: string = 'mock-development-token'): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dev-auth-token', token);
    console.log('Mock token set for development');
  }
}

// For development: Get mock token
export function getMockToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dev-auth-token');
  }
  return null;
}

// Debug function to help troubleshoot OIDC storage
export function debugOIDCStorage(): void {
  if (typeof window === 'undefined') {
    console.log('Running on server-side, no localStorage available');
    return;
  }

  console.log('=== OIDC Storage Debug ===');
  console.log('Environment variables:');
  console.log('- NEXT_PUBLIC_COGNITO_AUTHORITY:', process.env.NEXT_PUBLIC_COGNITO_AUTHORITY);
  console.log('- NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID:', process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID);
  console.log('- NEXT_PUBLIC_AWS_USER_POOL_ID:', process.env.NEXT_PUBLIC_AWS_USER_POOL_ID);
  console.log('- NEXT_PUBLIC_AWS_REGION:', process.env.NEXT_PUBLIC_AWS_REGION);
  
  console.log('\nAll localStorage keys:');
  Object.keys(localStorage).forEach(key => {
    console.log(`- ${key}`);
  });
  
  console.log('\nOIDC-related keys:');
  const oidcKeys = Object.keys(localStorage).filter(key => 
    key.includes('oidc') || key.includes('cognito') || key.includes('auth')
  );
  oidcKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`- ${key}:`, value ? 'Has data' : 'Empty');
    if (value && key.includes('oidc.user')) {
      try {
        const parsed = JSON.parse(value);
        console.log('  └─ Profile:', parsed.profile ? 'Available' : 'Missing');
        console.log('  └─ Access Token:', parsed.access_token ? 'Available' : 'Missing');
        console.log('  └─ ID Token:', parsed.id_token ? 'Available' : 'Missing');
        console.log('  └─ Expires at:', parsed.expires_at ? new Date(parsed.expires_at * 1000) : 'Missing');
      } catch (e) {
        console.log('  └─ Parse error:', e);
      }
    }
  });
}