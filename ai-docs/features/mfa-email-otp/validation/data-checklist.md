# Data Checklist: MFA Email OTP

**Source**: data-model.md

## Completeness

- [ ] CHK048 Is the OTPCode generation algorithm documented (random, TOTP, etc.)? [Completeness, data-model.md: OTPCode]
- [ ] CHK049 Is the MFASession cleanup behavior documented (when is session data deleted)? [Completeness, data-model.md: MFASession]
- [ ] CHK050 Is the EmailTemplate localization strategy documented (per-realm, per-locale)? [Completeness, data-model.md: EmailTemplate]

## Clarity

- [ ] CHK051 Is the OTPCode.expiresAt calculation formula unambiguous (createdAt + OTP_EXPIRY_SECONDS)? [Clarity, data-model.md: OTPCode]
- [ ] CHK052 Is the comparison operator for lockout trigger clear (>= 3 vs > 3)? [Clarity, data-model.md: Constants]
- [ ] CHK053 Is the comparison operator for resend cooldown clear (>= 60 vs > 60)? [Clarity, data-model.md: Validation Rules]

## Consistency

- [ ] CHK054 Does MFASessionStatus enum include all states from ux.md States & Transitions? [Consistency, data-model.md → ux.md]
- [ ] CHK055 Do derived values (otp_expiration_countdown, remaining_attempts) match ux.md Quantified UX Elements? [Consistency, data-model.md → ux.md]
- [ ] CHK056 Does OTP_LENGTH (6) match the validation pattern (^\d{6}$)? [Consistency, data-model.md: Validation Rules]

## Edge Case

- [ ] CHK057 Is behavior defined when lockedUntil is null but attempts >= MAX_OTP_ATTEMPTS? [Edge Case, data-model.md: MFASession]
- [ ] CHK058 Is behavior defined when lastResendAt is null on first resend attempt? [Edge Case, data-model.md: MFASession]
- [ ] CHK059 Is behavior defined for OTPCode with consumed=true but not expired? [Edge Case, data-model.md: OTPCode]

## Cross-Artifact

- [ ] CHK060 Are all 6 constants (OTP_LENGTH, OTP_EXPIRY_SECONDS, MAX_OTP_ATTEMPTS, LOCKOUT_DURATION_SECONDS, RESEND_COOLDOWN_SECONDS, EMAIL_DELIVERY_TIMEOUT_SECONDS) referenced in tasks.md? [Coverage, data-model.md → tasks.md]
- [ ] CHK061 Are all state transitions (8 total) from States & Transitions covered by TEST tasks? [Coverage, data-model.md → tasks.md]
- [ ] CHK062 Do entity fields (OTPCode, MFASession) align with Keycloak's internal data model per plan.md? [Consistency, data-model.md → plan.md]
