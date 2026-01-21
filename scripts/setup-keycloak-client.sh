#!/bin/bash
# Setup alto-crm client in master realm
# Run after Keycloak is up: ./scripts/setup-keycloak-client.sh

set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
ADMIN_USER="${KC_ADMIN_USER:-admin}"
ADMIN_PASS="${KC_ADMIN_PASSWORD:-admin}"

echo "Setting up alto-crm client in Keycloak..."

# Get admin token
echo "Getting admin token..."
TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${ADMIN_USER}" \
  -d "password=${ADMIN_PASS}" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get admin token. Is Keycloak running?"
  exit 1
fi

echo "Got token, creating client..."

# Create alto-crm client
curl -s -X POST "${KEYCLOAK_URL}/admin/realms/master/clients" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "alto-crm",
    "name": "Alto CRM Dashboard",
    "enabled": true,
    "publicClient": true,
    "standardFlowEnabled": true,
    "implicitFlowEnabled": false,
    "directAccessGrantsEnabled": false,
    "redirectUris": [
      "http://localhost:3000/*",
      "http://localhost:5173/*"
    ],
    "webOrigins": [
      "http://localhost:3000",
      "http://localhost:5173"
    ],
    "protocol": "openid-connect"
  }'

echo ""
echo "Setting master realm login theme to alto..."

# Update master realm to use alto theme and enable registration
curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/master" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "loginTheme": "alto",
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false,
    "registrationAllowed": true,
    "registrationEmailAsUsername": true,
    "resetPasswordAllowed": true,
    "rememberMe": true
  }'

# Get the alto-crm client ID
echo "Getting alto-crm client internal ID..."
CLIENT_ID=$(curl -s "${KEYCLOAK_URL}/admin/realms/master/clients?clientId=alto-crm" \
  -H "Authorization: Bearer ${TOKEN}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$CLIENT_ID" ]; then
  echo "Adding client_prefix mapper to alto-crm client..."

  # Add protocol mapper to include client_prefix in token
  curl -s -X POST "${KEYCLOAK_URL}/admin/realms/master/clients/${CLIENT_ID}/protocol-mappers/models" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "client_prefix",
      "protocol": "openid-connect",
      "protocolMapper": "oidc-usermodel-attribute-mapper",
      "consentRequired": false,
      "config": {
        "userinfo.token.claim": "true",
        "user.attribute": "client_prefix",
        "id.token.claim": "true",
        "access.token.claim": "true",
        "claim.name": "client_prefix",
        "jsonType.label": "String"
      }
    }' 2>/dev/null || echo "(mapper may already exist)"
fi

echo ""
echo "Done! alto-crm client created and configured."
echo ""
echo "You can now access:"
echo "  - CRM Dashboard: http://localhost:3000"
echo "  - Keycloak Admin: http://localhost:8080/admin"
echo ""
echo "Test users created:"
echo "  - alto-operator / operator123 (super admin - sees all realms)"
echo "  - marriott-admin / marriott123 (client admin - sees marriott-* only)"
