# Tasks: MFA Email OTP

## Purpose
Implementation tasks for MFA Email OTP using Keycloak's built-in authentication flows, organized by TDD cycles.

## Phase 1: Core Infrastructure

- [x] INIT-001 Create cloud/ directory structure per plan.md
- [x] INIT-002 Initialize Terraform project with Keycloak provider 4.x in cloud/terraform/
- [x] INIT-003 Create docker-compose.yml with Keycloak 24+ and PostgreSQL 15 in cloud/
- [x] INIT-004 Configure environment variables for SMTP (KC_SMTP_HOST, KC_SMTP_PORT, KC_SMTP_USER, KC_SMTP_PASSWORD, KC_SMTP_STARTTLS) per setup.md
- [x] INIT-005 Create Terraform module structure in cloud/terraform/modules/mfa-email-otp/
- [x] INIT-006 Setup test infrastructure with Node.js and test framework in cloud/tests/
- [x] INIT-007 Create test fixtures directory with test-users.json in cloud/tests/fixtures/
- [x] INIT-008 Configure Keycloak theme directory structure in cloud/keycloak/themes/alto/

## Phase 2: User Story 1 - OTP Sent Within 10 Seconds (P1 - MVP)

### TDD Cycle 1: Authentication Flow Configuration
**Coverage:**
- Requirements: FR-001, FR-006
- Contracts: browser-with-otp flow from contracts.md
- Constants: OTP_LENGTH (6), OTP_EXPIRY_SECONDS (300)

#### RED Phase
- [ ] TEST-001 [US1] Test authentication flow includes OTP form execution in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-002 [US1] Test OTP policy configured with 6 digits (OTP_LENGTH) in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-003 [US1] Test OTP policy period set to 300 seconds (OTP_EXPIRY_SECONDS) in cloud/tests/integration/mfa-otp.test.ts

#### GREEN Phase
- [ ] IMPL-001 [US1] Create authentication flow with auth-otp-form execution in cloud/terraform/modules/mfa-email-otp/main.tf
- [ ] IMPL-002 [US1] Configure OTP policy with digits=6, period=300 in cloud/terraform/modules/mfa-email-otp/main.tf
- [ ] IMPL-003 [US1] Create variables.tf with OTP_LENGTH, OTP_EXPIRY_SECONDS constants in cloud/terraform/modules/mfa-email-otp/variables.tf

### TDD Cycle 2: SMTP Email Delivery
**Coverage:**
- Requirements: FR-002
- Contracts: SMTP Configuration Contract from contracts.md
- Constants: EMAIL_DELIVERY_TIMEOUT_SECONDS (10)

#### RED Phase
- [ ] TEST-004 [US1] Test SMTP configuration applied to realm in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-005 [US1] Test OTP email delivered within 10 seconds (EMAIL_DELIVERY_TIMEOUT_SECONDS) in cloud/tests/integration/mfa-otp.test.ts

#### GREEN Phase
- [ ] IMPL-004 [US1] Configure realm SMTP settings (smtp.gmail.com:587, STARTTLS) in cloud/terraform/modules/mfa-email-otp/main.tf
- [ ] IMPL-005 [US1] Add SMTP variables (host, port, user, password) to cloud/terraform/modules/mfa-email-otp/variables.tf

### TDD Cycle 3: Email Template
**Coverage:**
- Requirements: UX-004
- Entities: EmailTemplate from data-model.md
- Contracts: Email Template Contract from contracts.md

#### RED Phase
- [ ] TEST-006 [US1] Test email template contains OTP code placeholder in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-007 [US1] Test email template includes Alto branding in cloud/tests/integration/mfa-otp.test.ts

#### GREEN Phase
- [ ] IMPL-006 [US1] Create email-otp.ftl template with ${code} variable in cloud/keycloak/themes/alto/email/html/email-otp.ftl
- [ ] IMPL-007 [US1] Add Alto branding (logo, colors) to email template in cloud/keycloak/themes/alto/email/html/email-otp.ftl

## Phase 3: User Story 2 - Correct Code Authenticates (P1 - MVP)

