# Data Model - Manage Users

## Entities

### PropertyUser
Keycloak user within a property realm.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | required | Keycloak user ID |
| username | string | required | Login username |
| email | string | required | User email |
| firstName | string | optional | First name |
| lastName | string | optional | Last name |
| enabled | boolean | required | Account active status |
| createdTimestamp | number | required | Account creation time |
| lastLogin | timestamp | optional | Last authentication time |

### UsersState
UI state for users table.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| users | PropertyUser[] | required | Current page of users |
| total | number | required | Total user count |
| page | number | required | Current page (0-indexed) |
| pageSize | number | required | Users per page |
| search | string | optional | Search query |
| isLoading | boolean | required | Loading state |
| error | string | optional | Error message |

## Constants

| Name | Value | Description | Source |
|------|-------|-------------|--------|
| USERS_PER_PAGE | 20 | Pagination size | (ux.md) |
| SEARCH_DEBOUNCE_MS | 300 | Search input debounce | (ux.md) |
| MAX_USERS_BEFORE_PAGINATION | 100 | Threshold for pagination | (FR-002) |

## Validation Rules

### Search Query
- Minimum 1 character to trigger search
- Searches username and email fields
