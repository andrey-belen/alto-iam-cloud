# Implementation Plan: Admin Login

## Purpose
Implement admin authentication for CRM dashboard using Keycloak OIDC.

## Summary
React-based login page authenticating against Keycloak master realm. Extract client prefix from user attributes for property filtering. Store tokens in localStorage with automatic refresh.

## Technical Context

**Language:** TypeScript

**Framework:** React 18 + Vite + Tailwind CSS

**Storage:** localStorage for tokens, React Context for auth state

**API Layer:** Keycloak JS adapter for OIDC, fetch for Admin API

**Testing:** Vitest + React Testing Library

**Deployment:** Docker container served by Caddy

**Constraints:**
- Must authenticate against Keycloak master realm
- Client prefix stored as user attribute in Keycloak

## Implementation Mapping

### Component Architecture

- **Core Components:**
  - `LoginPage` - Login form with username/password
  - `AuthProvider` - React context for auth state
  - `ProtectedRoute` - Route guard requiring authentication
  - `useAuth` hook - Access auth state and methods

- **Data Models:**
  - AuthState: tokens, user info, client prefix
  - See `data-model.md` for entity specifications

- **API Operations:**
  - Keycloak OIDC: `/realms/master/protocol/openid-connect/token`
  - User info: `/realms/master/protocol/openid-connect/userinfo`

- **State Management:**
  - React Context for global auth state
  - localStorage for token persistence

### Error Handling Approach

- **Error handlers location:** AuthProvider catches all auth errors
- **Recovery mechanisms:** Auto-refresh tokens, redirect on session expire
- **User feedback:** Error messages per ux.md Error Presentation

## Feature Code Organization

```
cloud/
└── crm-dashboard/
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.tsx
    │   ├── contexts/
    │   │   └── AuthContext.tsx
    │   ├── hooks/
    │   │   └── useAuth.ts
    │   ├── pages/
    │   │   └── LoginPage.tsx
    │   ├── services/
    │   │   └── keycloak.ts
    │   ├── types/
    │   │   └── auth.ts
    │   └── App.tsx
    └── tests/
        └── auth.test.tsx
```

**Selected Structure:** Structure B (Split Architecture) - CRM dashboard is React frontend communicating with Keycloak backend.

## Testing Approach

- **Test Structure:** Unit tests for hooks/services, integration for login flow
- **Coverage Strategy:**
  - Login success: tokens stored, redirect to dashboard
  - Login failure: error displayed, form reset
  - Logout: tokens cleared, redirect to login
  - Token refresh: automatic before expiry
