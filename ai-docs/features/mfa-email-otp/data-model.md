# Data Model - MFA Email OTP

## Entities

### OTPCode
Represents a one-time password generated for MFA verification.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| code | string | length: 6, pattern: `^\d{6}$` | 6-digit numeric OTP |
| userId | string | required | Keycloak user ID |
| realmId | string | required | Keycloak realm ID |
| createdAt | timestamp | required | Generation timestamp |
| expiresAt | timestamp | required | `createdAt + OTP_EXPIRY_SECONDS` |
| attempts | number | default: 0, max: MAX_OTP_ATTEMPTS | Failed verification count |
| consumed | boolean | default: false | True after successful verification |

### MFASession
Temporary state tracking OTP flow for a user authentication attempt.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| sessionId | string | required, unique | Keycloak auth session ID |
| userId | string | required | User attempting authentication |
| status | MFASessionStatus | required | Current session state |
| lastResendAt | timestamp | optional | Last OTP resend timestamp |
| lockedUntil | timestamp | optional | Lockout expiration if locked |

### EmailTemplate
Branded HTML template for OTP delivery.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| templateId | string | required | Template identifier |
| subject | string | required, max: 100 | Email subject line |
| htmlBody | string | required | HTML content with `{otp}` placeholder |
| realmId | string | required | Realm this template belongs to |

## Enums

### MFASessionStatus
```
AWAITING_OTP     - OTP sent, waiting for user input
VALIDATING       - OTP submitted, being verified
LOCKED_OUT       - Too many failed attempts
EXPIRED          - OTP code expired
COMPLETED        - Successfully authenticated
```

### OTPDeliveryStatus
```
PENDING          - Email queued for delivery
SENT             - Email accepted by SMTP server
DELIVERED        - Delivery confirmed (if available)
FAILED           - Delivery failed
```

## States & Transitions

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │ password_validated
       ▼
┌─────────────┐  resend (cooldown elapsed)
│ AWAITING_OTP│◄────────────────────────┐
└──────┬──────┘                         │
       │ otp_submitted                  │
       ▼                                │
┌─────────────┐                         │
│ VALIDATING  │                         │
└──────┬──────┘                         │
       │                                │
  ┌────┴────┐                           │
  │         │                           │
valid    invalid                        │
  │         │                           │
  ▼         ▼                           │
┌─────┐  ┌──────────┐  attempts < 3     │
│DONE │  │CHECK_LOCK├───────────────────┘
└─────┘  └────┬─────┘
              │ attempts >= 3
              ▼
         ┌──────────┐  lockout_expired
         │LOCKED_OUT├────────────────► AWAITING_OTP
         └──────────┘
```

**Triggers:**
- `password_validated`: User entered correct password, trigger OTP send
- `otp_submitted`: User entered OTP code
- `resend`: User requested new code (if cooldown elapsed)
- `lockout_expired`: 5-minute lockout period ended

## Constants

| Name | Value | Description | Source |
|------|-------|-------------|--------|
| OTP_LENGTH | 6 | Number of digits in OTP code | (FR-001) |
| OTP_EXPIRY_SECONDS | 300 | OTP valid for 5 minutes (< 300 triggers expiry) | (FR-003) |
| MAX_OTP_ATTEMPTS | 3 | Failed attempts before lockout (>= 3 triggers lockout) | (FR-004) |
| LOCKOUT_DURATION_SECONDS | 300 | Lockout period of 5 minutes | (FR-004) |
| RESEND_COOLDOWN_SECONDS | 60 | Minimum wait between resends (< 60 shows timer) | (FR-005) |
| EMAIL_DELIVERY_TIMEOUT_SECONDS | 10 | Max acceptable delivery time | (PRD constraint) |

**Derived Values:**
- `otp_expiration_countdown`: `OTP_EXPIRY_SECONDS - elapsed_seconds` (ux.md)
- `resend_cooldown_timer`: `RESEND_COOLDOWN_SECONDS - elapsed_seconds` (ux.md)
- `lockout_countdown`: `LOCKOUT_DURATION_SECONDS - elapsed_seconds` (ux.md)
- `remaining_attempts`: `MAX_OTP_ATTEMPTS - current_attempts` (ux.md)

## Validation Rules

### OTP Code Input
- Must be exactly 6 digits
- Pattern: `^\d{6}$`
- No spaces or special characters

### Email Validation
- User must have verified email in Keycloak
- Email must be deliverable (not bounced previously)

### Resend Request
- `current_time - lastResendAt >= RESEND_COOLDOWN_SECONDS`
- Session must be in AWAITING_OTP status

### Lockout Check
- `attempts >= MAX_OTP_ATTEMPTS` triggers lockout
- Lockout clears when `current_time >= lockedUntil`
