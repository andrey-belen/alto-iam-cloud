# UX Checklist: Request Access

**Source**: ux.md

## Completeness

- [ ] CHK024 Is loading state documented for form submission? [Completeness, UX-001]
- [ ] CHK025 Is the success screen content fully specified beyond "We'll be in touch"? [Completeness, ux.md: Flow 1]
- [ ] CHK026 Are keyboard shortcuts documented for form navigation? [Completeness, ux.md: Accessibility]
- [ ] CHK027 Is mobile layout specified for the request form? [Completeness, UX-003]
- [ ] CHK028 Is the rejection email template fully specified? [Completeness, ux.md: Email Templates]

## Clarity

- [ ] CHK029 Is "compact - single card, no scroll" quantified with pixel dimensions? [Clarity, UX-003]
- [ ] CHK030 Is "prominent" for Approve/Reject buttons quantified (size, color codes)? [Clarity, UX-006]
- [ ] CHK031 Is "relative date" format specified for Submitted column? [Clarity, ux.md: Dashboard Table]
- [ ] CHK032 Are role descriptions ("Can control building systems") the final copy? [Clarity, ux.md: Role Options]

## Coverage

- [ ] CHK033 Are all form states (idle, submitting, success, error) covered by TEST tasks? [Coverage, ux.md → tasks.md]
- [ ] CHK034 Are all approval page states (loading, ready, processing, success, error, expired) covered? [Coverage, ux.md]
- [ ] CHK035 Are all site selector states (empty, loading, populated, error) covered? [Coverage, ux.md]
- [ ] CHK036 Are all error types from Error Presentation table covered by UI tests? [Coverage, ux.md → tasks.md]

## Edge Case

- [ ] CHK037 Is behavior defined when site list is empty for selected realm? [Edge Case, UX-009]
- [ ] CHK038 Is behavior defined when admin has no sites in their realm? [Edge Case, ux.md: Flow 4]
- [ ] CHK039 Is behavior defined for very long company/name values in the table? [Edge Case, ux.md: Dashboard Table]
- [ ] CHK040 Is behavior defined for email with special characters in display? [Edge Case, ux.md]

## Cross-Artifact

- [ ] CHK041 Are all accessibility requirements (ARIA, keyboard, contrast) covered by TEST tasks? [Coverage, ux.md → tasks.md]
- [ ] CHK042 Do error types in Error Presentation match API error responses? [Consistency, ux.md → plan.md]
- [ ] CHK043 Are exit path behaviors (success, error, expired) covered by state tests in tasks.md? [Coverage, ux.md → tasks.md]
- [ ] CHK044 Do Client Admin restrictions in Flow 4 match FR-014/FR-015 in spec.md? [Consistency, ux.md → spec.md]