### TDD Cycle 1: OTP Verification Flow
**Coverage:**
- Requirements: FR-001, FR-003
- States: AWAITING_OTP → VALIDATING → DONE transitions from data-model.md

#### RED Phase
- [ ] TEST-008 [US2] Test state transition START → AWAITING_OTP on password_validated in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-009 [US2] Test state transition AWAITING_OTP → VALIDATING on otp_submitted in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-010 [US2] Test state transition VALIDATING → DONE on valid code in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-011 [US2] Test successful authentication returns access token in cloud/tests/integration/mfa-otp.test.ts

#### GREEN Phase
- [ ] IMPL-008 [US2] Bind browser-with-otp flow to realm in cloud/terraform/modules/mfa-email-otp/main.tf
- [ ] IMPL-009 [US2] Create outputs.tf with flow binding IDs in cloud/terraform/modules/mfa-email-otp/outputs.tf

### TDD Cycle 2: OTP Expiration
**Coverage:**
- Requirements: FR-003
- States: Code expiration handling
- Constants: OTP_EXPIRY_SECONDS (300)

#### RED Phase
- [ ] TEST-012 [US2] Test expired OTP (> 300 seconds) rejected with expiration error in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-013 [US2] Test error presentation for timeout matches ux.md specification in cloud/tests/integration/mfa-otp.test.ts

#### GREEN Phase
- [ ] IMPL-010 [US2] Configure OTP expiration policy in realm settings in cloud/terraform/modules/mfa-email-otp/main.tf

### TDD Cycle 3: Login Theme Error Messages
**Coverage:**
- Requirements: UX-001, UX-002
- Accessibility: ARIA role="form", aria-live="polite" for timers, aria-live="assertive" for errors

#### RED Phase
- [ ] TEST-014 [US2] Test OTP input accepts only 6 digits matching pattern ^\d{6}$ in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-015 [US2] Test countdown timer displays OTP_EXPIRY_SECONDS countdown in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-016 [US2] Test ARIA role="form" on OTP container in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-017 [US2] Test aria-live="assertive" on error messages in cloud/tests/integration/mfa-otp.test.ts

#### GREEN Phase
- [ ] IMPL-011 [US2] Create messages_en.properties with error messages in cloud/keycloak/themes/alto/login/messages/messages_en.properties
- [ ] IMPL-012 [US2] Configure login theme with ARIA attributes in cloud/keycloak/themes/alto/login/

## Phase 4: User Story 3 - Resend Code Functionality (P2)

### TDD Cycle 1: Resend with Cooldown
**Coverage:**
- Requirements: FR-005, UX-003
- States: AWAITING_OTP → AWAITING_OTP (resend, cooldown elapsed)
- Constants: RESEND_COOLDOWN_SECONDS (60)

#### RED Phase
- [ ] TEST-018 [US3] Test resend blocked during cooldown (< 60 seconds) in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-019 [US3] Test resend allowed after cooldown (>= 60 seconds) in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-020 [US3] Test state transition AWAITING_OTP → AWAITING_OTP on resend in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-021 [US3] Test new OTP invalidates previous OTP in cloud/tests/integration/mfa-otp.test.ts

#### GREEN Phase
- [ ] IMPL-013 [US3] Add RESEND_COOLDOWN_SECONDS variable to Terraform in cloud/terraform/modules/mfa-email-otp/variables.tf
- [ ] IMPL-014 [US3] Configure resend cooldown in authentication flow in cloud/terraform/modules/mfa-email-otp/main.tf

### TDD Cycle 2: Resend UI Feedback
**Coverage:**
- Requirements: UX-003
- Accessibility: aria-live="polite" for cooldown timer

#### RED Phase
- [ ] TEST-022 [US3] Test cooldown timer displays remaining seconds in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-023 [US3] Test resend button disabled during cooldown in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-024 [US3] Test aria-live="polite" on cooldown timer in cloud/tests/integration/mfa-otp.test.ts

#### GREEN Phase
- [ ] IMPL-015 [US3] Add cooldown timer to login theme in cloud/keycloak/themes/alto/login/

## Phase 5: User Story 4 - Lockout After Failed Attempts (P3)

