// lib/auth-config.ts

export interface CognitoConfig {
    authority: string;
    client_id: string;
    redirect_uri: string;
    post_logout_redirect_uri: string;
    response_type: string;
    scope: string;
    automaticSilentRenew: boolean;
    loadUserInfo: boolean;
  }
  
  // Get environment variables - these should be available on client side with NEXT_PUBLIC_ prefix
  const region = process.env.NEXT_PUBLIC_AWS_REGION;
  const userPoolId = process.env.NEXT_PUBLIC_AWS_USER_POOL_ID;
  const clientId = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
  
  // Validate required environment variables
  if (!region) {
    throw new Error('NEXT_PUBLIC_AWS_REGION environment variable is required');
  }
  
  if (!userPoolId) {
    throw new Error('NEXT_PUBLIC_AWS_USER_POOL_ID environment variable is required');
  }
  
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID environment variable is required');
  }
  
  // Construct the authority URL from your user pool
  const authority = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
  
  // Base URL for redirects
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'http://localhost:3000';
  
  export const cognitoAuthConfig: CognitoConfig = {
    authority,
    client_id: clientId,
    redirect_uri: `${baseUrl}/auth/callback`,
    post_logout_redirect_uri: baseUrl,
    response_type: 'code',
    scope: 'email openid profile',
    automaticSilentRenew: true,
    loadUserInfo: true,
  };