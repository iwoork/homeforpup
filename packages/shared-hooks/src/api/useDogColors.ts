import { useState, useEffect, useCallback } from 'react';
import type { DogColor, DogColorCategory } from '@homeforpup/shared-types';

interface UseDogColorsOptions {
  category?: DogColorCategory;
  search?: string;
  limit?: number;
  enabled?: boolean;
  apiBaseUrl?: string;
}

interface UseDogColorsResult {
  colors: DogColor[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  categories: {
    solid: number;
    pattern: number;
    'multi-color': number;
  } | null;
}

export function useDogColors(options: UseDogColorsOptions = {}): UseDogColorsResult {
  const {
    category,
    search,
    limit,
    enabled = true,
    apiBaseUrl = '/api'
  } = options;

  const [colors, setColors] = useState<DogColor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{
    solid: number;
    pattern: number;
    'multi-color': number;
  } | null>(null);

  const fetchColors = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (category) {
        params.append('category', category);
      }
      
      if (search) {
        params.append('search', search);
      }
      
      if (limit) {
        params.append('limit', limit.toString());
      }

      const url = `${apiBaseUrl}/dog-colors${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Failed to fetch colors: ${response.statusText}`);
      }

      const data = await response.json();
      
      setColors(data.colors || []);
      setCategories(data.categories || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching dog colors:', err);
      setColors([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, limit, enabled, apiBaseUrl]);

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  return {
    colors,
    loading,
    error,
    refetch: fetchColors,
    categories
  };
}

export default useDogColors;

