# Research Notes - MFA Email OTP

## Key Decisions

- **OTP Implementation**: Keycloak built-in Email OTP Authenticator - No custom code needed, battle-tested, configurable via Admin API
- **Email Transport**: Google SMTP with app password - Free, reliable, meets 10-second delivery requirement (PRD)
- **Configuration Method**: Keycloak Admin REST API + Terraform - Declarative, reproducible across realms
- **Email Template**: Keycloak theme customization - Alto branding, HTML template in realm config
- **Frontend Approach**: Keycloak login theme handles OTP input - No React component needed for OTP entry itself
- **Lockout Strategy**: Keycloak brute force protection - Built-in, configurable attempts and duration

## Critical Risks

- **SMTP Delivery Latency**: Gmail rate limits may delay delivery → Use dedicated SMTP service if volume exceeds 500/day
- **Keycloak Theme Caching**: Template changes may not reflect immediately → Clear theme cache after updates
- **Session Invalidation**: OTP session state tied to browser → Document that clearing cookies requires restart

## Stack Compatibility

- Keycloak 24+ Email OTP Authenticator: ✔
- Google SMTP (smtp.gmail.com:587, STARTTLS): ✔
- Terraform Keycloak Provider 4.x: ✔
