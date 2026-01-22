# Feature Specification: View Properties

**Feature Branch**: `feature/view-properties`
**Input**: Generated from PRD - Core User Flow, Core MVP Feature

## User Scenarios & Testing

### Primary User Story
As a client administrator, I want to see a dashboard listing all properties belonging to my organization so that I can select which property to manage.

### Acceptance Scenarios
1. [P1] **Given** a logged-in client admin, **When** they access the dashboard, **Then** they see only properties matching their client prefix (e.g., marriott-* realms)
2. [P1] **Given** a logged-in super admin (Alto), **When** they access the dashboard, **Then** they see all properties grouped by client
3. [P2] **Given** properties are loading, **When** the API call is in progress, **Then** a loading spinner is displayed
4. [P2] **Given** each property card, **When** displayed, **Then** it shows property name, realm ID, user count, and status
5. [P3] **Given** no properties exist for client, **When** dashboard loads, **Then** empty state message is displayed

### Edge Cases
- When Keycloak API is slow (>2s), system MUST continue showing loading state [FR-002]
- When client has 50+ properties, system MUST paginate results [FR-004]
- When property realm is disabled, system MUST show disabled badge [FR-003]

## Requirements

### Functional Requirements
- **FR-001**: System MUST fetch realms from Keycloak Admin REST API
- **FR-002**: System MUST filter realms by client prefix from admin's session
- **FR-003**: System MUST display property status (active/disabled) for each realm
- **FR-004**: System MUST support 200+ realms with sub-second response (verified by pagination and API caching)
- **FR-005**: Super admin (no prefix) MUST see all realms grouped by client

### UX Requirements
- **UX-001**: Properties MUST be displayed as cards in a responsive grid layout
- **UX-002**: Each card MUST show: property name, realm ID, user count, active/disabled status
- **UX-003**: Cards MUST be clickable to navigate to property detail
- **UX-004**: Loading state MUST show skeleton cards matching final layout
- **UX-005**: Empty state MUST display helpful message with appropriate icon
- **UX-006**: Super admin view MUST show clear visual separation between clients

### Key Entities
- **Property**: Keycloak realm representing a physical property, has name, realm ID, enabled status
- **Client Group**: Logical grouping of properties by client prefix for super admin view
- **User Count**: Aggregated count of users per realm from Keycloak API

### Technical Context
- **Tech Stack**: React + Tailwind, Keycloak Admin REST API
- **Constraints**: Sub-second API response times for dashboard operations
