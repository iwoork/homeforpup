// hooks/useAuth.ts
'use client';

import { useAuth as useOidcAuth } from 'react-oidc-context';
import { useEffect, useState, useCallback } from 'react';
import { User } from '@/types';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signIn: (action?: 'login' | 'signup', userType?: 'breeder' | 'adopter') => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  isAuthenticated: boolean;
  getToken: () => string | null;
  refreshToken: () => Promise<boolean>;
  syncUser: (userData?: Partial<User>, providedToken?: string) => Promise<User | null>;
  updateUser: (updates: Partial<User>) => Promise<User | null>;
}

export const useAuth = (): UseAuthReturn => {
  const oidcAuth = useOidcAuth();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Method to get the current JWT token
  const getToken = useCallback((): string | null => {
    if (oidcAuth?.user?.id_token) {
      return oidcAuth.user.id_token;
    }

    if (oidcAuth?.user?.access_token) {
      return oidcAuth.user.access_token;
    }

    // Fallback: try to get from localStorage
    try {
      const storageKey = `oidc.user:${process.env.NEXT_PUBLIC_COGNITO_AUTHORITY}:${process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID}`;
      const userData = localStorage.getItem(storageKey);
      
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.access_token || parsedData.id_token || null;
      }
    } catch (error) {
      console.warn('Failed to get token from localStorage:', error);
    }

    return null;
  }, [oidcAuth]);

  // Method to refresh the token if needed
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!oidcAuth?.user) {
      console.warn('No user to refresh token for');
      return false;
    }

    try {
      console.log('Attempting to refresh token...');
      await oidcAuth.signinSilent();
      console.log('Token refresh successful');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, [oidcAuth]);

  // Method to sync user data with DynamoDB
  const syncUser = useCallback(async (userData?: Partial<User>, providedToken?: string): Promise<User | null> => {
    const token = providedToken || getToken();
    if (!token) {
      console.warn('No token available for user sync');
      return null;
    }

    try {
      // Check if there's a pending user type from registration
      const pendingUserType = localStorage.getItem('pendingUserType') as 'breeder' | 'adopter' | null;
      if (pendingUserType) {
        localStorage.removeItem('pendingUserType');
      }

      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userType: pendingUserType || userData?.userType || 'adopter',
          ...userData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const { user: syncedUser, isNewUser } = await response.json();
      
      console.log(`User sync successful (${isNewUser ? 'new' : 'existing'} user):`, {
        userId: syncedUser.userId.substring(0, 10) + '...',
        name: syncedUser.name,
        userType: syncedUser.userType
      });

      setUser(syncedUser);
      setError(null);
      return syncedUser;

    } catch (error) {
      console.error('Failed to sync user:', error);
      setError(error instanceof Error ? error.message : 'Failed to sync user data');
      return null;
    }
  }, [getToken]);

  // Method to update user data
  const updateUser = useCallback(async (updates: Partial<User>): Promise<User | null> => {
    if (!user) {
      console.warn('No user to update');
      return null;
    }

    try {
      const updatedUser = await syncUser({ ...user, ...updates });
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user:', error);
      setError(error instanceof Error ? error.message : 'Failed to update user');
      return null;
    }
  }, [user, syncUser]);

  // Update user state when OIDC auth state changes
  useEffect(() => {
    const updateUserState = async () => {
      console.log('useAuth effect running with OIDC state:', {
        isAuthenticated: oidcAuth?.isAuthenticated,
        hasUser: !!oidcAuth?.user,
        isLoading: oidcAuth?.isLoading,
        error: oidcAuth?.error?.message,
        userProfile: oidcAuth?.user?.profile ? {
          sub: oidcAuth.user.profile.sub?.substring(0, 10) + '...',
          email: oidcAuth.user.profile.email,
          name: oidcAuth.user.profile.name
        } : null
      });

      if (!oidcAuth) {
        setError('Authentication context not available');
        return;
      }

      if (oidcAuth.isAuthenticated && oidcAuth.user) {
        const profile = oidcAuth.user.profile;
        const userId = profile.sub || '';
        const email = profile.email || '';
        const name = profile.name || profile.email?.split('@')[0] || 'User';

        console.log('OIDC authentication successful, syncing user data...', {
          userId: userId.substring(0, 10) + '...',
          email,
          name
        });

        // Sync user data with DynamoDB
        const syncedUser = await syncUser({
          userId,
          email,
          name
        });

        console.log('Sync result:', syncedUser ? 'Success' : 'Failed');

      } else if (!oidcAuth.isLoading) {
        console.log('OIDC not authenticated, clearing user state');
        setUser(null);
      }

      // Handle auth errors
      if (oidcAuth.error) {
        console.error('OIDC error:', oidcAuth.error.message);
        setError(oidcAuth.error.message);
      } else if (!error || error === 'Authentication context not available') {
        setError(null);
      }
    };

    updateUserState();
  }, [oidcAuth, syncUser, error]);

  const signIn = useCallback(async (action: 'login' | 'signup' = 'login', userType?: 'breeder' | 'adopter') => {
    console.log('signIn function called with action:', action, 'userType:', userType);
    
    if (!oidcAuth) {
      console.error('OIDC Auth not initialized');
      setError('Authentication not initialized');
      return;
    }

    try {
      setError(null);
      console.log('Starting sign in process...');
      
      // Get environment variables
      const clientId = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
      const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
      const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
      
      if (action === 'signup' && cognitoDomain && clientId) {
        // Store user type for after signup completion
        if (userType) {
          localStorage.setItem('pendingUserType', userType);
        }
        
        // Direct redirect to Cognito signup page
        const signupUrl = `${cognitoDomain}/signup?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${redirectUri}`;
        console.log('Redirecting to signup URL:', signupUrl);
        window.location.href = signupUrl;
      } else {
        // Use OIDC signin redirect for login (default behavior)
        console.log('Using OIDC signin redirect with config:', {
          authority: oidcAuth.settings?.authority,
          client_id: oidcAuth.settings?.client_id,
          redirect_uri: oidcAuth.settings?.redirect_uri,
          response_type: oidcAuth.settings?.response_type
        });
        
        // Generate the OIDC redirect URL manually to see what it looks like
        const oidcRedirectUrl = oidcAuth.settings?.authority + 
          '/oauth2/authorize?client_id=' + oidcAuth.settings?.client_id +
          '&response_type=' + oidcAuth.settings?.response_type +
          '&scope=email+openid+profile' +
          '&redirect_uri=' + encodeURIComponent(oidcAuth.settings?.redirect_uri || '');
        
        console.log('Generated OIDC redirect URL:', oidcRedirectUrl);
        
        await oidcAuth.signinRedirect();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setError(errorMessage);
      console.error('Sign in error:', error);
    }
  }, [oidcAuth]);

  const signOut = useCallback(async () => {
    if (!oidcAuth) {
      setError('Authentication not initialized');
      return;
    }

    try {
      setError(null);
      
      // Clear local user state immediately
      setUser(null);
      
      // First, remove the OIDC user from local storage/session
      await oidcAuth.removeUser();
      
      // Get environment variables
      const clientId = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
      const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
      const logoutUri = encodeURIComponent(window.location.origin);
      
      if (cognitoDomain && clientId) {
        // Clear any additional browser storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to Cognito logout with proper parameters
        const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${logoutUri}&response_type=code`;
        window.location.href = logoutUrl;
      } else {
        // Fallback: try OIDC logout first, then manual cleanup
        try {
          await oidcAuth.signoutRedirect();
        } catch (oidcError) {
          console.warn('OIDC signout failed, clearing manually:', oidcError);
          // Manual cleanup
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/';
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      setError(errorMessage);
      console.error('Sign out error:', error);
      
      // Fallback: force logout by clearing everything and redirecting
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  }, [oidcAuth]);

  // Handle the case where oidcAuth is not available
  if (!oidcAuth) {
    return {
      user: null,
      loading: true,
      signIn,
      signOut,
      error: error || 'Authentication context not available',
      isAuthenticated: false,
      getToken: () => null,
      refreshToken: async () => false,
      syncUser: async () => null,
      updateUser: async () => null,
    };
  }

  return {
    user,
    loading: oidcAuth.isLoading,
    signIn,
    signOut,
    error,
    isAuthenticated: oidcAuth.isAuthenticated,
    getToken,
    refreshToken,
    syncUser,
    updateUser,
  };
};