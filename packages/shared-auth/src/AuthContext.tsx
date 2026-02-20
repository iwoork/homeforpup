'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/nextjs';
import { User } from '@homeforpup/shared-types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refreshToken: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  // Additional methods for compatibility
  signIn: () => void;
  signOut: () => void;
  loading: boolean;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn, getToken } = useClerkAuth();
  const clerk = useClerk();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!isSignedIn;

  // Fetch user data from API using sync route
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      console.log('AuthContext: Fetching user data for userId:', userId.substring(0, 10) + '...');

      // First try to get existing user data
      let response = await fetch(`/api/users/${userId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If user doesn't exist, sync/create user
        console.log('AuthContext: User not found in database, syncing user data...');
        response = await fetch('/api/users/sync', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            name: clerkUser?.fullName || clerkUser?.firstName || 'User',
            email: clerkUser?.primaryEmailAddress?.emailAddress || '',
            userType: (clerkUser?.publicMetadata?.userType as string) || (typeof window !== 'undefined' ? localStorage.getItem('pendingUserType') : null) || 'dog-parent'
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorDetails;
          try {
            errorDetails = JSON.parse(errorText);
          } catch {
            errorDetails = { error: errorText };
          }

          console.error('AuthContext: Sync failed:', errorText);

          if (errorDetails.details?.includes('ResourceNotFoundException') ||
              errorDetails.details?.includes('not found')) {
            setError('Database table not configured. Please contact support.');
          } else {
            setError('Failed to sync user data. Please try again.');
          }

          return;
        }

        const syncResult = await response.json();
        console.log('AuthContext: User synced successfully:', {
          userId: syncResult.user?.userId?.substring(0, 10) + '...',
          name: syncResult.user?.name,
          userType: syncResult.user?.userType
        });
        setUser(syncResult.user);
        setError(null);
        return;
      }

      const responseData = await response.json();
      const userData = responseData.user || responseData;
      console.log('AuthContext: User data fetched successfully:', {
        userId: userData?.userId?.substring(0, 10) + '...',
        name: userData?.name,
        userType: userData?.userType,
      });
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('AuthContext: Error fetching user data:', err);
      setError('Failed to load user data');
      setUser(null);
    }
  }, [clerkUser]);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = clerkUser?.id;

      if (userId) {
        console.log('AuthContext: Found user ID, fetching user data:', userId);
        await fetchUserData(userId);
      } else {
        console.log('AuthContext: No user ID, setting user to null');
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setError('Authentication check failed');

      // Fallback: create basic user from Clerk data if database fetch fails
      if (clerkUser) {
        const fallbackUser: User = {
          userId: clerkUser.id,
          name: clerkUser.fullName || clerkUser.firstName || 'User',
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          verified: clerkUser.primaryEmailAddress?.verification?.status === 'verified',
          accountStatus: 'active' as const,
          lastActiveAt: new Date().toISOString(),
        };
        setUser(fallbackUser);
        setError(null);
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [clerkUser, fetchUserData]);

  // Refresh token — Clerk handles this automatically, so this is mostly a no-op
  const refreshToken = useCallback(async () => {
    try {
      // Clerk handles token refresh automatically
      // Re-fetch user data to keep state fresh
      if (clerkUser?.id) {
        await fetchUserData(clerkUser.id);
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      setError('Session refresh failed');
    }
  }, [clerkUser, fetchUserData]);

  // Login function — with Clerk, login is handled by Clerk components
  const login = useCallback(async (_email: string, _password: string) => {
    // Clerk handles login via its built-in components (<SignIn />)
    // This method is kept for interface compatibility
    window.location.href = '/sign-in';
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setUser(null);
      setError(null);
      await clerk.signOut();
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, [clerk]);

  // Simplified signIn for compatibility
  const signInSimple = useCallback(() => {
    window.location.href = '/sign-in';
  }, []);

  // Simplified signOut for compatibility
  const signOutSimple = useCallback(() => {
    logout();
  }, [logout]);

  // Get token for API calls
  const getTokenValue = useCallback(async (): Promise<string | null> => {
    try {
      return await getToken();
    } catch {
      return null;
    }
  }, [getToken]);

  // Effect to handle Clerk auth state changes
  useEffect(() => {
    if (!isUserLoaded) {
      setIsLoading(true);
      return;
    }

    if (!isSignedIn) {
      setUser(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (isSignedIn && clerkUser?.id) {
      checkAuthStatus();
    }
  }, [isUserLoaded, isSignedIn, clerkUser?.id, checkAuthStatus]);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    refreshToken,
    login,
    logout,
    checkAuthStatus,
    // Compatibility methods
    signIn: signInSimple,
    signOut: signOutSimple,
    loading: isLoading,
    getToken: getTokenValue,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
