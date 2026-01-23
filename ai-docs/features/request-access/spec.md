# Feature Specification: Request Access

**Feature Folder**: `request-access`
**Input**: Generated from PRD - Access Request Management, Priority #3

## Overview

Access request workflow allows prospective users to request access to the Alto CERO IAM system. Requests are reviewed and approved by Alto Admins or Client Admins, who assign the user to a realm, role, and site groups.

## User Scenarios & Testing

### Primary User Story
As a prospective user, I want to request access to Alto CERO so that an administrator can verify me, assign me a role, and grant access to specific sites.

### Acceptance Scenarios

**Public Form (P1)**
1. [US1] **Given** a visitor on /request-access, **When** they fill required fields (company, name, email, phone, role preference) and submit, **Then** request is stored with status=pending and confirmation displayed
2. [US1] **Given** a submitted request, **When** stored successfully, **Then** Alto Admin receives email notification with approve/reject links

**Email Approval Flow (P1)**
3. [US2] **Given** an admin receiving request notification email, **When** they click "Approve" link, **Then** approval page opens (magic token, no login required)
4. [US2] **Given** admin on approval page, **When** they select realm, role, and sites, then confirm, **Then** user is created in Keycloak with assignments and welcome email sent
5. [US2] **Given** approved user receiving welcome email, **When** they click login link, **Then** they can authenticate with temporary password + MFA setup

**Email Rejection Flow (P2)**
6. [US3] **Given** an admin receiving request notification email, **When** they click "Reject" link, **Then** rejection page opens with reason field
7. [US3] **Given** admin on rejection page, **When** they enter reason and confirm, **Then** user receives rejection email with reason

**Dashboard Queue (P1)**
8. [US4] **Given** Alto Admin logged into dashboard, **When** they view access queue, **Then** all pending requests shown with approve/reject actions
9. [US4] **Given** Client Admin logged into dashboard, **When** they view access queue, **Then** only requests for their realm shown
10. [US5] **Given** admin approving from dashboard, **When** they click approve, **Then** modal opens with realm, role, and site selection

### Edge Cases
- When submitting with existing email in any realm, system MUST reject with clear message [FR-006]
- When magic link token expires (24h), admin MUST be redirected to dashboard login [FR-004]
- When Keycloak user creation fails, system MUST show error and keep request pending [FR-007]
- When email delivery fails, system MUST log error but complete the action [FR-008]
- When Client Admin tries to assign admin role, system MUST block with error [FR-015]

## Requirements

### Functional Requirements

**Form & Storage**
- **FR-001**: System MUST provide public request form at /request-access (no auth)
- **FR-002**: System MUST store requests in PostgreSQL with status (pending/approved/rejected)
- **FR-003**: System MUST send notification email to Alto Admin on new request
- **FR-016**: System MUST capture requested role preference (operator/viewer) on form

**Magic Link Approval**
- **FR-004**: System MUST generate secure approval token (24h expiry) in notification email
- **FR-005**: System MUST allow approval/rejection via token without dashboard login
- **FR-006**: System MUST validate email uniqueness across all realms before storing

**User Creation on Approval**
- **FR-007**: System MUST create Keycloak user in selected realm on approval
- **FR-008**: System MUST generate temporary password and require change on first login
- **FR-009**: System MUST send welcome email with login link and temporary credentials
- **FR-010**: System MUST assign selected role to user (client-admin, operator, or viewer)
- **FR-011**: System MUST assign user to selected site groups

**Role-Based Approval**
- **FR-012**: Alto Admin MUST be able to approve requests for any realm
- **FR-013**: Alto Admin MUST be able to assign any role (including client-admin)
- **FR-014**: Client Admin MUST only see/approve requests for their realm
- **FR-015**: Client Admin MUST NOT be able to assign client-admin role

**Audit**
- **FR-016**: System MUST record approval/rejection with timestamp and approver identity

### UX Requirements

**Public Form**
- **UX-001**: Form MUST have fields: company name, first name, last name, email, phone, role preference (required)
- **UX-002**: Role preference MUST be dropdown: Operator, Viewer (no Admin option)
- **UX-003**: Form MUST be compact - single card, no scroll on desktop
- **UX-004**: Success state MUST show confirmation message

**Notification Email**
- **UX-005**: Email MUST show: requester name, email, company, phone, role preference, submit time
- **UX-006**: Email MUST have prominent Approve (green) and Reject (red) buttons

**Approval Page (Magic Link)**
- **UX-007**: Approval page MUST show request summary
- **UX-008**: Approval page MUST have: realm dropdown, role dropdown, site multi-select
- **UX-009**: Site multi-select MUST filter by selected realm
- **UX-010**: Submit button: "Create User & Send Welcome Email"

**Dashboard Approval Modal**
- **UX-011**: Modal MUST show request details at top
- **UX-012**: Modal MUST have: realm dropdown (Alto Admin) or realm label (Client Admin)
- **UX-013**: Modal MUST have: role dropdown with allowed roles for approver
- **UX-014**: Modal MUST have: site group multi-select (filtered by realm)

**Rejection Page/Modal**
- **UX-015**: MUST have reason textarea (required, min 10 chars)
- **UX-016**: MUST show success/error feedback after action

**User Welcome Email**
- **UX-017**: Welcome email MUST include: login URL, temporary password, assigned role, assigned sites

### Key Entities

- **AccessRequest**: id, company, firstName, lastName, email, phone, rolePreference, status, approvalToken, tokenExpiresAt, assignedRealmId, assignedRole, assignedSiteIds[], processedBy, processedAt, createdAt
- **RequestStatus**: pending | approved | rejected
- **RolePreference**: operator | viewer
- **AssignableRole**: client-admin | operator | viewer

### Technical Context

- **Tech Stack**: React (form + dashboard), Express API (storage, emails), Keycloak Admin API (user creation)
- **Email**: SMTP via Nodemailer
- **Token**: crypto.randomBytes(32) → hex, stored with request
- **Constraints**:
  - Token valid for 24 hours
  - Request storage in PostgreSQL (alto_api database)
  - Alto Admin notification email from environment variable (ALTO_ADMIN_EMAIL)

## Non-Goals (Out of Scope)

- Self-registration (all users must be approved)
- Multiple approvers per request
- Approval workflow with multiple steps
- Request editing after submission
- Requester choosing specific sites (admin assigns)
- Bulk approval of multiple requests
