// AICODE-NOTE: MFA Email OTP constants from data-model.md
// Used for test assertions and validation

/**
 * Number of digits in OTP code
 * @see data-model.md OTP_LENGTH
 */
export const OTP_LENGTH = 6;

/**
 * OTP validity period in seconds (5 minutes)
 * @see data-model.md OTP_EXPIRY_SECONDS
 */
export const OTP_EXPIRY_SECONDS = 300;

/**
 * Maximum failed OTP attempts before lockout
 * @see data-model.md MAX_OTP_ATTEMPTS
 */
export const MAX_OTP_ATTEMPTS = 3;

/**
 * Lockout period after max failed attempts in seconds (5 minutes)
 * @see data-model.md LOCKOUT_DURATION_SECONDS
 */
export const LOCKOUT_DURATION_SECONDS = 300;

/**
 * Minimum wait time between OTP resends in seconds
 * @see data-model.md RESEND_COOLDOWN_SECONDS
 */
export const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Maximum acceptable email delivery time in seconds
 * @see data-model.md EMAIL_DELIVERY_TIMEOUT_SECONDS
 */
export const EMAIL_DELIVERY_TIMEOUT_SECONDS = 10;

/**
 * OTP code validation regex pattern
 * @see data-model.md OTPCode.code constraints
 */
export const OTP_PATTERN = /^\d{6}$/;

/**
 * MFA Session Status enum
 * @see data-model.md MFASessionStatus
 */
export const MFASessionStatus = {
  AWAITING_OTP: 'AWAITING_OTP',
  VALIDATING: 'VALIDATING',
  LOCKED_OUT: 'LOCKED_OUT',
  EXPIRED: 'EXPIRED',
  COMPLETED: 'COMPLETED',
} as const;

export type MFASessionStatusType = typeof MFASessionStatus[keyof typeof MFASessionStatus];

/**
 * OTP Delivery Status enum
 * @see data-model.md OTPDeliveryStatus
 */
export const OTPDeliveryStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
} as const;

export type OTPDeliveryStatusType = typeof OTPDeliveryStatus[keyof typeof OTPDeliveryStatus];

/**
 * Keycloak event types for MFA
 * @see contracts/contracts.md Event Contracts
 */
export const KeycloakEvents = {
  SEND_VERIFY_EMAIL: 'SEND_VERIFY_EMAIL',
  LOGIN: 'LOGIN',
  LOGIN_ERROR: 'LOGIN_ERROR',
  USER_DISABLED_BY_TEMPORARY_LOCKOUT: 'USER_DISABLED_BY_TEMPORARY_LOCKOUT',
} as const;
