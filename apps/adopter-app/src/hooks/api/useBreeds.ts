// hooks/api/useBreeds.ts
'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Breed, BreedsResponse } from '@homeforpup/shared-dogs';

interface UseBreedsOptions {
  search?: string;
  category?: string;
  size?: string;
  breedType?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'popularity' | 'breedType';
  enabled?: boolean;
}

interface UseBreedsReturn {
  breeds: Breed[];
  loading: boolean;
  error: string | null;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
  availableCategories: string[];
  availableSizes: string[];
  availableBreedTypes: string[];
  totalBreeders: number;
  refetch: () => void;
}

// Fetcher function
const fetcher = async (url: string): Promise<BreedsResponse> => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch breeds: ${response.statusText}`);
  }

  return response.json();
};

export const useBreeds = (options: UseBreedsOptions = {}): UseBreedsReturn => {
  const {
    search,
    category,
    size,
    breedType,
    page = 1,
    limit = 100, // Default to 100 for selector components
    sortBy = 'name',
    enabled = true
  } = options;

  // Build query parameters
  const searchParams = new URLSearchParams();
  if (search) searchParams.set('search', search);
  if (category && category !== 'All') searchParams.set('category', category);
  if (size && size !== 'All') searchParams.set('size', size);
  if (breedType && breedType !== 'All') searchParams.set('breedType', breedType);
  searchParams.set('page', page.toString());
  searchParams.set('limit', limit.toString());
  searchParams.set('sortBy', sortBy);

  const url = enabled ? `/api/breeds?${searchParams.toString()}` : null;

  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR<BreedsResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // Cache for 30 seconds
      onError: (error) => {
        console.error('Error fetching breeds:', error);
      }
    }
  );

  return {
    breeds: data?.breeds || [],
    loading: isLoading,
    error: error?.message || null,
    total: data?.total || 0,
    hasNextPage: data?.hasNextPage || false,
    hasPrevPage: data?.hasPrevPage || false,
    totalPages: data?.totalPages || 0,
    availableCategories: data?.filters?.availableCategories || [],
    availableSizes: data?.filters?.availableSizes || [],
    availableBreedTypes: data?.filters?.availableBreedTypes || [],
    totalBreeders: data?.filters?.totalBreeders || 0,
    refetch: mutate
  };
};

// Hook for getting all breeds (simplified for selectors)
export const useAllBreeds = (enabled: boolean = true) => {
  return useBreeds({
    limit: 10000, // Get all breeds - increased limit
    sortBy: 'name',
    enabled
  });
};
