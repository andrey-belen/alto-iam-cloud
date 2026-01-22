# Implementation Plan: View Properties

## Purpose
Display property cards filtered by client prefix from admin's Keycloak attributes.

## Summary
Fetch realms from Keycloak Admin API, filter by client prefix, display as responsive card grid. Super admins see all realms grouped by client.

## Technical Context

**Language:** TypeScript

**Framework:** React + Tailwind CSS

**Storage:** No local storage, data from Keycloak API

**API Layer:** Keycloak Admin REST API

**Testing:** Vitest + React Testing Library

**Deployment:** Part of crm-dashboard container

**Constraints:** Sub-second response for 200+ realms

## Implementation Mapping

### Component Architecture

- **Core Components:**
  - `PropertiesPage` - Grid of property cards
  - `PropertyCard` - Individual property display
  - `ClientGroup` - Grouping for super admin view

- **API Operations:**
  - `GET /admin/realms` - List all realms
  - `GET /admin/realms/{realm}/users/count` - User count

## Feature Code Organization

```
cloud/crm-dashboard/src/
├── pages/
│   └── PropertiesPage.tsx
├── components/
│   ├── PropertyCard.tsx
│   └── ClientGroup.tsx
└── services/
    └── properties.ts
```

**Selected Structure:** Part of crm-dashboard (Structure B).

## Testing Approach

- **Coverage Strategy:**
  - Client admin sees only prefixed realms
  - Super admin sees all realms grouped
  - Loading/empty/error states
