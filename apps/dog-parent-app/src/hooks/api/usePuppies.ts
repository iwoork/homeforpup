'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

interface PuppyWithBreeder {
  id: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  ageWeeks: number;
  price: number;
  location: string;
  country: string;
  state: string;
  city: string;
  breeder: {
    id: number;
    name: string;
    businessName: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    phone: string;
    email: string;
    website: string;
    shipping: boolean;
    pickupAvailable: boolean;
    responseRate: number;
    avgResponseTime: string;
  };
  image: string;
  available: boolean;
  description?: string;
  healthStatus: string;
  registrationNumber?: string;
  microchipNumber?: string;
  createdAt: string;
}

interface PuppiesResponse {
  puppies: PuppyWithBreeder[];
  count: number;
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  filters: {
    availableStates: string[];
    availableBreeds: string[];
    availableCountries: string[];
    averagePrice: number;
    verifiedCount: number;
  };
  stats: {
    totalPuppies: number;
    averageAge: number;
    shippingAvailable: number;
    verifiedBreeders: number;
  };
}

interface PuppyFilters {
  country?: string;
  state?: string;
  breed?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  shipping?: boolean;
  verified?: boolean;
  page?: number;
  limit?: number;
}

const fetcher = async (url: string): Promise<PuppiesResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch puppies');
  }
  return response.json();
};

export const usePuppies = (filters: PuppyFilters = {}) => {
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    
    if (filters.country) params.append('country', filters.country);
    if (filters.state) params.append('state', filters.state);
    if (filters.breed) params.append('breed', filters.breed);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.shipping) params.append('shipping', 'true');
    if (filters.verified) params.append('verified', 'true');
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    return `/api/puppies?${params.toString()}`;
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

export type { PuppyWithBreeder, PuppiesResponse, PuppyFilters };
