# Alto IAM Architecture Migration: Realm = Client

## Context

Alto IAM is a multi-tenant identity management system for building automation. We are migrating from an inconsistent state to a clean "realm = client" architecture.

### Current State (Broken)

- **Documentation** describes: Single realm + groups model
- **Code** implements: Realm = site model (each site is a realm)
- **Auth middleware** is ready for groups but no groups exist in Keycloak
- **`UserSiteAccess`** PostgreSQL table tracks site access separately from Keycloak

### Target State

**Realm = Client** model where:
- Each client organization (Marriott, Hilton) gets ONE Keycloak realm
- Sites within client are Keycloak groups: `/sites/{site-name}`
- Users belong to one realm, can access multiple sites via group membership
- Alto admins use a separate `alto` realm

---

## Target Architecture

### Keycloak Structure

```
master                          # Keycloak admin only
alto                            # Alto internal staff
├── Roles: alto-admin
├── Groups: (none needed)
└── Users: operator@alto.cloud, etc.

marriott                        # Client realm
├── Roles: client-admin, operator, viewer
├── Groups:
│   └── sites/
│       ├── site-hk
│       ├── site-sg
│       └── site-tokyo
└── Users: admin@marriott.com (client-admin), staff@marriott.com (operator)

hilton                          # Client realm
├── Roles: client-admin, operator, viewer
├── Groups:
│   └── sites/
│       ├── site-bangkok
│       └── site-sydney
└── Users: admin@hilton.com, etc.
```

### Role Definitions

| Role | Scope | Permissions |
|------|-------|-------------|
| `alto-admin` | All realms | Create/delete clients, manage all users, approve any request |
| `client-admin` | Own realm | Manage users in realm, assign to sites, approve requests |
| `operator` | Assigned sites | Access sites, control equipment |
| `viewer` | Assigned sites | Read-only access to sites |

### Token Structure

**Alto admin token** (from `alto` realm):
```json
{
  "iss": "https://auth.alto.cloud/realms/alto",
  "realm_access": { "roles": ["alto-admin"] },
  "groups": []
}
```

**Client user token** (from client realm, e.g., `marriott`):
```json
{
  "iss": "https://auth.alto.cloud/realms/marriott",
  "realm_access": { "roles": ["operator"] },
  "groups": ["/sites/site-hk", "/sites/site-sg"]
}
```

### Login Flows

1. **Alto admin**: `https://auth.alto.cloud/realms/alto` → Dashboard shows all clients
2. **Client user**: `https://auth.alto.cloud/realms/{client}` → Dashboard shows their sites
3. **Direct site login**: Site Keycloak (same realm name) with synced users

---

## Two-Way Sync Architecture

### Direction: Cloud → Site

**Trigger**: User created/updated in cloud, assigned to site group
**Action**: Sync user to site's local Keycloak (same realm name)
**Data synced**: credentials (hashed), roles, site group membership, 2FA seeds

### Direction: Site → Cloud

**Trigger**: Local admin creates user at site
**Action**: Sync user to cloud Keycloak
**Constraint**: User gets ONLY that site's group membership (not other sites)

### Sync Service

```
Cloud Keycloak (marriott realm)     Site Keycloak (marriott realm)
├── /sites/site-hk                  ├── /sites/site-hk (this site only)
├── /sites/site-sg                  └── users (filtered: only site-hk members)
├── /sites/site-tokyo
└── users (all marriott users)
            │
            ▼
      Sync Service
      - Listens to Keycloak events (both directions)
      - Filters users by site group for site→cloud
      - Cloud is source of truth for conflicts
```

### Conflict Resolution

