'use client';

import { useAuth as useOidcAuth } from 'react-oidc-context';
import { useEffect, useState, useCallback } from 'react';
import { User } from '@/types';
import { dbOperations } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  isAuthenticated: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const oidcAuth = useOidcAuth();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createOrGetBreederProfile = useCallback(async (userId: string, email: string, name: string) => {
    try {
      // Check if breeder profile exists
      const breederResult = await dbOperations.getBreeder(userId);
      
      if (!breederResult.Item) {
        // Create breeder profile
        await dbOperations.createBreeder({
          id: uuidv4(),
          userId: userId,
          name: name,
          email: email,
          phone: '',
          location: '',
          description: '',
          verified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error handling breeder profile:', error);
      // Don't throw the error - allow authentication to continue
      // This prevents auth from failing due to DB issues
    }
  }, []);

  // Update user state when OIDC auth state changes
  useEffect(() => {
    const updateUserState = async () => {
      if (!oidcAuth) {
        setError('Authentication context not available');
        return;
      }

      if (oidcAuth.isAuthenticated && oidcAuth.user) {
        const profile = oidcAuth.user.profile;
        const userId = profile.sub || '';
        const email = profile.email || '';
        const name = profile.name || profile.email?.split('@')[0] || 'User';

        const userData: User = {
          id: userId,
          email: email,
          name: name,
          isBreeder: true,
        };

        setUser(userData);
        setError(null);

        // Create or get breeder profile in background
        await createOrGetBreederProfile(userId, email, name);
      } else if (!oidcAuth.isLoading) {
        setUser(null);
      }

      // Handle auth errors
      if (oidcAuth.error) {
        setError(oidcAuth.error.message);
      } else if (!error || error === 'Authentication context not available') {
        setError(null);
      }
    };

    updateUserState();
  }, [oidcAuth, createOrGetBreederProfile, error]);

  const signIn = useCallback(async () => {
    if (!oidcAuth) {
      setError('Authentication not initialized');
      return;
    }

    try {
      setError(null);
      await oidcAuth.signinRedirect();
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
    };
  }

  return {
    user,
    loading: oidcAuth.isLoading,
    signIn,
    signOut,
    error,
    isAuthenticated: oidcAuth.isAuthenticated,
  };
};