# Tasks: Manage Users

## Purpose
Implementation tasks for read-only user list display per property.

## Phase 1: Core Infrastructure

- [ ] INIT-001 Create users service for Keycloak Admin API in cloud/crm-dashboard/src/services/users.ts

## Phase 2: User Story 1 - Display User List (P1 - MVP)

### TDD Cycle 1: Users Service
**Coverage:**
- Requirements: FR-001, FR-004

#### RED Phase
- [ ] TEST-001 [US1] Test getUsers returns users for realm in cloud/crm-dashboard/tests/services/users.test.ts
- [ ] TEST-002 [US1] Test getUsers supports pagination in cloud/crm-dashboard/tests/services/users.test.ts

#### GREEN Phase
- [ ] IMPL-001 [US1] Implement getUsers with pagination in cloud/crm-dashboard/src/services/users.ts

### TDD Cycle 2: Users Table
**Coverage:**
- Requirements: UX-001, UX-002

#### RED Phase
- [ ] TEST-003 [US1] Test UsersTable displays columns (username, email, status, last login) in cloud/crm-dashboard/tests/components/UsersTable.test.tsx
- [ ] TEST-004 [US1] Test PropertyDetailPage loads users on mount in cloud/crm-dashboard/tests/pages/PropertyDetailPage.test.tsx

#### GREEN Phase
- [ ] IMPL-002 [US1] Create UsersTable component in cloud/crm-dashboard/src/components/UsersTable.tsx
- [ ] IMPL-003 [US1] Create PropertyDetailPage in cloud/crm-dashboard/src/pages/PropertyDetailPage.tsx
- [ ] IMPL-004 [US1] Add /properties/:realmId route in cloud/crm-dashboard/src/App.tsx

## Phase 3: User Story 2 - Pagination (P2)

### TDD Cycle 1: Page Controls
**Coverage:**
- Requirements: FR-002

#### RED Phase
- [ ] TEST-005 [US2] Test pagination controls appear when users > 20 in cloud/crm-dashboard/tests/components/UsersTable.test.tsx
- [ ] TEST-006 [US2] Test page change loads new users in cloud/crm-dashboard/tests/components/UsersTable.test.tsx

#### GREEN Phase
- [ ] IMPL-005 [US2] Add pagination controls to UsersTable in cloud/crm-dashboard/src/components/UsersTable.tsx

## Phase 4: User Story 3 - Search (P2)

### TDD Cycle 1: Search Filter
**Coverage:**
- Requirements: FR-005, UX-005

#### RED Phase
- [ ] TEST-007 [US3] Test search filters users by username/email in cloud/crm-dashboard/tests/components/UsersTable.test.tsx
- [ ] TEST-008 [US3] Test search debounces input by 300ms in cloud/crm-dashboard/tests/components/UsersTable.test.tsx

#### GREEN Phase
- [ ] IMPL-006 [US3] Add search input to UsersTable in cloud/crm-dashboard/src/components/UsersTable.tsx

## Phase 5: User Story 4 - Empty State (P3)

### TDD Cycle 1: Empty Display
**Coverage:**
- Requirements: UX-003

#### RED Phase
- [ ] TEST-009 [US4] Test empty state shows Request Access message in cloud/crm-dashboard/tests/components/UsersTable.test.tsx

#### GREEN Phase
- [ ] IMPL-007 [US4] Add empty state to UsersTable in cloud/crm-dashboard/src/components/UsersTable.tsx

## Execution Order

1. **Phase 1**: Core Infrastructure
2. **Phase 2**: US1 - Display User List (P1)
3. **Phase 3**: US2 - Pagination (P2)
4. **Phase 4**: US3 - Search (P2)
5. **Phase 5**: US4 - Empty State (P3)

## Notes

- Read-only view - no user creation or deletion
- Users created via Request Access workflow only
- Last login shown as relative time
