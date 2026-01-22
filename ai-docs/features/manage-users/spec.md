# Feature Specification: Manage Users

**Feature Branch**: `feature/manage-users`
**Input**: Generated from PRD - Core User Flow, Core MVP Feature

## User Scenarios & Testing

### Primary User Story
As a client administrator viewing a property, I want to view all users and their status so that I can monitor who has access to that property's Alto CERO system.

### Acceptance Scenarios
1. [P1] **Given** an admin on property detail page, **When** page loads, **Then** user list displays with username, email, status, and last login
2. [P1] **Given** user list for a property, **When** displayed, **Then** each row shows username, email, enabled status, and last login date
3. [P2] **Given** user list exceeds 20 users, **When** scrolling, **Then** pagination controls appear
4. [P2] **Given** an admin searching users, **When** they type in search field, **Then** list filters by username or email
5. [P3] **Given** no users exist for property, **When** page loads, **Then** empty state shows message directing to Request Access flow

### Edge Cases
- When Keycloak API returns error, system MUST display error state with retry option [FR-001]
- When user count exceeds 100 users, system MUST paginate results [FR-002]
- When admin has no permission for realm, system MUST redirect to properties list [FR-003]

## Requirements

### Functional Requirements
- **FR-001**: System MUST list all users in selected Keycloak realm via Admin REST API
- **FR-002**: System MUST support pagination for realms with 20+ users
- **FR-003**: System MUST verify admin has permission for the realm before displaying
- **FR-004**: System MUST display user metadata: username, email, enabled status, last login timestamp
- **FR-005**: System MUST support search/filter by username or email

### UX Requirements
- **UX-001**: User list MUST be displayed as a table with sortable columns
- **UX-002**: Each row MUST show: username, email, enabled/disabled badge, last login (relative time)
- **UX-003**: Empty state MUST display message: "No users yet. Users are added via the Request Access workflow."
- **UX-004**: Loading state MUST show skeleton rows matching table layout
- **UX-005**: Search field MUST filter results as user types (debounced 300ms)

### Key Entities
- **Property User**: Keycloak user within a specific realm, has username, email, enabled status
- **User Metadata**: Last login timestamp, creation date from Keycloak
- **User List**: Paginated collection of users for a realm

### Technical Context
- **Tech Stack**: React + Tailwind, Keycloak Admin REST API
- **Constraints**: Read-only operations - user creation via `request-access` feature only

## Non-Goals (Explicit)
- User creation (handled by `request-access` feature)
- User deletion (use disable instead for audit trail)
- Password reset (users use "forgot password" flow)
