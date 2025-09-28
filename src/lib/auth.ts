import { NextAuthOptions } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';

export const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: '',
      issuer: process.env.COGNITO_ISSUER!,
      client: {
        token_endpoint_auth_method: "none"
      },
      checks: ["pkce", "state"],
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.name || profile.email?.split('@')[0] || 'User',
          email: profile.email,
          image: profile.picture,
          userType: profile['custom:userType'] || 'adopter',
          isVerified: profile.email_verified || false,
        };
      },
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  trustHost: true, // Allow any host in development
  callbacks: {
    async jwt({ token, account, profile }: any) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.userType = profile?.userType || 'adopter';
        token.isVerified = profile?.isVerified || false;
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
      // Handle redirects properly
      console.log('NextAuth redirect:', { url, baseUrl });
      
      // If url is relative, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // If url is on the same origin, allow it
      if (url.startsWith(baseUrl)) {
        return url;
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