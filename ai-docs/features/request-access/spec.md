# Feature Specification: Request Access

**Feature Branch**: `feature/request-access`
**Input**: Generated from PRD - Access Request Management, Priority #3

## User Scenarios & Testing

### Primary User Story
As a prospective user, I want to request access to Alto CERO by providing my company and contact information so that an Alto operator can review and grant me access to the appropriate property.

### Acceptance Scenarios
1. [P1] **Given** a visitor on the public request page, **When** they fill all required fields and submit, **Then** request is stored and confirmation message displayed
2. [P1] **Given** an Alto operator viewing pending requests, **When** they click "Approve", **Then** modal shows property dropdown for assignment
3. [P1] **Given** an Alto operator approving a request, **When** they select property and confirm, **Then** user is created in Keycloak realm with temporary password and notification email sent
4. [P2] **Given** an Alto operator viewing a request, **When** they click "Reject", **Then** modal shows reason field and rejection email sent on confirm
5. [P2] **Given** multiple pending requests, **When** operator views queue, **Then** requests are sorted by date (oldest first) with company name visible
6. [P3] **Given** a request with duplicate email, **When** form is submitted, **Then** error indicates email already registered

### Edge Cases
- When submitting with existing email in any realm, system MUST reject with clear message [FR-005]
- When Keycloak user creation fails, system MUST keep request in queue and show error to operator [FR-004]
- When email notification fails, system MUST still complete approval but log warning [FR-007]

## Requirements

### Functional Requirements
- **FR-001**: System MUST provide public request form without authentication
- **FR-002**: System MUST store requests in PostgreSQL with status (pending/approved/rejected)
- **FR-003**: System MUST display pending requests queue to Alto operators only
- **FR-004**: System MUST create Keycloak user in selected realm on approval
- **FR-005**: System MUST validate email uniqueness across all realms before storing request
- **FR-006**: System MUST set temporary password and require change on first login
- **FR-007**: System MUST send email notification on approval (with credentials) and rejection (with reason)
- **FR-008**: System MUST record approval/rejection with timestamp and operator ID for audit

### UX Requirements
- **UX-001**: Request form MUST have fields: company name, full name, email, phone, role/position, notes (optional)
- **UX-002**: Form MUST show inline validation errors before submission
- **UX-003**: Success state MUST display confirmation message without revealing queue position
- **UX-004**: Pending queue MUST show: company, name, email, role, submitted date, actions
- **UX-005**: Approve modal MUST show property dropdown filtered by company name match
- **UX-006**: Reject modal MUST require reason field (min 10 characters)

### Key Entities
- **Access Request**: Pending request with company, contact info, status, timestamps
- **Request Status**: Enum (pending, approved, rejected) with audit trail
- **Property Assignment**: Link between approved request and target Keycloak realm

### Technical Context
- **Tech Stack**: React + Tailwind (form/queue), Express API (request storage), Keycloak Admin REST API (user creation)
- **Constraints**: Request storage separate from Keycloak (PostgreSQL), email via Google SMTP
