import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { Veterinarian } from '../../../../packages/shared-types/src';

interface UseVeterinariansOptions {
  isActive?: boolean;
  limit?: number;
}

interface UseVeterinariansResult {
  veterinarians: Veterinarian[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createVeterinarian: (data: Partial<Veterinarian>) => Promise<Veterinarian | null>;
  updateVeterinarian: (id: string, data: Partial<Veterinarian>) => Promise<Veterinarian | null>;
  deleteVeterinarian: (id: string) => Promise<boolean>;
}

export const useVeterinarians = (options: UseVeterinariansOptions = {}): UseVeterinariansResult => {
  const { user } = useAuth();
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVeterinarians = useCallback(async () => {
    if (!user?.userId) {
      setVeterinarians([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getVeterinarians({
        ownerId: user.userId,
        isActive: options?.isActive,
        limit: options?.limit || 100,
      });

      if (response.success && response.data) {
        setVeterinarians(response.data.veterinarians || []);
      } else {
        setError(response.error || 'Failed to fetch veterinarians');
      }
    } catch (err) {
      console.error('Error fetching veterinarians:', err);
      setError('Failed to fetch veterinarians');
    } finally {
      setLoading(false);
    }
  }, [user?.userId, options?.isActive, options?.limit]);

  const createVeterinarian = async (data: Partial<Veterinarian>): Promise<Veterinarian | null> => {
    if (!user?.userId) {
      setError('User not authenticated');
      return null;
    }

    try {
      setError(null);

      const veterinarianData = {
        ...data,
        ownerId: user.userId,
      };

      const response = await apiService.createVeterinarian(veterinarianData);

      if (response.success && response.data) {
        const newVeterinarian = response.data.veterinarian;
        setVeterinarians(prev => [newVeterinarian, ...prev]);
        return newVeterinarian;
      } else {
        setError(response.error || 'Failed to create veterinarian');
        return null;
      }
    } catch (err) {
      console.error('Error creating veterinarian:', err);
      setError('Failed to create veterinarian');
      return null;
    }
  };

  const updateVeterinarian = async (id: string, data: Partial<Veterinarian>): Promise<Veterinarian | null> => {
    try {
      setError(null);

      const response = await apiService.updateVeterinarian(id, data);

      if (response.success && response.data) {
        const updatedVeterinarian = response.data.veterinarian;
        setVeterinarians(prev => 
          prev.map(vet => vet.id === id ? updatedVeterinarian : vet)
        );
        return updatedVeterinarian;
      } else {
        setError(response.error || 'Failed to update veterinarian');
        return null;
      }
    } catch (err) {
      console.error('Error updating veterinarian:', err);
      setError('Failed to update veterinarian');
      return null;
    }
  };

  const deleteVeterinarian = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await apiService.deleteVeterinarian(id);

      if (response.success) {
        setVeterinarians(prev => prev.filter(vet => vet.id !== id));
        return true;
      } else {
        setError(response.error || 'Failed to delete veterinarian');
        return false;
      }
    } catch (err) {
      console.error('Error deleting veterinarian:', err);
      setError('Failed to delete veterinarian');
      return false;
    }
  };

  useEffect(() => {
    fetchVeterinarians();
  }, [fetchVeterinarians]);

  return {
    veterinarians,
    loading,
    error,
    refetch: fetchVeterinarians,
    createVeterinarian,
    updateVeterinarian,
    deleteVeterinarian,
  };
};
