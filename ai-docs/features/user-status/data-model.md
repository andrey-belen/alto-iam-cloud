# Data Model - User Status

## Entities

### UserSession
Active authentication session for a user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | required | Session ID |
| userId | string | required | User ID |
| ipAddress | string | optional | Client IP |
| started | timestamp | required | Session start time |
| lastAccess | timestamp | required | Last activity |

### StatusToggleState
UI state for status toggle.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| isToggling | boolean | required | Operation in progress |
| showConfirm | boolean | required | Confirmation modal visible |
| sessionCount | number | optional | Active sessions count |

## Enums

### UserStatus
```
ENABLED  - User can authenticate
DISABLED - User cannot authenticate
```

## States & Transitions

```
┌─────────┐
│ ENABLED │
└────┬────┘
     │ disable
     ▼
┌──────────┐
│ DISABLED │
└────┬─────┘
     │ enable
     ▼
┌─────────┐
│ ENABLED │
└─────────┘
```

**Side Effects:**
- On disable: Terminate all active sessions immediately

## Constants

| Name | Value | Description | Source |
|------|-------|-------------|--------|
| DISABLED_ROW_OPACITY | 0.6 | Visual indicator for disabled | (ux.md) |

## Validation Rules

### Self-Disable Prevention
- If user.id === currentUser.id → block action with error message
