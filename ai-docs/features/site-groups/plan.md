# Implementation Plan: Site Groups

## Overview

Implement site group management using Keycloak groups. Site groups represent physical sites within a client realm and control user access to on-premise CERO systems.

## Technical Approach

### Keycloak Integration

Site groups are implemented as Keycloak groups with `site-` prefix:
- Create group: `POST /admin/realms/{realm}/groups`
- List groups: `GET /admin/realms/{realm}/groups`
- Get members: `GET /admin/realms/{realm}/groups/{id}/members`
- Add member: `PUT /admin/realms/{realm}/users/{userId}/groups/{groupId}`
- Remove member: `DELETE /admin/realms/{realm}/users/{userId}/groups/{groupId}`

### API Layer

Express routes proxy to Keycloak Admin API with:
- JWT validation (auth middleware)
- Role-based access control (Alto Admin vs Client Admin)
- Response transformation (Keycloak model → API model)

### Frontend

React components with:
- Role-aware rendering (hide realm selector for Client Admin)
- Optimistic updates for member operations
- Search/filter state management

## Code Organization

```
api/src/
├── routes/site-groups.ts       # Express routes
├── services/site-groups.ts     # Business logic
└── middleware/realm-access.ts  # Realm access guard

alto-cero-iam/src/
├── pages/
│   ├── SiteGroupsPage.tsx      # Site list view
│   └── SiteDetailPage.tsx      # Site detail with members
├── components/site-groups/
│   ├── SiteGroupTable.tsx      # Site list table
│   ├── CreateSiteModal.tsx     # Create/edit modal
│   ├── SiteMembersTable.tsx    # Members list
│   └── AssignSitesModal.tsx    # User → sites assignment
├── hooks/
│   └── useSiteGroups.ts        # API hooks
└── services/
    └── site-groups.ts          # API client
```

## Implementation Phases

### Phase 1: API Foundation
1. Create site-groups route file
2. Implement Keycloak group service
3. Add realm access middleware
4. Test with Postman/curl

### Phase 2: List & CRUD UI
1. Create SiteGroupsPage
2. Implement SiteGroupTable
3. Add CreateSiteModal
4. Wire up API hooks

### Phase 3: Site Detail & Members
1. Create SiteDetailPage
2. Implement SiteMembersTable
3. Add member add/remove operations
4. Connect to user management

### Phase 4: User-Site Assignment
1. Add "Assigned Sites" to user detail
2. Create AssignSitesModal
3. Update user hooks for site assignment

## Dependencies

### Required Before Start
- Keycloak realm structure (realm-per-client)
- Realm roles created (client-admin, operator, viewer)
- Auth middleware supporting role checks

### External Dependencies
- Keycloak Admin API access
- JWT token with realm access claims

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Keycloak group API limitations | Test API thoroughly before UI work |
| Performance with many groups | Implement pagination early |
| Concurrent modification | Use optimistic locking or last-write-wins |

## Testing Strategy

### Unit Tests
- Service layer: mock Keycloak API responses
- Validation: site name rules, slug generation

### Integration Tests
- API routes with test Keycloak instance
- CRUD operations end-to-end

### E2E Tests
- Create site → assign user → verify membership
- Role-based access (Client Admin cannot see other realms)
