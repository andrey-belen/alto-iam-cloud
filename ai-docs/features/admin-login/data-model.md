# Data Model - Admin Login

## Entities

### AuthState
Current authentication state in the application.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| isAuthenticated | boolean | required | Whether user is logged in |
| isLoading | boolean | required | Auth operation in progress |
| user | AdminUser | optional | Current user info if authenticated |
| accessToken | string | optional | JWT access token |
| refreshToken | string | optional | JWT refresh token |
| expiresAt | timestamp | optional | Token expiration time |
| error | string | optional | Last error message |

### AdminUser
Authenticated administrator information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | required | Keycloak user ID |
| username | string | required | Login username |
| email | string | required | User email |
| clientPrefix | string | optional | Organization prefix (e.g., "marriott") |
| isSuperAdmin | boolean | default: false | Alto operator (no prefix = sees all) |

### TokenResponse
Keycloak OIDC token response.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| access_token | string | required | JWT access token |
| refresh_token | string | required | JWT refresh token |
| expires_in | number | required | Seconds until expiry |
| token_type | string | required | Always "Bearer" |

## Enums

### AuthStatus
```
IDLE           - Initial state, checking stored tokens
AUTHENTICATING - Login in progress
AUTHENTICATED  - Successfully logged in
UNAUTHENTICATED - No valid session
ERROR          - Auth error occurred
```

## States & Transitions

```
┌────────────┐
│    IDLE    │
└─────┬──────┘
      │ check_stored_tokens
      ▼
┌─────────────────┐
│ Has valid token?│
└────┬───────┬────┘
     │       │
   Yes       No
     │       │
     ▼       ▼
┌─────────────┐  ┌──────────────────┐
│AUTHENTICATED│  │ UNAUTHENTICATED  │
└──────┬──────┘  └────────┬─────────┘
       │                  │
  logout/expire      login_attempt
       │                  │
       ▼                  ▼
┌──────────────────┐  ┌──────────────┐
│ UNAUTHENTICATED  │  │AUTHENTICATING│
└──────────────────┘  └──────┬───────┘
                             │
                      ┌──────┴──────┐
                      │             │
                   success       failure
                      │             │
                      ▼             ▼
               ┌─────────────┐  ┌───────┐
               │AUTHENTICATED│  │ ERROR │
               └─────────────┘  └───┬───┘
                                    │ dismiss
                                    ▼
                              ┌──────────────────┐
                              │ UNAUTHENTICATED  │
                              └──────────────────┘
```

## Constants

| Name | Value | Description | Source |
|------|-------|-------------|--------|
| TOKEN_STORAGE_KEY | "alto_auth_tokens" | localStorage key for tokens | (plan.md) |
| TOKEN_REFRESH_BUFFER_SECONDS | 60 | Refresh token 1 min before expiry | (ux.md) |
| AUTH_TIMEOUT_SECONDS | 10 | Max wait for auth response | (ux.md) |
| KEYCLOAK_REALM | "master" | Realm for admin auth | (FR-001) |
| CLIENT_PREFIX_ATTRIBUTE | "clientPrefix" | User attribute name | (FR-004) |

## Validation Rules

### Login Form
- Username: required, min 3 characters
- Password: required, min 1 character

### Client Prefix
- If null/empty and user is not super admin → deny access
- Super admin identified by role "alto-admin" in master realm
