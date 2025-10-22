import { NextAuthOptions } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';

export const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID!,
      clientSecret: '',
      issuer: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY!,
      client: {
        token_endpoint_auth_method: "none"
      },
      checks: ["pkce", "state"],
      profile(profile: any) {
        // Debug logging for profile data
        if (process.env.NODE_ENV === 'development') {
          console.log('Cognito profile data:', {
            sub: profile.sub,
            email: profile.email,
            email_verified: profile.email_verified,
            custom_userType: profile['custom:userType'],
            allKeys: Object.keys(profile)
          });
        }
        
        return {
          id: profile.sub,
          name: profile.name || profile.email?.split('@')[0] || 'User',
          email: profile.email,
          image: profile.picture,
          userType: profile['custom:userType'] || 'dog-parent',
          isVerified: profile.email_verified || false,
        };
      },
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, account, profile }: any) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        if (process.env.NODE_ENV === 'development') {
          console.log('JWT callback - account present:', {
            hasProfile: !!profile,
            profileIsVerified: profile?.isVerified,
            profileUserType: profile?.userType
          });
        }
        
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.userType = profile?.userType || 'dog-parent';
        token.isVerified = profile?.isVerified || false;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('JWT callback - final token:', {
          hasToken: !!token,
          isVerified: token.isVerified,
          userType: token.userType,
          email: token.email
        });
      }
      
      return token;
    },
    async session({ session, token }: any) {
      // Send properties to the client
      if (token) {
        session.user.id = token.sub!;
        session.user.userType = token.userType as string;
        session.user.isVerified = token.isVerified as boolean;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect:', { url, baseUrl });
      
      // Handle sign out with Cognito SSO logout
      if (url === 'signOut') {
        const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
        const clientId = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
        const nextAuthUrl = process.env.NEXTAUTH_URL || baseUrl;
        
        if (cognitoDomain && clientId) {
          const ssoLogoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${nextAuthUrl}/`;
          const signoutWithRedirectUrl = `${ssoLogoutUrl}&redirect_uri=${encodeURIComponent(nextAuthUrl)}`;
          console.log('Cognito SSO logout URL:', signoutWithRedirectUrl);
          return signoutWithRedirectUrl;
        }
        
        // Fallback to base URL if Cognito config is missing
        return baseUrl;
      }
      
      // If url is on the same origin, allow it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Allows relative callback URLs
      if (url.startsWith('/')) {
        return new URL(url, baseUrl).toString();
      }
      
      // Default to dashboard
      return `${baseUrl}/dashboard`;
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
};