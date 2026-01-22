# Feature Index

Total Features: 6

## Features List

### Authentication (2 features)

- **Admin Login**
  - Folder: `admin-login`

- **MFA Email OTP**
  - Folder: `mfa-email-otp`

### Property Management (1 feature)

- **View Properties**
  - Folder: `view-properties`

### Access Management (1 feature)

- **Request Access**
  - Folder: `request-access`
  - Note: Public form + Alto operator approval workflow

### User Management (2 features)

- **Manage Users**
  - Folder: `manage-users`
  - Note: View users, no direct creation (via request-access only)

- **User Status**
  - Folder: `user-status`

## Implementation Sequence

**Recommended Order:** Infrastructure first (MFA), then authentication, then access workflow, then property views, then user operations

### Phase 1: Core Security
1. **MFA Email OTP** - Priority #1 from PRD, foundational security requirement
2. **Admin Login** - Required for all subsequent features

### Phase 2: Access Workflow
3. **Request Access** - Priority #3 from PRD, public form + operator approval queue

### Phase 3: Property Navigation
4. **View Properties** - Depends on: `admin-login`

### Phase 4: User Operations
5. **Manage Users** - Depends on: `view-properties`, `request-access`
6. **User Status** - Depends on: `manage-users`

## Code Location

All cloud features are implemented in `cloud/` subfolder:
```
cloud/
├── crm-dashboard/     # React frontend
├── api/               # Express backend (request storage)
├── terraform/         # Keycloak configuration
└── keycloak/          # Theme customizations
```
