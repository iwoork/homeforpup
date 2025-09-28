'use client';

import { useCallback } from 'react';

interface UseProfileViewsReturn {
  trackProfileView: (userId: string) => Promise<void>;
  getProfileViews: (userId: string) => Promise<number>;
}

export const useProfileViews = (): UseProfileViewsReturn => {
  const trackProfileView = useCallback(async (userId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/users/${userId}/views`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error tracking profile view:', errorData.message);
        return;
      }

      const data = await response.json();
      console.log('Profile view tracked:', data);
    } catch (error) {
      console.error('Error tracking profile view:', error);
    }
  }, []);

  const getProfileViews = useCallback(async (userId: string): Promise<number> => {
    try {
      const response = await fetch(`/api/users/${userId}/views`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error getting profile views:', errorData.message);
        return 0;
      }

      const data = await response.json();
      return data.profileViews || 0;
    } catch (error) {
      console.error('Error getting profile views:', error);
      return 0;
    }
  }, []);

  return {
    trackProfileView,
    getProfileViews
  };
};
