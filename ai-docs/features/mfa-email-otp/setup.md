# Setup - MFA Email OTP

## Prerequisites

- Keycloak 24+ running (via Docker Compose)
- Gmail account with App Password enabled
- Access to Keycloak Admin Console or Admin REST API

## Config

### 1. Gmail App Password

1. Go to Google Account → Security → 2-Step Verification
2. At bottom, select "App passwords"
3. Generate password for "Mail" on "Other (Custom name)" → "Alto Keycloak"
4. Save the 16-character password

### 2. Environment Variables

Add to `.env` or Docker Compose:

```bash
# SMTP Configuration
KC_SMTP_HOST=smtp.gmail.com
KC_SMTP_PORT=587
KC_SMTP_FROM=alto-noreply@yourcompany.com
KC_SMTP_USER=your-gmail@gmail.com
KC_SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App password
KC_SMTP_STARTTLS=true
KC_SMTP_AUTH=true
```

### 3. Keycloak Realm SMTP Settings

Via Admin Console for each realm:
1. Realm Settings → Email
2. Fill SMTP settings from environment
3. Test connection

### 4. Authentication Flow Configuration

Via Admin Console:
1. Authentication → Flows → Browser
2. Add execution: "OTP Form"
3. Set requirement: "Required"
4. Bind flow to realm

Or via Terraform (see `terraform/mfa.tf`).

## Run

```bash
# Start infrastructure with MFA enabled
cd cloud
docker compose up -d keycloak postgres

# Apply Terraform MFA configuration
cd cloud/terraform
terraform init
terraform apply -target=keycloak_authentication_flow.browser_with_otp
```

## Test

### Manual Verification
1. Create test user in realm with email
2. Attempt login with credentials
3. Verify OTP email received within 10 seconds
4. Enter OTP, verify successful authentication

### Automated Test Commands
```bash
# Test SMTP connectivity
docker exec keycloak /opt/keycloak/bin/kcadm.sh get realms/test-realm -F smtpServer

# Test OTP flow (requires test user setup)
cd cloud/tests
npm run test:mfa-otp
```

## Troubleshooting

**Email not arriving:**
- Check Keycloak logs: `docker logs keycloak | grep -i smtp`
- Verify App Password is correct (no spaces)
- Check spam folder

**OTP expired too quickly:**
- Verify `OTP_EXPIRY_SECONDS` in realm OTP policy

**Account locked:**
- Wait 5 minutes or reset via Admin Console → Users → [user] → Credentials
