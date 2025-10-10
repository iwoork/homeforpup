import React from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { KennelAnnouncement } from '@/types';

const fetcher = async (url: string, token: string): Promise<KennelAnnouncement[]> => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch kennel announcements');
  }

  return response.json();
};

export const useKennelAnnouncements = (kennelId: string) => {
  const { data: session, status } = useSession();
  const [token, setToken] = React.useState<string | null>(null);
  const isAuthenticated = !!session;

  React.useEffect(() => {
    if (isAuthenticated && (session as any)?.accessToken) {
      setToken((session as any).accessToken);
    }
  }, [isAuthenticated, session]);

  const { data: announcements, error, isLoading, mutate } = useSWR<KennelAnnouncement[]>(
    token && kennelId ? [`/api/kennels/${kennelId}/announcements`, token] : null,
    ([url, token]) => fetcher(url, token as string)
  );

  const createAnnouncement = async (announcementData: Omit<KennelAnnouncement, 'id' | 'kennelId' | 'authorId' | 'createdAt' | 'updatedAt'>) => {
    if (!token) throw new Error('No token available');

    const response = await fetch(`/api/kennels/${kennelId}/announcements`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(announcementData),
    });

    if (!response.ok) {
      throw new Error('Failed to create announcement');
    }

    const newAnnouncement = await response.json();
    mutate([...(announcements || []), newAnnouncement]);
    return newAnnouncement;
  };

  const updateAnnouncement = async (announcementId: string, updates: Partial<KennelAnnouncement>) => {
    if (!token) throw new Error('No token available');

    const response = await fetch(`/api/announcements/${announcementId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update announcement');
    }

    const updatedAnnouncement = await response.json();
    mutate(
      announcements?.map(a => a.id === announcementId ? updatedAnnouncement : a) || []
    );
    return updatedAnnouncement;
  };

  const deleteAnnouncement = async (announcementId: string) => {
    if (!token) throw new Error('No token available');

    const response = await fetch(`/api/announcements/${announcementId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete announcement');
    }

    mutate(announcements?.filter(a => a.id !== announcementId) || []);
  };

  const refreshAnnouncements = () => {
    mutate();
  };

  return {
    announcements: announcements || [],
    isLoading,
    error,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    refreshAnnouncements,
    mutate,
  };
};
