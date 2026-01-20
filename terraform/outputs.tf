# AICODE-NOTE: Terraform outputs for MFA Email OTP module

output "authentication_flow_id" {
  description = "ID of the browser-with-otp authentication flow"
  value       = module.mfa_email_otp.authentication_flow_id
}

output "realm_id" {
  description = "Realm ID where MFA is configured"
  value       = module.mfa_email_otp.realm_id
}

output "otp_policy_configured" {
  description = "Whether OTP policy was successfully configured"
  value       = module.mfa_email_otp.otp_policy_configured
}

output "smtp_configured" {
  description = "Whether SMTP settings were successfully configured"
  value       = module.mfa_email_otp.smtp_configured
}
