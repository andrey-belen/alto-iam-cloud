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
export type RolePreference = 'operator' | 'viewer';

export interface AccessRequest {
  id: string;
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rolePreference: RolePreference;
  status: AccessRequestStatus;
  createdAt: string;
  updatedAt: string;
  processedBy?: string;
  processedAt?: string;
}

export interface CreateAccessRequestInput {
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rolePreference: RolePreference;
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

// AICODE-NOTE: Role hierarchy for access control
// Single alto realm with groups-based isolation:
// - alto-admin: Full access to all clients and sites
// - client-admin: Manage users within assigned client group
// - operator: Access assigned sites only
// - viewer: Read-only access to assigned sites
export type UserRole = 'alto-admin' | 'client-admin' | 'operator' | 'viewer';

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: UserRole[];           // From realm_roles claim
  groups: string[];            // Full group paths: ["/clients/marriott", "/clients/marriott/sites/site-hk"]
  clientName?: string;         // Derived from groups: "marriott" (from /clients/marriott)
  assignedSites: string[];     // Derived from groups: ["site-hk"] (from /clients/marriott/sites/site-hk)
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  token: string | null;
}
