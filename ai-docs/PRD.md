# Alto IAM - Product Requirements Document

## Core Proposition

### Target User
- Alto's enterprise clients (hotel chains, commercial building operators)
- Organizations managing multiple properties with distributed staff
- IT administrators responsible for access control across sites

### Problem
- Clients need centralized management of operator/staff access across multiple sites
- Clear data separation required between different clients
  - Marriott administrators cannot see Hilton's users
  - Each client operates in complete isolation
- MFA enforcement required for security compliance
- Self-service user management needed without Alto admin involvement
- Must integrate with existing on-premise Alto CERO deployments

### Core Solution Proposition
- Multi-tenant identity management system built on Keycloak
- Cloud Keycloak serves as source of truth for all users
- Single realm with group-based client and site isolation
- Keycloak handles authentication and MFA (Email OTP)
- SSO capability to on-premise sites (Phase 2)
- User sync to on-premise deployments (Phase 3)

## Architecture

### Cloud Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLOUD                                  │
│  ┌───────────────┐    ┌───────────────┐                    │
│  │   Keycloak    │    │   Dashboard   │                    │
│  │  (alto realm) │◄──►│   (React)     │                    │
│  └───────────────┘    └───────────────┘                    │
└─────────────────────────────────────────────────────────────┘
          │
          │ Identity Broker (Phase 2)
          ▼
┌─────────────────────────────────────────────────────────────┐
│                      SITE                                   │
│  ┌───────────────┐    ┌───────────────┐                    │
│  │   Keycloak    │◄──►│  CERO Stack   │                    │
│  │ (local copy)  │    │  (Django/FE)  │                    │
│  └───────────────┘    └───────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Single Realm with Groups

```
alto realm
├── Realm Roles:
│   ├── alto-admin      (god mode - all clients, all sites)
│   ├── client-admin    (manage users in assigned client)
│   ├── operator        (access assigned sites only)
│   └── viewer          (read-only access to assigned sites)
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
└── Users:
    ├── operator@alto.cloud    (alto-admin role)
    ├── admin@marriott.com     (client-admin role, /clients/marriott group)
    └── staff@marriott.com     (operator role, /clients/marriott/sites/site-hk group)
```

## Data Model

### Core Entities

**Client (Group)**
- Top-level group under `/clients/`
- Represents a client organization (e.g., `marriott`, `hilton`)
- Contains site groups and users
- Access controlled by group membership

**Site (Group)**
- Nested under `/clients/{client}/sites/`
- Represents a physical site/building
- Users can be assigned to multiple sites
- Example: `/clients/marriott/sites/site-hk`

**User**
- All users in single `alto` realm
- Has one role (alto-admin/client-admin/operator/viewer)
- Client determined by `/clients/{client}` group membership
- Sites determined by `/clients/{client}/sites/{site}` group membership

**Access Request** (separate storage, not in Keycloak)
- Pending approval queue
- Contains: name, email, company, requested sites, requested role

### Entity Relationships

```
Client Group (/clients/{client})
├── 1:N → Site Groups (/clients/{client}/sites/{site})
├── 1:N → Users (via group membership)
└── 1:N → Access Requests (pending)

User
├── 1:1 → Role (realm role assignment)
├── 1:1 → Client (group membership)
└── 1:N → Sites (group membership)

Site Group
├── N:1 → Client
└── N:M → Users (group membership)
```

## Roles & Permissions

### Alto Admin (god mode)

Scope: All clients, all sites

| Permission | Description |
|------------|-------------|
| Client CRUD | Create/delete client groups |
| User CRUD (all) | Manage users across all clients |
| Create admins | Only role that can assign client-admin |
| Access request approval (all) | Approve any pending request |
| Site CRUD | Manage site groups across all clients |

### Client Admin

Scope: Own client group only

| Permission | Description |
|------------|-------------|
| User CRUD | Create/edit/disable users in their client |
| Create operator/viewer | Cannot assign client-admin role |
| Access request approval | Own client's requests only |
| Site assignment | Assign users to sites within their client |
| Enter sites | SSO to any site in their client (Phase 2) |

### Operator

Scope: Assigned sites only

| Permission | Description |
|------------|-------------|
| Enter sites | SSO to assigned sites only (Phase 2) |
| Profile management | Change password, 2FA |
| Site actions | Control equipment, ack alarms, schedules |

### Viewer

Scope: Assigned sites only

| Permission | Description |
|------------|-------------|
| Enter sites | SSO to assigned sites, read-only (Phase 2) |
| Profile management | Change password, 2FA |
| View dashboards | Read-only access |

## User Flows

### Flow A: Alto Admin (Super Admin)
1. Alto admin logs into dashboard (single login URL)
2. Views all access requests across all clients
3. Approves/rejects requests, assigns client + role + sites
4. Manages all clients, users, and sites

