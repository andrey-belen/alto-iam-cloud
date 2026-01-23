# Feature Specification: Site Groups

**Feature Folder**: `site-groups`
**Input**: Generated from PRD - Site Group Management

## Overview

Site groups represent physical sites/buildings within a client's portfolio. They are implemented as Keycloak groups under `/clients/{client}/sites/`. Users are assigned to site groups to control which sites they can access.

## Architecture Context

All sites exist within the single `alto` realm:
```
alto realm
└── Groups:
    └── clients/
        ├── marriott/
        │   └── sites/
        │       ├── site-hk       # /clients/marriott/sites/site-hk
        │       └── site-sg       # /clients/marriott/sites/site-sg
        └── hilton/
            └── sites/
                └── site-bangkok  # /clients/hilton/sites/site-bangkok
```

## User Scenarios & Testing

### Primary User Stories

**As an Alto Admin**, I want to create and manage site groups within any client so that I can organize client sites.

**As a Client Admin**, I want to manage site groups within my client so that I can organize my company's sites and assign users.

### Acceptance Scenarios

**Site Group CRUD (Alto Admin)**
1. [US1] **Given** Alto Admin on client detail page, **When** they click "Add Site", **Then** modal opens with name field and create button
2. [US1] **Given** Alto Admin creating site, **When** they enter name and submit, **Then** Keycloak group is created under `/clients/{client}/sites/` and list refreshes
3. [US2] **Given** Alto Admin viewing sites, **When** they click delete on a site, **Then** confirmation modal appears with user count warning
4. [US2] **Given** site with 0 users, **When** delete confirmed, **Then** Keycloak group is deleted

**Site Group CRUD (Client Admin)**
5. [US3] **Given** Client Admin on their sites page, **When** they view the list, **Then** only their client's sites are shown
6. [US3] **Given** Client Admin, **When** they create/edit/delete sites, **Then** operations work same as Alto Admin but scoped to their client

**User-Site Assignment**
7. [US4] **Given** admin viewing user detail, **When** they click "Assign Sites", **Then** multi-select list of sites appears
8. [US4] **Given** admin selecting sites, **When** they save, **Then** user's group memberships are updated in Keycloak
9. [US5] **Given** admin viewing site detail, **When** they view members tab, **Then** list of assigned users is shown
10. [US5] **Given** admin on site members, **When** they click "Add User", **Then** user picker allows adding users to site

### Edge Cases
- When creating site with duplicate name in same client, system MUST reject with clear message [FR-006]
- When deleting site with assigned users, system MUST show warning with user count [FR-007]
- When user has no site assignments, they MUST NOT be able to "Enter Site" [FR-008]

## Requirements

### Functional Requirements

**Site Group CRUD**
- **FR-001**: System MUST allow Alto Admin to create site groups in any client
- **FR-002**: System MUST allow Client Admin to create site groups in their client only
- **FR-003**: System MUST store site groups as Keycloak groups at `/clients/{client}/sites/{name}`
- **FR-004**: System MUST allow renaming site groups
- **FR-005**: System MUST allow deleting empty site groups
- **FR-006**: System MUST enforce unique site names within a client
- **FR-007**: System MUST warn before deleting site with assigned users

**User-Site Assignment**
- **FR-008**: System MUST allow assigning users to multiple site groups
- **FR-009**: System MUST sync assignments to Keycloak user-group membership
- **FR-010**: System MUST show assigned sites on user detail page
- **FR-011**: System MUST show assigned users on site detail page

**Access Control**
- **FR-012**: Client Admin MUST NOT see or access other clients' site groups
- **FR-013**: Operator/Viewer MUST NOT access site management, only see their assigned sites

### UX Requirements

**Site List View**
- **UX-001**: Site list MUST show: name, user count, created date
- **UX-002**: Site list MUST support search by name
- **UX-003**: Alto Admin view MUST show client selector/filter

**Site Detail View**
- **UX-004**: Site detail MUST have tabs: Overview, Members
- **UX-005**: Members tab MUST show assigned users with role badges
- **UX-006**: "Add User" button MUST open user picker modal

**User-Site Assignment**
- **UX-007**: User detail MUST show "Assigned Sites" section
- **UX-008**: Site assignment MUST use checkbox list or multi-select
- **UX-009**: Changes MUST save immediately (no separate save button)

### Key Entities

- **SiteGroup**: id, clientName, name, path, userCount, createdAt
- **UserSiteAssignment**: userId, siteGroupId (Keycloak group membership)

### Technical Context

- **Tech Stack**: React (UI), Express API, Keycloak Admin API
- **Keycloak Mapping**: Site groups = Keycloak groups at `/clients/{client}/sites/{name}`
- **API Endpoints**:
  - `GET /api/clients/:clientName/sites` - List sites in client
  - `POST /api/clients/:clientName/sites` - Create site
  - `PUT /api/clients/:clientName/sites/:siteId` - Update site
  - `DELETE /api/clients/:clientName/sites/:siteId` - Delete site
  - `GET /api/clients/:clientName/sites/:siteId/members` - List site members
  - `POST /api/clients/:clientName/sites/:siteId/members` - Add user to site
  - `DELETE /api/clients/:clientName/sites/:siteId/members/:userId` - Remove user from site

## Non-Goals (Out of Scope)

- Site status/health monitoring (Phase 2)
- Site metadata (address, timezone, etc.)
- Hierarchical site groups (no nesting beyond client/sites)
- Bulk site import/export
- Site-level settings or configuration
