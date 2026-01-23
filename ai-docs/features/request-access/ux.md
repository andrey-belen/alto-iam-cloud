# UX Specification: Request Access

**Platform**: Web (Desktop-first, responsive)

## User Flows

### Flow 1: Public Access Request

```
User visits /request-access
         │
         ▼
┌─────────────────┐
│  Compact Form   │  Company, Name, Email, Phone, Role Pref
│  (no scroll)    │
└────────┬────────┘
         │ Submit
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Success Screen  │────▶│ Admin Email     │
│ "We'll be in    │     │ with Approve/   │
│  touch soon"    │     │ Reject links    │
└─────────────────┘     └─────────────────┘
```

### Flow 2: Email Approval (Magic Link)

```
Admin receives email
         │
   ┌─────┴─────┐
   │           │
   ▼           ▼
[Approve]   [Reject]
   │           │
   ▼           ▼
┌────────────────┐  ┌───────────────┐
│ Approval Page  │  │ Rejection     │
│ - Summary      │  │ - Summary     │
│ - Realm select │  │ - Reason      │
│ - Role select  │  └───────┬───────┘
│ - Site select  │          │
└───────┬────────┘          ▼
        │              Send rejection
        ▼              email to user
Create Keycloak
user + assign
role + sites +
send welcome
```

### Flow 3: Dashboard Approval (Alto Admin)

```
Alto Admin → Access Queue
         │
         ▼
Pending Requests Table (all requests)
         │
   ┌─────┴─────┐
   │           │
   ▼           ▼
[Approve]   [Reject]
   │           │
   ▼           ▼
┌────────────────┐  ┌───────────────┐
│ Approval Modal │  │ Rejection     │
│ - Summary      │  │ Modal         │
│ - Realm (all)  │  │ - Reason      │
│ - Role (all)   │  └───────────────┘
│ - Sites        │
└────────────────┘
```

### Flow 4: Dashboard Approval (Client Admin)

```
Client Admin → Access Queue
         │
         ▼
Pending Requests Table (filtered to realm's company)
         │
   ┌─────┴─────┐
   │           │
   ▼           ▼
[Approve]   [Reject]
   │           │
   ▼           ▼
┌────────────────┐  ┌───────────────┐
│ Approval Modal │  │ Rejection     │
│ - Summary      │  │ Modal         │
│ - Realm (fixed)│  │ - Reason      │
│ - Role (no     │  └───────────────┘
│   admin option)│
│ - Sites (own)  │
└────────────────┘
```

## Screen Specifications

### Public Form (/request-access)

```
┌────────────────────────────────────────┐
│           Alto CERO IAM                │
│          Request Access                │
│                                        │
│  Company Name *                        │
│  ┌──────────────────────────────────┐ │
│  │ e.g., Marriott International     │ │
│  └──────────────────────────────────┘ │
│                                        │
│  First Name *          Last Name *     │
│  ┌───────────────┐    ┌──────────────┐│
│  │ John          │    │ Smith        ││
│  └───────────────┘    └──────────────┘│
│                                        │
│  Email *                               │
│  ┌──────────────────────────────────┐ │
│  │ john.smith@company.com           │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Phone *                               │
│  ┌──────────────────────────────────┐ │
│  │ +1 (555) 123-4567                │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Role Preference *                     │
│  ┌──────────────────────────────────┐ │
│  │ Operator                      ▼  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │       Submit Request             │ │
│  └──────────────────────────────────┘ │
│                                        │
│     Already have access? Sign in       │
└────────────────────────────────────────┘
```

**Role Preference Options:**
- Operator - "Can control building systems"
- Viewer - "Read-only access to dashboards"

### Approval Page (/approve/{token})

