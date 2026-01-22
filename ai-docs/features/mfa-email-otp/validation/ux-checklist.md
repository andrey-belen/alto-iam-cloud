# UX Checklist: MFA Email OTP

**Source**: ux.md

## Completeness

- [ ] CHK017 Is keyboard shortcut for "Cancel" (Escape key) documented in login theme implementation? [Completeness, ux.md: Navigation]
- [ ] CHK018 Is the OTP input field autocomplete attribute value documented ("one-time-code")? [Completeness, ux.md: Browser]
- [ ] CHK019 Is the success toast message text defined for authentication completion? [Completeness, ux.md: submit_otp]
- [ ] CHK020 Is the "remaining attempts" display format documented (e.g., "2 attempts remaining")? [Completeness, ux.md: Quantified UX Elements]

## Clarity

- [ ] CHK021 Is the countdown timer format unambiguous (MM:SS vs "X seconds remaining")? [Clarity, UX-002]
- [ ] CHK022 Is the toast auto-dismiss timing (5s) documented in error presentation? [Clarity, ux.md: network_failure]
- [ ] CHK023 Is the minimum contrast ratio (4.5:1) specified for which text elements? [Clarity, ux.md: Visual]

## Coverage

- [ ] CHK024 Is loading state documented for OTP verification (submit_otp feedback)? [Coverage, ux.md: Core Actions]
- [ ] CHK025 Is loading state documented for resend action (resend_code feedback)? [Coverage, ux.md: Core Actions]
- [ ] CHK026 Are all 7 UI states (awaiting_input, validating, resending, cooldown, locked_out, expired, success) covered? [Coverage, ux.md: States & Transitions]

## Edge Case

- [ ] CHK027 Is behavior defined when user pastes partial OTP (less than 6 digits)? [Edge Case, ux.md: input_digit]
- [ ] CHK028 Is behavior defined when countdown reaches zero while user is typing? [Edge Case, ux.md: timeout]
- [ ] CHK029 Is focus management defined after error message display? [Edge Case, ux.md: validation_error]

## Cross-Artifact

- [ ] CHK030 Are all accessibility requirements (ARIA role="form", aria-live) covered by TEST tasks? [Coverage, ux.md → tasks.md]
- [ ] CHK031 Are all 4 error types (network_failure, validation_error, timeout, permission_denied) covered by TEST tasks? [Coverage, ux.md → tasks.md]
- [ ] CHK032 Do exit path behaviors (Cancel/Back, Browser Close, Timeout) have corresponding state handling in data-model.md? [Consistency, ux.md → data-model.md]
- [ ] CHK033 Does the 44x44px touch target requirement have implementation guidance in plan.md? [Coverage, ux.md → plan.md]
