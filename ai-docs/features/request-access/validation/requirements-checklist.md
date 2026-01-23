# Requirements Checklist: Request Access

**Source**: spec.md

## Completeness

- [ ] CHK001 Is the token generation algorithm specified (beyond crypto.randomBytes)? [Completeness, FR-004]
- [ ] CHK002 Is the token storage mechanism documented (database column, encryption)? [Completeness, FR-004]
- [ ] CHK003 Is the behavior when admin email delivery fails documented? [Completeness, FR-003]
- [ ] CHK004 Is the temporary password format/policy specified? [Completeness, FR-008]
- [ ] CHK005 Are MFA setup requirements documented for approved users? [Completeness, FR-008]
- [ ] CHK006 Is the Client Admin realm filtering logic specified? [Completeness, FR-014]

## Clarity

- [ ] CHK007 Is the 24-hour token expiry calculated from creation or last access? [Clarity, FR-004]
- [ ] CHK008 Is "selected realm" defined - who selects it and when? [Clarity, FR-007]
- [ ] CHK009 Are "site groups" defined distinctly from realm? [Clarity, FR-011]
- [ ] CHK010 Is "any realm" for Alto Admin approval explicitly all realms or a subset? [Clarity, FR-012]

## Consistency

- [ ] CHK011 Does FR-016 appear twice with different meanings (role preference vs audit)? [Consistency, spec.md]
- [x] CHK012 Do field names in Key Entities match data-model.md? [Resolution: CHK012 - Use spec.md fields: company, firstName, lastName, rolePreference]
- [ ] CHK013 Does rolePreference (operator/viewer) align with AssignableRole (client-admin/operator/viewer)? [Consistency, spec.md]

## Coverage

- [ ] CHK014 Are all scenario types covered: Primary (submit, approve), Alternate (reject), Exception (duplicate email, token expired), Recovery (retry)? [Coverage, spec.md]
- [x] CHK015 Is the magic link approval flow (FR-005) covered by TEST tasks in tasks.md? [Resolution: CHK015 - Added TEST-022 to TEST-025]
- [x] CHK016 Are Client Admin restrictions (FR-014, FR-015) covered by TEST tasks? [Resolution: CHK016 - Added TEST-026, TEST-027]
- [x] CHK017 Is realm/role/site assignment (FR-010, FR-011) covered by TEST tasks? [Resolution: CHK017 - Covered by TEST-022 to TEST-025]

## Edge Case

- [ ] CHK018 Is behavior defined when Keycloak is unavailable during approval? [Edge Case, FR-007]
- [ ] CHK019 Is behavior defined when user clicks magic link after already being processed? [Edge Case, FR-004]
- [ ] CHK020 Is behavior defined for concurrent approval attempts on same request? [Edge Case, FR-007]

## Cross-Artifact

- [ ] CHK021 Are all FR-XXX requirements covered by TEST tasks in tasks.md? [Coverage, spec.md → tasks.md]
- [ ] CHK022 Are all edge cases from spec.md covered by TEST tasks? [Coverage, spec.md → tasks.md]
- [ ] CHK023 Do API endpoints in plan.md match routes described in spec.md? [Consistency, spec.md → plan.md]
