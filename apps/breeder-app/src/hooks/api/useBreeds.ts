// hooks/api/useBreeds.ts
'use client';

import { useState, useEffect } from 'react';

export interface Breed {
  id: string;
  name: string;
  altNames: string[];
  category: string;
  size: string;
  breedType: string;
  image: string;
  images?: string[];
  overview: string;
  characteristics: {
    energyLevel: number;
    trainability: number;
    friendliness: number;
    groomingNeeds: number;
    exerciseNeeds: number;
    barking: number;
    shedding: number;
    goodWithKids: number;
    goodWithDogs: number;
    goodWithCats: number;
    goodWithStrangers: number;
    protective: number;
    playful: number;
    calm: number;
    intelligent: number;
    independent: number;
    affectionate: number;
    social: number;
    confident: number;
    gentle: number;
    patient: number;
    energetic: number;
    loyal: number;
    alert: number;
    brave: number;
    stubborn: number;
    sensitive: number;
    adaptable: number;
    vocal: number;
    territorial: number;
  };
  physicalTraits: string[];
  temperament: string[];
  idealFor: string[];
  exerciseNeeds: string;
  commonHealthIssues: string[];
  groomingTips: string;
  trainingTips: string;
  funFacts: string[];
  breederCount?: number;
}

export interface BreedsResponse {
  breeds: Breed[];
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
    availableCategories: string[];
    availableSizes: string[];
    availableBreedTypes: string[];
    totalBreeders: number;
  };
}

export interface UseBreedsOptions {
  search?: string;
  category?: string;
  size?: string;
  breedType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export const useAllBreeds = (options: UseBreedsOptions = {}) => {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BreedsResponse['filters'] | null>(null);

  const {
    search = '',
    category = 'All',
    size = 'All',
    breedType = 'All',
    page = 1,
    limit = 100, // Get all breeds for selector
    sortBy = 'name'
  } = options;

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category !== 'All') params.append('category', category);
        if (size !== 'All') params.append('size', size);
        if (breedType !== 'All') params.append('breedType', breedType);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        params.append('sortBy', sortBy);

        const response = await fetch(`/api/breeds?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch breeds: ${response.statusText}`);
        }

        const data: BreedsResponse = await response.json();
        setBreeds(data.breeds);
        setFilters(data.filters);
      } catch (err) {
        console.error('Error fetching breeds:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch breeds');
        setBreeds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBreeds();
  }, [search, category, size, breedType, page, limit, sortBy]);

  return {
    breeds,
    loading,
    error,
    filters
  };
};

export const useBreeds = (options: UseBreedsOptions = {}) => {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    total: number;
  } | null>(null);

  const {
    search = '',
    category = 'All',
    size = 'All',
    breedType = 'All',
    page = 1,
    limit = 12,
    sortBy = 'name'
  } = options;

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category !== 'All') params.append('category', category);
        if (size !== 'All') params.append('size', size);
        if (breedType !== 'All') params.append('breedType', breedType);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        params.append('sortBy', sortBy);

        const response = await fetch(`/api/breeds?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch breeds: ${response.statusText}`);
        }

        const data: BreedsResponse = await response.json();
        setBreeds(data.breeds);
        setPagination({
          page: data.page,
          totalPages: data.totalPages,
          hasNextPage: data.hasNextPage,
          hasPrevPage: data.hasPrevPage,
          total: data.total
        });
      } catch (err) {
        console.error('Error fetching breeds:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch breeds');
        setBreeds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBreeds();
  }, [search, category, size, breedType, page, limit, sortBy]);

  return {
    breeds,
    loading,
    error,
    pagination
  };
};

