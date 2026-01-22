# MFA Email OTP Contracts

## Overview

MFA is implemented via Keycloak's built-in authentication flows. No custom REST API endpoints are needed - all OTP handling occurs within Keycloak's authentication process.

## Keycloak Configuration Contract

### Authentication Flow Structure

```yaml
# browser-with-otp flow
flow_name: browser-with-otp
provider_id: basic-flow
executions:
  - authenticator: auth-cookie
    requirement: ALTERNATIVE
  - authenticator: auth-spnego
    requirement: DISABLED
  - sub_flow: forms
    requirement: ALTERNATIVE
    executions:
      - authenticator: auth-username-password-form
        requirement: REQUIRED
      - authenticator: auth-otp-form
        requirement: REQUIRED
```

### OTP Policy Configuration

```yaml
# Realm OTP Policy
otp_policy:
  type: totp  # Keycloak uses TOTP internally for email OTP
  algorithm: HmacSHA1
  digits: 6                    # OTP_LENGTH from data-model.md
  period: 300                  # OTP_EXPIRY_SECONDS from data-model.md
  look_ahead_window: 1
  initial_counter: 0
```

### Email Template Contract

```yaml
# OTP Email Template
template_id: email-otp
subject: "Your Alto verification code"
body_variables:
  - name: otp
    type: string              # OTPCode.code from data-model.md
    description: 6-digit verification code
  - name: expiration_minutes
    type: number
    description: Minutes until code expires (5)
  - name: user_name
    type: string
    description: User's display name or username
```

### SMTP Configuration Contract

```yaml
# Realm Email Settings
smtp_server:
  host: smtp.gmail.com
  port: 587
  from: string                # Display email address
  fromDisplayName: string     # Display name (e.g., "Alto Security")
  auth: true
  user: string                # Gmail address
  password: string            # App password (secret)
  starttls: true
  ssl: false
```

## Brute Force Protection Contract

```yaml
# Realm Brute Force Settings
brute_force_protected: true
max_failure_wait_seconds: 300      # LOCKOUT_DURATION_SECONDS from data-model.md
failure_reset_time_seconds: 300    # Reset counter after this period
max_delta_time_seconds: 43200      # 12 hours
quick_login_check_milli_seconds: 1000
minimum_quick_login_wait_seconds: 60
max_login_failures: 3              # MAX_OTP_ATTEMPTS from data-model.md
```

## Event Contracts

### OTP Events (Keycloak Event Types)

| Event Type | Trigger | Data |
|------------|---------|------|
| `SEND_VERIFY_EMAIL` | OTP email sent | userId, realmId, email |
| `LOGIN` | Successful OTP verification | userId, realmId, sessionId |
| `LOGIN_ERROR` | Failed OTP attempt | userId, realmId, error |
| `USER_DISABLED_BY_TEMPORARY_LOCKOUT` | Lockout triggered | userId, realmId |

### Event Listener Configuration

```yaml
# For audit logging
events_enabled: true
events_listeners:
  - jboss-logging
events_expiration: 604800  # 7 days
enabled_event_types:
  - LOGIN
  - LOGIN_ERROR
  - SEND_VERIFY_EMAIL
  - USER_DISABLED_BY_TEMPORARY_LOCKOUT
```
