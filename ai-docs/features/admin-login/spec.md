# Feature Specification: Admin Login

**Feature Branch**: `feature/admin-login`
**Input**: Generated from PRD - Core User Flow, Core MVP Feature

## User Scenarios & Testing

### Primary User Story
As a client administrator, I want to log into the CRM dashboard using my Keycloak credentials so that I can manage users across my organization's properties.

### Acceptance Scenarios
1. [P1] **Given** a valid client admin with Keycloak credentials, **When** they enter correct username and password on the login page, **Then** they are authenticated and redirected to the properties dashboard
2. [P1] **Given** a logged-in admin, **When** they click logout, **Then** their session is terminated and they are redirected to the login page
3. [P2] **Given** a user on the login page, **When** authentication is in progress, **Then** a loading indicator is displayed
4. [P3] **Given** a user with invalid credentials, **When** they attempt to log in, **Then** an error message is displayed without revealing which field was incorrect

### Edge Cases
- When session expires during use, system MUST redirect to login with session expired message [FR-003]
- When Keycloak is unavailable, system MUST display service unavailable error [FR-001]
- When user has no client prefix assigned, system MUST deny access with appropriate message [FR-004]

## Requirements

### Functional Requirements
- **FR-001**: System MUST authenticate admins via Keycloak master realm using OIDC
- **FR-002**: System MUST store authentication tokens securely in browser storage
- **FR-003**: System MUST handle token expiration and refresh automatically
- **FR-004**: System MUST extract client prefix from user attributes for filtering
- **FR-005**: System MUST provide logout functionality that clears all session data

### UX Requirements
- **UX-001**: Login form MUST display username and password fields with clear labels
- **UX-002**: Login button MUST show loading state during authentication
- **UX-003**: Error messages MUST be displayed in red (#EF4444) with clear actionable text
- **UX-004**: Login page MUST use white background with blue (#0ea5e9) accent for primary button

### Key Entities
- **Admin User**: Keycloak user with client prefix attribute, credentials managed by Keycloak
- **Session**: Authentication state including access token, refresh token, client prefix
- **Client Prefix**: String identifier linking admin to their organization (e.g., "marriott", "hilton")

### Technical Context
- **Tech Stack**: React + Keycloak OIDC, Keycloak Admin REST API
- **Constraints**: Must use Keycloak master realm for admin authentication

---

## Implementation Notes

**Status**: Implemented with modifications

### Changes from Original Spec

| Spec | Implementation | Reason |
|------|----------------|--------|
| React login page | Direct Keycloak redirect | Simpler flow, leverages Keycloak themed login |
| Blue accent (#0ea5e9) | Violet accent (#8b5cf6) | Distinguish from on-premise cyan theme |
| Separate login route | `/login` redirects to `/` | All auth handled by Keycloak |

### Implementation Details

**Authentication Flow:**
1. User visits any protected route
2. `ProtectedRoute` component checks `isAuthenticated`
3. If not authenticated, calls `keycloak.login()` with explicit `redirectUri`
4. Keycloak shows custom Alto Cloud IAM themed login
5. After successful login, redirects back to CRM origin
6. `keycloak-js` handles token exchange automatically
7. `AuthContext` extracts user info including `client_prefix`

**Key Files:**
- `cloud/crm-dashboard/src/components/ProtectedRoute.tsx` - Auth guard
- `cloud/crm-dashboard/src/services/keycloak.ts` - OIDC integration
- `cloud/crm-dashboard/src/contexts/AuthContext.tsx` - State management
- `cloud/keycloak/themes/alto/` - Custom login theme

**Test Users:**
- `alto-operator` / `operator123` - Super admin (client_prefix: `*`)
- `marriott-admin` / `marriott123` - Client admin (client_prefix: `marriott`)

**Protocol Mapper:**
- `client_prefix` user attribute mapped to access token via `oidc-usermodel-attribute-mapper`
