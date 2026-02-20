// hooks/useAuth.ts
'use client';

import { useAuth as useAuthContext } from '@homeforpup/shared-auth';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/nextjs';
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
  const { user: clerkUser } = useUser();
  const { getToken } = useClerkAuth();
  const clerk = useClerk();
  const authContext = useAuthContext();

  // Method to get the current JWT token
  const getTokenValue = useCallback(async (): Promise<string | null> => {
    try {
      return await getToken();
    } catch {
      return null;
    }
  }, [getToken]);

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
  const syncUser = useCallback(async (_userData?: any, _providedToken?: string): Promise<any> => {
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
      await authContext.checkAuthStatus();
      return updatedUser;

    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }, [authContext]);

  const handleSignIn = useCallback(async (action: 'login' | 'signup' = 'login', userType?: 'breeder' | 'dog-parent') => {
    if (action === 'signup' && userType) {
      localStorage.setItem('pendingUserType', userType);
    }
    window.location.href = action === 'signup' ? '/sign-up' : '/sign-in';
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      localStorage.removeItem('activeProfileType');
      await clerk.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, [clerk]);

  // Derive userType from authContext user data or Clerk metadata
  const effectiveUserType = (authContext.user?.userType || (clerkUser?.publicMetadata?.userType as string) || 'dog-parent') as 'breeder' | 'dog-parent' | null;
  const canSwitchProfiles = false;
  const activeProfileType = effectiveUserType;
  const isSwitchingProfile = false;
  const clearAllAuthData = () => {
    clerk.signOut();
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
    getToken: getTokenValue,
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
