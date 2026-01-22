# Feature Specification: MFA Email OTP

**Feature Branch**: `feature/mfa-email-otp`
**Input**: Generated from PRD - Supporting Features, Priority

## User Scenarios & Testing

### Primary User Story
As a property user, I want to receive a one-time password via email after entering my credentials so that my account is protected with multi-factor authentication.

### Acceptance Scenarios
1. [P1] **Given** a user who entered valid credentials, **When** MFA is required, **Then** an OTP code is sent to their registered email within 10 seconds
2. [P1] **Given** a user who received an OTP, **When** they enter the correct code, **Then** they are authenticated and redirected to the application
3. [P2] **Given** a user waiting for OTP, **When** the email hasn't arrived, **Then** they can request a new code via "Resend" button
4. [P3] **Given** a user who enters incorrect OTP 3 times, **When** they attempt again, **Then** account is temporarily locked for 5 minutes

### Edge Cases
- When email delivery fails, system MUST display error with retry option [FR-002]
- When OTP expires (5 minutes), system MUST prompt user to request new code [FR-003]
- When SMTP service is unavailable, system MUST queue email and retry [FR-002]

## Requirements

### Functional Requirements
- **FR-001**: System MUST send 6-digit OTP to user's registered email after password validation
- **FR-002**: System MUST deliver OTP email within 10 seconds using Google SMTP
- **FR-003**: System MUST expire OTP codes after 5 minutes
- **FR-004**: System MUST allow maximum 3 OTP attempts before temporary lockout
- **FR-005**: System MUST provide "Resend Code" functionality with 60-second cooldown
- **FR-006**: System MUST enforce MFA for all user logins (verified by Keycloak authentication flow configuration)

### UX Requirements
- **UX-001**: OTP input MUST be a single field accepting 6 digits with auto-focus
- **UX-002**: OTP form MUST display countdown timer showing code expiration
- **UX-003**: Resend button MUST show cooldown timer when disabled
- **UX-004**: Email template MUST clearly display OTP code with Alto branding

### Key Entities
- **OTP Code**: 6-digit numeric code with expiration timestamp, linked to user session
- **MFA Session**: Temporary state tracking OTP attempts, cooldowns, and expiration
- **Email Template**: Branded HTML template for OTP delivery

### Technical Context
- **Tech Stack**: Keycloak Email OTP Authenticator, Google SMTP
- **Constraints**:
  - MFA email delivery under 10 seconds (PRD requirement)
  - Google SMTP with app password authentication
