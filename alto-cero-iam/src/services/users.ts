import { getToken } from './keycloak';
import type { User, ApiResponse, PaginatedResponse } from '@/types';

// AICODE-NOTE: Users service - manages Keycloak users within realms
// Uses backend API which proxies to Keycloak Admin API

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
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
// User CRUD Operations
// ============================================================================

export async function getUsers(
  propertyId: string,
  page: number = 1,
  pageSize: number = 20,
  search?: string
): Promise<ApiResponse<PaginatedResponse<User>>> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (search) {
    params.append('search', search);
  }

  return fetchWithAuth<PaginatedResponse<User>>(
    `/properties/${propertyId}/users?${params}`
  );
}

export async function getUser(
  propertyId: string,
  userId: string
): Promise<ApiResponse<User>> {
  return fetchWithAuth<User>(`/properties/${propertyId}/users/${userId}`);
}

export async function createUser(
  propertyId: string,
  data: Partial<User> & { password?: string }
): Promise<ApiResponse<User>> {
  return fetchWithAuth<User>(`/properties/${propertyId}/users`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(
  propertyId: string,
  userId: string,
  data: Partial<User>
): Promise<ApiResponse<User>> {
  return fetchWithAuth<User>(`/properties/${propertyId}/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(
  propertyId: string,
  userId: string
): Promise<ApiResponse<void>> {
  return fetchWithAuth<void>(`/properties/${propertyId}/users/${userId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// User Status Operations
// ============================================================================

export async function enableUser(
  propertyId: string,
  userId: string
): Promise<ApiResponse<User>> {
  return fetchWithAuth<User>(
    `/properties/${propertyId}/users/${userId}/enable`,
    {
      method: 'POST',
    }
  );
}

export async function disableUser(
  propertyId: string,
  userId: string
): Promise<ApiResponse<User>> {
  return fetchWithAuth<User>(
    `/properties/${propertyId}/users/${userId}/disable`,
    {
      method: 'POST',
    }
  );
}

// ============================================================================
// User Password Operations
// ============================================================================

export async function resetUserPassword(
  propertyId: string,
  userId: string,
  password: string,
  temporary: boolean = true
): Promise<ApiResponse<void>> {
  return fetchWithAuth<void>(
    `/properties/${propertyId}/users/${userId}/reset-password`,
    {
      method: 'POST',
      body: JSON.stringify({ password, temporary }),
    }
  );
}

export async function sendPasswordResetEmail(
  propertyId: string,
  userId: string
): Promise<ApiResponse<void>> {
  return fetchWithAuth<void>(
    `/properties/${propertyId}/users/${userId}/send-password-reset`,
    {
      method: 'POST',
    }
  );
}

export default {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  enableUser,
  disableUser,
  resetUserPassword,
  sendPasswordResetEmail,
};
