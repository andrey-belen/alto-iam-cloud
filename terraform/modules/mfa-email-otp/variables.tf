# AICODE-NOTE: MFA Email OTP module variables
# Constants from data-model.md with their specified values as defaults

# ============================================================================
# Realm Configuration
# ============================================================================

variable "realm_id" {
  description = "Keycloak realm ID to configure MFA"
  type        = string
}

# ============================================================================
# OTP Policy Constants (from data-model.md)
# ============================================================================

variable "otp_length" {
  description = "Number of digits in OTP code (OTP_LENGTH from data-model.md)"
  type        = number
  default     = 6

  validation {
    condition     = var.otp_length >= 6 && var.otp_length <= 8
    error_message = "OTP length must be between 6 and 8 digits."
  }
}

variable "otp_expiry_seconds" {
  description = "OTP validity period in seconds (OTP_EXPIRY_SECONDS from data-model.md)"
  type        = number
  default     = 300 # 5 minutes

  validation {
    condition     = var.otp_expiry_seconds >= 60 && var.otp_expiry_seconds <= 600
    error_message = "OTP expiry must be between 60 and 600 seconds."
  }
}

# ============================================================================
# Brute Force Protection Constants (from data-model.md)
# ============================================================================

variable "max_otp_attempts" {
  description = "Maximum failed OTP attempts before lockout (MAX_OTP_ATTEMPTS from data-model.md)"
  type        = number
  default     = 3

  validation {
    condition     = var.max_otp_attempts >= 1 && var.max_otp_attempts <= 10
    error_message = "Max OTP attempts must be between 1 and 10."
  }
}

variable "lockout_duration_seconds" {
  description = "Lockout period after max failed attempts (LOCKOUT_DURATION_SECONDS from data-model.md)"
  type        = number
  default     = 300 # 5 minutes

  validation {
    condition     = var.lockout_duration_seconds >= 60 && var.lockout_duration_seconds <= 3600
    error_message = "Lockout duration must be between 60 and 3600 seconds."
  }
}

# ============================================================================
# Resend Configuration (from data-model.md)
# ============================================================================

variable "resend_cooldown_seconds" {
  description = "Minimum wait time between OTP resends (RESEND_COOLDOWN_SECONDS from data-model.md)"
  type        = number
  default     = 60

  validation {
    condition     = var.resend_cooldown_seconds >= 30 && var.resend_cooldown_seconds <= 300
    error_message = "Resend cooldown must be between 30 and 300 seconds."
  }
}

# ============================================================================
# SMTP Configuration (from setup.md)
# ============================================================================

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
  description = "SMTP authentication password"
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

# ============================================================================
# Email Delivery Timeout (from data-model.md)
# ============================================================================

variable "email_delivery_timeout_seconds" {
  description = "Maximum acceptable email delivery time (EMAIL_DELIVERY_TIMEOUT_SECONDS from data-model.md)"
  type        = number
  default     = 10

  validation {
    condition     = var.email_delivery_timeout_seconds >= 5 && var.email_delivery_timeout_seconds <= 30
    error_message = "Email delivery timeout must be between 5 and 30 seconds."
  }
}
