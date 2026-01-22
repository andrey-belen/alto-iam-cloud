# Tasks: Request Access

## Purpose
Implementation tasks for public access request form and operator approval workflow.

## Phase 1: Core Infrastructure

- [ ] INIT-001 Create Express.js API project in cloud/api/
- [ ] INIT-002 Configure TypeScript and ESLint for API
- [ ] INIT-003 Setup PostgreSQL connection with Prisma ORM
- [ ] INIT-004 Create AccessRequest Prisma schema
- [ ] INIT-005 Run Prisma migrations to create table
- [ ] INIT-006 Setup API testing with Vitest
- [ ] INIT-007 Add api service to cloud/docker-compose.yml
- [ ] INIT-008 Configure CORS for CRM dashboard origin

## Phase 2: User Story 1 - Submit Request (P1 - MVP)

### TDD Cycle 1: Request API Endpoint
**Coverage:**
- Requirements: FR-001, FR-002, FR-005
- Entities: AccessRequest from data-model.md
- Constants: field max lengths

#### RED Phase
- [ ] TEST-001 [US1] Test POST /api/access-requests creates request with PENDING status in cloud/api/tests/access-requests.test.ts
- [ ] TEST-002 [US1] Test POST /api/access-requests validates required fields in cloud/api/tests/access-requests.test.ts
- [ ] TEST-003 [US1] Test POST /api/access-requests rejects duplicate email in cloud/api/tests/access-requests.test.ts

#### GREEN Phase
- [ ] IMPL-001 [US1] Create AccessRequest Prisma model in cloud/api/prisma/schema.prisma
- [ ] IMPL-002 [US1] Implement POST /api/access-requests endpoint in cloud/api/src/routes/access-requests.ts
- [ ] IMPL-003 [US1] Add email uniqueness check against Keycloak realms in cloud/api/src/services/keycloak-admin.service.ts

### TDD Cycle 2: Request Form UI
**Coverage:**
- Requirements: UX-001, UX-002
- Accessibility: aria-required, aria-describedby

#### RED Phase
- [ ] TEST-004 [US1] Test RequestAccessPage renders all form fields in cloud/crm-dashboard/tests/pages/RequestAccessPage.test.tsx
- [ ] TEST-005 [US1] Test form shows inline validation errors in cloud/crm-dashboard/tests/pages/RequestAccessPage.test.tsx
- [ ] TEST-006 [US1] Test successful submission shows success message in cloud/crm-dashboard/tests/pages/RequestAccessPage.test.tsx

#### GREEN Phase
- [ ] IMPL-004 [US1] Create RequestAccessPage with form in cloud/crm-dashboard/src/pages/RequestAccessPage.tsx
- [ ] IMPL-005 [US1] Create access-requests service in cloud/crm-dashboard/src/services/access-requests.ts
- [ ] IMPL-006 [US1] Add public route /request-access in cloud/crm-dashboard/src/App.tsx

## Phase 3: User Story 2 - Operator Approval (P1 - MVP)

### TDD Cycle 1: Queue API
**Coverage:**
- Requirements: FR-003
- States: listing pending requests

#### RED Phase
- [ ] TEST-007 [US2] Test GET /api/access-requests returns pending requests in cloud/api/tests/access-requests.test.ts
- [ ] TEST-008 [US2] Test GET /api/access-requests requires authentication in cloud/api/tests/access-requests.test.ts

#### GREEN Phase
- [ ] IMPL-007 [US2] Implement GET /api/access-requests with auth middleware in cloud/api/src/routes/access-requests.ts
- [ ] IMPL-008 [US2] Add operator role check middleware in cloud/api/src/middleware/auth.ts

### TDD Cycle 2: Approval Flow
**Coverage:**
- Requirements: FR-004, FR-006, FR-007
- States: PENDING → APPROVED transition

#### RED Phase
- [ ] TEST-009 [US2] Test POST /api/access-requests/:id/approve creates Keycloak user in cloud/api/tests/access-requests.test.ts
- [ ] TEST-010 [US2] Test approval sets temporary password in cloud/api/tests/access-requests.test.ts
- [ ] TEST-011 [US2] Test approval sends email with credentials in cloud/api/tests/access-requests.test.ts

