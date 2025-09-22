// hooks/useAvailableUsers.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AvailableUser {
  userId: string;
  name: string;
  displayName?: string;
  email?: string;
  userType: 'breeder' | 'adopter' | 'both';
  profileImage?: string;
  location?: string;
  verified?: boolean;
  bio?: string;
  breederInfo?: {
    kennelName?: string;
    specialties?: string[];
    experience?: number;
  };
}

interface UseAvailableUsersReturn {
  users: AvailableUser[];
  loading: boolean;
  error: string | null;
  searchUsers: (filters: {
    userType?: 'breeder' | 'adopter' | 'both';
    search?: string;
    location?: string;
  }) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const useAvailableUsers = (): UseAvailableUsersReturn => {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<AvailableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (filters: {
    userType?: 'breeder' | 'adopter' | 'both';
    search?: string;
    location?: string;
    limit?: number;
  } = {}) => {
    const token = getToken();
    if (!token) {
      setError('No authentication token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.userType) params.append('userType', filters.userType);
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/users/available?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
      setError(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      console.error('Error fetching available users:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Search users with filters
  const searchUsers = useCallback(async (filters: {
    userType?: 'breeder' | 'adopter' | 'both';
    search?: string;
    location?: string;
  }) => {
    await fetchUsers(filters);
  }, [fetchUsers]);

  // Refresh users (reload current list)
  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    searchUsers,
    refreshUsers
  };
};