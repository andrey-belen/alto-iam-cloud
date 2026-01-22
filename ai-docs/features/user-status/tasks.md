# Tasks: User Status

## Purpose
Implementation tasks for enable/disable user functionality.

## Phase 1: Core Infrastructure

- [ ] INIT-001 Add toggleUserStatus to users service in cloud/crm-dashboard/src/services/users.ts
- [ ] INIT-002 Add getUserSessions to users service in cloud/crm-dashboard/src/services/users.ts

## Phase 2: User Story 1 - Disable User (P1 - MVP)

### TDD Cycle 1: Disable API
**Coverage:**
- Requirements: FR-001, FR-004

#### RED Phase
- [ ] TEST-001 [US1] Test disableUser sets enabled=false in Keycloak in cloud/crm-dashboard/tests/services/users.test.ts
- [ ] TEST-002 [US1] Test disableUser terminates all active sessions in cloud/crm-dashboard/tests/services/users.test.ts

#### GREEN Phase
- [ ] IMPL-001 [US1] Implement disableUser in users service in cloud/crm-dashboard/src/services/users.ts
- [ ] IMPL-002 [US1] Add session termination to disable flow in cloud/crm-dashboard/src/services/users.ts

### TDD Cycle 2: Disable UI
**Coverage:**
- Requirements: UX-001, UX-003

#### RED Phase
- [ ] TEST-003 [US1] Test StatusToggle shows Disable for enabled user in cloud/crm-dashboard/tests/components/StatusToggle.test.tsx
- [ ] TEST-004 [US1] Test disabled user row shows grayed styling in cloud/crm-dashboard/tests/components/UsersTable.test.tsx

#### GREEN Phase
- [ ] IMPL-003 [US1] Create StatusToggle component in cloud/crm-dashboard/src/components/StatusToggle.tsx
- [ ] IMPL-004 [US1] Add StatusToggle to UserRow in cloud/crm-dashboard/src/components/UsersTable.tsx

## Phase 3: User Story 2 - Enable User (P1 - MVP)

### TDD Cycle 1: Enable Flow
**Coverage:**
- Requirements: FR-001

#### RED Phase
- [ ] TEST-005 [US2] Test enableUser sets enabled=true in Keycloak in cloud/crm-dashboard/tests/services/users.test.ts
- [ ] TEST-006 [US2] Test StatusToggle shows Enable for disabled user in cloud/crm-dashboard/tests/components/StatusToggle.test.tsx

#### GREEN Phase
- [ ] IMPL-005 [US2] Implement enableUser in users service in cloud/crm-dashboard/src/services/users.ts

## Phase 4: User Story 3 - Disabled Badge (P2)

### TDD Cycle 1: Visual Indicator
**Coverage:**
- Requirements: UX-002

#### RED Phase
- [ ] TEST-007 [US3] Test disabled user shows "Disabled" badge in cloud/crm-dashboard/tests/components/UsersTable.test.tsx

#### GREEN Phase
- [ ] IMPL-006 [US3] Add disabled badge to UserRow in cloud/crm-dashboard/src/components/UsersTable.tsx

## Phase 5: User Story 4 - Session Confirmation (P3)

### TDD Cycle 1: Confirmation Dialog
**Coverage:**
- Requirements: UX-004, FR-004

#### RED Phase
- [ ] TEST-008 [US4] Test confirmation shown when user has active sessions in cloud/crm-dashboard/tests/components/StatusToggle.test.tsx
- [ ] TEST-009 [US4] Test session count displayed in confirmation in cloud/crm-dashboard/tests/components/ConfirmDisableModal.test.tsx

#### GREEN Phase
- [ ] IMPL-007 [US4] Create ConfirmDisableModal in cloud/crm-dashboard/src/components/ConfirmDisableModal.tsx
- [ ] IMPL-008 [US4] Add session check before disable in StatusToggle in cloud/crm-dashboard/src/components/StatusToggle.tsx

### TDD Cycle 2: Self-Disable Prevention
**Coverage:**
- Requirements: FR-003

#### RED Phase
- [ ] TEST-010 [US4] Test cannot disable own account in cloud/crm-dashboard/tests/components/StatusToggle.test.tsx

#### GREEN Phase
- [ ] IMPL-009 [US4] Add self-disable check in StatusToggle in cloud/crm-dashboard/src/components/StatusToggle.tsx

## Execution Order

1. **Phase 1**: Core Infrastructure
2. **Phase 2**: US1 - Disable User (P1)
3. **Phase 3**: US2 - Enable User (P1)
4. **Phase 4**: US3 - Disabled Badge (P2)
5. **Phase 5**: US4 - Session Confirmation (P3)

## Notes

- All sessions terminated immediately on disable for security
- User data preserved (not deleted) for audit trail
- Disabled users cannot authenticate until re-enabled
