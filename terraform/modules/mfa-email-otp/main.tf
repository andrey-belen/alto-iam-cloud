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
# AICODE-NOTE: SMTP is configured via Keycloak Admin API (configure-smtp.sh)
# The keycloak_realm_smtp_server resource is not supported in provider v4.4.0
# ============================================================================

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

# Execution 3: Email OTP (REQUIRED) - Uses user's registered email for OTP
# AICODE-NOTE: email-authenticator uses user's primary email automatically
# No credential setup needed - just send OTP to verified email
resource "keycloak_authentication_execution" "otp_form" {
  realm_id          = data.keycloak_realm.target.id
  parent_flow_alias = keycloak_authentication_subflow.forms.alias
  authenticator     = "email-authenticator"
  requirement       = "REQUIRED"

  depends_on = [keycloak_authentication_execution.username_password]
}

# Configure the email OTP authenticator settings
resource "keycloak_authentication_execution_config" "email_otp_config" {
  realm_id     = data.keycloak_realm.target.id
  execution_id = keycloak_authentication_execution.otp_form.id
  alias        = "email-otp-config"

  config = {
    # OTP Code Settings
    "length"         = tostring(var.otp_length)         # 6 digits
    "ttl"            = tostring(var.otp_expiry_seconds) # 300 seconds (5 min)
    # Use Keycloak SMTP (configured in realm)
    "emailProviderType" = "KEYCLOAK"
    # Real emails, not simulation
    "simulationMode" = "false"
  }

  depends_on = [keycloak_authentication_execution.otp_form]
}

# ============================================================================
# OTP Policy Configuration (FR-001, FR-003)
# OTP_LENGTH=6, OTP_EXPIRY_SECONDS=300 from data-model.md
# AICODE-NOTE: Simplified for keycloak provider v4.4.0 compatibility
# ============================================================================

resource "keycloak_realm" "otp_policy_update" {
  realm        = data.keycloak_realm.target.realm
  enabled      = true
  ssl_required = "external"

  # OTP Policy settings per contracts.md
  otp_policy {
    type              = "totp"
    algorithm         = "HmacSHA1"
    digits            = var.otp_length         # OTP_LENGTH (6)
    period            = var.otp_expiry_seconds # OTP_EXPIRY_SECONDS (300)
    look_ahead_window = 1
    initial_counter   = 0
  }

  # Use Alto theme for login
  login_theme = "alto"
  email_theme = "alto"

  # SMTP Configuration for email delivery
  smtp_server {
    host              = var.smtp_host
    port              = tostring(var.smtp_port)
    from              = var.smtp_from
    from_display_name = var.smtp_from_name
    starttls          = var.smtp_starttls
    ssl               = false

    auth {
      username = var.smtp_user
      password = var.smtp_password
    }
  }

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
    keycloak_authentication_execution_config.email_otp_config,
    keycloak_realm.otp_policy_update
  ]
}
