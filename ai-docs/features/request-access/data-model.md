# Data Model - Request Access

## Entities

### AccessRequest
Pending access request stored in PostgreSQL.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | primary key | Request identifier |
| companyName | string | required, max: 100 | Organization name |
| fullName | string | required, max: 100 | Requestor's full name |
| email | string | required, email format, unique | Contact email |
| phone | string | required, max: 20 | Contact phone |
| role | string | required, max: 50 | Job title/position |
| notes | string | optional, max: 500 | Additional information |
| status | RequestStatus | required, default: PENDING | Current status |
| createdAt | timestamp | required | Submission time |
| updatedAt | timestamp | required | Last modification |
| processedAt | timestamp | optional | Approval/rejection time |
| processedBy | string | optional | Operator user ID |
| assignedRealm | string | optional | Property realm on approval |
| rejectionReason | string | optional | Reason if rejected |

### RequestFormData
Client-side form state.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| companyName | string | required | Company/organization |
| fullName | string | required | Full name |
| email | string | required, email | Email address |
| phone | string | required | Phone number |
| role | string | required | Position/title |
| notes | string | optional | Additional notes |

## Enums

### RequestStatus
```
PENDING    - Awaiting operator review
APPROVED   - Approved, user created in Keycloak
REJECTED   - Rejected by operator
```

## States & Transitions

```
┌─────────┐
│ PENDING │
└────┬────┘
     │
  ┌──┴──┐
  │     │
approve reject
  │     │
  ▼     ▼
┌────────┐  ┌──────────┐
│APPROVED│  │ REJECTED │
└────────┘  └──────────┘
```

**Triggers:**
- `approve`: Operator approves with property assignment
- `reject`: Operator rejects with reason

**Side Effects:**
- On APPROVED: Create Keycloak user, send credentials email
- On REJECTED: Send rejection email with reason

## Constants

| Name | Value | Description | Source |
|------|-------|-------------|--------|
| COMPANY_NAME_MAX_LENGTH | 100 | Max company name chars | (FR-002) |
| FULL_NAME_MAX_LENGTH | 100 | Max full name chars | (UX-001) |
| PHONE_MAX_LENGTH | 20 | Max phone number chars | (UX-001) |
| ROLE_MAX_LENGTH | 50 | Max role/position chars | (UX-001) |
| NOTES_MAX_LENGTH | 500 | Max notes chars | (UX-001) |
| REJECTION_REASON_MIN_LENGTH | 10 | Min rejection reason | (UX-006) |
| QUEUE_REFRESH_INTERVAL_MS | 30000 | Queue auto-refresh | (ux.md) |

## Validation Rules

### Request Form
- companyName: required, 1-100 characters
- fullName: required, 1-100 characters
- email: required, valid email format, unique across all realms
- phone: required, 1-20 characters
- role: required, 1-50 characters
- notes: optional, max 500 characters

### Rejection
- rejectionReason: required, min 10 characters

### Email Uniqueness
- Check Keycloak Admin API across ALL realms before accepting request
- Also check existing pending requests in PostgreSQL
