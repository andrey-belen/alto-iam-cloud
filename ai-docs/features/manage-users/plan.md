# Implementation Plan: Manage Users

## Purpose
Display and search users within a property realm (read-only).

## Summary
Fetch users from Keycloak Admin API for selected realm. Display in sortable, searchable table with pagination. No create/delete - users added via Request Access workflow.

## Technical Context

**Language:** TypeScript

**Framework:** React + Tailwind CSS

**Storage:** No local storage, data from Keycloak API

**API Layer:** Keycloak Admin REST API

**Testing:** Vitest + React Testing Library

**Deployment:** Part of crm-dashboard container

**Constraints:** Read-only operations only

## Implementation Mapping

### Component Architecture

- **Core Components:**
  - `PropertyDetailPage` - Container for user list
  - `UsersTable` - Sortable, paginated table
  - `UserRow` - Individual user display

- **API Operations:**
  - `GET /admin/realms/{realm}/users` - List users with pagination
  - `GET /admin/realms/{realm}/users?search=` - Search users

## Feature Code Organization

```
cloud/crm-dashboard/src/
├── pages/
│   └── PropertyDetailPage.tsx
├── components/
│   ├── UsersTable.tsx
│   └── UserRow.tsx
└── services/
    └── users.ts
```

**Selected Structure:** Part of crm-dashboard (Structure B).

## Testing Approach

- **Coverage Strategy:**
  - User list displays with columns
  - Search filters results
  - Pagination works correctly
  - Empty state displays message
