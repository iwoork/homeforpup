// hooks/useMatchedPuppies.ts
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
    throw new Error(errorData.error || 'Failed to fetch matched puppies');
  }

  const data = await response.json();
  
  // Ensure we always return an array
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.matchedPuppies)) {
    return data.matchedPuppies;
  } else {
    console.warn('Unexpected data format from matched puppies API:', data);
    return [];
  }
};

// Custom hook for fetching puppies matched to user's criteria
export const useMatchedPuppies = () => {
  const { getToken } = useAuth();
  
  const { data, error, isLoading, mutate } = useSWR<Dog[]>('/api/dogs/matched', fetcher(getToken), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 10000, // Refresh every 10 seconds
  });

  return {
    matchedPuppies: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
};