### TDD Cycle 1: Brute Force Protection
**Coverage:**
- Requirements: FR-004
- States: CHECK_LOCK → LOCKED_OUT (attempts >= 3), LOCKED_OUT → AWAITING_OTP (lockout_expired)
- Contracts: Brute Force Protection Contract from contracts.md
- Constants: MAX_OTP_ATTEMPTS (3), LOCKOUT_DURATION_SECONDS (300)

#### RED Phase
- [ ] TEST-025 [US4] Test state transition VALIDATING → CHECK_LOCK on invalid code in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-026 [US4] Test state transition CHECK_LOCK → AWAITING_OTP when attempts < 3 in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-027 [US4] Test state transition CHECK_LOCK → LOCKED_OUT when attempts >= 3 (MAX_OTP_ATTEMPTS) in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-028 [US4] Test state transition LOCKED_OUT → AWAITING_OTP after 300 seconds (LOCKOUT_DURATION_SECONDS) in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-029 [US4] Test LOGIN_ERROR event fired on failed attempt in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-030 [US4] Test USER_DISABLED_BY_TEMPORARY_LOCKOUT event on lockout in cloud/tests/integration/mfa-otp.test.ts

#### GREEN Phase
- [ ] IMPL-016 [US4] Configure brute_force_protected=true in realm in cloud/terraform/modules/mfa-email-otp/main.tf
- [ ] IMPL-017 [US4] Set max_login_failures=3 (MAX_OTP_ATTEMPTS) in cloud/terraform/modules/mfa-email-otp/main.tf
- [ ] IMPL-018 [US4] Set max_failure_wait_seconds=300 (LOCKOUT_DURATION_SECONDS) in cloud/terraform/modules/mfa-email-otp/main.tf
- [ ] IMPL-019 [US4] Add MAX_OTP_ATTEMPTS, LOCKOUT_DURATION_SECONDS variables in cloud/terraform/modules/mfa-email-otp/variables.tf

### TDD Cycle 2: Lockout Error Presentation
**Coverage:**
- Requirements: UX-002
- Error Presentation: permission_denied from ux.md

#### RED Phase
- [ ] TEST-031 [US4] Test lockout displays countdown timer in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-032 [US4] Test lockout message matches ux.md permission_denied template in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-033 [US4] Test form auto-enables when lockout expires in cloud/tests/integration/mfa-otp.test.ts

#### GREEN Phase
- [ ] IMPL-020 [US4] Add lockout countdown to login theme in cloud/keycloak/themes/alto/login/
- [ ] IMPL-021 [US4] Configure lockout error message in messages_en.properties in cloud/keycloak/themes/alto/login/messages/messages_en.properties

### TDD Cycle 3: Event Logging
**Coverage:**
- Contracts: Event Listener Configuration from contracts.md

#### RED Phase
- [ ] TEST-034 [US4] Test events_enabled=true in realm configuration in cloud/tests/integration/mfa-otp.test.ts
- [ ] TEST-035 [US4] Test LOGIN, LOGIN_ERROR, SEND_VERIFY_EMAIL events captured in cloud/tests/integration/mfa-otp.test.ts

#### GREEN Phase
- [ ] IMPL-022 [US4] Enable event logging with required event types in cloud/terraform/modules/mfa-email-otp/main.tf

## Execution Order

1. **Phase 1**: Core Infrastructure (blocks all stories)
2. **Phase 2**: US1 - OTP Sent Within 10 Seconds (P1)
3. **Phase 3**: US2 - Correct Code Authenticates (P1)
4. **Phase 4**: US3 - Resend Code Functionality (P2)
5. **Phase 5**: US4 - Lockout After Failed Attempts (P3)

Within each story: RED → GREEN cycles

## Notes

- Implementation uses Keycloak's built-in OTP authenticator - no custom backend code
- All configuration via Terraform for reproducibility across realms
- Tests run against live Keycloak instance using test-users.json fixtures
- Constants (OTP_LENGTH, OTP_EXPIRY_SECONDS, etc.) defined in variables.tf
- Email template uses FreeMarker syntax (${code} for OTP)
- All state transitions match data-model.md States & Transitions
- Accessibility standards from ux.md included in theme customization
