import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSignIn, useSignUp, useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { User, ApiResponse } from '../types';
import apiService from '../services/apiService';
import pushNotificationService from '../services/pushNotificationService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<ApiResponse>;
  signup: (userData: any) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUserFromCognito: () => Promise<boolean>;
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
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn, getToken } = useClerkAuth();
  const { signOut } = useClerk();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth when Clerk loads
  useEffect(() => {
    if (!isUserLoaded) return;

    if (isSignedIn && clerkUser) {
      initializeUser();
    } else {
      setUser(null);
      setIsLoading(false);
      apiService.setAuthToken(null);
    }
  }, [isUserLoaded, isSignedIn, clerkUser?.id]);

  // Periodic token refresh
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(async () => {
      try {
        const freshToken = await getToken();
        if (freshToken) {
          apiService.setAuthToken(freshToken);
        }
      } catch (error) {
        console.error('Error during periodic token check:', error);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user, getToken]);

  const initializeUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (token) {
        apiService.setAuthToken(token);
      }

      if (!clerkUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const userData: User = {
        userId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        name: clerkUser.fullName || clerkUser.firstName || 'User',
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        profileImage: clerkUser.imageUrl || undefined,
        userType: (clerkUser.publicMetadata?.userType as 'breeder' | 'dog-parent') || 'dog-parent',
        verified: clerkUser.primaryEmailAddress?.verification?.status === 'verified',
        accountStatus: 'active',
        createdAt: clerkUser.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Ensure profile exists in database
      try {
        const response = await apiService.getProfileById(userData.userId);
        if (!response.success || !response.data?.profile) {
          await apiService.updateProfile(userData.userId, {
            userId: userData.userId,
            email: userData.email,
            name: userData.name,
            verified: false,
            accountStatus: 'active',
          });
        }
      } catch (err) {
        console.warn('Could not verify/create profile:', err);
      }

      setUser(userData);

      pushNotificationService.registerWithBackend().catch((err) => {
        console.warn('Push token registration failed:', err);
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isSignInLoaded || !signIn) {
        return { success: false, error: 'Sign in not ready' };
      }

      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        // Clerk will update the user state automatically
        return { success: true };
      } else {
        return { success: false, error: 'Login incomplete' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.errors?.[0]?.message || error?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: any): Promise<ApiResponse> => {
    try {
      setError(null);

      if (!isSignUpLoaded || !signUp) {
        return { success: false, error: 'Sign up not ready' };
      }

      const result = await signUp.create({
        emailAddress: userData.email,
        password: userData.password,
        firstName: userData.name?.split(' ')[0],
        lastName: userData.name?.split(' ').slice(1).join(' '),
        unsafeMetadata: {
          userType: userData.userType || 'dog-parent',
          phone: userData.phone,
        },
      });

      if (result.status === 'complete') {
        return { success: true };
      } else {
        // Email verification needed
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        return {
          success: true,
          message: 'Please check your email for verification code',
          data: { requiresVerification: true },
        };
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error?.errors?.[0]?.message || error?.message || 'Signup failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await pushNotificationService.unregisterFromBackend().catch(() => {});
      await signOut();
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
    if (user) {
      const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
      setUser(updatedUser);
    }
  };

  const refreshUserFromCognito = async () => {
    // With Clerk, just re-initialize from Clerk user data
    if (clerkUser) {
      await initializeUser();
      return true;
    }
    return false;
  };

  const updateUserType = async (userType: 'breeder' | 'dog-parent'): Promise<boolean> => {
    if (user) {
      setUser({ ...user, userType });
      return true;
    }
    return false;
  };

  const refreshSession = async () => {
    try {
      const token = await getToken();
      if (token) {
        apiService.setAuthToken(token);
      } else {
        setUser(null);
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

      if (!isSignUpLoaded || !signUp) {
        return { success: false, error: 'Sign up not ready' };
      }

      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === 'complete') {
        return { success: true };
      } else {
        return { success: false, error: 'Verification incomplete' };
      }
    } catch (error: any) {
      const errorMessage = error?.errors?.[0]?.message || error?.message || 'Verification failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (_email: string): Promise<ApiResponse> => {
    // Clerk handles password reset via its built-in flow
    // For custom UI, use signIn.create({ strategy: 'reset_password_email_code', identifier: email })
    return { success: true, message: 'Password reset is handled by Clerk' };
  };

  const confirmResetPassword = async (_email: string, _code: string, _newPassword: string): Promise<ApiResponse> => {
    // Clerk handles this via signIn.attemptFirstFactor / resetPassword flow
    return { success: true };
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!isSignedIn,
    isLoading,
    error,
    login,
    signup,
    logout,
    updateUser,
    refreshUserFromCognito,
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
