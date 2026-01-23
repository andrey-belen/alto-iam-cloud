# Resolutions: Request Access

## Summary

| Metric | Count |
|--------|-------|
| Total resolved | 4 |
| Gaps filled | 3 |
| Conflicts resolved | 1 |
| Ambiguities clarified | 0 |
| Assumptions confirmed | 0 |
| New tasks created | 8 |
| Existing tasks updated | 0 |
| Deferred to future | 0 |

## Decisions

### CHK012/CHK070: Field Names Conflict

- **Source**: requirements-checklist.md, data-checklist.md
- **Type**: Conflict
- **Original**: Do field names in Key Entities match data-model.md (company vs companyName, firstName/lastName vs fullName)?
- **Options**: a) Use spec.md fields / b) Use data-model.md fields / c) Defer
- **Decision**: Use spec.md fields
- **Rationale**: spec.md aligns with current Prisma schema implementation (company, firstName, lastName, rolePreference)
- **Task Impact**: UPDATE: data-model.md documentation (out of scope for tasks.md)

### CHK015/CHK045: Magic Link Approval Flow

- **Source**: requirements-checklist.md, api-checklist.md
- **Type**: Gap
- **Original**: Is the magic link approval flow (FR-005) covered by TEST tasks in tasks.md?
- **Options**: a) Add TEST tasks for magic link / b) Defer to post-MVP
- **Decision**: Add TEST tasks
- **Rationale**: Magic link approval is P1 requirement per spec.md, currently implemented but untested
- **Task Impact**: NEW: TEST-022 to TEST-025, IMPL-021 to IMPL-022 [US2] → Phase 3

### CHK016/CHK017: Client Admin Restrictions and Site Assignment

- **Source**: requirements-checklist.md
- **Type**: Gap
- **Original**: Are Client Admin restrictions (FR-014, FR-015) and realm/role/site assignment covered by TEST tasks?
- **Options**: a) Add TEST tasks / b) Defer to post-MVP
- **Decision**: Add TEST tasks
- **Rationale**: Permission enforcement is security-critical, must be tested
- **Task Impact**: NEW: TEST-026 to TEST-027, IMPL-023 to IMPL-024 [US4] → Phase 3

### CHK063-CHK066: Missing Data Model Fields

- **Source**: data-checklist.md
- **Type**: Gap
- **Original**: Is approvalToken, tokenExpiresAt, rolePreference, assignedSiteIds documented in data-model.md?
- **Options**: a) Update data-model.md / b) Already in Prisma
- **Decision**: Update data-model.md
- **Rationale**: Documentation should match implementation for maintainability
- **Task Impact**: UPDATE: data-model.md documentation (out of scope for tasks.md - doc only)

---

## Tasks Cross-Reference

### New Tasks
| CHK | Tasks | Story | Description |
|-----|-------|-------|-------------|
| CHK015/CHK045 | TEST-022, TEST-023, TEST-024, TEST-025, IMPL-021, IMPL-022 | US2 | Magic link token validation, expiry, public approval endpoints |
| CHK016/CHK017 | TEST-026, TEST-027, IMPL-023, IMPL-024 | US4 | Client Admin filtering, role restrictions |

### Updated Tasks
| CHK | Task | Change |
|-----|------|--------|
| (none) | - | - |

### Deferred
| CHK | Reason |
|-----|--------|
| (none) | - |
