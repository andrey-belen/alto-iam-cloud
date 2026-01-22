# Tasks: Admin Login

## Purpose
Implementation tasks for CRM dashboard admin authentication via Keycloak OIDC.

## Phase 1: Core Infrastructure

- [ ] INIT-001 Create crm-dashboard React project with Vite in cloud/crm-dashboard/
- [ ] INIT-002 Configure Tailwind CSS with Alto color scheme (#0ea5e9 blue, #10b981 green)
- [ ] INIT-003 Setup TypeScript configuration and ESLint
- [ ] INIT-004 Create project directory structure (components, pages, services, contexts, hooks)
- [ ] INIT-005 Configure Vitest and React Testing Library
- [ ] INIT-006 Create Dockerfile for production build
- [ ] INIT-007 Add crm-dashboard service to cloud/docker-compose.yml

## Phase 2: User Story 1 - Successful Login (P1 - MVP)

### TDD Cycle 1: Keycloak Service
**Coverage:**
- Requirements: FR-001, FR-002
- Entities: TokenResponse from data-model.md
- Constants: KEYCLOAK_REALM, TOKEN_STORAGE_KEY

#### RED Phase
- [ ] TEST-001 [US1] Test keycloak.login() returns tokens on valid credentials in cloud/crm-dashboard/tests/services/keycloak.test.ts
- [ ] TEST-002 [US1] Test tokens stored in localStorage with TOKEN_STORAGE_KEY in cloud/crm-dashboard/tests/services/keycloak.test.ts
- [ ] TEST-003 [US1] Test keycloak.login() throws on invalid credentials in cloud/crm-dashboard/tests/services/keycloak.test.ts

#### GREEN Phase
- [ ] IMPL-001 [US1] Create keycloak service with login method in cloud/crm-dashboard/src/services/keycloak.ts
- [ ] IMPL-002 [US1] Implement token storage in localStorage in cloud/crm-dashboard/src/services/keycloak.ts

### TDD Cycle 2: Auth Context
**Coverage:**
- Requirements: FR-003, FR-004
- Entities: AuthState, AdminUser from data-model.md
- States: IDLE → AUTHENTICATED transitions

#### RED Phase
- [ ] TEST-004 [US1] Test AuthProvider initializes with stored tokens in cloud/crm-dashboard/tests/contexts/AuthContext.test.tsx
- [ ] TEST-005 [US1] Test AuthProvider extracts clientPrefix from user attributes in cloud/crm-dashboard/tests/contexts/AuthContext.test.tsx
- [ ] TEST-006 [US1] Test state transition IDLE → AUTHENTICATED on valid stored token in cloud/crm-dashboard/tests/contexts/AuthContext.test.tsx

#### GREEN Phase
- [ ] IMPL-003 [US1] Create AuthContext with AuthState in cloud/crm-dashboard/src/contexts/AuthContext.tsx
- [ ] IMPL-004 [US1] Implement token validation and user extraction in cloud/crm-dashboard/src/contexts/AuthContext.tsx
- [ ] IMPL-005 [US1] Create useAuth hook in cloud/crm-dashboard/src/hooks/useAuth.ts

### TDD Cycle 3: Login Page
**Coverage:**
- Requirements: UX-001, UX-002, UX-004
- Accessibility: ARIA role="form", aria-live="polite"

#### RED Phase
- [ ] TEST-007 [US1] Test LoginPage renders username and password fields in cloud/crm-dashboard/tests/pages/LoginPage.test.tsx
- [ ] TEST-008 [US1] Test LoginPage shows loading spinner during auth in cloud/crm-dashboard/tests/pages/LoginPage.test.tsx
- [ ] TEST-009 [US1] Test LoginPage redirects to /properties on success in cloud/crm-dashboard/tests/pages/LoginPage.test.tsx
- [ ] TEST-010 [US1] Test ARIA role="form" on login container in cloud/crm-dashboard/tests/pages/LoginPage.test.tsx

#### GREEN Phase
- [ ] IMPL-006 [US1] Create LoginPage component with form in cloud/crm-dashboard/src/pages/LoginPage.tsx
- [ ] IMPL-007 [US1] Style LoginPage with Tailwind (white bg, blue button) in cloud/crm-dashboard/src/pages/LoginPage.tsx
- [ ] IMPL-008 [US1] Add ARIA attributes for accessibility in cloud/crm-dashboard/src/pages/LoginPage.tsx

## Phase 3: User Story 2 - Logout (P1 - MVP)

### TDD Cycle 1: Logout Functionality
**Coverage:**
- Requirements: FR-005
- States: AUTHENTICATED → UNAUTHENTICATED

#### RED Phase
- [ ] TEST-011 [US2] Test logout clears tokens from localStorage in cloud/crm-dashboard/tests/services/keycloak.test.ts
- [ ] TEST-012 [US2] Test logout redirects to login page in cloud/crm-dashboard/tests/contexts/AuthContext.test.tsx
- [ ] TEST-013 [US2] Test state transition AUTHENTICATED → UNAUTHENTICATED on logout in cloud/crm-dashboard/tests/contexts/AuthContext.test.tsx

#### GREEN Phase
- [ ] IMPL-009 [US2] Implement logout method in keycloak service in cloud/crm-dashboard/src/services/keycloak.ts
- [ ] IMPL-010 [US2] Add logout to AuthContext in cloud/crm-dashboard/src/contexts/AuthContext.tsx

## Phase 4: User Story 3 - Loading State (P2)

### TDD Cycle 1: Loading Indicator
**Coverage:**
- Requirements: UX-002
- States: AUTHENTICATING state

#### RED Phase
- [ ] TEST-014 [US3] Test loading spinner displays during AUTHENTICATING state in cloud/crm-dashboard/tests/pages/LoginPage.test.tsx
- [ ] TEST-015 [US3] Test form inputs disabled during loading in cloud/crm-dashboard/tests/pages/LoginPage.test.tsx

#### GREEN Phase
- [ ] IMPL-011 [US3] Add loading spinner component in cloud/crm-dashboard/src/components/LoadingSpinner.tsx
- [ ] IMPL-012 [US3] Integrate loading state in LoginPage in cloud/crm-dashboard/src/pages/LoginPage.tsx

## Phase 5: User Story 4 - Error Handling (P3)

### TDD Cycle 1: Error Display
**Coverage:**
- Requirements: UX-003
- Error Presentation: validation_error from ux.md

#### RED Phase
- [ ] TEST-016 [US4] Test error message displays on invalid credentials in cloud/crm-dashboard/tests/pages/LoginPage.test.tsx
- [ ] TEST-017 [US4] Test error message uses red color (#EF4444) in cloud/crm-dashboard/tests/pages/LoginPage.test.tsx
- [ ] TEST-018 [US4] Test password field clears on error in cloud/crm-dashboard/tests/pages/LoginPage.test.tsx
- [ ] TEST-019 [US4] Test state transition AUTHENTICATING → ERROR on failure in cloud/crm-dashboard/tests/contexts/AuthContext.test.tsx

#### GREEN Phase
- [ ] IMPL-013 [US4] Add error display to LoginPage in cloud/crm-dashboard/src/pages/LoginPage.tsx
- [ ] IMPL-014 [US4] Implement error state handling in AuthContext in cloud/crm-dashboard/src/contexts/AuthContext.tsx

### TDD Cycle 2: Protected Routes
**Coverage:**
- Requirements: FR-003
- Edge Cases: session expired redirect

#### RED Phase
- [ ] TEST-020 [US4] Test ProtectedRoute redirects unauthenticated users to login in cloud/crm-dashboard/tests/components/ProtectedRoute.test.tsx
- [ ] TEST-021 [US4] Test ProtectedRoute shows children for authenticated users in cloud/crm-dashboard/tests/components/ProtectedRoute.test.tsx

#### GREEN Phase
- [ ] IMPL-015 [US4] Create ProtectedRoute component in cloud/crm-dashboard/src/components/ProtectedRoute.tsx
- [ ] IMPL-016 [US4] Setup React Router with protected routes in cloud/crm-dashboard/src/App.tsx

## Execution Order

1. **Phase 1**: Core Infrastructure (blocks all stories)
2. **Phase 2**: US1 - Successful Login (P1)
3. **Phase 3**: US2 - Logout (P1)
4. **Phase 4**: US3 - Loading State (P2)
5. **Phase 5**: US4 - Error Handling (P3)

Within each story: RED → GREEN cycles

## Notes

- Uses Keycloak JS adapter pattern but with direct fetch calls for more control
- Tokens stored in localStorage for persistence across browser sessions
- Client prefix extracted from Keycloak user attributes
- Super admin (Alto operator) identified by absence of clientPrefix
