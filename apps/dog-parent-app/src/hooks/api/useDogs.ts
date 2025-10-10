// hooks/useDogs.ts
import useSWR from 'swr';
import { Dog } from '@/types';
import { message } from 'antd';
import { useAuth } from '@/hooks';

// Fetcher function that includes auth token
const fetcher = (getToken: () => Promise<string | null>) => async (url: string) => {
  // Get the auth token from the new authentication system
  const token = await getToken();
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  return response.json();
};

// Custom hook for managing dogs with SWR
export const useDogs = () => {
  const { getToken } = useAuth();
  
  const { data, error, isLoading, mutate: mutateDogs } = useSWR<Dog[]>('/api/dogs', fetcher(getToken), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

  const deleteDog = async (dogId: string) => {
    try {
      const token = await getToken();
      
      const response = await fetch(`/api/dogs/${dogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete dog');
      }

      // Revalidate the data after successful deletion
      mutateDogs();
      message.success('Dog deleted successfully');
    } catch (error) {
      console.error('Error deleting dog:', error);
      message.error('Failed to delete dog');
    }
  };

  return {
    dogs: data || [],
    isLoading,
    error,
    deleteDog,
    mutate: mutateDogs,
  };
};