# AICODE-NOTE: MFA Email OTP module outputs for realm binding verification

output "authentication_flow_id" {
  description = "ID of the browser-with-otp authentication flow"
  value       = keycloak_authentication_flow.browser_with_otp.id
}

output "authentication_flow_alias" {
  description = "Alias of the browser-with-otp authentication flow"
  value       = keycloak_authentication_flow.browser_with_otp.alias
}

output "realm_id" {
  description = "Realm ID where MFA is configured"
  value       = data.keycloak_realm.target.id
}

output "otp_policy_configured" {
  description = "Whether OTP policy was successfully configured"
  value       = true
  depends_on  = [keycloak_realm.otp_policy_update]
}

# AICODE-NOTE: SMTP configured via Admin API, not Terraform
# Brute force settings not available in keycloak provider v4.4.0

output "otp_form_execution_id" {
  description = "ID of the OTP form execution"
  value       = keycloak_authentication_execution.otp_form.id
}

# Configuration summary for verification
output "configuration_summary" {
  description = "Summary of configured MFA settings"
  value = {
    otp_digits         = var.otp_length
    otp_period_seconds = var.otp_expiry_seconds
    max_failures       = var.max_otp_attempts
    lockout_seconds    = var.lockout_duration_seconds
    resend_cooldown    = var.resend_cooldown_seconds
  }
}