| Scenario | Resolution |
|----------|------------|
| Same email exists | Cloud version wins, site overwritten |
| User deleted on cloud while site offline | Mark inactive on site when reconnects |
| Password changed on site | Push to cloud (user's choice of where to change) |
| Role changed on site | Reject - roles managed from cloud only |

---

## Task A: Update Documentation

Update all files in `/ai-docs/` to reflect realm = client architecture:

### 1. `ai-docs/PRD.md`

- [x] Update "Architecture" section with realm = client diagram
- [x] Update "Keycloak Structure" to show client realms
- [x] Update "Token Structure" examples
- [x] Update "User Flows" for multi-realm login
- [ ] Add "Two-Way Sync" section with architecture (Phase 3)
- [ ] Move Vault from "Non-Goals" to "Phase 3" (Phase 3)
- [ ] Add "Conflict Resolution" section (Phase 3)

### 2. `ai-docs/README.md`

- [x] Update "Keycloak Structure" diagram
- [x] Update "Test Users" table with realm info
- [x] Update "Token Structure" example
- [x] Update implementation progress checklist
- [x] Remove references to single realm

### 3. `ai-docs/FEATURES.md`

- [x] Update "Architecture" section
- [x] Update "Keycloak Mapping" table
- [ ] Add "user-sync" feature to list (Phase 3)
- [x] Update feature dependencies

### 4. Create `ai-docs/features/user-sync/spec.md` (Phase 3)

Create new feature spec with:
- [ ] Sync direction (bidirectional)
- [ ] Trigger mechanisms (Keycloak events)
- [ ] Data synced (credentials, roles, groups, 2FA)
- [ ] Conflict resolution rules
- [ ] Offline handling
- [ ] API endpoints needed

### 5. Create `ai-docs/ISO-COMPLIANCE.md` (Phase 4)

Document ISO 27001 controls:
- [ ] A.9.2.6 - Session invalidation on access removal
- [ ] A.12.4.1 - Audit retention (1yr auth, 3yr access changes)
- [ ] A.11.2.7 - Secure disposal on site decommission
- [ ] A.18.1.3 - Data retention on client offboarding

---

## Task B: Implement Code Changes

### 1. Remove Legacy Code (Future cleanup)

- [ ] Delete `UserSiteAccess` model from `prisma/schema.prisma`
- [ ] Delete `api/src/routes/site-access.ts`
- [ ] Remove `filterPropertiesByClient()` from `client-access.ts`
- [ ] Remove `requirePropertyAccess()` deprecated function

### 2. Update Auth Middleware (`api/src/middleware/auth.ts`)

- [x] Extract realm from token issuer: `iss.split('/realms/')[1]`
- [x] Add `realm: string` to `AuthUser` interface
- [x] Update `extractAssignedSites()` to use `/sites/{name}` pattern (not `/clients/x/sites/y`)
- [x] Remove `clientName` - now derived from realm
- [x] Add `isAltoAdmin()` check: `realm === 'alto' && roles.includes('alto-admin')`

Updated `AuthUser` interface: **DONE**
```typescript
export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  realm: string;              // From token issuer: "marriott", "hilton", "alto"
  roles: UserRole[];          // From realm_access: ["client-admin"], ["operator"]
  groups: string[];           // Group paths: ["/sites/site-hk", "/sites/site-sg"]
  assignedSites: string[];    // Derived: ["site-hk", "site-sg"]
}
```

### 3. Replace Properties Routes with Clients Routes (existing routes work, future API cleanup)

Create `api/src/routes/clients.ts`:
```typescript
// GET /api/clients - List all client realms (alto-admin only)
// GET /api/clients/:clientId - Get client realm details
// POST /api/clients - Create new client realm (alto-admin only)
// DELETE /api/clients/:clientId - Delete client realm (alto-admin only)
```

### 4. Create Sites Routes

Create `api/src/routes/sites.ts`:
```typescript
// GET /api/clients/:clientId/sites - List sites (groups) in client
// POST /api/clients/:clientId/sites - Create site group
// DELETE /api/clients/:clientId/sites/:siteId - Delete site group
// GET /api/clients/:clientId/sites/:siteId/users - Users assigned to site
// POST /api/clients/:clientId/sites/:siteId/users/:userId - Assign user to site
// DELETE /api/clients/:clientId/sites/:siteId/users/:userId - Remove user from site
```

### 5. Update Users Routes (`api/src/routes/users.ts`)

- [ ] Add realm parameter to all routes: `/api/clients/:clientId/users`
- [ ] Filter users by realm
- [ ] Include site group assignments in user response
- [ ] Update user creation to assign site groups

### 6. Update Access Request Flow

Update `api/src/routes/access-requests.ts`:
- [ ] Add `clientId` field to AccessRequest model
- [ ] Add `siteIds` field (array of requested sites)
- [ ] On approval: create user in client realm + assign to site groups

Update `prisma/schema.prisma`:
```prisma
model AccessRequest {
  // ... existing fields
  clientId       String    @map("client_id")      // Target client realm
  siteIds        String[]  @map("site_ids")       // Requested site groups
}
```

### 7. Update Keycloak Admin Service

Update `api/src/services/keycloak-admin.service.ts`:
- [ ] Add `createRealm(name, displayName)` - Create client realm with default roles
- [ ] Add `deleteRealm(name)` - Delete client realm
- [ ] Add `getGroups(realm)` - List groups in realm
- [ ] Add `createGroup(realm, path)` - Create site group
- [ ] Add `deleteGroup(realm, groupId)` - Delete site group
- [ ] Add `addUserToGroup(realm, userId, groupId)` - Assign user to site
- [ ] Add `removeUserFromGroup(realm, userId, groupId)` - Remove user from site
- [ ] Update `createUser()` to accept realm parameter
- [ ] Update `getUsers()` to accept realm parameter

### 8. Update Frontend

Update `alto-cero-iam/src/`:

**Auth Context** (`contexts/AuthContext.tsx`):
- [x] Parse realm from token issuer
- [x] Remove `clientName`, use `realm` instead
- [x] Update `assignedSites` parsing for new group structure

**Login** (`services/keycloak.ts`):
- [x] Extract realm from token issuer
- [x] Update group parsing for `/sites/{name}` pattern
- [ ] Support realm selection or detection (future: currently uses configured realm)

**Pages** (existing pages work, use realm for access control):
- [x] `ClientsPage.tsx` - Already exists, manages client realms
- [x] `SitesPage.tsx` - Already exists, manages sites within client
- [x] `SitePickerPage.tsx` - Already exists, operator/viewer site selection
- [x] `UsersPage.tsx` - Already exists, user management
- [x] `AccessQueuePage.tsx` - Already exists, approval queue

**Routing** (`App.tsx`):
- [x] Routes already implemented, access control uses realm from token

**Types** (`types/index.ts`):
- [x] Updated `AuthUser` interface to use `realm` instead of `clientName`
- [x] Updated comments to reflect realm = client architecture

### 9. Database Migration

```bash
# Generate migration to remove UserSiteAccess
npx prisma migrate dev --name remove_user_site_access

# Update AccessRequest model
npx prisma migrate dev --name add_client_site_to_access_request
```

### 10. Keycloak Setup Script

Updated `scripts/setup-keycloak.sh`: **DONE**
- [x] Verify `alto` realm with alto-admin role
- [x] Verify client realms (marriott, hilton) with roles: client-admin, operator, viewer
- [x] Verify site groups: /sites/site-hk, /sites/site-sg
- [x] Verify test users with role + group assignments
- [x] Test token generation and issuer verification

---

## Validation Checklist

After implementation:

- [ ] Alto admin can login to `alto` realm, see all client realms
- [ ] Alto admin can create new client realm
- [ ] Client admin can login to their realm, see their sites
- [ ] Client admin can create users, assign to sites
- [ ] Operator can login, see only assigned sites in picker
- [ ] Token contains correct realm, roles, and groups
- [ ] Access denied when accessing other client's realm
- [ ] Sites correctly filtered by group membership

---

## File Reference

```
alto-iam-cloud/
├── ai-docs/
│   ├── PRD.md                    # UPDATE
│   ├── README.md                 # UPDATE
│   ├── FEATURES.md               # UPDATE
│   ├── ISO-COMPLIANCE.md         # CREATE
│   └── features/
│       └── user-sync/
│           └── spec.md           # CREATE
├── api/
│   ├── prisma/schema.prisma      # UPDATE (remove UserSiteAccess, update AccessRequest)
│   └── src/
│       ├── middleware/
│       │   ├── auth.ts           # UPDATE
│       │   └── client-access.ts  # UPDATE (remove legacy)
│       ├── routes/
│       │   ├── clients.ts        # CREATE
│       │   ├── sites.ts          # CREATE
│       │   ├── users.ts          # UPDATE
│       │   ├── access-requests.ts # UPDATE
│       │   ├── properties.ts     # DELETE
│       │   └── site-access.ts    # DELETE
│       └── services/
│           └── keycloak-admin.service.ts # UPDATE
├── alto-cero-iam/src/
│   ├── contexts/AuthContext.tsx  # UPDATE
│   ├── services/keycloak.ts      # UPDATE
│   ├── pages/
│   │   ├── ClientsPage.tsx       # CREATE
│   │   ├── SitesPage.tsx         # CREATE
│   │   ├── SitePickerPage.tsx    # CREATE
│   │   ├── UsersPage.tsx         # UPDATE
│   │   └── AccessQueuePage.tsx   # UPDATE
│   └── App.tsx                   # UPDATE routes
└── scripts/
    └── setup-keycloak.sh         # CREATE
```
