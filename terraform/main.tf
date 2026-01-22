# AICODE-NOTE: MFA Email OTP Terraform configuration - manages Keycloak provider and module instantiation
# See ai-docs/features/mfa-email-otp/plan.md for architecture

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    keycloak = {
      source  = "mrparkers/keycloak"
      version = "~> 4.0"
    }
  }
}

# Keycloak Provider Configuration
# Uses environment variables: KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET
provider "keycloak" {
  url       = var.keycloak_url
  realm     = "master"
  client_id = var.keycloak_admin_client_id
  username  = var.keycloak_admin_username
  password  = var.keycloak_admin_password
}

# ============================================================================
# Master Realm Configuration
# ============================================================================

# AICODE-NOTE: Master realm already exists, using data source instead
data "keycloak_realm" "master" {
  realm = "master"
}

# ============================================================================
# CRM Dashboard Client in Master Realm
# ============================================================================

resource "keycloak_openid_client" "alto_crm" {
  realm_id                     = data.keycloak_realm.master.id
  client_id                    = "alto-crm"
  name                         = "Alto CRM Dashboard"
  enabled                      = true
  access_type                  = "PUBLIC"
  standard_flow_enabled        = true
  implicit_flow_enabled        = false
  direct_access_grants_enabled = false

  valid_redirect_uris = [
    "http://localhost:3000/*",
    "https://localhost:3000/*",
    "${var.crm_dashboard_url}/*"
  ]

  web_origins = [
    "http://localhost:3000",
    "https://localhost:3000",
    var.crm_dashboard_url
  ]

  login_theme = "alto"
}

# ============================================================================
# MFA Email OTP Module instantiation for test realm
# ============================================================================

module "mfa_email_otp" {
  source = "./modules/mfa-email-otp"

  realm_id = var.target_realm_id

  # OTP Configuration - constants from data-model.md
  otp_length         = 6   # OTP_LENGTH
  otp_expiry_seconds = 300 # OTP_EXPIRY_SECONDS

  # Brute Force Protection - constants from data-model.md
  max_otp_attempts         = 3   # MAX_OTP_ATTEMPTS
  lockout_duration_seconds = 300 # LOCKOUT_DURATION_SECONDS

  # Resend Configuration - constants from data-model.md
  resend_cooldown_seconds = 60 # RESEND_COOLDOWN_SECONDS

  # SMTP Configuration - from environment
  smtp_host      = var.smtp_host
  smtp_port      = var.smtp_port
  smtp_user      = var.smtp_user
  smtp_password  = var.smtp_password
  smtp_from      = var.smtp_from
  smtp_from_name = var.smtp_from_name
  smtp_starttls  = var.smtp_starttls
}
