#!/bin/bash

# AICODE-NOTE: Configure Keycloak SMTP settings via Admin API
# Usage: ./configure-smtp.sh
# Required environment variables: SMTP_USER, SMTP_PASSWORD

set -e

# Configuration (can be overridden via environment)
KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
KEYCLOAK_ADMIN="${KEYCLOAK_ADMIN:-admin}"
KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin}"
REALM="${REALM:-alto}"

# Gmail SMTP defaults
SMTP_HOST="${SMTP_HOST:-smtp.gmail.com}"
SMTP_PORT="${SMTP_PORT:-587}"
SMTP_FROM="${SMTP_FROM:-$SMTP_USER}"
SMTP_FROM_DISPLAY="${SMTP_FROM_DISPLAY:-Alto Security}"

# Validate required variables
if [ -z "$SMTP_USER" ] || [ -z "$SMTP_PASSWORD" ]; then
    echo "Error: SMTP_USER and SMTP_PASSWORD environment variables are required"
    echo ""
    echo "Usage:"
    echo "  SMTP_USER=your@gmail.com SMTP_PASSWORD=your-app-password ./configure-smtp.sh"
    exit 1
fi

echo "Configuring Keycloak SMTP for realm: $REALM"
echo "SMTP Host: $SMTP_HOST:$SMTP_PORT"
echo "From: $SMTP_FROM"
echo ""

# Get admin access token
echo "Getting admin access token..."
TOKEN_RESPONSE=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  -d "username=${KEYCLOAK_ADMIN}" \
  -d "password=${KEYCLOAK_ADMIN_PASSWORD}")

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "Error: Failed to get access token"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

echo "Got access token"

# Get current realm configuration
echo "Getting current realm configuration..."
REALM_CONFIG=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json")

# Update SMTP server settings
echo "Updating SMTP settings..."
SMTP_CONFIG=$(cat <<EOF
{
  "smtpServer": {
    "host": "${SMTP_HOST}",
    "port": "${SMTP_PORT}",
    "from": "${SMTP_FROM}",
    "fromDisplayName": "${SMTP_FROM_DISPLAY}",
    "starttls": "true",
    "auth": "true",
    "user": "${SMTP_USER}",
    "password": "${SMTP_PASSWORD}"
  }
}
EOF
)

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$SMTP_CONFIG")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
    echo ""
    echo "✅ SMTP configured successfully for realm: $REALM"
    echo ""
    echo "Configuration:"
    echo "  Host: $SMTP_HOST:$SMTP_PORT"
    echo "  User: $SMTP_USER"
    echo "  From: $SMTP_FROM ($SMTP_FROM_DISPLAY)"
    echo "  STARTTLS: enabled"
    echo ""
    echo "You can test by triggering a password reset email from:"
    echo "  ${KEYCLOAK_URL}/admin/master/console/#/${REALM}/users"
else
    echo "Error: Failed to update SMTP settings"
    echo "HTTP Code: $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi
