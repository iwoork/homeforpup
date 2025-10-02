import { useMemo } from 'react';
import useSWR from 'swr';
import { PuppiesResponse, PuppyFilters } from '@homeforpup/shared-dogs';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch puppies');
  }
  return response.json();
};

export const useAvailablePuppiesWithKennels = (filters: PuppyFilters = {}) => {
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    
    if (filters.country) params.append('country', filters.country);
    if (filters.state) params.append('state', filters.state);
    if (filters.breed) params.append('breed', filters.breed);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.shipping) params.append('shipping', 'true');
    if (filters.verified) params.append('verified', 'true');
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    return `/api/available-puppies?${params.toString()}`;
  }, [filters]);

  const { data, error, isLoading, mutate } = useSWR<PuppiesResponse>(apiUrl, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 minute
  });

  return {
    puppies: data?.puppies || [],
    totalCount: data?.total || 0,
    totalPages: data?.totalPages || 1,
    currentPage: data?.page || 1,
    hasNextPage: data?.hasNextPage || false,
    hasPrevPage: data?.hasPrevPage || false,
    filters: data?.filters,
    stats: data?.stats,
    isLoading,
    error,
    mutate,
  };
};

export type { PuppyFilters, PuppiesResponse };
