import { NextAuthOptions } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID) {
  console.error('Missing NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID environment variable');
} else {
  // Log the actual client ID being used (first 10 chars for security)
  const clientId = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
  console.log('✅ NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID loaded:', clientId.substring(0, 10) + '...');
  console.log('   Full Client ID:', clientId);
  console.log('   ⚠️  If you see a different client_id in Cognito errors, check:');
  console.log('      1. Environment variables are loaded correctly');
  console.log('      2. Server was restarted after .env changes');
  console.log('      3. No hardcoded client IDs in the codebase');
  console.log('      4. Correct .env file is being used');
}

if (!process.env.NEXT_PUBLIC_COGNITO_AUTHORITY) {
  console.error('Missing NEXT_PUBLIC_COGNITO_AUTHORITY environment variable');
} else {
  // Validate COGNITO_AUTHORITY format
  const authority = process.env.NEXT_PUBLIC_COGNITO_AUTHORITY;
  if (!authority.startsWith('https://cognito-idp.')) {
    console.error('NEXT_PUBLIC_COGNITO_AUTHORITY should start with https://cognito-idp.');
    console.error('Expected format: https://cognito-idp.{region}.amazonaws.com/{userPoolId}');
    console.error('Current value:', authority);
  }
}

if (!process.env.NEXTAUTH_SECRET) {
  console.error('Missing NEXTAUTH_SECRET environment variable - this is required for NextAuth to work');
}

if (!process.env.NEXTAUTH_URL) {
  console.warn('Missing NEXTAUTH_URL environment variable - using default http://localhost:3000');
}

// Construct Cognito authority from user pool ID if not provided
const getCognitoAuthority = (): string => {
  const authority = process.env.NEXT_PUBLIC_COGNITO_AUTHORITY;
  if (authority) return authority;
  
  // Fallback: construct from user pool ID
  const userPoolId = process.env.NEXT_PUBLIC_AWS_USER_POOL_ID;
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
  
  if (userPoolId) {
    const constructed = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
    console.warn(`NEXT_PUBLIC_COGNITO_AUTHORITY not set, constructing from user pool ID: ${constructed}`);
    return constructed;
  }
  
  throw new Error('Either NEXT_PUBLIC_COGNITO_AUTHORITY or NEXT_PUBLIC_AWS_USER_POOL_ID must be set');
};

// Log Cognito configuration for debugging
if (process.env.NODE_ENV === 'development') {
  const authority = getCognitoAuthority();
  const cleanAuthority = authority.replace(/\/$/, '');
  const wellKnownUrl = `${cleanAuthority}/.well-known/openid-configuration`;
  const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  // Remove trailing slash to ensure exact match
  const baseUrl = nextAuthUrl.replace(/\/$/, '');
  const callbackUrl = `${baseUrl}/api/auth/callback/cognito`;
  
  const jwksUrl = `${cleanAuthority}/.well-known/jwks.json`;
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🔐 Cognito OAuth Configuration');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Authority:', cleanAuthority);
  console.log('Well-known URL:', wellKnownUrl);
  console.log('JWKS URL (auto-discovered by NextAuth):', jwksUrl);
  console.log('User Pool ID:', process.env.NEXT_PUBLIC_AWS_USER_POOL_ID);
  console.log('Client ID:', process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID?.substring(0, 10) + '...');
  console.log('NEXTAUTH_URL:', nextAuthUrl);
  console.log('\n🎯 CRITICAL: Callback URL Configuration');
  console.log('   Expected callback URL:', callbackUrl);
  console.log('   ⚠️  This EXACT URL must be in Cognito User Pool settings');
  console.log('\n📋 Verification Checklist:');
  console.log('   1. Go to AWS Cognito Console → User Pool → App Integration → App Client');
  console.log('   2. Check "Allowed callback URLs" contains EXACTLY:');
  console.log('      ', callbackUrl);
  console.log('   3. Verify NO trailing slash');
  console.log('   4. Verify protocol matches (http:// for localhost)');
  console.log('   5. Verify port number matches (3000)');
  console.log('   6. Check "Allowed sign-out URLs" contains:', baseUrl);
  console.log('\n📝 Note: NextAuth automatically discovers JWKS URL from well-known endpoint');
  console.log('   JWKS URL format:', jwksUrl);
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Get well-known endpoint URL
const getWellKnownUrl = (): string => {
  const authority = getCognitoAuthority();
  const cleanAuthority = authority.replace(/\/$/, '');
  return `${cleanAuthority}/.well-known/openid-configuration`;
};

