// lib/auth/cognito-hosted-ui.ts
'use client';

// Simple Hosted UI authentication for Cognito
// This is the most reliable approach and doesn't require special client configurations

export interface AuthResult {
  success: boolean;
  user?: any;
  tokens?: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
  };
  error?: string;
}

export interface SignUpResult {
  success: boolean;
  userId?: string;
  error?: string;
  requiresConfirmation?: boolean;
}

const CLIENT_ID = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'http://localhost:3000/auth/callback';

if (!CLIENT_ID) {
  console.error('❌ NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID is not set');
}

if (!COGNITO_DOMAIN) {
  console.error('❌ NEXT_PUBLIC_COGNITO_DOMAIN is not set');
}

// Generate Hosted UI login URL
export function getLoginUrl(): string {
  if (!CLIENT_ID || !COGNITO_DOMAIN) {
    throw new Error('Missing required environment variables: NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID or NEXT_PUBLIC_COGNITO_DOMAIN');
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'email openid profile',
  });

  return `${COGNITO_DOMAIN}/login?${params.toString()}`;
}

// Generate Hosted UI signup URL
export function getSignUpUrl(): string {
  if (!CLIENT_ID || !COGNITO_DOMAIN) {
    throw new Error('Missing required environment variables: NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID or NEXT_PUBLIC_COGNITO_DOMAIN');
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'email openid profile',
  });

  return `${COGNITO_DOMAIN}/signup?${params.toString()}`;
}

// Generate Hosted UI logout URL
export function getLogoutUrl(): string {
  if (!CLIENT_ID || !COGNITO_DOMAIN) {
    throw new Error('Missing required environment variables: NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID or NEXT_PUBLIC_COGNITO_DOMAIN');
  }

  // AWS Cognito logout URL format
  // The logout_uri should be URL encoded
  const logoutUri = encodeURIComponent(REDIRECT_URI);
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    logout_uri: logoutUri,
  });

  return `${COGNITO_DOMAIN}/logout?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string): Promise<AuthResult> {
  try {
    if (!CLIENT_ID || !COGNITO_DOMAIN) {
      throw new Error('Missing required environment variables: NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID or NEXT_PUBLIC_COGNITO_DOMAIN');
    }

    const tokenUrl = `${COGNITO_DOMAIN}/oauth2/token`;
    
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code: code,
      redirect_uri: REDIRECT_URI,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        errorData = { error_description: errorText };
      }
      
      throw new Error(errorData.error_description || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const tokenData = await response.json();

    return {
      success: true,
      tokens: {
        accessToken: tokenData.access_token,
        idToken: tokenData.id_token,
        refreshToken: tokenData.refresh_token,
      },
    };
  } catch (error: any) {
    console.error('Token exchange error:', error);
    return {
      success: false,
      error: error.message || 'Token exchange failed',
    };
  }
}

// Get user info from ID token
export function getUserFromIdToken(idToken: string): any {
  try {
    // Decode JWT payload (simple base64 decode)
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email?.split('@')[0] || 'User',
      userType: payload['custom:userType'] || 'adopter',
      isVerified: payload.email_verified || false,
    };
  } catch (error) {
    console.error('Error decoding ID token:', error);
    return null;
  }
}

// Token management utilities
export function saveTokens(tokens: { accessToken: string; idToken: string; refreshToken: string }) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cognito_tokens', JSON.stringify(tokens));
  }
}

export function getTokens(): { accessToken: string; idToken: string; refreshToken: string } | null {
  if (typeof window !== 'undefined') {
    const tokens = localStorage.getItem('cognito_tokens');
    return tokens ? JSON.parse(tokens) : null;
  }
  return null;
}

export function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cognito_tokens');
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const tokens = getTokens();
  return !!(tokens && tokens.accessToken);
}

// Get current access token
export function getAccessToken(): string | null {
  const tokens = getTokens();
  return tokens?.accessToken || null;
}

// Redirect to login
export function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    window.location.href = getLoginUrl();
  }
}

// Redirect to signup
export function redirectToSignUp(): void {
  if (typeof window !== 'undefined') {
    window.location.href = getSignUpUrl();
  }
}

// Simple logout that just clears tokens and redirects
export function simpleLogout(): void {
  if (typeof window !== 'undefined') {
    clearTokens();
    window.location.href = '/';
  }
}

// Redirect to logout
export function redirectToLogout(): void {
  if (typeof window !== 'undefined') {
    // Clear tokens first
    clearTokens();
    
    // For now, use simple logout to avoid Cognito logout page issues
    // You can uncomment the Cognito logout if you want to use it
    simpleLogout();
    
    // Uncomment below to use Cognito hosted logout (if configured properly)
    // try {
    //   const logoutUrl = getLogoutUrl();
    //   console.log('Logging out via Cognito:', logoutUrl);
    //   window.location.href = logoutUrl;
    // } catch (error) {
    //   console.warn('Cognito logout failed, using simple redirect:', error);
    //   simpleLogout();
    // }
  }
}
