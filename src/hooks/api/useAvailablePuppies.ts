// hooks/useAvailablePuppies.ts
import useSWR from 'swr';
import { Dog } from '@/types';
import { getAccessToken } from '@/lib/auth/cognito-hosted-ui';

// Fetcher function that includes auth token
const fetcher = async (url: string) => {
  const token = getAccessToken();
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch available puppies');
  }

  return response.json();
};

// Custom hook for fetching available puppies
export const useAvailablePuppies = () => {
  const { data, error, isLoading, mutate } = useSWR<Dog[]>('/api/dogs?available=true', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 10000, // Refresh every 10 seconds
  });

  return {
    puppies: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
};
