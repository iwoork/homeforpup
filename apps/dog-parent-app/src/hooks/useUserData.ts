import React from 'react';
import useSWR from 'swr';
import { useUser, useAuth } from '@clerk/nextjs';
import { User } from '@/types';

const fetcher = async (url: string, token: string | null) => {
  if (!token) throw new Error('No token available');

  console.log('Fetcher called with:', { url, tokenLength: token.length });

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('Fetcher response:', { status: response.status, ok: response.ok });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Fetcher error response:', errorText);
    throw new Error('Failed to fetch user data');
  }

  const data = await response.json();
  console.log('Fetcher response data:', data);
  console.log('User data userType from API:', data.user?.userType);

  // Return the user data from the API response
  return data.user;
};

export const useUserData = (): {
  userData: User | undefined;
  error: any;
  isLoading: boolean;
  refreshUserData: any;
} => {
  const { user: clerkUser, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchToken = async () => {
      if (isSignedIn) {
        const t = await getToken();
        if (t && t !== token) {
          console.log('Setting token from Clerk:', t?.substring(0, 20) + '...');
          setToken(t);
        }
      } else if (!isSignedIn && token) {
        console.log('Clearing token - user not authenticated');
        setToken(null);
      }
    };
    fetchToken();
  }, [isSignedIn, getToken, token]);

  const { data: userData, error, isLoading, mutate } = useSWR<User>(
    token && clerkUser ? [`/api/users/${clerkUser.id}`, token] : null,
    ([url, token]: [string, string]) => {
      console.log('Fetching user data from:', url, 'with token:', token?.substring(0, 20) + '...');
      return fetcher(url, token);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 second deduplication
      refreshInterval: 0, // No automatic refresh
    }
  );

  // Debug logging (reduced frequency)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && userData) {
      console.log('useUserData hook state:', {
        hasToken: !!token,
        hasUser: !!clerkUser,
        userId: clerkUser?.id?.substring(0, 10) + '...',
        isLoading,
        userData: userData ? {
          name: userData.name,
          userType: userData.userType,
          verified: userData.verified
        } : null,
        error: error?.message
      });
    }
  }, [userData?.userType, error]);

  return {
    userData,
    error,
    isLoading,
    refreshUserData: mutate,
  };
};
