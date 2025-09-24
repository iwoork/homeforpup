'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useNextAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user ? {
    userId: (session.user as any).id || session.user.email || '',
    name: session.user.name || '',
    email: session.user.email || '',
    userType: (session.user as any).userType || 'adopter',
    isVerified: (session.user as any).isVerified || false,
    profileImage: session.user.image || '',
    adopterInfo: (session.user as any).adopterInfo || null,
    createdAt: (session.user as any).createdAt || new Date().toISOString(),
    location: (session.user as any).location || '',
    galleryPhotos: (session.user as any).galleryPhotos || [],
    coverPhoto: (session.user as any).coverPhoto || '',
    bio: (session.user as any).bio || '',
    phone: (session.user as any).phone || '',
    website: (session.user as any).website || '',
    socialMedia: (session.user as any).socialMedia || {},
    breederInfo: (session.user as any).breederInfo || null,
  } : null;

  const isAuthenticated = !!session;
  const loading = status === 'loading';

  const login = useCallback(() => {
    signIn('cognito', { callbackUrl: '/dashboard' });
  }, []);

  const logout = useCallback(() => {
    signOut({ callbackUrl: '/' });
  }, []);

  const getToken = useCallback(async () => {
    if ((session as any)?.accessToken) {
      return (session as any).accessToken;
    }
    return null;
  }, [session]);

  return {
    user,
    isAuthenticated,
    loading,
    login,
    signIn: login, // Alias for compatibility
    logout,
    getToken,
    session,
  };
};
