# Data Model - View Properties

## Entities

### Property
Keycloak realm representing a property.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| realmId | string | required | Keycloak realm name |
| displayName | string | required | Human-readable name |
| enabled | boolean | required | Active/disabled status |
| userCount | number | required | Number of users in realm |
| clientPrefix | string | derived | Extracted from realm name |

### PropertiesState
UI state for properties page.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| properties | Property[] | required | List of properties |
| isLoading | boolean | required | Loading state |
| error | string | optional | Error message |
| groupedByClient | Map | optional | For super admin view |

## Enums

### PropertyStatus
```
ACTIVE   - Realm enabled
DISABLED - Realm disabled
```

## Constants

| Name | Value | Description | Source |
|------|-------|-------------|--------|
| CARDS_PER_ROW_DESKTOP | 3 | Grid columns on 1280px+ | (ux.md) |
| CARDS_PER_ROW_TABLET | 2 | Grid columns on 768-1279px | (ux.md) |
| CARDS_PER_ROW_MOBILE | 1 | Grid columns on <768px | (ux.md) |
| REALM_PREFIX_SEPARATOR | "-" | Separator in realm name | (PRD) |

## Validation Rules

### Client Prefix Extraction
- Split realm name by "-"
- First segment is client prefix
- Example: "marriott-hk" → prefix "marriott"
