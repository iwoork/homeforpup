import { useState, useEffect, useCallback } from 'react';
import apiService, { Dog, DogsResponse } from '../services/apiService';

interface UseAvailablePuppiesParams {
  search?: string;
  breed?: string;
  gender?: string;
  location?: string;
  autoFetch?: boolean;
}

interface UseAvailablePuppiesReturn {
  puppies: Dog[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  page: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  updateFilters: (filters: Partial<UseAvailablePuppiesParams>) => void;
}

export const useAvailablePuppies = (
  params: UseAvailablePuppiesParams = {}
): UseAvailablePuppiesReturn => {
  const [puppies, setPuppies] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState(params);

  const fetchPuppies = useCallback(
    async (pageNum: number, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching puppies with filters:', { ...filters, page: pageNum });

        const response = await apiService.getAvailablePuppies({
          ...filters,
          page: pageNum,
          limit: 20,
        });

        console.log('Full API Response:', JSON.stringify(response, null, 2));

        if (response.success && response.data) {
          const newPuppies = response.data.dogs || [];
          const pagination = (response.data as any).pagination;
          
          console.log('Puppies from API:', {
            count: newPuppies.length,
            pagination,
            firstPuppy: newPuppies[0] ? {
              id: newPuppies[0].id,
              name: newPuppies[0].name,
              breed: newPuppies[0].breed,
            } : null,
          });
          
          setPuppies(prev => append ? [...prev, ...newPuppies] : newPuppies);
          
          // Handle both response formats
          const totalCount = pagination?.total || response.data.total || 0;
          const totalPages = pagination?.totalPages || 1;
          const currentPage = pagination?.page || pageNum;
          const hasMorePages = currentPage < totalPages;
          
          setTotal(totalCount);
          setHasMore(hasMorePages);
          setPage(pageNum);

          console.log('Puppies fetched:', {
            count: newPuppies.length,
            total: totalCount,
            hasMore: hasMorePages,
            currentPage,
            totalPages,
          });
        } else {
          setError(response.error || 'Failed to fetch puppies');
          console.error('Failed to fetch puppies:', response.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        console.error('Error fetching puppies:', err);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const refresh = useCallback(async () => {
    setPage(1);
    await fetchPuppies(1, false);
  }, [fetchPuppies]);

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchPuppies(page + 1, true);
    }
  }, [loading, hasMore, page, fetchPuppies]);

  const updateFilters = useCallback((newFilters: Partial<UseAvailablePuppiesParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  // Auto-fetch on mount or when filters change
  useEffect(() => {
    if (params.autoFetch !== false) {
      fetchPuppies(1, false);
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    puppies,
    loading,
    error,
    total,
    hasMore,
    page,
    refresh,
    loadMore,
    updateFilters,
  };
};

