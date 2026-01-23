# UX Specification: Site Groups

## User Flows

### Flow 1: View Site Groups (Alto Admin)

```
Alto Admin → Dashboard
    │
    ├─► Sidebar: "Site Groups"
    │
    └─► Site Groups Page
            │
            ├─► Realm selector dropdown (default: all realms)
            │
            └─► Site list table
                    │
                    ├─► Columns: Realm, Site Name, Users, Created
                    │
                    └─► Click row → Site Detail
```

### Flow 2: View Site Groups (Client Admin)

```
Client Admin → Dashboard
    │
    ├─► Sidebar: "Sites" (no "Site Groups" label)
    │
    └─► Sites Page (realm pre-filtered)
            │
            └─► Site list table
                    │
                    ├─► Columns: Site Name, Users, Created
                    │
                    └─► Click row → Site Detail
```

### Flow 3: Create Site Group

```
Admin on Site Groups Page
    │
    ├─► Click "Add Site" button
    │
    └─► Modal: Create Site
            │
            ├─► Input: Site Name (required)
            ├─► Realm: [shown if Alto Admin, pre-selected if Client Admin]
            │
            ├─► Cancel → Close modal
            │
            └─► Create → API call → Success toast → List refresh
```

### Flow 4: Site Detail & Members

```
Admin clicks site row
    │
    └─► Site Detail Page
            │
            ├─► Header: Site name, realm badge, user count
            │
            ├─► Tabs: [Overview] [Members]
            │
            ├─► Overview Tab:
            │       ├─► Created date
            │       ├─► User count
            │       └─► Actions: Rename, Delete
            │
            └─► Members Tab:
                    │
                    ├─► "Add User" button
                    │
                    └─► User list table
                            ├─► Columns: Name, Email, Role, Actions
                            └─► Action: Remove from site
```

### Flow 5: Assign User to Sites (from User Detail)

```
Admin on User Detail Page
    │
    └─► "Assigned Sites" section
            │
            ├─► List of current site assignments (chips)
            │
            ├─► "Edit Sites" button
            │
            └─► Modal: Assign Sites
                    │
                    ├─► Checkbox list of all sites in realm
                    ├─► Currently assigned sites pre-checked
                    │
                    ├─► Cancel → Close modal
                    │
                    └─► Save → API call → Success toast → Refresh
```

## Screen Specifications

### Site Groups List Page

**Header**
- Title: "Site Groups" (Alto Admin) or "Sites" (Client Admin)
- "Add Site" button (primary, right-aligned)

**Filters (Alto Admin only)**
- Realm dropdown: "All Realms" | specific realm names
- Search input: filters by site name

**Table Columns**
| Column | Width | Content |
|--------|-------|---------|
| Realm | 120px | Realm name badge (Alto Admin only) |
| Site Name | flex | Site display name |
| Users | 80px | User count number |
| Created | 120px | Date (MMM DD, YYYY) |

**Empty State**
- Icon: Building outline
- Message: "No sites yet"
- Action: "Add your first site"

### Site Detail Page

**Header**
- Back arrow → Site list
- Site name (h1)
- Realm badge (muted)
- User count badge

**Tabs**
- Overview (default)
- Members

**Overview Tab**
- Card: Site Information
  - Created: [date]
  - User count: [number]
- Card: Actions
  - Rename button
  - Delete button (destructive, with confirmation)

**Members Tab**
- "Add User" button (right-aligned)
- User table:
  | Column | Content |
  |--------|---------|
  | Name | Full name |
  | Email | Email address |
  | Role | Role badge (admin/operator/viewer) |
  | Actions | Remove button |

### Create/Edit Site Modal

**Fields**
- Site Name (text input, required)
  - Placeholder: "e.g., Building A, Hong Kong Office"
  - Validation: 2-50 characters, unique in realm
- Realm (dropdown, Alto Admin only)
  - Pre-selected if coming from realm context

**Actions**
- Cancel (secondary)
- Create/Save (primary)

### Delete Confirmation Modal

**Content**
- Title: "Delete Site?"
- Message: "This will remove [Site Name] from [Realm]."
- Warning (if users assigned): "Warning: [N] users are assigned to this site. They will lose access."

**Actions**
- Cancel (secondary)
- Delete (destructive)

### Assign Sites Modal (from User Detail)

**Content**
- Title: "Assign Sites"
- Subtitle: "Select sites for [User Name]"
- Checkbox list of all sites in user's realm
- Pre-checked for currently assigned sites

**Actions**
- Cancel (secondary)
- Save (primary)

## Component States

### Site List Row
- Default: White background
- Hover: Light gray background (#f9fafb)
- Click: Navigate to detail

### User Count Badge
- 0 users: Gray text
- 1+ users: Default text with user icon

### Role Badge
- client-admin: Purple background
- operator: Blue background
- viewer: Gray background

## Responsive Behavior

**Desktop (1280px+)**
- Full table with all columns
- Side-by-side layout for detail cards

**Tablet (768px - 1279px)**
- Table with key columns only (hide Created)
- Stacked layout for detail cards

**Mobile (< 768px)**
- Card list instead of table
- Full-width modals
