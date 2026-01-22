# Implementation Plan: User Status

## Purpose
Enable/disable users without deletion, preserving audit trail.

## Summary
Toggle user enabled status via Keycloak Admin API. Terminate active sessions on disable. Prevent self-disable. Show confirmation when user has active sessions.

## Technical Context

**Language:** TypeScript

**Framework:** React + Tailwind CSS

**Storage:** No local storage, Keycloak API

**API Layer:** Keycloak Admin REST API

**Testing:** Vitest + React Testing Library

**Deployment:** Part of crm-dashboard container

**Constraints:** Must terminate sessions on disable for security

## Implementation Mapping

### Component Architecture

- **Core Components:**
  - `StatusToggle` - Enable/disable button per user row
  - `ConfirmDisableModal` - Confirmation when user has sessions

- **API Operations:**
  - `PUT /admin/realms/{realm}/users/{id}` - Update user enabled
  - `GET /admin/realms/{realm}/users/{id}/sessions` - Get sessions
  - `DELETE /admin/realms/{realm}/users/{id}/sessions` - Terminate sessions

## Feature Code Organization

```
cloud/crm-dashboard/src/
├── components/
│   ├── StatusToggle.tsx
│   └── ConfirmDisableModal.tsx
└── services/
    └── users.ts (extended)
```

**Selected Structure:** Part of crm-dashboard (Structure B).

## Testing Approach

- **Coverage Strategy:**
  - Enable user updates status
  - Disable user terminates sessions
  - Cannot disable self
  - Confirmation when sessions exist
