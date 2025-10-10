'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refreshToken: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!session;

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
            name: session?.user?.name || 'User',
            email: session?.user?.email || '',
            userType: (session?.user as any)?.userType || 'dog-parent'
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('AuthContext: Sync failed:', errorText);
          throw new Error('Failed to sync user data');
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
      const userData = responseData.user || responseData; // Handle both formats
      console.log('AuthContext: Raw response data:', responseData);
      console.log('AuthContext: User data fetched successfully:', {
        userId: userData?.userId?.substring(0, 10) + '...',
        name: userData?.name,
        userType: userData?.userType,
        fullUserData: userData
      });
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('AuthContext: Error fetching user data:', err);
      setError('Failed to load user data');
      setUser(null);
    }
  }, [session]);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('AuthContext: Checking auth status, session:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: (session?.user as any)?.id,
        userEmail: session?.user?.email,
        userName: session?.user?.name,
        fullSession: session
      });

      // Try to get user ID from session
      const userId = (session?.user as any)?.id || (session?.user as any)?.sub;
      
      if (userId) {
        console.log('AuthContext: Found user ID, fetching user data:', userId);
        await fetchUserData(userId);
      } else {
        console.log('AuthContext: No user ID in session, setting user to null');
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setError('Authentication check failed');
      
      // Fallback: create basic user from session if database fetch fails
      if (session?.user) {
        console.log('AuthContext: Creating fallback user from session');
        const userId = (session.user as any).id || (session.user as any).sub;
        const fallbackUser: User = {
          userId: userId,
          name: session.user.name || 'User',
          email: session.user.email || '',
          userType: (session.user as any).userType || 'dog-parent',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          verified: (session.user as any).isVerified || false,
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
  }, [session, fetchUserData]);

  // Refresh token by updating session
  const refreshToken = useCallback(async () => {
    try {
      if (session) {
        await update();
        // Re-fetch user data after token refresh
        if (session?.user?.id) {
          await fetchUserData((session.user as any).id);
        }
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      setError('Session refresh failed');
    }
  }, [session, update, fetchUserData]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use Cognito provider for login
      const result = await signIn('cognito', {
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Session will be updated automatically by NextAuth
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setUser(null);
      setError(null);
      await signOut({ redirect: false });
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to handle session changes
  useEffect(() => {
    console.log('AuthContext: Session status changed', { 
      status, 
      hasSession: !!session,
      userId: (session?.user as any)?.id?.substring(0, 10) + '...',
      userName: session?.user?.name,
      userEmail: session?.user?.email,
      userType: (session?.user as any)?.userType,
      fullSession: session
    });

    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (status === 'unauthenticated') {
      setUser(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      console.log('AuthContext: Authenticated, checking auth status...');
      checkAuthStatus();
    }
  }, [status, session, checkAuthStatus]);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!session?.expires) return;

    const now = new Date().getTime();
    const expiresAt = new Date(session.expires).getTime();
    const timeUntilExpiry = expiresAt - now;
    
    // Refresh token 5 minutes before expiration
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);

    const refreshTimer = setTimeout(() => {
      refreshToken();
    }, refreshTime);

    return () => clearTimeout(refreshTimer);
  }, [session?.expires, refreshToken]);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    refreshToken,
    login,
    logout,
    checkAuthStatus,
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
