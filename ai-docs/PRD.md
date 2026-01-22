# Alto IAM - Product Requirements Document

## Core Proposition

### Target User
- Alto's enterprise clients (hotel chains, commercial building operators)
- Organizations managing multiple properties with distributed staff
- IT administrators responsible for access control across sites

### Problem
- Clients need centralized management of operator/staff access across multiple properties
- Clear data separation required between different clients
  - Marriott administrators cannot see Hilton's users
  - Each client operates in complete isolation
- MFA enforcement required for security compliance
- Self-service user management needed without Alto admin involvement
- Must integrate with existing on-premise Alto CERO deployments

### Core Solution Proposition
- Multi-tenant identity management system built on Keycloak
- Each client gets a dedicated dashboard to manage users across their properties
- Keycloak handles authentication and MFA (Email OTP)
- Automatic sync capability to on-premise deployments (Phase 2)

## Solution Design

### Project Structure
```
alto-iam-sandbox/           # Existing on-premise system (unchanged)
└── cloud/                  # NEW: Cloud deployment subfolder
    ├── docker-compose.yml  # Keycloak + PostgreSQL + CRM
    ├── Caddyfile           # HTTPS configuration
    ├── terraform/          # Keycloak realm configuration
    ├── crm-dashboard/      # React admin dashboard
    └── keycloak/           # Theme customizations
```

### Core User Flows

**Flow A: Alto Operator (Super Admin)**
1. Alto operator logs into CRM dashboard (master realm)
2. Views all access requests across all clients
3. Approves/rejects requests, assigns user to specific property
4. Manages all realms and users

**Flow B: Client Admin**
1. Client admin logs into CRM dashboard
2. Dashboard displays only their properties (filtered by client prefix)
3. Admin selects a property to manage
4. Admin views, enables/disables users for that property
5. Users can then log into on-premise Alto CERO at that property with MFA

**Flow C: New User Access Request**
1. User visits public "Request Access" page
2. Fills form: company name, full name, email, phone, role/position
3. Submits request (stored in pending queue)
4. Alto operator receives notification
5. Operator reviews, approves, and assigns to property
6. User receives email with credentials and MFA setup instructions

### Core MVP Feature
- Multi-tenant property management with client isolation
- Realm-per-property architecture
  - Each property gets its own Keycloak realm (e.g., `marriott-hk`, `hilton-bangkok`)
  - Dashboard filters realms by client prefix
  - Complete data separation enforced at infrastructure level
- Access Request workflow (no self-registration)
  - Public form for requesting access
  - Alto operator approval queue
  - Property assignment during approval
- Discrete capabilities:
  - Alto operator authentication via Keycloak master realm
  - Client admin authentication via client-specific realm
  - Realm listing filtered by client prefix
  - User management per realm (view, enable/disable)
  - MFA enforcement on all user logins

### Supporting Features
- Email OTP MFA for all logins
  - Primary security feature
  - Must be reliable and fast
- Access Request Management
  - Public request form (company, name, email, phone, role)
  - Pending requests queue for Alto operator
  - Approve with property assignment
  - Reject with reason
  - Email notification on approval/rejection
- User enable/disable without deletion
  - Preserve audit trail
  - Quick access revocation
- Integration endpoint for on-premise sync (Phase 2)
  - Webhook-based user provisioning
  - Deferred to post-MVP

## Technical Requirements

### Tech Stack
- **Identity Provider**: Keycloak 24+
  - Already used in Alto stack
  - Proven multi-tenant capabilities
  - Built-in MFA support
- **CRM Dashboard**: React + Tailwind CSS
  - Fast development
  - Responsive design
  - Component reusability
- **Deployment**: Docker Compose
  - Single-command deployment
  - Easy VM provisioning
- **HTTPS**: Caddy
  - Automatic Let's Encrypt certificates
  - Zero-config TLS
- **Email**: Google SMTP (Gmail)
  - For MFA OTP delivery
  - App password authentication
  - Reliable and free
- **Database**: PostgreSQL 15
  - Keycloak persistence
  - Reliable and performant

### Technical Constraints
- Cloud code in `cloud/` subfolder (separate from on-premise system)
- Must integrate with existing on-premise Keycloak deployments at client sites
- All operations via Keycloak Admin REST API
- Access requests stored in PostgreSQL (separate from Keycloak)
- Cloud VM deployment (Azure)
- Single VM deployment for MVP (can scale later)

### Measurable Constraints
- Support 10+ clients with 20+ properties each (200+ realms)
- Sub-second API response times for dashboard operations
- 99.9% uptime for authentication services
- MFA email delivery under 10 seconds

## UX Details

### Platform Strategy
- Desktop-first admin dashboard
  - Primary use case is office-based administration
  - Responsive but optimized for 1280px+ screens

### Interface Requirements
- Clean professional design
- White background (#FFFFFF)
- Blue accent (#0ea5e9) for primary actions
- Green accent (#10b981) for success states
- Property cards showing:
  - Property name and realm ID
  - User count
  - Active/disabled status
- Access Request form (public page):
  - Required: company name, full name, email, phone, role/position
  - Optional: notes/reason for access
- Access Request queue (Alto operator view):
  - List pending requests with company, name, date
  - Approve modal: select property to assign
  - Reject modal: reason field
- Clear visual separation between clients in super-admin view
- All views must handle states:
  - Loading (spinner)
  - Empty (helpful message)
  - Error (actionable message)
  - Success (confirmation)

## Non-Goals (Out of Scope for MVP)

- Self-registration (all users must be approved by Alto operator)
- Client admins creating users directly (only Alto operator can approve/create)
- On-premise sync automation (Phase 2)
- Custom branding per client
- Advanced analytics/reporting
- Mobile app
- SSO integration with third-party IdPs
- Automated user provisioning from HR systems

## Success Metrics

- Deploy to VM in under 30 minutes
- Client admin can add first user within 5 minutes of onboarding
- MFA code delivered in under 10 seconds
- Zero cross-client data leakage

## Priority

1. **MFA** - Most important, must be reliable
2. **Fast VM deployment** - Single command, minimal configuration
3. **Access Request workflow** - Public form → Alto operator approval → user creation
4. **Client isolation** - Hard separation between clients
5. **User management** - View, enable/disable operations