#### GREEN Phase
- [ ] IMPL-009 [US2] Implement POST /api/access-requests/:id/approve in cloud/api/src/routes/access-requests.ts
- [ ] IMPL-010 [US2] Create Keycloak user creation service in cloud/api/src/services/keycloak-admin.service.ts
- [ ] IMPL-011 [US2] Create email notification service in cloud/api/src/services/email.service.ts

### TDD Cycle 3: Queue UI
**Coverage:**
- Requirements: UX-004, UX-005

#### RED Phase
- [ ] TEST-012 [US2] Test AccessQueuePage displays pending requests table in cloud/crm-dashboard/tests/pages/AccessQueuePage.test.tsx
- [ ] TEST-013 [US2] Test ApproveModal shows property dropdown in cloud/crm-dashboard/tests/components/ApproveModal.test.tsx
- [ ] TEST-014 [US2] Test approval success shows toast and removes from queue in cloud/crm-dashboard/tests/pages/AccessQueuePage.test.tsx

#### GREEN Phase
- [ ] IMPL-012 [US2] Create AccessQueuePage with table in cloud/crm-dashboard/src/pages/AccessQueuePage.tsx
- [ ] IMPL-013 [US2] Create ApproveModal with property dropdown in cloud/crm-dashboard/src/components/ApproveModal.tsx
- [ ] IMPL-014 [US2] Add /access-queue route (protected, operator only) in cloud/crm-dashboard/src/App.tsx

## Phase 4: User Story 3 - Rejection Flow (P2)

### TDD Cycle 1: Reject API
**Coverage:**
- Requirements: FR-007, FR-008
- States: PENDING → REJECTED transition

#### RED Phase
- [ ] TEST-015 [US3] Test POST /api/access-requests/:id/reject requires reason in cloud/api/tests/access-requests.test.ts
- [ ] TEST-016 [US3] Test rejection sends email with reason in cloud/api/tests/access-requests.test.ts
- [ ] TEST-017 [US3] Test rejection records operator ID and timestamp in cloud/api/tests/access-requests.test.ts

#### GREEN Phase
- [ ] IMPL-015 [US3] Implement POST /api/access-requests/:id/reject in cloud/api/src/routes/access-requests.ts
- [ ] IMPL-016 [US3] Add rejection email template in cloud/api/src/services/email.service.ts

### TDD Cycle 2: Reject UI
**Coverage:**
- Requirements: UX-006
- Constants: REJECTION_REASON_MIN_LENGTH (10)

#### RED Phase
- [ ] TEST-018 [US3] Test RejectModal requires reason with min 10 chars in cloud/crm-dashboard/tests/components/RejectModal.test.tsx
- [ ] TEST-019 [US3] Test rejection success shows toast and removes from queue in cloud/crm-dashboard/tests/pages/AccessQueuePage.test.tsx

#### GREEN Phase
- [ ] IMPL-017 [US3] Create RejectModal with reason textarea in cloud/crm-dashboard/src/components/RejectModal.tsx
- [ ] IMPL-018 [US3] Add reject button to AccessQueuePage in cloud/crm-dashboard/src/pages/AccessQueuePage.tsx

## Phase 5: User Story 4 - Duplicate Email Check (P3)

### TDD Cycle 1: Cross-Realm Email Check
**Coverage:**
- Requirements: FR-005
- Edge Cases: email exists in different realm

#### RED Phase
- [ ] TEST-020 [US4] Test email uniqueness check spans all Keycloak realms in cloud/api/tests/access-requests.test.ts
- [ ] TEST-021 [US4] Test email uniqueness check includes pending requests in cloud/api/tests/access-requests.test.ts

#### GREEN Phase
- [ ] IMPL-019 [US4] Enhance email check to query all realms in cloud/api/src/services/keycloak-admin.service.ts
- [ ] IMPL-020 [US4] Add pending requests check to email validation in cloud/api/src/services/access-request.service.ts

## Execution Order

1. **Phase 1**: Core Infrastructure (blocks all stories)
2. **Phase 2**: US1 - Submit Request (P1)
3. **Phase 3**: US2 - Operator Approval (P1)
4. **Phase 4**: US3 - Rejection Flow (P2)
5. **Phase 5**: US4 - Duplicate Email Check (P3)

Within each story: RED → GREEN cycles

## Notes

- Public form at /request-access requires no authentication
- Queue and approval require operator role (Alto admin)
- Email notifications use same Google SMTP as MFA
- Temporary passwords set with "must change on first login" flag
