# Feature Specification: User Status

**Feature Branch**: `feature/user-status`
**Input**: Generated from PRD - Supporting Features

## User Scenarios & Testing

### Primary User Story
As a client administrator, I want to enable or disable users without deleting them so that I can quickly revoke or restore access while preserving the audit trail.

### Acceptance Scenarios
1. [P1] **Given** an admin viewing a user in the list, **When** they click "Disable", **Then** user status changes to disabled and they cannot log in
2. [P1] **Given** an admin viewing a disabled user, **When** they click "Enable", **Then** user status changes to enabled and they can log in again
3. [P2] **Given** a user is disabled, **When** viewing user list, **Then** disabled status is clearly visible with visual indicator
4. [P3] **Given** an admin disables a user with active sessions, **When** action completes, **Then** all active sessions are terminated

### Edge Cases
- When disabling self (logged-in admin), system MUST warn and prevent action [FR-003]
- When toggling status fails, system MUST show error and revert UI state [FR-001]
- When user has active sessions during disable, system MUST terminate all sessions [FR-004]

## Requirements

### Functional Requirements
- **FR-001**: System MUST toggle user enabled/disabled status via Keycloak Admin REST API
- **FR-002**: System MUST preserve all user data when disabling (no deletion)
- **FR-003**: System MUST prevent admin from disabling their own account
- **FR-004**: System MUST terminate active sessions when user is disabled (verified by Keycloak session invalidation)
- **FR-005**: Disabled users MUST be unable to authenticate until re-enabled

### UX Requirements
- **UX-001**: Enable/Disable MUST be a toggle button or switch in user row
- **UX-002**: Disabled users MUST show grayed-out row with "Disabled" badge
- **UX-003**: Toggle action MUST show loading state during API call
- **UX-004**: Confirmation MUST be required when disabling user with active sessions

### Key Entities
- **User Status**: Boolean enabled flag on Keycloak user, affects authentication capability
- **Active Session**: Current login session that must be terminated on disable

### Technical Context
- **Tech Stack**: React + Tailwind, Keycloak Admin REST API
- **Constraints**: Status changes must take effect immediately for security
