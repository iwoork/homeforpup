import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, ApiResponse } from '../types';
import authService from '../services/authService';
import apiService from '../services/apiService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<ApiResponse>;
  signup: (userData: any) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateUserType: (userType: 'breeder' | 'dog-parent') => Promise<boolean>;
  refreshSession: () => Promise<void>;
  confirmSignup: (email: string, code: string) => Promise<ApiResponse>;
  resetPassword: (email: string) => Promise<ApiResponse>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<ApiResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('AuthContext: Initializing auth...');
      setIsLoading(true);
      setError(null);

      // Load stored auth data
      const { user: storedUser, token } = await authService.loadStoredAuthData();
      console.log('AuthContext: Loaded stored auth data:', { 
        hasUser: !!storedUser, 
        hasToken: !!token,
        tokenLength: token?.length 
      });
      
      if (storedUser && token) {
        // Verify the session is still valid
        const isValid = await authService.refreshSession();
        console.log('AuthContext: Session valid:', isValid);
        
        if (isValid) {
          // Get fresh token after refresh
          const freshToken = await authService.getAuthToken();
          console.log('AuthContext: Got fresh token:', { 
            hasToken: !!freshToken,
            tokenLength: freshToken?.length 
          });
          
          // Set the fresh auth token in the API service
          apiService.setAuthToken(freshToken);
          setUser(storedUser);
        } else {
          // Session expired, clear stored data
          await authService.logout();
          apiService.setAuthToken(null);
        }
      }
      console.log('AuthContext: Auth initialization complete');
    } catch (error) {
      console.error('AuthContext: Error initializing auth:', error);
      // Don't set error state - let the app continue without auth
      console.log('AuthContext: Continuing without authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.login(email, password);
      
      if (result.success && result.user && result.token) {
        console.log('AuthContext: Login successful, setting token:', {
          hasToken: !!result.token,
          tokenLength: result.token.length
        });
        
        // Set the auth token in the API service
        apiService.setAuthToken(result.token);
        setUser(result.user);
        return { success: true, data: result.user };
      } else {
        setError(result.error || 'Login failed');
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: any): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.signup(userData);
      
      if (result.success) {
        if (result.user) {
          // User is already verified and logged in
          setUser(result.user);
          return { success: true, data: result.user };
        } else if (result.requiresVerification) {
          // Signup successful, but email verification is required
          return { 
            success: true, 
            message: result.message || 'Please check your email for verification code',
            data: { requiresVerification: true }
          };
        } else {
          // Success but unexpected state
          return { success: true };
        }
      } else {
        setError(result.error || 'Signup failed');
        return { success: false, error: result.error || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.logout();
      // Clear the auth token from the API service
      apiService.setAuthToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (user) {
        const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
        setUser(updatedUser);
        // TODO: Sync with backend API
      }
    } catch (error) {
      console.error('Update user error:', error);
      setError('Failed to update user');
    }
  };

  const updateUserType = async (userType: 'breeder' | 'dog-parent'): Promise<boolean> => {
    try {
      const success = await authService.updateUserType(userType);
      if (success && user) {
        // Update the user in state to trigger re-render
        setUser({ ...user, userType });
        console.log('✅ User type updated in context:', userType);
      }
      return success;
    } catch (error) {
      console.error('Update user type error:', error);
      return false;
    }
  };

  const refreshSession = async () => {
    try {
      const isValid = await authService.refreshSession();
      if (!isValid) {
        setUser(null);
        await authService.logout();
      }
    } catch (error) {
      console.error('Refresh session error:', error);
      setError('Session refresh failed');
    }
  };

  const confirmSignup = async (email: string, code: string): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.confirmSignup(email, code);
      
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error || 'Verification failed');
        return { success: false, error: result.error || 'Verification failed' };
      }
    } catch (error) {
      console.error('Confirm signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.resetPassword(email);
      
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error || 'Password reset failed');
        return { success: false, error: result.error || 'Password reset failed' };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const confirmResetPassword = async (email: string, code: string, newPassword: string): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.confirmResetPassword(email, code, newPassword);
      
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error || 'Password reset confirmation failed');
        return { success: false, error: result.error || 'Password reset confirmation failed' };
      }
    } catch (error) {
      console.error('Confirm reset password error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Password reset confirmation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    signup,
    logout,
    updateUser,
    updateUserType,
    refreshSession,
    confirmSignup,
    resetPassword,
    confirmResetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
