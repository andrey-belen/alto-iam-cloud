# Alto Keycloak - Scope Clarification Needed

## Current Progress

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMPLETED (90%)                                   │
│                                                                             │
│   ON-PREM KEYCLOAK (Infra v2 Security Fix)                                 │
│   ─────────────────────────────────────────                                │
│   ✅ MFA implementation                                                     │
│   ✅ Replaces old vulnerable login                                          │
│   ✅ Vault integration for secrets                                          │
│   ✅ Terraform orchestration                                                │
│   ✅ Removes hardcoded credentials                                          │
│                                                                             │
│   Purpose: Fix existing security vulnerabilities                            │
│   Users: Site operators accessing CERO dashboard                            │
│   Scope: CLEAR ✓                                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ (was planned for later phases)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMPLETED (Auth Only)                             │
│                                                                             │
│   CLOUD KEYCLOAK                                                            │
│   ──────────────                                                            │
│   ✅ Basic deployment on Azure VM                                           │
│   ✅ MFA working                                                            │
│   ✅ Login/auth functional                                                  │
│   ⚠️  Dashboard started but unclear requirements                            │
│                                                                             │
│   Purpose: ??? UNCLEAR                                                      │
│   Users: ??? UNCLEAR                                                        │
│   Scope: ??? UNCLEAR                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
┌───────────────────────┐ ┌─────────────────────┐ ┌─────────────────────────┐
│      OPTION A         │ │      OPTION B       │ │       OPTION C          │
│  (Original Plan)      │ │   (New Request?)    │ │    (Enterprise SSO)     │
├───────────────────────┤ ├─────────────────────┤ ├─────────────────────────┤
│                       │ │                     │ │                         │
│ INFRA SUPPORT         │ │ CLIENT IAM          │ │ ALTO INTERNAL SSO       │
│                       │ │                     │ │                         │
│ Cloud Keycloak syncs  │ │ Multi-tenant system │ │ All Alto services use   │
│ with on-prem for:     │ │ for external clients│ │ single Keycloak for:    │
│ • Central user mgmt   │ │ • Marriott, Hilton  │ │ • Alto employees        │
│ • Backup auth         │ │ • Self-service      │ │ • Internal tools        │
│ • Remote access       │ │ • Client admins     │ │ • Cross-service SSO     │
│                       │ │ • Site picker       │ │                         │
│ Users: Alto ops +     │ │ Users: External     │ │ Users: Alto staff       │
│        site staff     │ │        clients      │ │                         │
│                       │ │                     │ │ ❓ Why not Azure AD?    │
│ Effort: Medium        │ │ Effort: High        │ │    That's what AD is    │
│ (sync service)        │ │ (new product)       │ │    designed for         │
│                       │ │                     │ │                         │
└───────────────────────┘ └─────────────────────┘ └─────────────────────────┘
        │                         │                         │
        │                         │                         │
        └─────────────────────────┴─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │   QUESTIONS FOR SUPERVISOR  │
                    └─────────────────────────────┘
```

## Questions to Clarify

### 1. Who is the user?

| Option | Primary User | Secondary User |
|--------|--------------|----------------|
| A: Infra Support | Alto operators | Site staff (synced) |
| B: Client IAM | External clients (Marriott, Hilton) | Client admins |
| C: Alto SSO | Alto employees | Internal services |

**Question:** When you said "allow other Alto employees to connect their services" - did you mean:
- (A) Alto ops managing client sites remotely?
- (B) External client staff?
- (C) Alto internal tools/employees?

### 2. What problem are we solving?

| Option | Problem Solved |
|--------|----------------|
| A: Infra Support | Remote management of on-prem deployments |
| B: Client IAM | Client self-service, multi-site access, Alto-branded portal |
| C: Alto SSO | Single login for all Alto internal systems |

**Question:** Is this fixing a security issue (like on-prem was) or building a new product?

### 3. If Option C (Alto SSO) - Why Keycloak over Azure AD?

Azure AD is designed for exactly this use case:
- Employee SSO across Microsoft + custom apps
- Built-in MFA
- Already managed by IT
- No infrastructure to maintain

Keycloak makes sense for:
- External/customer-facing auth
- On-prem deployments (no cloud dependency)
- Custom auth flows

**Question:** Is there a specific reason Keycloak was chosen over AD for internal SSO?

---

## My Recommendation

**Don't mix purposes.** Each option is a different product:

```
ON-PREM KEYCLOAK          CLOUD KEYCLOAK              AZURE AD
(Done - Infra v2)         (If needed)                 (If needed)
      │                         │                          │
      ▼                         ▼                          │
┌─────────────┐          ┌─────────────┐                   │
│ Site auth   │◄─sync───►│ Option A:   │                   │
│ MFA         │          │ Remote mgmt │                   │
│ Vault/TF    │          │ Backup auth │                   │
└─────────────┘          └─────────────┘                   │
                                                           │
                         ┌─────────────┐                   │
                         │ Option B:   │ (separate         │
                         │ Client IAM  │  project)         │
                         └─────────────┘                   │
                                                           ▼
                                                    ┌─────────────┐
                                                    │ Option C:   │
                                                    │ Alto SSO    │
                                                    │ (use AD)    │
                                                    └─────────────┘
```

---

## Current Blocker

**I cannot proceed with cloud Keycloak development until scope is defined:**

- [ ] Who is the target user?
- [ ] What features are required?
- [ ] What's the relationship to on-prem Keycloak?
- [ ] Is this a security fix or a new product?
- [ ] If internal SSO: why not Azure AD?

**On-prem Keycloak (Infra v2) is unblocked** - just needs staging deployment and final testing.
