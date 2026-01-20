# AICODE-NOTE: Root-level Terraform variables for MFA Email OTP infrastructure
# Environment variables should be set via .env or TF_VAR_ prefix

# Keycloak Connection
variable "keycloak_url" {
  description = "Keycloak server URL"
  type        = string
  default     = "http://localhost:8080"
}

variable "keycloak_admin_client_id" {
  description = "Keycloak admin client ID"
  type        = string
  default     = "admin-cli"
}

variable "keycloak_admin_username" {
  description = "Keycloak admin username"
  type        = string
  default     = "admin"
}

variable "keycloak_admin_password" {
  description = "Keycloak admin password"
  type        = string
  sensitive   = true
}

# Target Realm
variable "target_realm_id" {
  description = "Realm ID to apply MFA configuration"
  type        = string
  default     = "alto"
}

# CRM Dashboard
variable "crm_dashboard_url" {
  description = "CRM Dashboard URL for OAuth redirects"
  type        = string
  default     = "http://localhost:3000"
}

# SMTP Configuration (from setup.md)
variable "smtp_host" {
  description = "SMTP server hostname"
  type        = string
  default     = "smtp.gmail.com"
}

variable "smtp_port" {
  description = "SMTP server port"
  type        = number
  default     = 587
}

variable "smtp_user" {
  description = "SMTP authentication username"
  type        = string
}

variable "smtp_password" {
  description = "SMTP authentication password (Gmail App Password)"
  type        = string
  sensitive   = true
}

variable "smtp_from" {
  description = "From email address for OTP emails"
  type        = string
}

variable "smtp_from_name" {
  description = "From display name for OTP emails"
  type        = string
  default     = "Alto Security"
}

variable "smtp_starttls" {
  description = "Enable STARTTLS for SMTP"
  type        = bool
  default     = true
}
