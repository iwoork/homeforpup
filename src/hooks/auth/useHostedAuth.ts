// hooks/auth/useHostedAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import {
  exchangeCodeForTokens,
  getUserFromIdToken,
  saveTokens,
  getTokens,
  isAuthenticated,
  getAccessToken,
  redirectToLogin,
  redirectToSignUp,
  redirectToLogout
} from '@/lib/auth/cognito-hosted-ui';

interface UseHostedAuthReturn {
  // State
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Auth methods
  login: () => void;
  signUp: () => void;
  signIn: (action?: 'login' | 'signup', userType?: 'breeder' | 'adopter') => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => void;
  handleCallback: (code: string) => Promise<boolean>;
  
  // Utility methods
  getToken: () => string | null;
  clearError: () => void;
  syncUser: (userData?: Partial<User>, providedToken?: string) => Promise<User | null>;
  updateUser: (updates: Partial<User>) => Promise<User | null>;
  refreshAuth: () => Promise<void>;
}

export const useHostedAuth = (): UseHostedAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        console.log('🔄 Initializing auth state...');
        const isAuth = isAuthenticated();
        console.log('🔍 Is authenticated:', isAuth);
        
        if (isAuth) {
          const tokens = getTokens();
          console.log('🔑 Tokens found:', !!tokens);
          
          if (tokens?.idToken) {
            const userData = getUserFromIdToken(tokens.idToken);
            console.log('👤 User data from token:', userData);
            
            if (userData) {
              const user = {
                      userId: userData.userId,
                      email: userData.email,
                      name: userData.name,
                      userType: userData.userType,
                      verified: userData.isVerified || false,
                      accountStatus: 'active' as const,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
              };
              console.log('✅ Setting user state:', user);
              setUser(user);
            }
          }
        } else {
          console.log('❌ Not authenticated, clearing user state');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for storage changes to detect when tokens are updated
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cognito_tokens') {
        console.log('🔄 Storage change detected, reinitializing auth...');
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for focus events to refresh auth state
    const handleFocus = () => {
      console.log('🔄 Window focused, checking auth state...');
      initializeAuth();
    };

    window.addEventListener('focus', handleFocus);

    // Set up periodic refresh to ensure state stays synchronized
    const refreshInterval = setInterval(() => {
      if (isAuthenticated() && !user) {
        console.log('🔄 Periodic refresh - tokens exist but no user, refreshing...');
        initializeAuth();
      }
    }, 2000); // Check every 2 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(refreshInterval);
    };
  }, []);

  // Login method - redirects to Hosted UI
  const login = useCallback(() => {
    redirectToLogin();
  }, []);

  // Sign up method - redirects to Hosted UI
  const signUp = useCallback(() => {
    redirectToSignUp();
  }, []);

  // Logout method - redirects to Hosted UI
  const logout = useCallback(() => {
    redirectToLogout();
  }, []);

  // Handle callback from Hosted UI
  const handleCallback = useCallback(async (code: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Handling callback with code:', code.substring(0, 10) + '...');
      const result = await exchangeCodeForTokens(code);
      
      if (result.success && result.tokens) {
        console.log('✅ Token exchange successful, saving tokens...');
        saveTokens(result.tokens);
        
        // Get user info from ID token
        const userData = getUserFromIdToken(result.tokens.idToken);
        console.log('👤 User data from callback token:', userData);
        
        if (userData) {
          const user = {
                      userId: userData.userId,
                      email: userData.email,
                      name: userData.name,
                      userType: userData.userType,
                      verified: userData.isVerified || false,
                      accountStatus: 'active' as const,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
          };
          console.log('✅ Setting user state from callback:', user);
          setUser(user);
        }
        
        return true;
      } else {
        console.error('❌ Token exchange failed:', result.error);
        setError(result.error || 'Authentication failed');
        return false;
      }
    } catch (err) {
      console.error('Callback error:', err);
      setError('Authentication failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get token method
  const getToken = useCallback((): string | null => {
    return getAccessToken();
  }, []);

  // Clear error method
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // SignIn method - alias for login/signUp with action parameter
  const signIn = useCallback(async (action: 'login' | 'signup' = 'login', _userType?: 'breeder' | 'adopter') => {
    if (action === 'signup') {
      signUp();
    } else {
      login();
    }
  }, [login, signUp]);

  // SignOut method - alias for logout
  const signOut = useCallback(async () => {
    logout();
  }, [logout]);

  // Sync user method - placeholder implementation
  const syncUser = useCallback(async (_userData?: Partial<User>, _providedToken?: string): Promise<User | null> => {
    // This would typically sync user data with the backend
    // For now, just return the current user
    return user;
  }, [user]);

  // Update user method - placeholder implementation
  const updateUser = useCallback(async (updates: Partial<User>): Promise<User | null> => {
    if (!user) {
      return null;
    }
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    return updatedUser;
  }, [user]);

  // Refresh auth state manually
  const refreshAuth = useCallback(async () => {
    console.log('🔄 Manual auth refresh triggered...');
    const isAuth = isAuthenticated();
    console.log('🔍 Refresh - Is authenticated:', isAuth);
    
    if (isAuth) {
      const tokens = getTokens();
      console.log('🔑 Refresh - Tokens found:', !!tokens);
      
      if (tokens?.idToken) {
        const userData = getUserFromIdToken(tokens.idToken);
        console.log('👤 Refresh - User data from token:', userData);
        
        if (userData) {
          const user = {
                      userId: userData.userId,
                      email: userData.email,
                      name: userData.name,
                      userType: userData.userType,
                      verified: userData.isVerified || false,
                      accountStatus: 'active' as const,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
          };
          console.log('✅ Refreshed user state:', user);
          setUser(user);
        } else {
          console.log('❌ No user data found in token');
          setUser(null);
        }
      } else {
        console.log('❌ No ID token found');
        setUser(null);
      }
    } else {
      console.log('❌ Not authenticated, clearing user state');
      setUser(null);
    }
  }, []);

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated: !!user,
    
    // Auth methods
    login,
    signUp,
    signIn,
    signOut,
    logout,
    handleCallback,
    
    // Utility methods
    getToken,
    clearError,
    syncUser,
    updateUser,
    refreshAuth,
  };
};

// Export as useAuth for compatibility
export const useAuth = useHostedAuth;
