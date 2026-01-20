import { useState, useEffect, useCallback } from 'react';
import { getAccessRequests } from '@/services/access-requests';
import type { AccessRequest, PaginatedResponse, AccessRequestStatus } from '@/types';

// AICODE-NOTE: Custom hook for access request data fetching with filtering

interface UseAccessRequestsParams {
  status?: AccessRequestStatus;
  propertyId?: string;
  page?: number;
  pageSize?: number;
}

interface UseAccessRequestsResult {
  requests: AccessRequest[];
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
  setStatus: (status: AccessRequestStatus | undefined) => void;
}

export function useAccessRequests({
  status: initialStatus,
  propertyId,
  page: initialPage = 1,
  pageSize = 20,
}: UseAccessRequestsParams = {}): UseAccessRequestsResult {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: initialPage,
    pageSize,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AccessRequestStatus | undefined>(
    initialStatus
  );
  const [page, setPage] = useState(initialPage);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await getAccessRequests(status, propertyId, page, pageSize);

    if (response.success && response.data) {
      const data = response.data as PaginatedResponse<AccessRequest>;
      setRequests(data.items);
      setPagination({
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
      });
    } else {
      setError(response.error || 'Failed to fetch access requests');
    }

    setIsLoading(false);
  }, [status, propertyId, page, pageSize]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    pagination,
    isLoading,
    error,
    refetch: fetchRequests,
    setPage,
    setStatus,
  };
}

export default useAccessRequests;
