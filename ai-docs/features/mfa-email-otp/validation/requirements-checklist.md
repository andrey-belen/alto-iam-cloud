# Requirements Checklist: MFA Email OTP

**Source**: spec.md

## Completeness

- [ ] CHK001 Is OTP code generation method documented (random vs TOTP-based)? [Completeness, FR-001]
- [ ] CHK002 Is behavior documented when user has no verified email address? [Completeness, FR-001]
- [ ] CHK003 Is the SMTP retry strategy documented for delivery failures? [Completeness, FR-002]
- [ ] CHK004 Is behavior documented when OTP expires mid-entry? [Completeness, FR-003]
- [ ] CHK005 Is the lockout counter reset behavior documented (after success or time)? [Completeness, FR-004]

## Clarity

- [ ] CHK006 Is "within 10 seconds" measured from password validation or OTP request? [Clarity, FR-002]
- [ ] CHK007 Is "temporary lockout" duration explicitly stated with units (5 minutes = 300 seconds)? [Clarity, FR-004]
- [ ] CHK008 Is the 60-second resend cooldown starting point defined (from send or from click)? [Clarity, FR-005]

## Consistency

- [ ] CHK009 Does FR-003 (5-minute expiry) align with OTP_EXPIRY_SECONDS (300) in data-model.md? [Consistency, FR-003 → data-model.md]
- [ ] CHK010 Does FR-004 (3 attempts) align with MAX_OTP_ATTEMPTS (3) in data-model.md? [Consistency, FR-004 → data-model.md]

## Coverage

- [ ] CHK011 Are all scenario types covered: Primary (valid OTP), Alternate (resend), Exception (invalid OTP), Recovery (lockout expiry)? [Coverage, spec.md: Acceptance Scenarios]
- [ ] CHK012 Is behavior defined for concurrent login attempts from same user? [Coverage, spec.md: Edge Cases]
- [ ] CHK013 Is behavior defined for OTP entry after browser refresh? [Coverage, spec.md: Edge Cases]

## Cross-Artifact

- [ ] CHK014 Are all FR-XXX (FR-001 to FR-006) covered by TEST tasks in tasks.md? [Coverage, spec.md → tasks.md]
- [ ] CHK015 Are all edge cases from spec.md (email delivery fails, OTP expires, SMTP unavailable) covered by TEST tasks? [Coverage, spec.md → tasks.md]
- [ ] CHK016 Does the acceptance scenario for lockout (P3) have corresponding state tests in tasks.md? [Consistency, spec.md → tasks.md]
