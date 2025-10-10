// hooks/useAuth.ts
'use client';

import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { useSession, signIn } from 'next-auth/react';
import { useCallback } from 'react';

interface UseAuthReturn {
  user: any;
  loading: boolean;
  signIn: (action?: 'login' | 'signup', userType?: 'breeder' | 'dog-parent') => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  isAuthenticated: boolean;
  getToken: () => Promise<string | null>;
  refreshToken: () => Promise<boolean>;
  syncUser: (userData?: any, providedToken?: string) => Promise<any>;
  updateUser: (updates: any) => Promise<any>;
  // Legacy properties for backward compatibility
  login: (action?: 'login' | 'signup', userType?: 'breeder' | 'dog-parent') => Promise<void>;
  effectiveUserType: 'breeder' | 'dog-parent' | null;
  canSwitchProfiles: boolean;
  activeProfileType: 'breeder' | 'dog-parent' | null;
  isSwitchingProfile: boolean;
  clearAllAuthData: () => void;
  refreshUserData: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const { data: session } = useSession();
  const authContext = useAuthContext();

  // Method to get the current JWT token
  const getToken = useCallback(async (): Promise<string | null> => {
    return (session as any)?.accessToken || null;
  }, [session]);

  // Method to refresh the token if needed
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      await authContext.refreshToken();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, [authContext]);

  // Method to sync user data with DynamoDB
  const syncUser = useCallback(async (userData?: any, providedToken?: string): Promise<any> => {
    // The AuthContext handles user syncing automatically
    return authContext.user;
  }, [authContext]);

  // Method to update user data
  const updateUser = useCallback(async (updates: any): Promise<any> => {
    if (!authContext.user) {
      console.warn('No user to update');
      return null;
    }

    try {
      const response = await fetch(`/api/users/${authContext.user.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedUser = await response.json();
      // The AuthContext will handle updating the user state
      await authContext.checkAuthStatus();
      return updatedUser;

    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }, [authContext]);

  const handleSignIn = useCallback(async (action: 'login' | 'signup' = 'login', userType?: 'breeder' | 'dog-parent') => {
    try {
      // Store user type for after signup completion
      if (action === 'signup' && userType) {
        localStorage.setItem('pendingUserType', userType);
      }
      
      // Use NextAuth signIn directly with proper redirect handling
      const result = await signIn('cognito', { 
        callbackUrl: '/dashboard',
        redirect: true 
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await authContext.logout();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, [authContext]);

  // Legacy properties for backward compatibility
  const effectiveUserType = authContext.user?.userType === 'both' ? 'breeder' : (authContext.user?.userType as 'breeder' | 'dog-parent' | null) || null;
  const canSwitchProfiles = authContext.user?.userType === 'both';
  const activeProfileType = effectiveUserType;
  const isSwitchingProfile = false; // Not implemented in current version
  const clearAllAuthData = () => {
    // This is handled by the context
  };
  const refreshUserData = async () => {
    await authContext.checkAuthStatus();
  };

  return {
    user: authContext.user,
    loading: authContext.isLoading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    error: authContext.error,
    isAuthenticated: authContext.isAuthenticated,
    getToken,
    refreshToken,
    syncUser,
    updateUser,
    // Legacy properties
    login: handleSignIn,
    effectiveUserType,
    canSwitchProfiles,
    activeProfileType,
    isSwitchingProfile,
    clearAllAuthData,
    refreshUserData,
  };
};