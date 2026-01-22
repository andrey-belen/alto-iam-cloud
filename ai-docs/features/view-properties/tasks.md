# Tasks: View Properties

## Purpose
Implementation tasks for property dashboard with client-filtered realm display.

## Phase 1: Core Infrastructure

- [ ] INIT-001 Create properties service for Keycloak Admin API in cloud/crm-dashboard/src/services/properties.ts
- [ ] INIT-002 Add Keycloak Admin API types in cloud/crm-dashboard/src/types/keycloak.ts

## Phase 2: User Story 1 - Client Admin View (P1 - MVP)

### TDD Cycle 1: Properties Service
**Coverage:**
- Requirements: FR-001, FR-002
- Entities: Property from data-model.md

#### RED Phase
- [ ] TEST-001 [US1] Test getProperties returns realms filtered by client prefix in cloud/crm-dashboard/tests/services/properties.test.ts
- [ ] TEST-002 [US1] Test getProperties includes user count for each realm in cloud/crm-dashboard/tests/services/properties.test.ts

#### GREEN Phase
- [ ] IMPL-001 [US1] Implement getProperties with prefix filtering in cloud/crm-dashboard/src/services/properties.ts
- [ ] IMPL-002 [US1] Add user count fetch per realm in cloud/crm-dashboard/src/services/properties.ts

### TDD Cycle 2: Properties Page
**Coverage:**
- Requirements: UX-001, UX-002, UX-003
- Accessibility: Cards as role="article"

#### RED Phase
- [ ] TEST-003 [US1] Test PropertiesPage displays property cards in grid in cloud/crm-dashboard/tests/pages/PropertiesPage.test.tsx
- [ ] TEST-004 [US1] Test PropertyCard shows name, realm ID, user count, status in cloud/crm-dashboard/tests/components/PropertyCard.test.tsx
- [ ] TEST-005 [US1] Test PropertyCard click navigates to /properties/:realmId in cloud/crm-dashboard/tests/components/PropertyCard.test.tsx

#### GREEN Phase
- [ ] IMPL-003 [US1] Create PropertiesPage with responsive grid in cloud/crm-dashboard/src/pages/PropertiesPage.tsx
- [ ] IMPL-004 [US1] Create PropertyCard component in cloud/crm-dashboard/src/components/PropertyCard.tsx
- [ ] IMPL-005 [US1] Add /properties route in cloud/crm-dashboard/src/App.tsx

## Phase 3: User Story 2 - Super Admin View (P1 - MVP)

### TDD Cycle 1: Grouped Display
**Coverage:**
- Requirements: FR-005, UX-006

#### RED Phase
- [ ] TEST-006 [US2] Test super admin sees all realms (no prefix filter) in cloud/crm-dashboard/tests/pages/PropertiesPage.test.tsx
- [ ] TEST-007 [US2] Test realms grouped by client prefix for super admin in cloud/crm-dashboard/tests/pages/PropertiesPage.test.tsx

#### GREEN Phase
- [ ] IMPL-006 [US2] Add groupByClient logic to PropertiesPage in cloud/crm-dashboard/src/pages/PropertiesPage.tsx
- [ ] IMPL-007 [US2] Create ClientGroup component for visual separation in cloud/crm-dashboard/src/components/ClientGroup.tsx

## Phase 4: User Story 3 - Loading State (P2)

### TDD Cycle 1: Loading UI
**Coverage:**
- Requirements: UX-004

#### RED Phase
- [ ] TEST-008 [US3] Test loading state shows skeleton cards in cloud/crm-dashboard/tests/pages/PropertiesPage.test.tsx

#### GREEN Phase
- [ ] IMPL-008 [US3] Add skeleton loading state to PropertiesPage in cloud/crm-dashboard/src/pages/PropertiesPage.tsx

## Phase 5: User Story 4 - Empty State (P3)

### TDD Cycle 1: Empty Display
**Coverage:**
- Requirements: UX-005

#### RED Phase
- [ ] TEST-009 [US4] Test empty state shows helpful message in cloud/crm-dashboard/tests/pages/PropertiesPage.test.tsx

#### GREEN Phase
- [ ] IMPL-009 [US4] Add empty state to PropertiesPage in cloud/crm-dashboard/src/pages/PropertiesPage.tsx

## Execution Order

1. **Phase 1**: Core Infrastructure
2. **Phase 2**: US1 - Client Admin View (P1)
3. **Phase 3**: US2 - Super Admin View (P1)
4. **Phase 4**: US3 - Loading State (P2)
5. **Phase 5**: US4 - Empty State (P3)

## Notes

- Properties page is default landing after login
- Client prefix extracted from user's Keycloak attributes
- Super admin has no prefix, sees all realms grouped