```
┌──────────────────────────────────────────────┐
│              Alto CERO IAM                    │
│         Approve Access Request               │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ REQUEST DETAILS                        │ │
│  │                                        │ │
│  │ Name:       John Smith                 │ │
│  │ Email:      john.smith@company.com     │ │
│  │ Company:    Marriott International     │ │
│  │ Phone:      +1 (555) 123-4567          │ │
│  │ Preference: Operator                   │ │
│  │ Submitted:  Jan 22, 2026 at 3:45 PM    │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ ASSIGN ACCESS                          │ │
│  │                                        │ │
│  │ Realm *                                │ │
│  │ ┌────────────────────────────────┐    │ │
│  │ │ Select realm                ▼  │    │ │
│  │ └────────────────────────────────┘    │ │
│  │                                        │ │
│  │ Role *                                 │ │
│  │ ┌────────────────────────────────┐    │ │
│  │ │ Operator                    ▼  │    │ │
│  │ └────────────────────────────────┘    │ │
│  │                                        │ │
│  │ Assign to Sites *                      │ │
│  │ ┌────────────────────────────────┐    │ │
│  │ │ ☑ Hong Kong Office             │    │ │
│  │ │ ☐ Singapore Office             │    │ │
│  │ │ ☐ Tokyo Office                 │    │ │
│  │ └────────────────────────────────┘    │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │   Create User & Send Welcome Email   │   │
│  └──────────────────────────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

**Role Options (by approver):**
| Approver | Available Roles |
|----------|-----------------|
| Alto Admin | Client Admin, Operator, Viewer |
| Client Admin | Operator, Viewer |

### Dashboard Access Queue Page

**Header**
- Title: "Access Requests"
- Badge showing pending count

**Tabs**
- Pending (default)
- Approved
- Rejected

**Table Columns (Alto Admin)**
| Column | Width | Content |
|--------|-------|---------|
| Name | 150px | First + Last name |
| Email | 200px | Email address |
| Company | 150px | Company name |
| Role Pref | 100px | Operator/Viewer badge |
| Submitted | 120px | Relative date |
| Actions | 150px | Approve/Reject buttons |

**Table Columns (Client Admin)**
| Column | Width | Content |
|--------|-------|---------|
| Name | 150px | First + Last name |
| Email | 200px | Email address |
| Role Pref | 100px | Operator/Viewer badge |
| Submitted | 120px | Relative date |
| Actions | 150px | Approve/Reject buttons |

### Approval Modal (Dashboard)

```
┌──────────────────────────────────────────┐
│ Approve Access Request              [X]  │
├──────────────────────────────────────────┤
│                                          │
│ John Smith                               │
│ john.smith@company.com                   │
│ Marriott International                   │
│ Requested: Operator                      │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│ Realm                                    │
│ ┌──────────────────────────────────┐    │
│ │ marriott                      ▼  │    │
│ └──────────────────────────────────┘    │
│                                          │
│ Role                                     │
│ ┌──────────────────────────────────┐    │
│ │ Operator                      ▼  │    │
│ └──────────────────────────────────┘    │
│                                          │
│ Sites                                    │
│ ☑ Hong Kong Office                       │
│ ☐ Singapore Office                       │
│ ☐ Tokyo Office                           │
│                                          │
├──────────────────────────────────────────┤
│              [Cancel]  [Approve & Create]│
└──────────────────────────────────────────┘
```

## Email Templates

### Admin Notification Email

```
Subject: New Access Request: John Smith (Marriott International)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

New Access Request

Someone has requested access to Alto CERO IAM.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name:       John Smith
Email:      john.smith@company.com
Company:    Marriott International
Phone:      +1 (555) 123-4567
Role Pref:  Operator
Submitted:  Jan 22, 2026 at 3:45 PM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please verify this person before approving.

    ┌─────────────────┐    ┌─────────────────┐
    │     APPROVE     │    │     REJECT      │
    │     (green)     │    │     (red)       │
    └─────────────────┘    └─────────────────┘

This link expires in 24 hours.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### User Welcome Email

```
Subject: Welcome to Alto CERO IAM - Your Access is Ready

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome to Alto CERO IAM

Your access request has been approved!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Login URL: https://iam.alto.cloud
Username:  john.smith@company.com
Password:  TempPass123!

Your Role: Operator
Your Sites:
  • Hong Kong Office
  • Singapore Office

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Steps:
1. Click the login link above
2. Enter your email and temporary password
3. You'll be prompted to set up MFA (email code)
4. Change your password when prompted

    ┌─────────────────────────────────────┐
    │            LOG IN NOW               │
    └─────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Rejection Email

```
Subject: Alto CERO IAM Access Request Update

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Access Request Update

Your access request has been reviewed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Unfortunately, your request was not approved at this time.

Reason: [Rejection reason provided by admin]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If you believe this is an error, please contact your administrator.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Interaction States

### Form States
- **idle**: Empty form ready for input
- **submitting**: Button spinner, form disabled
- **success**: Confirmation message shown
- **error**: Error message, form re-enabled

### Approval Page States
- **loading**: Validating token
- **ready**: Request details + assignment form shown
- **processing**: Creating user in Keycloak
- **success**: User created confirmation
- **error**: Creation failed, retry option
- **expired**: Token invalid, redirect to dashboard

### Site Selector States
- **empty**: "Select a realm first" (before realm selected)
- **loading**: Spinner while fetching sites
- **populated**: Checkbox list of sites
- **error**: "Failed to load sites" with retry

## Accessibility Standards

- **Screen Readers**: ARIA role="form", aria-required on all fields
- **Keyboard**: Tab order follows visual order, Enter submits
- **Visual**: 4.5:1 contrast ratio, required fields marked with asterisk
- **Touch**: 44x44px minimum button size

## Error Presentation

| Error | Visual | Message | Action |
|-------|--------|---------|--------|
| Validation | Red border + text below field | "[Field] is required" | Focus field |
| Duplicate email | Red text below email | "This email is already registered" | Clear on change |
| Network | Red banner above form | "Connection error. Please try again." | Retry button |
| Token expired | Full page message | "This link has expired" | Link to dashboard |
| Server error | Red banner | "Something went wrong. Please try again." | Retry button |
| Role not allowed | Red text on role field | "You cannot assign this role" | Auto-clear selection |
