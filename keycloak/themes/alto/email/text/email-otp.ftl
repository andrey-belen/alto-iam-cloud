<#-- AICODE-NOTE: Plain text OTP Email Template for Alto MFA
     Fallback for email clients that don't support HTML -->
Alto Verification Code

Hi<#if user.firstName??> ${user.firstName}</#if>,

You requested a verification code to sign in to your Alto account.

Your verification code is: ${code}

This code will expire in ${expiration} minutes.

SECURITY NOTICE: If you did not request this code, please ignore this email. Someone may have entered your email address by mistake.

If you're having trouble, contact our support team.

---
This is an automated message from Alto.
(c) ${.now?string('yyyy')} Alto. All rights reserved.
