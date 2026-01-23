#!/bin/bash
# Setup and verify Keycloak configuration for Alto CERO IAM
# Realm = Client architecture: each client gets its own realm
#
# Run after Keycloak is up: ./scripts/setup-keycloak.sh

set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
ADMIN_USER="${KC_ADMIN_USER:-admin}"
ADMIN_PASS="${KC_ADMIN_PASSWORD:-admin}"

echo "=============================================="
echo "Alto CERO IAM - Keycloak Setup"
echo "Realm = Client Architecture"
echo "=============================================="
echo ""

# Wait for Keycloak to be ready
echo "Waiting for Keycloak to be ready..."
for i in {1..30}; do
  if curl -s "${KEYCLOAK_URL}/health/ready" > /dev/null 2>&1; then
    echo "Keycloak is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "Keycloak not ready after 30 seconds. Is it running?"
    exit 1
  fi
  sleep 1
done

# Get admin token
echo ""
echo "Getting admin token..."
TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${ADMIN_USER}" \
  -d "password=${ADMIN_PASS}" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get admin token."
  echo "Check KEYCLOAK_URL, KC_ADMIN_USER, and KC_ADMIN_PASSWORD"
  exit 1
fi
echo "Got admin token."

# ============================================================================
# Verify alto realm exists
# ============================================================================
echo ""
echo "Verifying alto realm..."
REALM_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
  "${KEYCLOAK_URL}/admin/realms/alto" \
  -H "Authorization: Bearer ${TOKEN}")

if [ "$REALM_EXISTS" != "200" ]; then
  echo "  Alto realm not found, will be created from realm import"
fi

# ============================================================================
# Verify roles in alto realm
# ============================================================================
echo ""
echo "Verifying alto realm roles..."
ROLES=$(curl -s "${KEYCLOAK_URL}/admin/realms/alto/roles" \
  -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || echo "[]")

if echo "$ROLES" | grep -q '"name":"alto-admin"'; then
  echo "  Role 'alto-admin' exists in alto realm."
else
  echo "  WARNING: Role 'alto-admin' not found in alto realm!"
fi

# ============================================================================
# Verify client realms
# ============================================================================
echo ""
echo "Verifying client realms..."

for CLIENT_REALM in "marriott" "hilton"; do
  REALM_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
    "${KEYCLOAK_URL}/admin/realms/${CLIENT_REALM}" \
    -H "Authorization: Bearer ${TOKEN}")

  if [ "$REALM_EXISTS" == "200" ]; then
    echo "  ${CLIENT_REALM} realm exists."

    # Check roles in client realm
    ROLES=$(curl -s "${KEYCLOAK_URL}/admin/realms/${CLIENT_REALM}/roles" \
      -H "Authorization: Bearer ${TOKEN}")

    for ROLE in "client-admin" "operator" "viewer"; do
      if echo "$ROLES" | grep -q "\"name\":\"$ROLE\""; then
        echo "    Role '$ROLE' exists."
      else
        echo "    WARNING: Role '$ROLE' not found!"
      fi
    done

    # Check site groups
    GROUPS=$(curl -s "${KEYCLOAK_URL}/admin/realms/${CLIENT_REALM}/groups" \
      -H "Authorization: Bearer ${TOKEN}")

    if echo "$GROUPS" | grep -q '"name":"sites"'; then
      echo "    /sites group exists."
    else
      echo "    WARNING: /sites group not found!"
    fi
  else
    echo "  WARNING: ${CLIENT_REALM} realm not found!"
  fi
done

# ============================================================================
# Verify test users
# ============================================================================
echo ""
echo "Verifying test users..."

# Alto admin user
USER_DATA=$(curl -s "${KEYCLOAK_URL}/admin/realms/alto/users?username=operator@alto.cloud" \
  -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || echo "[]")

if echo "$USER_DATA" | grep -q '"username":"operator@alto.cloud"'; then
  echo "  User 'operator@alto.cloud' exists in alto realm."
else
  echo "  WARNING: User 'operator@alto.cloud' not found in alto realm!"
fi

# Marriott admin user
USER_DATA=$(curl -s "${KEYCLOAK_URL}/admin/realms/marriott/users?username=admin@marriott.com" \
  -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || echo "[]")

if echo "$USER_DATA" | grep -q '"username":"admin@marriott.com"'; then
  echo "  User 'admin@marriott.com' exists in marriott realm."
else
  echo "  WARNING: User 'admin@marriott.com' not found in marriott realm!"
fi

# Marriott staff user
USER_DATA=$(curl -s "${KEYCLOAK_URL}/admin/realms/marriott/users?username=staff@marriott.com" \
  -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || echo "[]")

if echo "$USER_DATA" | grep -q '"username":"staff@marriott.com"'; then
  echo "  User 'staff@marriott.com' exists in marriott realm."
else
  echo "  WARNING: User 'staff@marriott.com' not found in marriott realm!"
fi

# ============================================================================
# Test token generation
# ============================================================================
echo ""
echo "Testing token generation for operator@alto.cloud (alto realm)..."
TEST_TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/alto/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=operator@alto.cloud" \
  -d "password=operator123" \
  -d "grant_type=password" \
  -d "client_id=alto-cero-iam" 2>/dev/null)

if echo "$TEST_TOKEN" | grep -q '"access_token"'; then
  echo "  Token generation successful!"

  # Decode and check token
  ACCESS_TOKEN=$(echo "$TEST_TOKEN" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  PAYLOAD_B64=$(echo "$ACCESS_TOKEN" | cut -d'.' -f2 | tr '_-' '/+')
  case $((${#PAYLOAD_B64} % 4)) in
    2) PAYLOAD_B64="${PAYLOAD_B64}==" ;;
    3) PAYLOAD_B64="${PAYLOAD_B64}=" ;;
  esac
  PAYLOAD=$(echo "$PAYLOAD_B64" | base64 -d 2>/dev/null || echo "")

  if echo "$PAYLOAD" | grep -q '"alto-admin"'; then
    echo "  Token contains 'alto-admin' role."
  fi

  if echo "$PAYLOAD" | grep -q '/realms/alto'; then
    echo "  Token issuer is alto realm."
  fi
else
  echo "  WARNING: Token generation failed!"
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "=============================================="
echo "Setup Verification Complete"
echo "=============================================="
echo ""
echo "Keycloak Structure (Realm = Client):"
echo "  alto realm        → alto-admin role"
echo "  marriott realm    → client-admin, operator, viewer roles"
echo "                      /sites/site-hk, /sites/site-sg, /sites/site-tokyo"
echo "  hilton realm      → client-admin, operator, viewer roles"
echo "                      /sites/site-bangkok, /sites/site-sydney"
echo ""
echo "Test Users:"
echo "  alto realm:"
echo "    operator@alto.cloud / operator123  (alto-admin)"
echo "  marriott realm:"
echo "    admin@marriott.com / marriott123   (client-admin)"
echo "    staff@marriott.com / staff123      (operator, /sites/site-hk)"
echo ""
echo "Access:"
echo "  Dashboard: http://localhost:3000"
echo "  Keycloak Admin: http://localhost:8080/admin (admin/admin)"
echo "  MailHog: http://localhost:8025"
echo ""
