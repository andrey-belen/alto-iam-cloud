import { getToken } from './keycloak';
import type {
  AccessRequest,
  CreateAccessRequestInput,
  ApiResponse,
  PaginatedResponse,
  AccessRequestStatus,
} from '@/types';

// AICODE-NOTE: Access Requests service
// Handles public access requests and operator approval workflow

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============================================================================
// Public Access Request (No Auth Required)
// ============================================================================

export async function submitAccessRequest(
  data: CreateAccessRequestInput
): Promise<ApiResponse<AccessRequest>> {
  // This endpoint is public, no auth required
  try {
    const response = await fetch(`${API_BASE}/access-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Access request submission failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============================================================================
// Operator Access Request Management (Auth Required)
// ============================================================================

export async function getAccessRequests(
  status?: AccessRequestStatus,
  propertyId?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PaginatedResponse<AccessRequest>>> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (status) {
    params.append('status', status);
  }

  if (propertyId) {
    params.append('propertyId', propertyId);
  }

  return fetchWithAuth<PaginatedResponse<AccessRequest>>(
    `/access-requests?${params}`
  );
}

export async function getAccessRequest(
  requestId: string
): Promise<ApiResponse<AccessRequest>> {
  return fetchWithAuth<AccessRequest>(`/access-requests/${requestId}`);
}

export async function approveAccessRequest(
  requestId: string
): Promise<ApiResponse<AccessRequest>> {
  return fetchWithAuth<AccessRequest>(
    `/access-requests/${requestId}/approve`,
    {
      method: 'POST',
    }
  );
}

export async function rejectAccessRequest(
  requestId: string,
  reason?: string
): Promise<ApiResponse<AccessRequest>> {
  return fetchWithAuth<AccessRequest>(`/access-requests/${requestId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function deleteAccessRequest(
  requestId: string
): Promise<ApiResponse<void>> {
  return fetchWithAuth<void>(`/access-requests/${requestId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Statistics
// ============================================================================

export async function getAccessRequestStats(): Promise<
  ApiResponse<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }>
> {
  return fetchWithAuth<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }>('/access-requests/stats');
}

export default {
  submitAccessRequest,
  getAccessRequests,
  getAccessRequest,
  approveAccessRequest,
  rejectAccessRequest,
  deleteAccessRequest,
  getAccessRequestStats,
};
