# AICODE-NOTE: MFA Email OTP Keycloak configuration module
# Implements authentication flow with OTP per contracts/contracts.md
# Uses constants from data-model.md: OTP_LENGTH, OTP_EXPIRY_SECONDS, MAX_OTP_ATTEMPTS, LOCKOUT_DURATION_SECONDS

terraform {
  required_providers {
    keycloak = {
      source  = "mrparkers/keycloak"
      version = "~> 4.0"
    }
  }
}

# Data source to reference existing realm
data "keycloak_realm" "target" {
  realm = var.realm_id
}

# ============================================================================
# SMTP Configuration (FR-002: OTP email delivery)
# ============================================================================

resource "keycloak_realm_smtp_server" "alto_smtp" {
  realm_id = data.keycloak_realm.target.id

  host              = var.smtp_host
  port              = tostring(var.smtp_port)
  from              = var.smtp_from
  from_display_name = var.smtp_from_name
  starttls          = var.smtp_starttls
  auth {
    username = var.smtp_user
    password = var.smtp_password
  }
}

# ============================================================================
# Authentication Flow: browser-with-otp (FR-001, FR-006)
# Flow structure per contracts/contracts.md
# ============================================================================

resource "keycloak_authentication_flow" "browser_with_otp" {
  realm_id    = data.keycloak_realm.target.id
  alias       = "browser-with-otp"
  description = "Browser flow with email OTP as second factor"
  provider_id = "basic-flow"
}

# Execution 1: Cookie authentication (ALTERNATIVE)
resource "keycloak_authentication_execution" "cookie" {
  realm_id          = data.keycloak_realm.target.id
  parent_flow_alias = keycloak_authentication_flow.browser_with_otp.alias
  authenticator     = "auth-cookie"
  requirement       = "ALTERNATIVE"

  depends_on = [keycloak_authentication_flow.browser_with_otp]
}

# Sub-flow: Forms (ALTERNATIVE)
resource "keycloak_authentication_subflow" "forms" {
  realm_id          = data.keycloak_realm.target.id
  parent_flow_alias = keycloak_authentication_flow.browser_with_otp.alias
  alias             = "browser-with-otp-forms"
  description       = "Username/password and OTP verification"
  provider_id       = "basic-flow"
  requirement       = "ALTERNATIVE"

  depends_on = [keycloak_authentication_execution.cookie]
}

# Execution 2: Username/Password form (REQUIRED)
resource "keycloak_authentication_execution" "username_password" {
  realm_id          = data.keycloak_realm.target.id
  parent_flow_alias = keycloak_authentication_subflow.forms.alias
  authenticator     = "auth-username-password-form"
  requirement       = "REQUIRED"

  depends_on = [keycloak_authentication_subflow.forms]
}

# Execution 3: OTP form (REQUIRED) - Core MFA step
resource "keycloak_authentication_execution" "otp_form" {
  realm_id          = data.keycloak_realm.target.id
  parent_flow_alias = keycloak_authentication_subflow.forms.alias
  authenticator     = "auth-otp-form"
  requirement       = "REQUIRED"

  depends_on = [keycloak_authentication_execution.username_password]
}

# ============================================================================
# OTP Policy Configuration (FR-001, FR-003)
# OTP_LENGTH=6, OTP_EXPIRY_SECONDS=300 from data-model.md
# ============================================================================

resource "keycloak_realm" "otp_policy_update" {
  realm   = data.keycloak_realm.target.realm
  enabled = true

  # OTP Policy settings per contracts.md
  otp_policy {
    type              = "totp"
    algorithm         = "HmacSHA1"
    digits            = var.otp_length         # OTP_LENGTH (6)
    period            = var.otp_expiry_seconds # OTP_EXPIRY_SECONDS (300)
    look_ahead_window = 1
    initial_counter   = 0
  }

  # SMTP settings are configured separately via keycloak_realm_smtp_server

  # Brute Force Protection (FR-004)
  # MAX_OTP_ATTEMPTS=3, LOCKOUT_DURATION_SECONDS=300 from data-model.md
  brute_force_protected            = true
  max_failure_wait_seconds         = var.lockout_duration_seconds # LOCKOUT_DURATION_SECONDS
  failure_reset_time_seconds       = var.lockout_duration_seconds
  max_delta_time_seconds           = 43200 # 12 hours
  quick_login_check_milli_seconds  = 1000
  minimum_quick_login_wait_seconds = 60
  max_login_failures               = var.max_otp_attempts # MAX_OTP_ATTEMPTS

  # Event Logging per contracts.md Event Listener Configuration
  events_enabled    = true
  events_expiration = 604800 # 7 days
  events_listeners  = ["jboss-logging"]
  enabled_event_types = [
    "LOGIN",
    "LOGIN_ERROR",
    "SEND_VERIFY_EMAIL",
    "USER_DISABLED_BY_TEMPORARY_LOCKOUT"
  ]

  # Use Alto theme for login
  login_theme = "alto"
  email_theme = "alto"

  lifecycle {
    ignore_changes = [
      # Preserve existing realm settings not managed by this module
      display_name,
      registration_allowed,
      registration_email_as_username,
      reset_password_allowed,
      verify_email,
    ]
  }
}

# ============================================================================
# Bind browser-with-otp flow to realm browser flow binding
# ============================================================================

resource "keycloak_authentication_bindings" "browser_binding" {
  realm_id     = data.keycloak_realm.target.id
  browser_flow = keycloak_authentication_flow.browser_with_otp.alias

  depends_on = [
    keycloak_authentication_execution.otp_form,
    keycloak_realm.otp_policy_update
  ]
}
