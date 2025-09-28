import React from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { Kennel } from '@/types';

const fetcher = async (url: string, token: string | null) => {
  if (!token) throw new Error('No token available');
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch kennels');
  }
  
  return response.json();
};

export const useKennels = () => {
  const { data: session, status } = useSession();
  const [token, setToken] = React.useState<string | null>(null);
  const isAuthenticated = !!session;

  React.useEffect(() => {
    if (isAuthenticated && (session as any)?.accessToken) {
      setToken((session as any).accessToken);
    }
  }, [isAuthenticated, session]);

  const { data: kennels, error, isLoading, mutate } = useSWR<Kennel[]>(
    token ? ['/api/kennels', token] : null,
    ([url, token]) => fetcher(url, token as string)
  );

  const createKennel = async (kennelData: Omit<Kennel, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!token) throw new Error('No token available');

    const response = await fetch('/api/kennels', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(kennelData),
    });

    if (!response.ok) {
      throw new Error('Failed to create kennel');
    }

    const newKennel = await response.json();
    mutate([...(kennels || []), newKennel]);
    return newKennel;
  };

  const updateKennel = async (kennelId: string, updates: Partial<Kennel>) => {
    if (!token) throw new Error('No token available');

    const response = await fetch(`/api/kennels/${kennelId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update kennel');
    }

    const updatedKennel = await response.json();
    mutate(
      kennels?.map(k => k.id === kennelId ? updatedKennel : k) || []
    );
    return updatedKennel;
  };

  const deleteKennel = async (kennelId: string) => {
    if (!token) throw new Error('No token available');

    const response = await fetch(`/api/kennels/${kennelId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete kennel');
    }

    mutate(kennels?.filter(k => k.id !== kennelId) || []);
  };

  return {
    kennels,
    error,
    isLoading,
    createKennel,
    updateKennel,
    deleteKennel,
    refreshKennels: mutate,
  };
};
