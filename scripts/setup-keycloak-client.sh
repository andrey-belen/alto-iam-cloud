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

# Update master realm to use alto theme
curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/master" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "loginTheme": "alto",
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false
  }'

echo ""
echo "Done! alto-crm client created and theme set."
echo ""
echo "You can now access:"
echo "  - CRM Dashboard: http://localhost:3000"
echo "  - Keycloak Admin: http://localhost:8080/admin"
