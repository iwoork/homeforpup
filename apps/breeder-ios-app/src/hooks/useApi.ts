import { useState, useEffect, useCallback } from 'react';
import apiService, { ApiResponse } from '../services/apiService';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = [],
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    refreshing: false,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setState(prev => ({ ...prev, data: response.data!, loading: false }));
        onSuccess?.(response.data);
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.error || 'API call failed', 
          loading: false 
        }));
        onError?.(response.error || 'API call failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      onError?.(errorMessage);
    }
  }, dependencies);

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true, error: null }));
    
    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setState(prev => ({ ...prev, data: response.data!, refreshing: false }));
        onSuccess?.(response.data);
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.error || 'API call failed', 
          refreshing: false 
        }));
        onError?.(response.error || 'API call failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage, refreshing: false }));
      onError?.(errorMessage);
    }
  }, dependencies);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    refresh,
  };
}

// Specific hooks for common API calls
export function useDashboardStats() {
  return useApi(() => apiService.getDashboardStats());
}

export function useKennels(params: Parameters<typeof apiService.getKennels>[0] = {}) {
  return useApi(() => apiService.getKennels(params), [JSON.stringify(params)]);
}

export function useDogs(params: Parameters<typeof apiService.getDogs>[0] = {}) {
  return useApi(() => apiService.getDogs(params), [JSON.stringify(params)]);
}

export function useBreeds(params: Parameters<typeof apiService.getBreeds>[0] = {}) {
  return useApi(() => apiService.getBreeds(params), [JSON.stringify(params)]);
}

export function useKennel(id: string) {
  return useApi(() => apiService.getKennelById(id), [id]);
}

export function useDog(id: string) {
  return useApi(() => apiService.getDogById(id), [id]);
}

export function useBreed(id: string) {
  return useApi(() => apiService.getBreedById(id), [id]);
}

export function useActivities(params: Parameters<typeof apiService.getActivities>[0] = {}) {
  return useApi(() => apiService.getActivities(params), [JSON.stringify(params)]);
}
