// hooks/useAuth.ts
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { User } from '@/types';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signIn: (action?: 'login' | 'signup', userType?: 'breeder' | 'puppy-parent') => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  isAuthenticated: boolean;
  getToken: () => Promise<string | null>;
  refreshToken: () => Promise<boolean>;
  syncUser: (userData?: Partial<User>, providedToken?: string) => Promise<User | null>;
  updateUser: (updates: Partial<User>) => Promise<User | null>;
  // Legacy properties for backward compatibility
  login: (action?: 'login' | 'signup', userType?: 'breeder' | 'puppy-parent') => Promise<void>;
  effectiveUserType: 'breeder' | 'puppy-parent' | null;
  canSwitchProfiles: boolean;
  activeProfileType: 'breeder' | 'puppy-parent' | null;
  isSwitchingProfile: boolean;
  clearAllAuthData: () => void;
  refreshUserData: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Method to get the current JWT token
  const getToken = useCallback(async (): Promise<string | null> => {
    return (session as any)?.accessToken || null;
  }, [session]);

  // Method to refresh the token if needed
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      console.log('Attempting to refresh token...');
      // NextAuth handles token refresh automatically
      // We can trigger a session update
      await fetch('/api/auth/session?update');
      console.log('Token refresh successful');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);

  // Method to sync user data with DynamoDB
  const syncUser = useCallback(async (userData?: Partial<User>, providedToken?: string): Promise<User | null> => {
    const token = providedToken || getToken();
    if (!token) {
      console.warn('No token available for user sync');
      return null;
    }

    try {
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData || {}),
      });

      if (!response.ok) {
        const errorData = await response.json();
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
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/users/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      return updatedUser;

    } catch (error) {
      console.error('Failed to update user:', error);
      setError(error instanceof Error ? error.message : 'Failed to update user data');
      return null;
    }
  }, [user, getToken]);

  // Update user state when NextAuth session changes
  useEffect(() => {
    const updateUserState = async () => {
      console.log('useAuth effect running with NextAuth state:', {
        status,
        hasSession: !!session,
        user: session?.user ? {
          id: (session.user as any).id?.substring(0, 10) + '...',
          email: session.user.email,
          name: session.user.name,
          userType: (session.user as any).userType
        } : null
      });

      if (status === 'loading') {
        setIsInitializing(true);
        return;
      }

      if (status === 'authenticated' && session?.user) {
        const profile = session.user as any;
        const userId = profile.id || '';
        const email = profile.email || '';
        const name = profile.name || profile.email?.split('@')[0] || 'User';
        const userType = profile.userType || 'puppy-parent';

        console.log('NextAuth authentication successful, syncing user data...', {
          userId: userId.substring(0, 10) + '...',
          email,
          name,
          userType
        });

        // Sync user data with DynamoDB
        const syncedUser = await syncUser({
          userId,
          email,
          name,
          userType
        });

        console.log('Sync result:', syncedUser ? 'Success' : 'Failed');
        
        // If sync failed, create a basic user object from NextAuth data
        if (!syncedUser) {
          console.log('Creating basic user from NextAuth data');
          const basicUser: User = {
            userId,
            email,
            name,
            userType: userType as 'breeder' | 'puppy-parent' | 'both',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            verified: false,
            accountStatus: 'active',
            lastActiveAt: new Date().toISOString(),
            preferences: {
              privacy: {
                showEmail: false,
                showPhone: true,
                showLocation: true
              },
              notifications: {
                sms: false,
                email: true,
                push: true
              }
            },
            galleryPhotos: [],
            ...(userType === 'breeder' ? {
              breederInfo: {
                kennelName: '',
                license: '',
                specialties: [],
                experience: 0,
                website: ''
              }
            } : {
              puppyParentInfo: {
                housingType: 'house',
                yardSize: 'medium',
                hasOtherPets: false,
                experienceLevel: 'first-time',
                preferredBreeds: []
              }
            })
          };
          setUser(basicUser);
        }

      } else if (status === 'unauthenticated') {
        console.log('NextAuth not authenticated, clearing user state');
        setUser(null);
      }

      setIsInitializing(false);
    };

    updateUserState();
  }, [status, session, syncUser]);

  // Handle initialization timeout to prevent infinite loading
  useEffect(() => {
    const initTimeout = setTimeout(() => {
      if (isInitializing) {
        console.log('Auth initialization timeout, setting loading to false');
        setIsInitializing(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(initTimeout);
  }, [isInitializing]);

  const handleSignIn = useCallback(async (action: 'login' | 'signup' = 'login', userType?: 'breeder' | 'puppy-parent') => {
    console.log('signIn function called with action:', action, 'userType:', userType);
    
    try {
      setError(null);
      console.log('Starting sign in process...');
      
      // Store user type for after signup completion
      if (action === 'signup' && userType) {
        localStorage.setItem('pendingUserType', userType);
      }
      
      // Use NextAuth signIn
      await signIn('cognito', { 
        callbackUrl: '/dashboard',
        redirect: true 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setError(errorMessage);
      console.error('Sign in error:', error);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      console.log('Signing out...');
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even if signOut fails
      window.location.href = '/';
    }
  }, []);

  const loading = status === 'loading' || isInitializing;
  const isAuthenticated = status === 'authenticated' && !!user;

  // Legacy properties for backward compatibility
  const effectiveUserType = user?.userType === 'both' ? 'breeder' : (user?.userType as 'breeder' | 'puppy-parent' | null) || null;
  const canSwitchProfiles = user?.userType === 'both';
  const activeProfileType = effectiveUserType;
  const isSwitchingProfile = false; // Not implemented in current version
  const clearAllAuthData = () => {
    setUser(null);
    setError(null);
  };
  const refreshUserData = async () => {
    // Re-fetch user data
    if (user?.userId) {
      try {
        const response = await fetch(`/api/users/${user.userId}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  return {
    user,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    error,
    isAuthenticated,
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