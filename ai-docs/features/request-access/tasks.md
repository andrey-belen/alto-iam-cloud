# Tasks: Request Access

## Purpose
Implementation tasks for public access request form and operator approval workflow.

## Source Traceability
- **Spec**: spec.md (FR-001 to FR-016, UX-001 to UX-017)
- **UX**: ux.md (4 user flows, screen specifications)
- **Plan**: plan.md (API endpoints, component architecture)
- **Data**: data-model.md → spec.md Key Entities (source of truth)

## User Stories

| ID | Story | Priority | Acceptance Scenarios |
|----|-------|----------|---------------------|
| US1 | Submit Request | P1 | spec.md scenarios 1-2 |
| US2 | Email Approval | P1 | spec.md scenarios 3-5 |
| US3 | Email Rejection | P2 | spec.md scenarios 6-7 |
| US4 | Dashboard Queue | P1 | spec.md scenarios 8-9 |
| US5 | Dashboard Approval | P1 | spec.md scenario 10 |

---

## Phase 1: Core Infrastructure

**Blocks**: All user stories

### INIT-001: Database Schema
- [ ] Create/update AccessRequest Prisma model in `api/prisma/schema.prisma`
  - Fields: id, company, firstName, lastName, email, phone, rolePreference, status, approvalToken, tokenExpiresAt, assignedRole, assignedSiteIds, processedBy, processedAt, rejectionReason, createdAt, updatedAt
  - Indexes: status, email, approvalToken
  - Enum: AccessRequestStatus (pending, approved, rejected)

### INIT-002: Run Migration
- [ ] Execute `npx prisma db push` to apply schema changes

### INIT-003: API Test Setup
- [ ] Configure Vitest for API tests in `api/vitest.config.ts`
- [ ] Create test helper for Prisma mocking in `api/tests/helpers/prisma.ts`

### INIT-004: Environment Variables
- [ ] Add `ALTO_ADMIN_EMAIL` to `.env` and `.env.example`
- [ ] Add `DASHBOARD_URL` for magic link base URL

---

## Phase 2: User Story 1 - Submit Request (P1)

**Coverage**: FR-001, FR-002, FR-003, FR-006, FR-016, UX-001 to UX-004

### TDD Cycle 1: Request API Endpoint

#### RED Phase
- [ ] TEST-001 [US1] Test POST /api/access-requests creates request with pending status
  - File: `api/tests/access-requests.test.ts`
  - Input: { company, firstName, lastName, email, phone, rolePreference }
  - Assert: 201 status, request stored with status=pending

- [ ] TEST-002 [US1] Test POST /api/access-requests validates required fields
  - File: `api/tests/access-requests.test.ts`
  - Input: Missing required fields
  - Assert: 400 status with validation errors

- [ ] TEST-003 [US1] Test POST /api/access-requests generates approval token
  - File: `api/tests/access-requests.test.ts`
  - Assert: approvalToken is 64-char hex, tokenExpiresAt is 24h from now

- [ ] TEST-004 [US1] Test POST /api/access-requests rejects duplicate email
  - File: `api/tests/access-requests.test.ts`
  - Input: Email exists in Keycloak or pending requests
  - Assert: 409 status with "email already registered" error

- [ ] TEST-005 [US1] Test POST /api/access-requests sends admin notification email
  - File: `api/tests/access-requests.test.ts`
  - Assert: Email sent to ALTO_ADMIN_EMAIL with approve/reject links

#### GREEN Phase
- [ ] IMPL-001 [US1] Create Zod schema for request validation
  - File: `api/src/routes/access-requests.ts`
  - Fields: company (1-100), firstName (1-100), lastName (1-100), email (valid format), phone (1-20), rolePreference (operator|viewer)

- [ ] IMPL-002 [US1] Implement POST /api/access-requests endpoint
  - File: `api/src/routes/access-requests.ts`
  - Generate approvalToken with crypto.randomBytes(32).toString('hex')
  - Set tokenExpiresAt to now + 24 hours
  - Store request in PostgreSQL

- [ ] IMPL-003 [US1] Add email uniqueness check
  - File: `api/src/services/keycloak-admin.service.ts`
  - Check Keycloak users across all realms
  - Check pending AccessRequests in PostgreSQL

- [ ] IMPL-004 [US1] Create admin notification email template
  - File: `api/src/services/email.service.ts`
  - Method: sendAdminApprovalRequest()
  - Include: requester details, approve/reject URLs with token

### TDD Cycle 2: Request Form (Keycloak Theme)

