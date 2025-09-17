// hooks/useDogs.ts
import useSWR, { mutate } from 'swr';
import { Dog } from '@/types';
import { message } from 'antd';

// Fetcher function that includes auth token
const fetcher = async (url: string) => {
  // Get the auth token from your auth context or localStorage
  const token = localStorage.getItem('authToken') || '';
  
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
  const { data, error, isLoading, mutate: mutateDogs } = useSWR<Dog[]>('/api/dogs', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

  const deleteDog = async (dogId: string) => {
    try {
      const token = localStorage.getItem('authToken') || '';
      
      const response = await fetch(`/api/dogs/${dogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete dog');
      }

      // Optimistically update the cache
      if (data) {
        const updatedDogs = data.filter(dog => dog.id !== dogId);
        mutateDogs(updatedDogs, false);
      }

      message.success('Dog deleted successfully');
      
      // Revalidate to ensure consistency
      mutateDogs();
      
      return true;
    } catch (error) {
      console.error('Error deleting dog:', error);
      message.error(error instanceof Error ? error.message : 'Failed to delete dog');
      return false;
    }
  };

  const refreshDogs = () => {
    mutateDogs();
  };

  return {
    dogs: data || [],
    isLoading,
    error,
    deleteDog,
    refreshDogs,
    mutate: mutateDogs,
  };
};

// Custom hook for a single dog
export const useDog = (dogId: string | null) => {
  const { data, error, isLoading } = useSWR<Dog>(
    dogId ? `/api/dogs/${dogId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    dog: data,
    isLoading,
    error,
  };
};  