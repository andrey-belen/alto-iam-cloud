# Data Checklist: Request Access

**Source**: data-model.md

## Completeness

- [x] CHK063 Is the approvalToken field documented in AccessRequest entity? [Resolution: CHK063 - Update data-model.md]
- [x] CHK064 Is tokenExpiresAt field documented for token expiry tracking? [Resolution: CHK064 - Update data-model.md]
- [x] CHK065 Is rolePreference field documented (not just 'role' for job title)? [Resolution: CHK065 - Update data-model.md]
- [x] CHK066 Are assignedSiteIds documented for multi-site assignment? [Resolution: CHK066 - Update data-model.md]

## Clarity

- [ ] CHK067 Is 'role' field distinguished from 'rolePreference' (job title vs access role)? [Clarity, data-model.md]
- [ ] CHK068 Is email uniqueness scope clarified (all realms + pending requests)? [Clarity, data-model.md]
- [ ] CHK069 Is the difference between assignedRealm and assignedSiteIds clarified? [Clarity, data-model.md]

## Consistency

- [x] CHK070 Do field names match spec.md Key Entities (company vs companyName)? [Resolution: CHK070 - Use spec.md fields]
- [ ] CHK071 Does RequestStatus enum match spec.md (pending/approved/rejected case)? [Consistency, data-model.md → spec.md]
- [ ] CHK072 Do max length constants match actual validation rules? [Consistency, data-model.md]

## Edge Case

- [ ] CHK073 Is behavior defined for requests at exactly 24h token expiry boundary? [Edge Case, data-model.md]
- [ ] CHK074 Is behavior defined when processedBy references deleted user? [Edge Case, data-model.md]
- [ ] CHK075 Is behavior defined for email with maximum length (RFC 5321: 254 chars)? [Edge Case, data-model.md]

## Cross-Artifact

- [ ] CHK076 Do constants in data-model.md match quantified values in ux.md? [Consistency, data-model.md → ux.md]
- [ ] CHK077 Are all state transitions (PENDING→APPROVED, PENDING→REJECTED) covered by TEST tasks? [Coverage, data-model.md → tasks.md]
- [ ] CHK078 Do entity fields match Prisma schema in implementation? [Consistency, data-model.md → implementation]