#### RED Phase
- [ ] TEST-006 [US1] Test register.ftl renders all form fields
  - File: Manual testing or Selenium
  - Assert: company, firstName, lastName, email, phone, rolePreference visible

- [ ] TEST-007 [US1] Test form submission posts to API
  - Assert: Form action points to /api/access-requests
  - Assert: Success redirects to confirmation page

#### GREEN Phase
- [ ] IMPL-005 [US1] Update register.ftl with spec.md fields
  - File: `keycloak/themes/alto/login/register.ftl`
  - Fields: company, firstName, lastName, email, phone, rolePreference dropdown
  - Action: POST to ${apiUrl}/api/access-requests

- [ ] IMPL-006 [US1] Create success confirmation page
  - File: `keycloak/themes/alto/login/register-success.ftl` or redirect URL
  - Message: "Thank you! We'll review your request and be in touch soon."

---

## Phase 3: User Story 2 - Email Approval (P1)

**Coverage**: FR-004, FR-005, FR-007 to FR-011, UX-005 to UX-010

### TDD Cycle 1: Token Validation API

#### RED Phase
- [ ] TEST-008 [US2] Test GET /api/access-requests/approve/:token returns request details
  - File: `api/tests/access-requests.test.ts`
  - Assert: 200 with request summary (no sensitive data)

- [ ] TEST-009 [US2] Test GET /api/access-requests/approve/:token rejects expired token
  - File: `api/tests/access-requests.test.ts`
  - Setup: Token created 25 hours ago
  - Assert: 410 Gone with "token expired" error

- [ ] TEST-010 [US2] Test GET /api/access-requests/approve/:token rejects invalid token
  - File: `api/tests/access-requests.test.ts`
  - Assert: 404 Not Found

- [ ] TEST-011 [US2] Test GET /api/access-requests/approve/:token rejects already processed
  - File: `api/tests/access-requests.test.ts`
  - Setup: Request already approved/rejected
  - Assert: 409 Conflict with "already processed" error

#### GREEN Phase
- [ ] IMPL-007 [US2] Implement GET /api/access-requests/approve/:token
  - File: `api/src/routes/access-requests.ts`
  - Validate token exists, not expired, status=pending
  - Return: firstName, lastName, email, company, phone, rolePreference, createdAt

- [ ] IMPL-008 [US2] Add token expiry validation helper
  - File: `api/src/routes/access-requests.ts`
  - Check tokenExpiresAt > now

### TDD Cycle 2: Approval Flow API

#### RED Phase
- [ ] TEST-012 [US2] Test POST /api/access-requests/approve/:token creates Keycloak user
  - File: `api/tests/access-requests.test.ts`
  - Input: { role: 'operator', siteIds: ['site-hk'] }
  - Assert: User created in Keycloak with correct group memberships

- [ ] TEST-013 [US2] Test POST /api/access-requests/approve/:token assigns role
  - File: `api/tests/access-requests.test.ts`
  - Assert: Keycloak user has realm role assigned

- [ ] TEST-014 [US2] Test POST /api/access-requests/approve/:token assigns sites
  - File: `api/tests/access-requests.test.ts`
  - Assert: User added to site groups (/clients/{client}/sites/{site})

- [ ] TEST-015 [US2] Test POST /api/access-requests/approve/:token sends welcome email
  - File: `api/tests/access-requests.test.ts`
  - Assert: Welcome email sent with login URL, assigned role, assigned sites

- [ ] TEST-016 [US2] Test POST /api/access-requests/approve/:token updates request status
  - File: `api/tests/access-requests.test.ts`
  - Assert: status=approved, processedAt set, processedBy='magic-link'

#### GREEN Phase
- [ ] IMPL-009 [US2] Implement POST /api/access-requests/approve/:token
  - File: `api/src/routes/access-requests.ts`
  - Validate token (reuse IMPL-008)
  - Create Keycloak user via Admin API
  - Assign role and site groups
  - Update request status
  - Send welcome email

- [ ] IMPL-010 [US2] Create Keycloak user creation service
  - File: `api/src/services/keycloak-admin.service.ts`
  - Method: createUser(email, firstName, lastName, role, siteIds)
  - Send password reset email via Keycloak (requiredAction: UPDATE_PASSWORD)

- [ ] IMPL-011 [US2] Create welcome email template
  - File: `api/src/services/email.service.ts`
  - Method: sendWelcomeEmail()
  - Include: login URL, assigned role, assigned sites

### TDD Cycle 3: Approval Page UI

