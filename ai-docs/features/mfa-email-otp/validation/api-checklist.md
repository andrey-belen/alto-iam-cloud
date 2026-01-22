# API Checklist: MFA Email OTP

**Source**: contracts/contracts.md, plan.md

## Completeness

- [ ] CHK034 Is the Keycloak version requirement (24+) documented for Email OTP authenticator support? [Completeness, contracts.md: Overview]
- [ ] CHK035 Is the SMTP connection timeout documented for email delivery? [Completeness, contracts.md: SMTP Configuration]
- [ ] CHK036 Is the event retention period (604800 = 7 days) configurable or fixed? [Completeness, contracts.md: Event Listener]

## Clarity

- [ ] CHK037 Is the OTP policy "type: totp" explicitly required or can it be "hotp"? [Clarity, contracts.md: OTP Policy]
- [ ] CHK038 Is the email template variable syntax (${code} vs {otp}) consistent across contracts.md and plan.md? [Clarity, contracts.md → plan.md]
- [ ] CHK039 Is the SMTP port (587) required or can alternative ports (465, 25) be used? [Clarity, contracts.md: SMTP Configuration]

## Consistency

- [ ] CHK040 Does brute_force max_login_failures (3) match MAX_OTP_ATTEMPTS in data-model.md? [Consistency, contracts.md → data-model.md]
- [ ] CHK041 Does brute_force max_failure_wait_seconds (300) match LOCKOUT_DURATION_SECONDS in data-model.md? [Consistency, contracts.md → data-model.md]
- [ ] CHK042 Does OTP policy digits (6) match OTP_LENGTH in data-model.md? [Consistency, contracts.md → data-model.md]

## Coverage

- [ ] CHK043 Are all 4 Keycloak event types (LOGIN, LOGIN_ERROR, SEND_VERIFY_EMAIL, USER_DISABLED_BY_TEMPORARY_LOCKOUT) tested? [Coverage, contracts.md: OTP Events]
- [ ] CHK044 Is the authentication flow structure (auth-cookie, forms, auth-username-password-form, auth-otp-form) complete? [Coverage, contracts.md: Authentication Flow]

## Cross-Artifact

- [ ] CHK045 Are all SMTP configuration fields from contracts.md covered by INIT tasks in tasks.md? [Coverage, contracts.md → tasks.md]
- [ ] CHK046 Does the event logging configuration have corresponding TEST tasks? [Coverage, contracts.md → tasks.md]
- [ ] CHK047 Do error response behaviors in Keycloak align with error types in ux.md? [Consistency, contracts.md → ux.md]
