# Alto CERO IAM - Implementation Status

## Current State: Single Realm with Groups

**Status**: Implementing group-based multi-tenancy in single `alto` realm.

### Architecture

| Aspect | Previous | New |
|--------|----------|-----|
| Realm structure | Multiple realms | Single `alto` realm |
| Client isolation | `client_prefix` attribute | `/clients/{name}` groups |
| Site representation | Realm = site | `/clients/{client}/sites/{name}` groups |
| Roles | 2 (operator, admin) | 4 realm roles |

### Keycloak Structure

```
master                         # Keycloak admin only (not for users)
alto                           # All dashboard users
├── Realm Roles:
│   ├── alto-admin             # God mode - all clients, all sites
│   ├── client-admin           # Manage users in assigned client
│   ├── operator               # Access assigned sites
│   └── viewer                 # Read-only site access
├── Groups:
│   └── clients/
│       ├── marriott/
│       │   └── sites/
│       │       ├── site-hk
│       │       ├── site-sg
│       │       └── site-tokyo
│       └── hilton/
│           └── sites/
│               ├── site-bangkok
│               └── site-sydney
└── Client: alto-cero-iam      # OIDC public client for dashboard
```

### Deployed Infrastructure
- Keycloak 26 running on Docker (localhost:8080)
- PostgreSQL 15 for persistence
- Alto CERO IAM Dashboard (React + Vite) on localhost:3000
- API Server (Express + Prisma) on localhost:3001
- MailHog for email testing (localhost:8025)

### Test Users (Target)

| User | Role | Groups | Access |
|------|------|--------|--------|
| operator@alto.cloud / operator123 | alto-admin | (none needed) | All clients, all sites |
| admin@marriott.com / marriott123 | client-admin | /clients/marriott | All marriott sites |
| staff@marriott.com / staff123 | operator | /clients/marriott/sites/site-hk | site-hk only |

### Token Structure

After login, JWT contains:
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

### Code Locations

```
/
├── alto-cero-iam/src/
│   ├── components/
│   │   └── ProtectedRoute.tsx   # Auth guard, role-based routing
│   ├── contexts/AuthContext.tsx # Auth state with roles + groups
│   ├── services/keycloak.ts     # Keycloak OIDC integration
│   ├── types/index.ts           # AuthUser with roles, clientName, assignedSites
│   ├── pages/
│   │   ├── ClientsPage.tsx      # Alto Admin: manage client groups
│   │   ├── SitesPage.tsx        # Manage sites within client
│   │   ├── UsersPage.tsx        # User management
│   │   ├── AccessQueuePage.tsx  # Approval queue
│   │   └── SitePickerPage.tsx   # Operator/Viewer: site selection
│   └── App.tsx                  # Routes with role guards
├── api/src/
│   ├── routes/
│   │   ├── clients.ts           # Client group CRUD
│   │   ├── sites.ts             # Site group CRUD
│   │   ├── users.ts             # User management
│   │   └── access-requests.ts   # Access request workflow
│   ├── middleware/auth.ts       # JWT validation + role/group extraction
│   └── services/                # Business logic
├── keycloak/
│   ├── themes/alto/             # Custom login theme
│   └── realms/alto-realm.json   # Realm configuration with groups
├── terraform/                   # Keycloak configuration
├── scripts/
│   └── setup-keycloak.sh        # Roles + groups setup script
└── docker-compose.yml           # All services
```

### Implementation Progress

**Phase 1: Core Security** (DONE)
- [x] MFA Email OTP configuration (Terraform module)
- [x] Admin login with Keycloak OIDC
- [x] Custom Alto theme for login page

**Phase 2: Infrastructure** (IN PROGRESS)
- [ ] Create realm roles (alto-admin, client-admin, operator, viewer)
- [ ] Create group hierarchy (/clients/{client}/sites/{site})
- [ ] Add groups protocol mapper to include groups in token
- [ ] Update auth middleware to extract roles + groups
- [ ] Update dashboard for 4-role routing

**Phase 3: Access Workflow** (PENDING)
- [ ] Update access request form with role selection
- [ ] Approval flow with client + role + site assignment
- [ ] Welcome email with role-appropriate instructions

**Phase 4: User Operations** (PENDING)
- [ ] User management with site assignment
- [ ] User enable/disable
- [ ] Role-based permission checks

### Quick Start

```bash
# Start all services with hot-reload
docker compose --profile dev up -d

# Setup Keycloak roles and groups
./scripts/setup-keycloak.sh

# Access:
# - Dashboard: http://localhost:3000
# - Keycloak Admin: http://localhost:8080/admin (admin / admin)
# - MailHog: http://localhost:8025
```

### Setup Script Tasks

The `setup-keycloak.sh` script will:
1. Create realm roles: alto-admin, client-admin, operator, viewer
2. Create group hierarchy: /clients/marriott/sites/*, /clients/hilton/sites/*
3. Create OIDC client: alto-cero-iam
4. Add protocol mapper: groups (include in token)
5. Create test users with role + group assignments
