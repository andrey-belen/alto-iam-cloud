import { getToken } from './keycloak';
import type { Property, ApiResponse, PaginatedResponse } from '@/types';

// AICODE-NOTE: Properties service - manages Keycloak realms as properties
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
// Property CRUD Operations
// ============================================================================

export async function getProperties(): Promise<ApiResponse<Property[]>> {
  return fetchWithAuth<Property[]>('/properties');
}

export async function getPropertiesPaginated(
  page: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<PaginatedResponse<Property>>> {
  return fetchWithAuth<PaginatedResponse<Property>>(
    `/properties?page=${page}&pageSize=${pageSize}`
  );
}

export async function getProperty(
  propertyId: string
): Promise<ApiResponse<Property>> {
  return fetchWithAuth<Property>(`/properties/${propertyId}`);
}

export async function createProperty(
  data: Partial<Property>
): Promise<ApiResponse<Property>> {
  return fetchWithAuth<Property>('/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProperty(
  propertyId: string,
  data: Partial<Property>
): Promise<ApiResponse<Property>> {
  return fetchWithAuth<Property>(`/properties/${propertyId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProperty(
  propertyId: string
): Promise<ApiResponse<void>> {
  return fetchWithAuth<void>(`/properties/${propertyId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Property Statistics
// ============================================================================

export async function getPropertyStats(
  propertyId: string
): Promise<ApiResponse<{ userCount: number; activeUsers: number }>> {
  return fetchWithAuth<{ userCount: number; activeUsers: number }>(
    `/properties/${propertyId}/stats`
  );
}

export default {
  getProperties,
  getPropertiesPaginated,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyStats,
};
