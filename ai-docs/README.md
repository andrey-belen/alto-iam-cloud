# Alto Cloud IAM - Implementation Status

## Current State: MVP Development

### Deployed Infrastructure
- Keycloak 24 running on Docker (localhost:8080)
- PostgreSQL 15 for persistence
- CRM Dashboard (React + Vite) on localhost:3000
- MailHog for email testing (localhost:8025)

### Authentication Architecture

**IMPLEMENTED CHANGE FROM SPEC:**
- Original spec: Separate login page in React
- Actual implementation: Direct redirect to Keycloak themed login
  - No React `/login` route (redirects to `/`)
  - ProtectedRoute redirects unauthenticated users directly to Keycloak
  - Custom Alto theme applied to Keycloak login page

**User Types:**
| User | Credentials | client_prefix | Access |
|------|-------------|---------------|--------|
| alto-operator | operator123 | `*` | All realms (super admin) |
| marriott-admin | marriott123 | `marriott` | marriott-* realms only |

**Keycloak Admin:**
- admin / admin - Keycloak admin console only (not for CRM)

### Test Realms Created
- `master` - Keycloak admin realm
- `alto` - Alto internal realm
- `marriott-hk` - Marriott Hong Kong
- `marriott-sg` - Marriott Singapore
- `marriott-tokyo` - Marriott Tokyo
- `hilton-bangkok` - Hilton Bangkok
- `hilton-sydney` - Hilton Sydney

### Theme Customization

**Cloud theme (violet/purple)** - distinct from on-premise (cyan/teal):
- Location: `cloud/keycloak/themes/alto/`
- Color scheme: Violet (#8b5cf6) / Purple (#a855f7)
- Features: "Alto Cloud IAM" branding, cloud icon

**On-premise theme (cyan/teal)**:
- Location: `keycloak/themes/alto-cero/`
- Color scheme: Cyan (#06b6d4) / Teal (#14b8a6)
- Features: "Alto CERO Platform" branding

### Code Locations

```
cloud/
├── crm-dashboard/src/
│   ├── components/ProtectedRoute.tsx   # Auth guard, redirects to Keycloak
│   ├── contexts/AuthContext.tsx        # Auth state management
│   ├── services/keycloak.ts            # Keycloak OIDC integration
│   ├── types/index.ts                  # AuthUser with clientPrefix
│   └── App.tsx                         # Routes (no /login page)
├── keycloak/themes/alto/               # Custom login theme
├── scripts/setup-keycloak-client.sh    # Client + mapper setup
└── docker-compose.yml                  # All services
```

### Key Implementation Details

**client_prefix attribute:**
- Stored as Keycloak user attribute
- Mapped to access token via protocol mapper
- Values: `*` (super admin), `marriott`, `hilton`, etc.
- Used by CRM to filter visible realms

**Authentication Flow:**
1. User visits localhost:3000
2. ProtectedRoute checks auth via keycloak-js
3. If not authenticated, redirects to Keycloak login
4. User logs in (with custom Alto theme)
5. Keycloak redirects back to CRM with auth code
6. keycloak-js exchanges code for tokens
7. AuthContext extracts user info + client_prefix
8. CRM filters realms based on client_prefix

### Pending Features
- [ ] Realm filtering in PropertiesPage based on clientPrefix
- [ ] Access Request form and approval queue
- [ ] User management per realm
- [ ] MFA Email OTP configuration

### Quick Start
```bash
cd cloud
docker compose up -d
./scripts/setup-keycloak-client.sh

# Access:
# - CRM: http://localhost:3000 (login: alto-operator / operator123)
# - Keycloak Admin: http://localhost:8080/admin (login: admin / admin)
# - MailHog: http://localhost:8025
```
