# Implementation Plan: Request Access

## Purpose
Implement public access request form and operator approval workflow.

## Summary
Public form stores requests in PostgreSQL. Alto operators review queue, approve with property assignment (creates Keycloak user), or reject with reason. Email notifications on both outcomes.

## Technical Context

**Language:** TypeScript

**Framework:** React + Express.js API

**Storage:** PostgreSQL for requests, Keycloak for approved users

**API Layer:** Express REST API for requests, Keycloak Admin API for user creation

**Testing:** Vitest for frontend, Vitest for API

**Deployment:** Docker containers (api + crm-dashboard)

**Constraints:**
- Requests stored separately from Keycloak
- Email uniqueness checked across all realms before storing

## Implementation Mapping

### Component Architecture

- **Core Components:**
  - `RequestAccessPage` - Public form (no auth required)
  - `AccessQueuePage` - Operator view of pending requests
  - `ApproveModal` - Property selection for approval
  - `RejectModal` - Reason input for rejection

- **API Endpoints:**
  - `POST /api/access-requests` - Submit new request
  - `GET /api/access-requests` - List pending (operator only)
  - `POST /api/access-requests/:id/approve` - Approve with property
  - `POST /api/access-requests/:id/reject` - Reject with reason

- **Data Models:**
  - AccessRequest entity in PostgreSQL
  - See `data-model.md` for specifications

### Error Handling Approach

- **Error handlers location:** Express middleware + React error boundaries
- **Recovery mechanisms:** Retry for network failures, validation feedback
- **User feedback:** Toast notifications for operators, inline errors for public form

## Feature Code Organization

```
cloud/
├── api/
│   ├── src/
│   │   ├── routes/
│   │   │   └── access-requests.ts
│   │   ├── services/
│   │   │   ├── access-request.service.ts
│   │   │   ├── keycloak-admin.service.ts
│   │   │   └── email.service.ts
│   │   ├── models/
│   │   │   └── access-request.model.ts
│   │   └── index.ts
│   └── tests/
│       └── access-requests.test.ts
│
└── crm-dashboard/
    └── src/
        ├── pages/
        │   ├── RequestAccessPage.tsx
        │   └── AccessQueuePage.tsx
        ├── components/
        │   ├── ApproveModal.tsx
        │   └── RejectModal.tsx
        └── services/
            └── access-requests.ts
```

**Selected Structure:** Structure B (Split Architecture) - Express API handles requests storage and Keycloak integration, React frontend for forms and queue.

## Testing Approach

- **Test Structure:** API integration tests, React component tests
- **Coverage Strategy:**
  - Form submission: validation, success, duplicate email
  - Queue display: loading, empty, with requests
  - Approve flow: property selection, user creation, email sent
  - Reject flow: reason required, email sent
