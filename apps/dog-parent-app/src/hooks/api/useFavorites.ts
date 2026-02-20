import useSWR, { mutate } from 'swr';
import { useAuth } from './useAuth';

interface FavoriteItem {
  userId: string;
  puppyId: string;
  GSI1PK: string;
  createdAt: string;
  puppyData?: any;
}

interface FavoritesResponse {
  favorites: FavoriteItem[];
  lastKey: string | null;
  count: number;
}

interface FavoriteStatusResponse {
  isFavorited: boolean;
  favorite: FavoriteItem | null;
}

interface BulkFavoriteStatusResponse {
  favoriteStatus: Record<string, boolean>;
  results: Array<{
    puppyId: string;
    isFavorited: boolean;
    favorite: FavoriteItem | null;
  }>;
}

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include', // Include cookies for session
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Hook for managing user's favorites list
export const useFavorites = (limit: number = 50) => {
  
  const { data, error, isLoading, mutate: mutateFavorites } = useSWR<FavoritesResponse>(
    '/api/favorites',
    (url) => fetcher(`${url}?limit=${limit}`),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  const addToFavorites = async (puppyId: string, puppyData?: any) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        credentials: 'include', // Include cookies for session
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ puppyId, puppyData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Revalidate favorites list
      mutateFavorites();
      
      return await response.json();
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  };

  const removeFromFavorites = async (puppyId: string) => {
    try {
      const response = await fetch(`/api/favorites?puppyId=${encodeURIComponent(puppyId)}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for session
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Revalidate favorites list
      mutateFavorites();
      
      return await response.json();
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  };

  const toggleFavorite = async (puppyId: string, puppyData?: any) => {
    const isCurrentlyFavorited = data?.favorites.some(fav => fav.puppyId === puppyId);
    
    if (isCurrentlyFavorited) {
      return await removeFromFavorites(puppyId);
    } else {
      return await addToFavorites(puppyId, puppyData);
    }
  };

  return {
    favorites: data?.favorites || [],
    count: data?.count || 0,
    lastKey: data?.lastKey || null,
    isLoading,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    mutate: mutateFavorites,
  };
};

// Hook for checking if specific puppies are favorited
export const useFavoriteStatus = (puppyId?: string) => {
  
  const { data, error, isLoading } = useSWR<FavoriteStatusResponse>(
    puppyId ? `/api/favorites/check?puppyId=${encodeURIComponent(puppyId)}` : null,
    (url) => fetcher(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    isFavorited: data?.isFavorited || false,
    favorite: data?.favorite || null,
    isLoading,
    error,
  };
};

// Hook for checking multiple puppies at once
export const useBulkFavoriteStatus = (puppyIds: string[]) => {
  
  const { data, error, isLoading } = useSWR<BulkFavoriteStatusResponse>(
    puppyIds.length > 0 ? `/api/favorites/check` : null,
    (url) => {
      return fetch(url, {
        method: 'POST',
        credentials: 'include', // Include cookies for session
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ puppyIds }),
      }).then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    favoriteStatus: data?.favoriteStatus || {},
    results: data?.results || [],
    isLoading,
    error,
  };
};

export type { FavoriteItem, FavoritesResponse, FavoriteStatusResponse, BulkFavoriteStatusResponse };
