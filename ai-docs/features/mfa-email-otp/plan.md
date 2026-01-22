# Implementation Plan: MFA Email OTP

## Purpose
Translates MFA Email OTP requirements into technical implementation using Keycloak's built-in authentication flows.

## Summary
Leverage Keycloak's native Email OTP authenticator configured via Terraform and Admin API. No custom backend code required - OTP generation, delivery, and validation handled entirely by Keycloak. Implementation focuses on configuration, email template customization, and integration testing.

## Technical Context

**Language:** HCL (Terraform), HTML (email template)

**Framework:** Keycloak 24+ Authentication SPI

**Storage:** Keycloak internal (PostgreSQL) - OTP state managed by Keycloak session

**API Layer:** Keycloak Admin REST API for configuration, no custom endpoints

**Testing:** Integration tests against Keycloak authentication endpoints

**Deployment:** Docker Compose with Keycloak + PostgreSQL

**Constraints:**
- Email delivery under 10 seconds (PRD)
- Must work across all property realms
- Google SMTP rate limits (~500/day free tier)

## Implementation Mapping

### Component Architecture

- **Core Components:**
  - Terraform module for authentication flow configuration
  - Email template files for Alto branding
  - Realm configuration for SMTP and OTP policy

- **Data Models:**
  - OTPCode, MFASession managed internally by Keycloak
  - EmailTemplate stored in Keycloak theme directory
  - See `data-model.md` for entity specifications

- **API Operations:**
  - No custom API - Keycloak handles `/realms/{realm}/protocol/openid-connect/auth` flow
  - Admin API for configuration: `PUT /admin/realms/{realm}`

- **State Management:**
  - MFASessionStatus transitions managed by Keycloak auth flow
  - Lockout state in Keycloak brute force protection
  - See `data-model.md` States & Transitions

### Error Handling Approach

- **Error handlers location:** Keycloak authentication flow + login theme
- **Recovery mechanisms:**
  - Resend button with cooldown (60s) // RESEND_COOLDOWN_SECONDS from data-model.md
  - Auto-unlock after lockout period (300s) // LOCKOUT_DURATION_SECONDS from data-model.md
- **User feedback:** Keycloak login theme templates display errors per ux.md Error Presentation

## Feature Code Organization

```
cloud/
├── terraform/
│   └── modules/
│       └── mfa-email-otp/
│           ├── main.tf           # Authentication flow, OTP policy
│           ├── variables.tf      # Configurable constants
│           └── outputs.tf        # Flow IDs for realm binding
│
├── keycloak/
│   └── themes/
│       └── alto/
│           ├── email/
│           │   └── html/
│           │       └── email-otp.ftl    # OTP email template
│           └── login/
│               └── messages/
│                   └── messages_en.properties  # Error messages
│
└── tests/
    ├── integration/
    │   └── mfa-otp.test.ts       # E2E authentication flow tests
    └── fixtures/
        └── test-users.json       # Test user data
```

**Selected Structure:** Structure A (Standalone Module) - MFA is self-contained Keycloak configuration with no custom backend or frontend code, only Terraform and theme files.

## Testing Approach

- **Test Structure:** Integration tests verifying complete authentication flow
- **Coverage Strategy:**
  - Happy path: credentials → OTP sent → correct code → authenticated
  - Invalid OTP: verify error message and attempt counting
  - Expired OTP: verify expiration handling after 5 minutes
  - Lockout: verify lockout after 3 failed attempts
  - Resend: verify cooldown and new code delivery

Test files map to acceptance scenarios from spec.md:
| Scenario | Test File | Verification |
|----------|-----------|--------------|
| [P1] OTP sent within 10s | `mfa-otp.test.ts` | Email delivery timing |
| [P1] Correct code authenticates | `mfa-otp.test.ts` | Token received |
| [P2] Resend functionality | `mfa-otp.test.ts` | New code after cooldown |
| [P3] Lockout after 3 attempts | `mfa-otp.test.ts` | 403 response, timer |

## Implementation Notes

- **Email Template Customization:** Keycloak FreeMarker templates in `themes/alto/email/html/`. Must include `${code}` variable for OTP insertion. Template changes require Keycloak restart or theme cache clear.

- **Multi-Realm Application:** Terraform module applies to each property realm. Use `for_each` on realm list. SMTP settings can be shared via realm defaults or set per-realm.

- **Edge Cases:**
  - SMTP delivery failure: Keycloak shows generic error, logs detail. Mitigation: monitor SMTP logs, alert on failures.
  - Session timeout during OTP entry: User must restart authentication. No special handling needed.
  - Concurrent login attempts: Each attempt gets unique OTP. Only latest valid.

- **Scalability:** Google SMTP free tier supports ~500 emails/day. If client volume exceeds this:
  - Threshold: >400 MFA attempts/day per client
  - Mitigation: Upgrade to Google Workspace or SendGrid relay
