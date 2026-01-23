# Data Model - Site Groups

## Architecture Context

All sites exist within the single `alto` realm as nested groups:
```
alto realm
└── Groups:
    └── clients/
        └── {client}/
            └── sites/
                └── {site-name}
```

## Entities

### SiteGroup
Represents a physical site/building. Implemented as Keycloak group at `/clients/{client}/sites/{name}`.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | required | Keycloak group ID |
| name | string | required, 2-50 chars | Display name |
| path | string | required | Full Keycloak group path |
| clientName | string | required | Parent client name |
| userCount | number | computed | Number of assigned users |
| createdAt | timestamp | optional | Group creation time |

### SiteGroupMember
User assigned to a site. Keycloak user-group membership.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| userId | string | required | Keycloak user ID |
| siteGroupId | string | required | Keycloak group ID |
| username | string | computed | User's username |
| email | string | computed | User's email |
| role | string | computed | User's realm role |

### SiteGroupListItem
UI model for site list display.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | required | Keycloak group ID |
| name | string | required | Display name |
| path | string | required | Full group path |
| clientName | string | required | Parent client name |
| userCount | number | required | Number of assigned users |

## Keycloak Mapping

### Group Structure
```
alto realm
└── Groups:
    └── clients/
        ├── marriott/
        │   └── sites/
        │       ├── site-hk     → path: /clients/marriott/sites/site-hk
        │       ├── site-sg     → path: /clients/marriott/sites/site-sg
        │       └── site-tokyo  → path: /clients/marriott/sites/site-tokyo
        └── hilton/
            └── sites/
                ├── site-bangkok → path: /clients/hilton/sites/site-bangkok
                └── site-sydney  → path: /clients/hilton/sites/site-sydney
```

### Path Convention
- Client group: `/clients/{client-name}`
- Sites parent: `/clients/{client-name}/sites`
- Site group: `/clients/{client-name}/sites/{site-name}`

### Naming Convention
- Site group name: lowercase, alphanumeric + hyphens (e.g., `site-hk`)
- Display name: User-friendly (stored as group attribute)

### Group Attributes (Optional)
| Attribute | Type | Description |
|-----------|------|-------------|
| displayName | string | User-friendly name (e.g., "Hong Kong Office") |
| createdAt | string | ISO timestamp |

## Constants

| Name | Value | Description |
|------|-------|-------------|
| CLIENTS_GROUP_PATH | `/clients` | Root path for client groups |
| SITES_SUBGROUP | `sites` | Subgroup name for sites under each client |
| MIN_SITE_NAME_LENGTH | 2 | Minimum site name length |
| MAX_SITE_NAME_LENGTH | 50 | Maximum site name length |
| SITE_NAME_PATTERN | `/^[a-z0-9-]+$/` | Valid site name characters |

## Validation Rules

### Site Name
- Required
- Length: 2-50 characters
- Unique within client (case-insensitive)
- Lowercase alphanumeric + hyphens only
- No spaces (use hyphens)

### Path Derivation
```typescript
// From client name and site name to full path
const sitePath = `/clients/${clientName}/sites/${siteName}`;

// From full path to client name
const clientName = path.split('/')[2]; // /clients/{clientName}/sites/{siteName}

// From full path to site name
const siteName = path.split('/')[4];
```

## API Request/Response Models

### CreateSiteRequest
```typescript
{
  name: string;           // Site name (will be slugified)
  displayName?: string;   // Optional user-friendly name
  clientName?: string;    // Required for Alto Admin, implicit for Client Admin
}
```

### UpdateSiteRequest
```typescript
{
  displayName: string;    // New display name (name/path cannot change)
}
```

### SiteGroupResponse
```typescript
{
  id: string;
  name: string;
  displayName?: string;
  path: string;
  clientName: string;
  userCount: number;
  createdAt?: string;
}
```

### SiteMemberResponse
```typescript
{
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'alto-admin' | 'client-admin' | 'operator' | 'viewer';
}
```

### AssignSitesRequest
```typescript
{
  siteIds: string[];   // Array of site group IDs to assign
}
```

## State Management

### SiteGroupsState (UI)
```typescript
{
  sites: SiteGroupListItem[];
  selectedClient: string | null;  // null = all clients (Alto Admin only)
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}
```

### SiteDetailState (UI)
```typescript
{
  site: SiteGroup | null;
  members: SiteMemberResponse[];
  activeTab: 'overview' | 'members';
  isLoading: boolean;
  error: string | null;
}
```

## Keycloak API Operations

### List Sites in Client
```
GET /admin/realms/alto/groups
Filter by path starting with: /clients/{clientName}/sites/
```

### Create Site
```
POST /admin/realms/alto/groups/{sitesParentGroupId}/children
Body: { name: "site-hk", attributes: { displayName: ["Hong Kong Office"] } }
```

### Get Site Members
```
GET /admin/realms/alto/groups/{siteGroupId}/members
```

### Add User to Site
```
PUT /admin/realms/alto/users/{userId}/groups/{siteGroupId}
```

### Remove User from Site
```
DELETE /admin/realms/alto/users/{userId}/groups/{siteGroupId}
```