### Flow B: Client Admin
1. Client admin logs into dashboard (same login URL)
2. Dashboard displays only their client's sites (filtered by group)
3. Admin manages users: view, enable/disable, assign to sites
4. Admin approves access requests for their client
5. Users can then log into on-premise Alto CERO at assigned sites with MFA

### Flow C: New User Access Request
1. User visits public "Request Access" page
2. Fills form: company name, full name, email, phone, role/position
3. Submits request (stored in pending queue)
4. Alto admin (or client admin for their client) receives notification
5. Approver reviews, approves with: client + role + sites
6. User receives email with credentials and MFA setup instructions

### Flow D: Operator/Viewer
1. Operator/Viewer logs into dashboard (same login URL)
2. Sees site picker with only their assigned sites
3. Clicks "Enter Site" to SSO into on-premise CERO (Phase 2)

## Technical Requirements

### Tech Stack
- **Identity Provider**: Keycloak 26+
  - Single `alto` realm for all users
  - Group-based multi-tenancy
  - Built-in MFA support
- **Dashboard**: React + Tailwind CSS + Vite
  - Fast development
  - Responsive design
  - Component reusability
- **API**: Express + Prisma + PostgreSQL
  - Access request storage
  - Keycloak Admin API proxy
- **Deployment**: Docker Compose
  - Single-command deployment
  - Easy VM provisioning
- **HTTPS**: Caddy
  - Automatic Let's Encrypt certificates
  - Zero-config TLS
- **Email**: SMTP (MailHog for dev, Google SMTP for prod)
  - For MFA OTP delivery
  - Welcome emails and notifications

### Keycloak Structure

```
master                    # Keycloak admin only (not for users)
alto                      # All dashboard users
├── Realm Roles:
│   ├── alto-admin
│   ├── client-admin
│   ├── operator
│   └── viewer
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
└── Client: alto-cero-iam (OIDC public client)
```

### Token Structure

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

### Technical Constraints
- All operations via Keycloak Admin REST API
- Access requests stored in PostgreSQL (separate from Keycloak)
- Client/site isolation via Keycloak groups
- Role stored as Keycloak realm role assignment
- Groups included in token via protocol mapper
- Cloud VM deployment (Azure) for production

### Security Constraints
- Only Alto admin can assign client-admin role
- Client admins cannot escalate to alto-admin
- Users can only access sites they are assigned to (group membership)
- All logins require 2FA (email for MVP)
- Access tokens short-lived (15 min), refresh tokens rotated
- Single login URL - no realm selection needed

## MVP Phases

### Phase 1: Dashboard (No Site Integration) - CURRENT

**Included:**
- Cloud Keycloak with single realm + group hierarchy
- Alto admin dashboard (full features)
- Client admin dashboard (user/site management)
- Operator/Viewer dashboard (site picker only)
- Access request flow with client + role + site assignment
- Site groups as metadata (no live connection)
- 2FA via email

**Mocked/Disabled:**
- "Enter Site" button (placeholder)
- Site status indicators
- User sync

### Phase 2: Single Site Integration

**Included:**
- Identity broker configuration (Cloud → Site)
- SSO flow (Cloud → Site)
- Direct site login support
- "Enter Site" button functional

### Phase 3: User Sync

**Included:**
- Sync service implementation
- Event-driven sync (Cloud → Site)
- Multi-site support

### Phase 4: Production Hardening

**Included:**
- Audit logging
- Monitoring/alerting
- Backup/recovery

## UX Requirements

### Platform Strategy
- Desktop-first admin dashboard
- Primary use case is office-based administration
- Responsive but optimized for 1280px+ screens

### Interface Requirements
- Clean professional design
- Violet/Purple accent (#8b5cf6) for Alto branding
- Single login URL for all users
- Role-based navigation:
  - Alto Admin: All Clients, All Users, Access Queue, Sites
  - Client Admin: Users, Sites, Access Queue (filtered to their client)
  - Operator/Viewer: Site Picker only
- All views must handle states: Loading, Empty, Error, Success

## Non-Goals (Out of Scope for MVP)

- Self-registration (all users must be approved)
- On-premise sync automation (Phase 3)
- Custom branding per client
- Advanced analytics/reporting
- Mobile app
- SSO integration with third-party IdPs
- Vault integration for site credentials
- Session invalidation automation
- Multiple realms (single realm is sufficient for MVP)

## Success Metrics

- Deploy to VM in under 30 minutes
- Client admin can add first user within 5 minutes of onboarding
- MFA code delivered in under 10 seconds
- Zero cross-client data leakage

## Priority

1. **MFA** - Most important, must be reliable
2. **Fast VM deployment** - Single command, minimal configuration
3. **Access Request workflow** - Public form → approval → user creation with client + role + sites
4. **Client isolation** - Group-based separation between clients
5. **Site group management** - Assign users to sites
6. **Role-based access** - 4-tier role system
