import React from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { Kennel } from '@/types';

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include', // Include session cookies
    headers: {
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
  const isAuthenticated = !!session;

  const { data: kennels, error, isLoading, mutate } = useSWR<Kennel[]>(
    isAuthenticated ? '/api/kennels' : null,
    fetcher
  );

  const createKennel = async (kennelData: Omit<Kennel, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch('/api/kennels', {
      method: 'POST',
      credentials: 'include',
      headers: {
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
    const response = await fetch(`/api/kennels/${kennelId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
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
    const response = await fetch(`/api/kennels/${kennelId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
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
