'use client';

import { useState, useEffect } from 'react';
import { Dog, DogsResponse, UseDogsOptions, MatchedDogsResponse } from './types';

export const useDogs = (options: UseDogsOptions = {}) => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    total: number;
    hasMore?: boolean;
  } | null>(null);

  const {
    search = '',
    kennelId = '',
    type = '',
    gender = '',
    breed = '',
    status = '',
    breedingStatus = '',
    page = 1,
    limit = 20,
    offset = 0,
    sortBy = 'updatedAt',
    ownerId
  } = options;

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (kennelId) params.append('kennelId', kennelId);
        if (type) params.append('type', type);
        if (gender) params.append('gender', gender);
        if (breed) params.append('breed', breed);
        if (status) params.append('status', status);
        if (breedingStatus) params.append('breedingStatus', breedingStatus);
        if (ownerId) params.append('ownerId', ownerId);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());
        params.append('sortBy', sortBy);

        const response = await fetch(`/api/dogs?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dogs: ${response.statusText}`);
        }

        const data: DogsResponse = await response.json();
        setDogs(data.dogs);
        setPagination({
          page: data.page || page,
          totalPages: data.totalPages || Math.ceil((data.total || 0) / limit),
          hasNextPage: data.hasNextPage || false,
          hasPrevPage: data.hasPrevPage || false,
          total: data.total || 0,
          hasMore: data.hasMore
        });
      } catch (err) {
        console.error('Error fetching dogs:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch dogs');
        setDogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDogs();
  }, [search, kennelId, type, gender, breed, status, breedingStatus, page, limit, offset, sortBy, ownerId]);

  return {
    dogs,
    loading,
    error,
    pagination
  };
};

export const useDog = (id: string) => {
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDog = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/dogs/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dog: ${response.statusText}`);
        }

        const data: Dog = await response.json();
        setDog(data);
      } catch (err) {
        console.error('Error fetching dog:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch dog');
        setDog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDog();
  }, [id]);

  return {
    dog,
    loading,
    error
  };
};

export const useMatchedDogs = () => {
  const [matchedDogs, setMatchedDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatchedDogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/dogs/matched');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch matched dogs: ${response.statusText}`);
        }

        const data: MatchedDogsResponse = await response.json();
        setMatchedDogs(data.matchedPuppies || []);
      } catch (err) {
        console.error('Error fetching matched dogs:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch matched dogs');
        setMatchedDogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchedDogs();
  }, []);

  return {
    matchedDogs,
    loading,
    error
  };
};

// Hook for getting all dogs (simplified for selectors or listings)
export const useAllDogs = (options: UseDogsOptions = {}) => {
  return useDogs({
    limit: 1000, // Get all dogs
    sortBy: 'name',
    ...options
  });
};