#### RED Phase
- [ ] TEST-017 [US2] Test ApprovePage loads request details
  - File: `alto-cero-iam/tests/pages/ApprovePage.test.tsx`
  - Assert: Request summary displayed

- [ ] TEST-018 [US2] Test ApprovePage shows role dropdown with correct options
  - File: `alto-cero-iam/tests/pages/ApprovePage.test.tsx`
  - Assert: client-admin, operator, viewer options visible

- [ ] TEST-019 [US2] Test ApprovePage shows site multi-select
  - File: `alto-cero-iam/tests/pages/ApprovePage.test.tsx`
  - Assert: Sites loaded and selectable

- [ ] TEST-020 [US2] Test ApprovePage submit creates user
  - File: `alto-cero-iam/tests/pages/ApprovePage.test.tsx`
  - Assert: Success message shown after approval

#### GREEN Phase
- [ ] IMPL-012 [US2] Create ApprovePage component
  - File: `alto-cero-iam/src/pages/ApprovePage.tsx`
  - Fetch request details via token
  - Role dropdown: client-admin, operator, viewer
  - Site multi-select
  - Submit button: "Create User & Send Welcome Email"

- [ ] IMPL-013 [US2] Add /approve/:token route
  - File: `alto-cero-iam/src/App.tsx`
  - Public route (outside ProtectedRoute)

- [ ] IMPL-014 [US2] Create access-requests service methods
  - File: `alto-cero-iam/src/services/access-requests.ts`
  - getRequestByToken(token)
  - approveByToken(token, role, siteIds)

---

## Phase 4: User Story 3 - Email Rejection (P2)

**Coverage**: FR-005, UX-015, UX-016

### TDD Cycle 1: Rejection API

#### RED Phase
- [ ] TEST-021 [US3] Test POST /api/access-requests/reject/:token requires reason
  - File: `api/tests/access-requests.test.ts`
  - Input: { reason: '' }
  - Assert: 400 with "reason required" error

- [ ] TEST-022 [US3] Test POST /api/access-requests/reject/:token validates min length
  - File: `api/tests/access-requests.test.ts`
  - Input: { reason: 'too short' }
  - Assert: 400 with "reason must be at least 10 characters"

- [ ] TEST-023 [US3] Test POST /api/access-requests/reject/:token sends rejection email
  - File: `api/tests/access-requests.test.ts`
  - Assert: Rejection email sent to requester with reason

- [ ] TEST-024 [US3] Test POST /api/access-requests/reject/:token updates status
  - File: `api/tests/access-requests.test.ts`
  - Assert: status=rejected, rejectionReason set, processedAt set

#### GREEN Phase
- [ ] IMPL-015 [US3] Implement POST /api/access-requests/reject/:token
  - File: `api/src/routes/access-requests.ts`
  - Validate token and reason (min 10 chars)
  - Update request status
  - Send rejection email

- [ ] IMPL-016 [US3] Create rejection email template
  - File: `api/src/services/email.service.ts`
  - Method: sendRejectionEmail()
  - Include: rejection reason

### TDD Cycle 2: Rejection Page UI

#### RED Phase
- [ ] TEST-025 [US3] Test RejectPage loads request details
  - File: `alto-cero-iam/tests/pages/RejectPage.test.tsx`
  - Assert: Request summary displayed

- [ ] TEST-026 [US3] Test RejectPage validates reason length
  - File: `alto-cero-iam/tests/pages/RejectPage.test.tsx`
  - Assert: Error shown if reason < 10 chars

- [ ] TEST-027 [US3] Test RejectPage submit sends rejection
  - File: `alto-cero-iam/tests/pages/RejectPage.test.tsx`
  - Assert: Success message shown after rejection

#### GREEN Phase
- [ ] IMPL-017 [US3] Create RejectPage component
  - File: `alto-cero-iam/src/pages/RejectPage.tsx`
  - Request summary
  - Reason textarea (required, min 10 chars)
  - Submit button

- [ ] IMPL-018 [US3] Add /reject/:token route
  - File: `alto-cero-iam/src/App.tsx`
  - Public route (outside ProtectedRoute)

- [ ] IMPL-019 [US3] Add rejectByToken service method
  - File: `alto-cero-iam/src/services/access-requests.ts`
  - rejectByToken(token, reason)

---

## Phase 5: User Story 4 - Dashboard Queue (P1)

**Coverage**: FR-014, UX-011 to UX-014

### TDD Cycle 1: Queue API

#### RED Phase
- [ ] TEST-028 [US4] Test GET /api/access-requests requires authentication
  - File: `api/tests/access-requests.test.ts`
  - Assert: 401 if no token

