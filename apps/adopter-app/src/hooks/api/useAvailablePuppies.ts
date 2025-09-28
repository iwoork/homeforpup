// hooks/useAvailablePuppies.ts
import useSWR from 'swr';
import { Dog } from '@/types';
import { useAuth } from '@/hooks';

// Fetcher function that includes auth token
const fetcher = (getToken: () => Promise<string | null>) => async (url: string) => {
  const token = await getToken();
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch available puppies');
  }
  return response.json();
};

export const useAvailablePuppies = () => {
  const { getToken } = useAuth();
  
  const { data, error, isLoading } = useSWR<Dog[]>('/api/dogs?status=available', fetcher(getToken), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 10000, // Revalidate every 10 seconds
  });

  return {
    puppies: data || [],
    isLoading,
    error,
  };
};