'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { useUserData } from './useUserData';

export const useNextAuth = (): {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  login: () => void;
  signIn: () => void;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  session: any;
  activeProfileType: 'dog-professional' | 'puppy-parent';
  switchProfileType: (profileType: 'dog-professional' | 'puppy-parent') => void;
  canSwitchProfiles: boolean;
  effectiveUserType: string | undefined;
  isSwitchingProfile: boolean;
  clearAllAuthData: () => void;
  refreshUserData: () => void;
} => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { userData, isLoading: userDataLoading, refreshUserData } = useUserData();
  
  // Profile switching state
  const [activeProfileType, setActiveProfileType] = useState<'dog-professional' | 'puppy-parent'>('puppy-parent');
  const [isSwitchingProfile, setIsSwitchingProfile] = useState(false);

  // Debug user data processing (only when data changes)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && userData?.userType) {
      console.log('User data processing:', {
        userDataUserType: userData?.userType,
        sessionUserType: session?.user ? (session.user as any)?.userType : 'no session',
        finalUserType: userData?.userType || (session?.user ? (session.user as any).userType : null) || 'adopter'
      });
    }
  }, [userData?.userType]);

  // Use database user data when available, fallback to session data
  const user = session?.user ? {
    userId: (session.user as any).id || session.user.email || '',
    name: userData?.name || session.user.name || '',
    email: session.user.email || '',
    userType: userData?.userType || (session.user as any)?.userType || 'adopter', // Use database userType
    isVerified: userData?.verified || (session.user as any)?.isVerified || false,
    profileImage: userData?.profileImage || session.user.image || '',
    puppyParentInfo: userData?.puppyParentInfo || null,
    createdAt: userData?.createdAt || new Date().toISOString(),
    location: userData?.location || '',
    galleryPhotos: userData?.galleryPhotos || [],
    coverPhoto: userData?.coverPhoto || '',
    bio: userData?.bio || '',
    phone: userData?.phone || '',
    website: userData?.dogProfessionalInfo?.website || '',
    socialMedia: userData?.socialLinks || {},
    dogProfessionalInfo: userData?.dogProfessionalInfo || null,
  } : null;

  // Initialize active profile type when user changes
  useEffect(() => {
    if (user) {
      console.log('User data in auth hook:', {
        userId: user.userId?.substring(0, 10) + '...',
        name: user.name,
        userType: user.userType,
        canSwitch: user.userType === 'both',
        source: userData ? 'database' : 'session'
      });
      
      if (user.userType === 'dog-professional') {
        setActiveProfileType('dog-professional');
      } else if (user.userType === 'puppy-parent') {
        setActiveProfileType('puppy-parent');
      } else if (user.userType === 'both') {
        // Load from localStorage or default to 'adopter'
        const savedProfileType = localStorage.getItem('activeProfileType') as 'dog-professional' | 'puppy-parent' | null;
        setActiveProfileType(savedProfileType || 'puppy-parent');
      }
    }
  }, [user]);

  // Save profile type selection to localStorage
  const switchProfileType = useCallback(async (profileType: 'dog-professional' | 'puppy-parent') => {
    const startTime = Date.now();
    // switchProfileType called
    
    setIsSwitchingProfile(true);
    // Set isSwitchingProfile to true
    
    try {
      // Brief delay to show the loading state (reduced to 100ms)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setActiveProfileType(profileType);
      localStorage.setItem('activeProfileType', profileType);
      
      // Refresh user data to ensure we have the latest information
      if (refreshUserData) {
              try {
                await Promise.race([
                  refreshUserData(),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 800))
                ]);
              } catch (error) {
                console.warn('User data refresh failed or timed out:', error);
                // Continue anyway - the profile switch was successful
              }
      }
    } catch (error) {
      console.error('Error switching profile:', error);
    } finally {
      const endTime = Date.now();
      const duration = endTime - startTime;
      // Profile switch completed
      setIsSwitchingProfile(false);
    }
  }, [activeProfileType, refreshUserData]);

  // Check if user can switch profiles
  const canSwitchProfiles = user?.userType === 'both';
  
  // Get the effective user type (either the user's actual type or the selected profile type)
  const effectiveUserType = user?.userType === 'both' ? activeProfileType : user?.userType;

  // Debug effective user type changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Effective user type changed
    }
  }, [user?.userType, activeProfileType, effectiveUserType, canSwitchProfiles]);

  // Debug isSwitchingProfile state changes
  useEffect(() => {
    // isSwitchingProfile state changed
  }, [isSwitchingProfile]);

  const isAuthenticated = !!session;
  const loading = status === 'loading' || (isAuthenticated && userDataLoading);

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth state changed:', {
        status,
        isAuthenticated,
        hasSession: !!session,
        sessionUser: session?.user ? {
          id: (session.user as any).id?.substring(0, 10) + '...',
          name: session.user.name,
          userType: (session.user as any).userType
        } : null
      });
    }
  }, [status, isAuthenticated, session]);

  const login = useCallback(() => {
    console.log('Starting login process...');
    
    // Force a fresh login by clearing any cached session
    if (typeof window !== 'undefined') {
      // Clear any localStorage items that might interfere
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('nextauth') || key.startsWith('activeProfileType')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear sessionStorage as well
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('nextauth')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('Cleared cached auth data, redirecting to Cognito...');
    
    // Sign in with Cognito, forcing a fresh authentication
    signIn('cognito', { 
      callbackUrl: '/dashboard',
      redirect: true 
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('Starting logout process...');
      
      // Clear localStorage profile selection
      localStorage.removeItem('activeProfileType');
      
      // Clear any remaining session data first
      if (typeof window !== 'undefined') {
        // Clear all localStorage items related to auth
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('nextauth') || key.startsWith('activeProfileType')) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear sessionStorage as well
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('nextauth')) {
            sessionStorage.removeItem(key);
          }
        });
      }
      
      // Clear any cookies that might be related to auth
      if (typeof document !== 'undefined') {
        // Clear NextAuth cookies
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
          if (name.startsWith('next-auth') || name.startsWith('__Secure-next-auth')) {
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
          }
        });
      }
      
      // Sign out from NextAuth
      await signOut({ 
        callbackUrl: '/',
        redirect: false // Don't redirect automatically, we'll handle it
      });
      
      console.log('NextAuth signOut completed');
      
      // Redirect to Cognito logout URL to clear Cognito session
      const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
      const clientId = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
      
      if (cognitoDomain && clientId) {
        const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(window.location.origin)}`;
        console.log('Redirecting to Cognito logout:', logoutUrl);
        // Use window.location.replace to prevent back button issues
        window.location.replace(logoutUrl);
      } else {
        console.log('Cognito env vars not available, redirecting to home');
        window.location.replace('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force redirect to home page
      window.location.href = '/';
    }
  }, []);

  const getToken = useCallback(async () => {
    if ((session as any)?.accessToken) {
      return (session as any).accessToken;
    }
    return null;
  }, [session]);

  // Manual clear function for debugging
  const clearAllAuthData = useCallback(() => {
    console.log('Manually clearing all auth data...');
    
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('nextauth') || key.startsWith('activeProfileType')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('nextauth')) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear cookies
    if (typeof document !== 'undefined') {
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        if (name.startsWith('next-auth') || name.startsWith('__Secure-next-auth')) {
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
        }
      });
    }
    
    console.log('All auth data cleared');
    // Force page reload
    window.location.reload();
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    login,
    signIn: login, // Alias for compatibility
    logout,
    getToken,
    session,
    // Profile switching functionality
    activeProfileType,
    switchProfileType,
    canSwitchProfiles,
    effectiveUserType,
    isSwitchingProfile,
    // Debug function
    clearAllAuthData,
    // Refresh function
    refreshUserData,
  };
};