- [ ] TEST-029 [US4] Test GET /api/access-requests returns all pending for Alto Admin
  - File: `api/tests/access-requests.test.ts`
  - Setup: User with alto-admin role
  - Assert: All pending requests returned

- [ ] TEST-030 [US4] Test GET /api/access-requests filters by company for Client Admin
  - File: `api/tests/access-requests.test.ts`
  - Setup: User with client-admin role in /clients/marriott
  - Assert: Only requests with matching company returned

- [ ] TEST-031 [US4] Test GET /api/access-requests supports status filter
  - File: `api/tests/access-requests.test.ts`
  - Input: ?status=approved
  - Assert: Only approved requests returned

#### GREEN Phase
- [ ] IMPL-020 [US4] Implement GET /api/access-requests with auth
  - File: `api/src/routes/access-requests.ts`
  - Require alto-admin or client-admin role
  - Filter by company for client-admin users
  - Support status query param

- [ ] IMPL-021 [US4] Add client filtering middleware
  - File: `api/src/middleware/client-access.ts`
  - Extract user's client from groups
  - Filter queries by client name = request company

### TDD Cycle 2: Queue UI

#### RED Phase
- [ ] TEST-032 [US4] Test AccessQueuePage displays pending requests table
  - File: `alto-cero-iam/tests/pages/AccessQueuePage.test.tsx`
  - Assert: Table with name, email, company, role pref, date, actions

- [ ] TEST-033 [US4] Test AccessQueuePage shows status tabs
  - File: `alto-cero-iam/tests/pages/AccessQueuePage.test.tsx`
  - Assert: Pending, Approved, Rejected tabs

- [ ] TEST-034 [US4] Test AccessQueuePage refreshes automatically
  - File: `alto-cero-iam/tests/pages/AccessQueuePage.test.tsx`
  - Assert: Requests refetched every 30 seconds

#### GREEN Phase
- [ ] IMPL-022 [US4] Update AccessQueuePage with new fields
  - File: `alto-cero-iam/src/pages/AccessQueuePage.tsx`
  - Table columns: name, email, company, rolePreference, createdAt, actions
  - Status tabs: pending, approved, rejected
  - Auto-refresh every 30 seconds

---

## Phase 6: User Story 5 - Dashboard Approval (P1)

**Coverage**: FR-012 to FR-015, UX-011 to UX-014

### TDD Cycle 1: Dashboard Approval API

#### RED Phase
- [ ] TEST-035 [US5] Test POST /api/access-requests/:id/approve requires auth
  - File: `api/tests/access-requests.test.ts`
  - Assert: 401 if no token

- [ ] TEST-036 [US5] Test POST /api/access-requests/:id/approve requires admin role
  - File: `api/tests/access-requests.test.ts`
  - Setup: User with operator role
  - Assert: 403 Forbidden

- [ ] TEST-037 [US5] Test Client Admin cannot assign client-admin role
  - File: `api/tests/access-requests.test.ts`
  - Setup: User with client-admin role
  - Input: { role: 'client-admin' }
  - Assert: 403 with "cannot assign client-admin role"

- [ ] TEST-038 [US5] Test Client Admin can only approve matching company
  - File: `api/tests/access-requests.test.ts`
  - Setup: client-admin for marriott, request from hilton
  - Assert: 403 Forbidden

#### GREEN Phase
- [ ] IMPL-023 [US5] Implement POST /api/access-requests/:id/approve with auth
  - File: `api/src/routes/access-requests.ts`
  - Require alto-admin or client-admin role
  - Validate role assignment permissions
  - Validate company access for client-admin
  - Reuse Keycloak user creation from IMPL-010

- [ ] IMPL-024 [US5] Add role restriction validation
  - File: `api/src/routes/access-requests.ts`
  - Alto Admin: can assign any role
  - Client Admin: can only assign operator, viewer

### TDD Cycle 2: Approval Modal UI

#### RED Phase
- [ ] TEST-039 [US5] Test ApproveModal shows request details
  - File: `alto-cero-iam/tests/components/ApproveModal.test.tsx`
  - Assert: Name, email, company, preference displayed

- [ ] TEST-040 [US5] Test ApproveModal role options for Alto Admin
  - File: `alto-cero-iam/tests/components/ApproveModal.test.tsx`
  - Setup: User with alto-admin role
  - Assert: client-admin, operator, viewer options

