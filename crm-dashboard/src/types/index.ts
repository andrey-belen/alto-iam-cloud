// AICODE-NOTE: Core types for Alto CRM Dashboard
// Aligned with Keycloak Admin API and backend data model

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified: boolean;
  createdTimestamp?: number;
  attributes?: Record<string, string[]>;
}

export interface UserCredential {
  type: string;
  temporary: boolean;
}

// ============================================================================
// Property Types (Keycloak Realms)
// ============================================================================

export interface Property {
  id: string;
  realm: string;
  displayName?: string;
  enabled: boolean;
  userCount?: number;
  sessionCount?: number;
  createdAt?: string;
}

// ============================================================================
// Access Request Types
// ============================================================================

export type AccessRequestStatus = 'pending' | 'approved' | 'rejected';

export interface AccessRequest {
  id: string;
  propertyId: string;
  propertyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  unit?: string;
  reason?: string;
  status: AccessRequestStatus;
  createdAt: string;
  updatedAt: string;
  processedBy?: string;
  processedAt?: string;
}

export interface CreateAccessRequestInput {
  propertyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  unit?: string;
  reason?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Site Access Types
// ============================================================================

export interface UserSiteAccess {
  id: string;
  userId: string;
  userEmail: string;
  propertyId: string;
  grantedBy: string;
  grantedAt: string;
  revokedAt?: string;
}

// ============================================================================
// Auth Types
// ============================================================================

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  // AICODE-NOTE: client_prefix determines realm visibility
  // "*" = super admin (Alto operator) - sees all realms
  // "marriott" = client admin - sees only marriott-* realms
  clientPrefix?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  token: string | null;
}
