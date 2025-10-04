import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, ApiResponse } from '../types';
import authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<ApiResponse>;
  signup: (userData: any) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
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
      setIsLoading(true);
      setError(null);

      // Load stored auth data
      const { user: storedUser, token } = await authService.loadStoredAuthData();
      
      if (storedUser && token) {
        // Verify the session is still valid
        const isValid = await authService.refreshSession();
        if (isValid) {
          setUser(storedUser);
        } else {
          // Session expired, clear stored data
          await authService.logout();
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setError('Failed to initialize authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authService.login(email, password);
      
      if (result.success && result.user) {
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
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true, data: result.user };
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