- [ ] TEST-041 [US5] Test ApproveModal role options for Client Admin
  - File: `alto-cero-iam/tests/components/ApproveModal.test.tsx`
  - Setup: User with client-admin role
  - Assert: Only operator, viewer options

- [ ] TEST-042 [US5] Test ApproveModal site selection
  - File: `alto-cero-iam/tests/components/ApproveModal.test.tsx`
  - Assert: Sites loaded from API, multi-select works

#### GREEN Phase
- [ ] IMPL-025 [US5] Create ApproveModal component
  - File: `alto-cero-iam/src/components/ApproveModal.tsx`
  - Request details section
  - Role dropdown (filtered by user's role)
  - Site multi-select
  - Submit: calls POST /api/access-requests/:id/approve

- [ ] IMPL-026 [US5] Integrate ApproveModal in AccessQueuePage
  - File: `alto-cero-iam/src/pages/AccessQueuePage.tsx`
  - Approve button opens modal
  - Refresh queue after approval

---

## Phase 7: Dashboard Rejection (P2)

**Coverage**: FR-007, FR-008, UX-015, UX-016

### TDD Cycle 1: Rejection API

#### RED Phase
- [ ] TEST-043 [US5] Test POST /api/access-requests/:id/reject requires auth
  - File: `api/tests/access-requests.test.ts`
  - Assert: 401 if no token

- [ ] TEST-044 [US5] Test POST /api/access-requests/:id/reject requires reason
  - File: `api/tests/access-requests.test.ts`
  - Assert: 400 if reason missing or < 10 chars

- [ ] TEST-045 [US5] Test Client Admin can only reject matching company
  - File: `api/tests/access-requests.test.ts`
  - Assert: 403 if company doesn't match

#### GREEN Phase
- [ ] IMPL-027 [US5] Implement POST /api/access-requests/:id/reject with auth
  - File: `api/src/routes/access-requests.ts`
  - Require alto-admin or client-admin role
  - Validate company access for client-admin
  - Record rejection reason and timestamp

### TDD Cycle 2: Rejection Modal UI

#### RED Phase
- [ ] TEST-046 [US5] Test RejectModal shows request summary
  - File: `alto-cero-iam/tests/components/RejectModal.test.tsx`
  - Assert: Name, email displayed

- [ ] TEST-047 [US5] Test RejectModal validates reason
  - File: `alto-cero-iam/tests/components/RejectModal.test.tsx`
  - Assert: Error if reason < 10 chars

#### GREEN Phase
- [ ] IMPL-028 [US5] Create RejectModal component
  - File: `alto-cero-iam/src/components/RejectModal.tsx`
  - Request summary
  - Reason textarea (min 10 chars validation)
  - Submit button

- [ ] IMPL-029 [US5] Integrate RejectModal in AccessQueuePage
  - File: `alto-cero-iam/src/pages/AccessQueuePage.tsx`
  - Reject button opens modal
  - Refresh queue after rejection

---

## Execution Order

1. **Phase 1**: Core Infrastructure (INIT-001 to INIT-004) - blocks all
2. **Phase 2**: US1 - Submit Request (TEST-001 to IMPL-006)
3. **Phase 3**: US2 - Email Approval (TEST-008 to IMPL-014)
4. **Phase 4**: US3 - Email Rejection (TEST-021 to IMPL-019)
5. **Phase 5**: US4 - Dashboard Queue (TEST-028 to IMPL-022)
6. **Phase 6**: US5 - Dashboard Approval (TEST-035 to IMPL-026)
7. **Phase 7**: Dashboard Rejection (TEST-043 to IMPL-029)

Within each phase: RED → GREEN cycles

---

## Notes

### Public vs Authenticated Endpoints
| Endpoint | Auth | Notes |
|----------|------|-------|
| POST /api/access-requests | None | Public form submission |
| GET /api/access-requests/approve/:token | None | Magic link validation |
| POST /api/access-requests/approve/:token | None | Magic link approval |
| POST /api/access-requests/reject/:token | None | Magic link rejection |
| GET /api/access-requests | Required | Dashboard queue |
| POST /api/access-requests/:id/approve | Required | Dashboard approval |
| POST /api/access-requests/:id/reject | Required | Dashboard rejection |

### Role Permissions
| Role | See Requests | Assign Roles | Sites |
|------|--------------|--------------|-------|
| Alto Admin | All | client-admin, operator, viewer | All |
| Client Admin | Own company | operator, viewer | Own client |

### Constants (from spec.md)
- Token expiry: 24 hours
- Rejection reason min length: 10 characters
- Queue refresh interval: 30 seconds
