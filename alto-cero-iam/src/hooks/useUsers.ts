import { useState, useEffect, useCallback } from 'react';
import { getUsers } from '@/services/users';
import type { User, PaginatedResponse } from '@/types';

// AICODE-NOTE: Custom hook for user data fetching with pagination

interface UseUsersParams {
  propertyId: string | undefined;
  page?: number;
  pageSize?: number;
  search?: string;
}

interface UseUsersResult {
  users: User[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
}

export function useUsers({
  propertyId,
  page: initialPage = 1,
  pageSize = 20,
  search: initialSearch = '',
}: UseUsersParams): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: initialPage,
    pageSize,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);

  const fetchUsers = useCallback(async () => {
    if (!propertyId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await getUsers(propertyId, page, pageSize, search);

    if (response.success && response.data) {
      const data = response.data as PaginatedResponse<User>;
      setUsers(data.items);
      setPagination({
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
      });
    } else {
      setError(response.error || 'Failed to fetch users');
    }

    setIsLoading(false);
  }, [propertyId, page, pageSize, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    pagination,
    isLoading,
    error,
    refetch: fetchUsers,
    setPage,
    setSearch,
  };
}

export default useUsers;