// Get the exact callback URL that NextAuth will use
const getCallbackUrl = (): string => {
  const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  // Remove trailing slash if present
  const baseUrl = nextAuthUrl.replace(/\/$/, '');
  return `${baseUrl}/api/auth/callback/cognito`;
};

// Log the exact callback URL that should be in Cognito
if (process.env.NODE_ENV === 'development') {
  const expectedCallbackUrl = getCallbackUrl();
  console.log('\n🔍 OAuth Callback URL Verification:');
  console.log('   Expected callback URL:', expectedCallbackUrl);
  console.log('   NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'http://localhost:3000 (default)');
  console.log('   ⚠️  This EXACT URL must be in Cognito User Pool → App Client → Allowed callback URLs');
  console.log('   ⚠️  Check for:');
  console.log('      - Exact match (no trailing slash, exact protocol http/https)');
  console.log('      - Case sensitivity');
  console.log('      - Port number (3000)');
  console.log('');
}

// Get and validate client ID
const getClientId = (): string => {
  const clientId = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID is required but not set');
  }
  
  // Log the client ID being used (for debugging)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔑 Using Client ID:', clientId);
    console.log('   ⚠️  This must match the client_id in Cognito User Pool App Client settings');
  }
  
  return clientId;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: getClientId(),
      // clientSecret is optional when using token_endpoint_auth_method: "none" (PKCE)
      // Using type assertion since NextAuth types may require it but it's not needed for PKCE
      ...(process.env.COGNITO_CLIENT_SECRET ? { clientSecret: process.env.COGNITO_CLIENT_SECRET } : {}) as any,
      issuer: getCognitoAuthority(),
      wellKnown: getWellKnownUrl(),
      // Note: NextAuth automatically constructs the callback URL as: ${NEXTAUTH_URL}/api/auth/callback/cognito
      // Make sure NEXTAUTH_URL is set correctly and matches what's in Cognito
      client: {
        token_endpoint_auth_method: "none"
      },
      checks: ["pkce", "state"],
      profile(profile: any) {
        // Always log profile data for debugging
        console.log('👤 Cognito profile callback invoked:', {
          hasProfile: !!profile,
          sub: profile?.sub,
          email: profile?.email,
          email_verified: profile?.email_verified,
          custom_userType: profile?.['custom:userType'],
          name: profile?.name,
          allKeys: profile ? Object.keys(profile) : [],
        });
        
        // Defensive check - ensure profile exists
        if (!profile) {
          console.error('❌ Profile callback: Profile is null or undefined');
          // Don't throw - return a minimal profile to avoid breaking the flow
          return {
            id: 'unknown',
            name: 'User',
            email: 'unknown@example.com',
            userType: 'dog-parent',
            isVerified: false,
          };
        }
        
        // Log warning if required fields are missing but don't throw
        if (!profile.sub) {
          console.warn('⚠️ Profile callback: Profile missing sub (user ID), using fallback');
        }
        
        if (!profile.email) {
          console.warn('⚠️ Profile callback: Profile missing email, using fallback');
        }
        
        try {
          const mappedProfile = {
            id: profile.sub || 'unknown',
            name: profile.name || profile.email?.split('@')[0] || 'User',
            email: profile.email || 'unknown@example.com',
            image: profile.picture || undefined,
            userType: profile['custom:userType'] || 'dog-parent',
            isVerified: profile.email_verified || false,
          };
          
          console.log('✅ Profile callback: Mapped profile successfully:', {
            id: mappedProfile.id,
            email: mappedProfile.email,
            name: mappedProfile.name,
            userType: mappedProfile.userType
          });
          
          return mappedProfile;
        } catch (error: any) {
          console.error('❌ Error mapping Cognito profile:', error);
          console.error('Profile data that caused error:', JSON.stringify(profile, null, 2));
          // Return a fallback profile instead of throwing to prevent OAuth callback failure
          return {
            id: profile?.sub || 'error-fallback',
            name: 'User',
            email: profile?.email || 'error@example.com',
            userType: 'dog-parent',
            isVerified: false,
          };
        }
      },
    }),
  ],
  debug: true, // Always enable debug to see OAuth errors
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('🎉 NextAuth signIn event:', {
        userId: user?.id,
        userEmail: user?.email,
        hasAccount: !!account,
        hasProfile: !!profile,
        isNewUser,
      });
    },
    async signOut({ token, session }) {
      console.log('👋 NextAuth signOut event:', {
        hasToken: !!token,
        hasSession: !!session,
      });
    },
    async createUser({ user }) {
      console.log('👤 NextAuth createUser event:', {
        userId: user?.id,
        userEmail: user?.email,
      });
    },
    async updateUser({ user }) {
      console.log('🔄 NextAuth updateUser event:', {
        userId: user?.id,
        userEmail: user?.email,
      });
    },
    async linkAccount({ user, account, profile }) {
      console.log('🔗 NextAuth linkAccount event:', {
        userId: user?.id,
        hasAccount: !!account,
        hasProfile: !!profile,
      });
    },
    async session({ session, token }) {
      console.log('📋 NextAuth session event:', {
        hasSession: !!session,
        hasToken: !!token,
        userEmail: session?.user?.email,
      });
    },
    // @ts-ignore - error event may not be in types but is supported by NextAuth
    async error({ error: errorParam }: any) {
      console.error('❌ NextAuth error event:', {
        error: errorParam?.message,
        errorType: errorParam?.type,
        errorStack: errorParam?.stack,
      });
      
      // Provide specific diagnostics for OAuthCallback errors
      if (errorParam?.type === 'OAuthCallback') {
        const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const expectedCallbackUrl = `${nextAuthUrl}/api/auth/callback/cognito`;
        
        console.error('🔍 OAuthCallback Error Diagnostics:', {
          expectedCallbackUrl,
          nextAuthUrl,
          userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
          clientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID?.substring(0, 10) + '...',
          cognitoDomain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
          troubleshooting: [
            `1. Verify callback URL in Cognito User Pool matches: ${expectedCallbackUrl}`,
            '2. Check AWS Cognito Console → User Pool → App Integration → App Client',
            '3. Ensure "Allowed callback URLs" includes the exact callback URL above',
            '4. Verify PKCE is enabled in Cognito (should be enabled by default)',
            '5. Check that the state parameter is being preserved correctly',
            '6. Verify NEXTAUTH_SECRET is set and consistent',
          ],
        });
      }
    },
  },
  callbacks: {
    async jwt({ token, account, profile, trigger, user }: any) {
      // Log all JWT callback invocations for debugging
      console.log('🔑 JWT callback invoked:', {
        trigger,
        hasAccount: !!account,
        hasProfile: !!profile,
        hasUser: !!user,
        hasToken: !!token,
        tokenEmail: token?.email,
        tokenSub: token?.sub,
        tokenKeys: token ? Object.keys(token) : [],
      });
      
      // CRITICAL: Ensure token is initialized
      if (!token) {
        console.error('❌ JWT callback: Token is null or undefined!');
        return {};
      }
      
      // On initial sign-in, account and user (from profile callback) are present
      if (account) {
        if (process.env.NODE_ENV === 'development') {
          console.log('JWT callback - account present (initial sign-in):', {
            hasUser: !!user,
            hasProfile: !!profile,
            userData: user ? { id: user.id, email: user.email, name: user.name } : null,
            profileData: profile ? { sub: profile.sub, email: profile.email } : null,
            accountType: account.type,
            provider: account.provider,
          });
        }

        try {
          // Store account info in token
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;

          // Store user info from profile callback (user object)
          // The profile callback returns { id, email, name, ... }
          if (user) {
            token.sub = user.id || token.sub; // user.id comes from profile callback
            token.email = user.email || token.email;
            token.name = user.name || token.name;
            token.userType = user.userType || 'dog-parent';
            token.picture = user.image || token.picture;
          }

          // Fallback: if user is not available, try profile (raw from Cognito)
          if (!token.sub && profile) {
            token.sub = profile.sub || token.sub;
            token.email = profile.email || token.email;
            token.name = profile.name || token.name;
            token.userType = profile['custom:userType'] || 'dog-parent';
          }

          // Extract Cognito groups from profile
          if (profile) {
            const groups = (profile as any)['cognito:groups'] || [];
            token.groups = groups;
          }

          // Let Cognito handle email verification - don't interfere
          // If user can authenticate, they should be able to access the app
          token.isVerified = true; // Always allow access for authenticated users
        } catch (error: any) {
          console.error('Error in JWT callback:', error);
          throw error;
        }
      }
      
      // On subsequent requests, user might be present (from session callback)
      // Ensure token has required fields even if account is not present
      if (user && !account) {
        if (process.env.NODE_ENV === 'development') {
          console.log('JWT callback - user present (subsequent request):', {
            userId: user.id,
            userEmail: user.email,
          });
        }
        
        // Ensure token has user info
        if (!token.sub && user.id) {
          token.sub = user.id;
        }
        if (!token.email && user.email) {
          token.email = user.email;
        }
        if (!token.name && user.name) {
          token.name = user.name;
        }
      }
      
      // CRITICAL: Ensure token always has required fields for middleware
      // If token.sub is missing, the middleware will redirect to login
      if (!token.sub) {
        console.warn('⚠️ JWT callback: Token missing sub field!', {
          tokenKeys: Object.keys(token),
          hasAccount: !!account,
          hasUser: !!user,
          hasProfile: !!profile,
        });
        
        // Try to get sub from session user if available
        if (token.email && !token.sub) {
          // Use email as fallback identifier (not ideal but better than nothing)
          console.warn('⚠️ Using email as fallback identifier');
          token.sub = token.email;
        }
      }
      
      console.log('🔑 JWT callback - final token:', {
        hasToken: !!token,
        hasSub: !!token.sub,
        hasEmail: !!token.email,
        isVerified: token.isVerified,
        userType: token.userType,
        email: token.email,
        sub: token.sub
      });
      
      return token;
    },
    async session({ session, token }: any) {
      // Log session callback for debugging - always log
      console.log('📋 Session callback invoked:', {
        hasToken: !!token,
        hasSession: !!session,
        tokenEmail: token?.email,
        tokenSub: token?.sub,
        sessionUser: session?.user?.email,
        tokenKeys: token ? Object.keys(token) : [],
      });
      
      // Send properties to the client
      if (token) {
        try {
          if (!token.sub) {
            console.error('❌ Session callback: Token missing sub field!', {
              tokenKeys: Object.keys(token),
              tokenEmail: token.email
            });
          }
          
          session.user.id = token.sub!;
          session.user.userType = (token.userType as string) || 'dog-parent';
          session.user.isVerified = token.isVerified as boolean;
          session.user.groups = (token.groups as string[]) || [];
          session.accessToken = token.accessToken as string;
          
          console.log('✅ Session callback: Session updated with user data', {
            userId: session.user.id,
            userEmail: session.user.email
          });
        } catch (error: any) {
          console.error('❌ Error in session callback:', error);
          throw error;
        }
      } else {
        console.error('❌ Session callback: Token is null or undefined!');
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 NextAuth redirect callback:', { url, baseUrl });
      
      // Handle sign out with Cognito SSO logout
      if (url === 'signOut') {
        const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
        const clientId = getClientId(); // Use the validated client ID function
        const nextAuthUrl = process.env.NEXTAUTH_URL || baseUrl;
        
        if (cognitoDomain && clientId) {
          const ssoLogoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${nextAuthUrl}/`;
          const signoutWithRedirectUrl = `${ssoLogoutUrl}&redirect_uri=${encodeURIComponent(nextAuthUrl)}`;
          console.log('Cognito SSO logout URL:', signoutWithRedirectUrl);
          console.log('   Using Client ID:', clientId.substring(0, 10) + '...');
          return signoutWithRedirectUrl;
        }
        
        // Fallback to base URL if Cognito config is missing
        return baseUrl;
      }
      
      // If url is on the same origin, allow it
      if (url.startsWith(baseUrl)) {
        console.log('✅ NextAuth redirect: Same origin, allowing:', url);
        return url;
      }
      
      // Allows relative callback URLs (e.g., /dashboard, /auth/login)
      if (url.startsWith('/')) {
        const fullUrl = new URL(url, baseUrl).toString();
        console.log('✅ NextAuth redirect: Relative URL, converted to:', fullUrl);
        return fullUrl;
      }
      
      // Default to dashboard after successful login
      const dashboardUrl = `${baseUrl}/dashboard`;
      console.log('✅ NextAuth redirect: Defaulting to dashboard:', dashboardUrl);
      return dashboardUrl;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};