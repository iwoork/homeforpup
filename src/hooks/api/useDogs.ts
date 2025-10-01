// hooks/useDogs.ts
import useSWR from 'swr';
import { Dog } from '@/types';
import { message } from 'antd';
import { useAuth } from '@/hooks';

// Fetcher function that includes session cookies
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include', // Include session cookies
    headers: {
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
  const { user } = useAuth();
  
  const { data, error, isLoading, mutate: mutateDogs } = useSWR<Dog[]>(
    user?.userId ? '/api/dogs' : null, 
    fetcher, 
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  const deleteDog = async (dogId: string) => {
    try {
      const response = await fetch(`/api/dogs/${dogId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
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