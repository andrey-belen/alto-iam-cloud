# Feature Index

Total Features: 8

## Architecture: Single Realm with Groups

All users authenticate against a single `alto` realm. Client and site isolation is achieved through Keycloak groups:

```
alto realm
├── Groups: /clients/{client}/sites/{site}
└── Roles: alto-admin, client-admin, operator, viewer
```

## Roles Overview

| Role | Scope | Dashboard Access |
|------|-------|------------------|
| Alto Admin | All clients, all sites | Full: Clients, Users, Sites, Access Queue |
| Client Admin | Own client group | Users, Sites, Access Queue (own client) |
| Operator | Assigned sites | Site Picker only |
| Viewer | Assigned sites | Site Picker only (read-only) |

## Features List

### Authentication (2 features)

- **Admin Login**
  - Folder: `admin-login`
  - Note: Single login URL, routes based on role

- **MFA Email OTP**
  - Folder: `mfa-email-otp`
  - Note: Required for all logins

### Client & Site Management (2 features)

- **Manage Clients**
  - Folder: `manage-clients`
  - Note: Alto Admin only - CRUD for client groups under `/clients/`

- **Site Groups**
  - Folder: `site-groups`
  - Note: CRUD for sites under `/clients/{client}/sites/`, user-site assignment

### Access Management (1 feature)

- **Request Access**
  - Folder: `request-access`
  - Note: Public form + approval with client + role + site assignment

### User Management (2 features)

- **Manage Users**
  - Folder: `manage-users`
  - Note: View users, assign to sites, role management

- **User Status**
  - Folder: `user-status`
  - Note: Enable/disable users

### Site Access (1 feature)

- **Site Entry** (Phase 2)
  - Folder: `site-entry`
  - Note: "Enter Site" SSO flow (placeholder in Phase 1)

## Implementation Sequence

### Phase 1: Core Security (DONE)
1. **MFA Email OTP** - Foundational security requirement
2. **Admin Login** - Required for all subsequent features

### Phase 2: Infrastructure (IN PROGRESS)
3. **Manage Clients** - Alto Admin creates client groups
4. **Site Groups** - Create sites within clients, assign users

### Phase 3: Access Workflow
5. **Request Access** - Public form + approval with client + role + site assignment

### Phase 4: User Operations
6. **Manage Users** - View, edit, assign sites (depends on site-groups)
7. **User Status** - Enable/disable (depends on manage-users)

### Phase 5: Site Integration (Future)
8. **Site Entry** - SSO to on-premise CERO

## Feature Dependencies

```
mfa-email-otp
    └── admin-login
            ├── manage-clients (Alto Admin only)
            │       └── site-groups
            │               ├── request-access (needs sites for assignment)
            │               └── manage-users (needs sites for assignment)
            │                       └── user-status
            └── site-entry (Phase 2, needs sites)
```

## Code Location

All features implemented at root level:
```
/
├── alto-cero-iam/     # React frontend (Dashboard)
│   └── src/
│       ├── pages/
│       │   ├── ClientsPage.tsx     # manage-clients
│       │   ├── SitesPage.tsx       # site-groups
│       │   ├── UsersPage.tsx       # manage-users
│       │   ├── AccessQueuePage.tsx # request-access (admin view)
│       │   └── SitePickerPage.tsx  # site-entry (operator/viewer)
│       └── components/
├── api/               # Express backend
│   └── src/
│       ├── routes/
│       │   ├── clients.ts          # manage-clients
│       │   ├── sites.ts            # site-groups
│       │   ├── users.ts            # manage-users
│       │   └── access-requests.ts  # request-access
│       └── services/
├── terraform/         # Keycloak configuration
└── keycloak/          # Theme customizations
```

## Keycloak Mapping

| Feature | Keycloak Concept |
|---------|------------------|
| Client (org) | Keycloak Group: `/clients/{name}` |
| Site | Keycloak Group: `/clients/{client}/sites/{name}` |
| User Role | Keycloak Realm Role: `alto-admin`, `client-admin`, `operator`, `viewer` |
| User-Client | Keycloak User-Group membership: `/clients/{client}` |
| User-Site | Keycloak User-Group membership: `/clients/{client}/sites/{site}` |

## Token Structure

After login, the JWT contains:
```json
{
  "realm_access": {
    "roles": ["client-admin"]
  },
  "groups": [
    "/clients/marriott",
    "/clients/marriott/sites/site-hk",
    "/clients/marriott/sites/site-sg"
  ]
}
```

Dashboard parses groups to determine:
- `clientName`: First `/clients/{name}` group → `"marriott"`
- `assignedSites`: All `/clients/{client}/sites/{name}` groups → `["site-hk", "site-sg"]`
