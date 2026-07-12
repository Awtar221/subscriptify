# Subscriptify - Feature Development with GitHub in an Agile SDLC

## Project Overview

Subscriptify is a subscription tracker web application developed as part of the BAI21113 Software Engineering assignment. The application supports user registration, login, and subscription management. Development follows Scrum with 2 sprints and uses GitHub for version control and collaboration.

---

## Team Members & Roles

| Name | Role | Responsibilities |
|------|------|------------------|
| Kelvin Singh (BAI_2009F-2505002) | Product Owner & Developer | Backlog prioritisation, sprint scope decisions, UI shell, CSS system, codebase restructuring |
| Wei Liang (BIT_B2201F-2505006) | Scrum Master & Developer | Sprint planning facilitation, Jira board management, authentication system, README |
| Li Xian (BIT_B2201F-2505005) | Developer | Subscription CRUD system, localStorage data layer, form validation, bug fixes |
---

## How to Run the Code

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge)
- VS Code (recommended) or any text editor

### Steps to Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/Subscriptify-kwl.git
   ```

2. **Open the project**
   - Open the folder in VS Code
   - Or double-click `index.html` to open directly in a browser

3. **Start the application**
   - Open `index.html` in your browser
   - If not logged in, the app redirects you to `login.html`
   - Create a new account via `register.html`
   - Log in to access the Dashboard

### Using Live Server (Recommended)
In VS Code, right-click `index.html` → "Open with Live Server"

---

## Agile SDLC Approach: Scrum with 2 Sprints

### Justification

Scrum was chosen because it organises work into fixed-length sprints, each ending with a working, reviewable increment of the product. Three factors made Scrum the right fit.

- The assignment requires two defined iterations. Scrum's sprint model maps directly to this structure, with each sprint producing a tagged, deployable version of the application.
- Scrum defines clear roles. With three team members, assigning a Product Owner and Scrum Master kept decision-making and process management explicit.
- Scrum ceremonies, specifically sprint planning and sprint review, gave the team formal moments to commit to scope before starting and evaluate output before moving on.

### Task Tracking

Day-to-day task tracking and sprint management was done in Jira. Each sprint had its own Jira board with columns for To Do, In Progress, and Done. GitHub Issues were also created per member to satisfy the assignment requirement. GitHub holds all commits, branches, and pull requests as the primary collaboration record.

---

## User Stories (Backlog)

| ID | User Story | Priority | Size | Sprint |
|----|------------|----------|------|--------|
| US-01 | As a user, I want to register an account so I can access the tracker. | High | Medium | 1 |
| US-02 | As a user, I want to log in so I can view my subscriptions. | High | Medium | 1 |
| US-03 | As a user, I want to add a subscription with a name, cost, category, and renewal date. | High | Large | 1 |
| US-04 | As a user, I want to edit an existing subscription so I can update its details. | High | Medium | 1 |
| US-05 | As a user, I want to delete a subscription so I can remove services I no longer track. | High | Small | 1 |
| US-06 | As a user, I want to filter subscriptions by status so I can view only active or cancelled ones. | Medium | Medium | 1 |
| US-07 | As a user, I want to see a summary of my total monthly cost so I can understand my spending. | Medium | Small | 1 |
| US-08 | As a user, I want to see which subscriptions renew within 7 days so I can prepare. | Medium | Small | 1 |

---

## Iteration Breakdown

| Iteration | Stories Addressed | Focus | Tag |
|-----------|------------------|-------|-----|
| Sprint 1 | US-01 to US-08 | Core foundation, minimum viable product | iteration1 |
| Sprint 2 | US-01 to US-08 | Refinement, bug fixes, code restructuring | iteration2 |

Sprint 2 works from the same eight user stories. No new stories were added. The team used Sprint 2 to address quality gaps identified in the Sprint 1 review.

### What Was Delivered in Each Sprint

**Sprint 1 (iteration1) - Core Foundation**

- Base UI with sidebar navigation, stat cards, and subscription table (`index.html`, `css/layout.css`, `css/components.css`)
- User registration with localStorage-based credential storage — `subtrack_users` key (`register.html`, `js/auth.js`)
- User login with session management and page guard — `subtrack_current_user` key (`login.html`, `js/auth.js`, `js/session.js`)
- Subscription CRUD: add, edit, and delete via modal form (`js/simple_CRUD.js`)
- Filter subscriptions by active or cancelled status via tabs and sidebar links
- Dashboard stat cards: total monthly cost, active count, renewing soon count, cancelled count
- Subscriptions stored under `subscriptions` key in localStorage
- Codebase restructured: inline scripts extracted into `auth.js`, `session.js`, `dropdown.js`, `modal.js`
- CSS split into five focused files: `base.css`, `layout.css`, `components.css`, `modal.css`, `auth.css`

**Sprint 2 (iteration2) - Refinement and Bug Fixes**

- Improved form validation with field-level error toasts for each missing input (`validateForm` in `simple_CRUD.js`)

- Fixed inconsistent sidebar filter behaviour that left stale results after switching filters
- Fixed duplicate modal footer in `index.html`
- Fixed status context menu (`showStatusMenu`) rendering and cleanup on outside click
- Export, import, and clear-all actions extracted into `dropdown.js`
- Updated README to reflect new file structure and localStorage schema

### Feature Evolution Between Sprints

| Feature | Sprint 1 (iteration1) | Sprint 2 (iteration2) |
|---------|----------------------------|----------------------------|
| Registration | Basic form with localStorage persistence | Same flow, no change |
| Login | Login with session redirect | Same flow, no change |
| Subscription CRUD | Functional via modal form | Bug fixes: sidebar filter, modal footer, status context menu |
| Form Validation | Basic required-field check | Field-level error toasts for each missing input |
| Status Filter | Working but inconsistent on repeat use | Fixed; renders correctly on every filter change |
| Stat Cards | Correct calculations | No change |
| Three-dot menu | Extracted into `dropdown.js` | No change |
| Codebase | Modular JS files, CSS split into five files | No change |

---

## GitHub Repository Setup & Collaboration

### Branching Strategy

```
main (stable, production-ready — merged from dev at end of each sprint)
  │
  └── dev (integration branch, Kelvin — all feature branches merge here first)
        │
        ├──  user-reg   (Wei Liang — login, registration, session guard)
        └── subscription-list (Li Xian — CRUD, UI, dashboard)
```

The team used a four-branch model.

- `main` holds stable, tagged code. Nothing merges directly into `main` except `dev` at the end of a sprint.
- `dev` is the shared integration branch. Feature branches are merged into `dev` and tested together before `dev` is merged into `main`.
- `login-register` covers all authentication work: registration, login, session guard, and the auth pages.
- `subscription-list` covers the subscription CRUD, dashboard UI, stat cards, filters, and all related CSS and JS.

This model kept in-progress work off `main` at all times and gave the team a stable integration point in `dev` to catch conflicts before the sprint review.

### GitHub Issues (Minimum 2 per team member)

| Issue | Assigned To | Status |
|-------|-------------|--------|
| Added log in and register | Wei Liang | Closed |
| Added logo to login page | Wei Liang | Closed |
| UI improvement needed | Kelvin | Open |
| Filtering is in dashboard rather than subscription table | Kelvin | Open |
| Added syncronisation between dashboard and subscription list | Li Xian | Closed |
| Validation error | Li Xian | Closed |

### Pull Requests & Code Reviews

Each team member submitted at least 2 pull requests with review comments.

**Kelvin's PRs:**
- PR #1: `dev` → `main` (Dashboard UI, sidebar, stat cards, CSS system, login, registration, subscription list — Sprint 1)
- PR #2: `dev` → `main` (README update, validation update, logo added — Sprint 2)

**Wei Liang's PRs:**
- PR #1: `login-register` → `dev` (Login, registration, `auth.js`, `session.js`)
- PR #2: `login-register` → `dev` (README update)

**Li Xian's PRs:**
- PR #1: `subscription-list` → `dev` (SubscriptionManager class, localStorage CRUD, stat card logic)
- PR #2: `subscription-list` → `dev` (Form validation toasts, status context menu fix)

### Release Tags

| Tag | Sprint | Description |
|-----|--------|-------------|
| iteration1 | Sprint 1 | Core subscription tracker with full CRUD and authentication |
| iteration2 | Sprint 2 | Refined codebase with improved validation and bug fixes, added image to login page |

### Evidence of Collaboration

- Regular commits from all 3 team members across both sprints
- Four-branch model: `main`, `dev`, `login-register`, `subscription-list`
- All feature branches merged into `dev` first; `dev` merged into `main` at sprint end
- Pull requests with review comments before every merge
- GitHub Issues created per member
- Jira Scrum board used for sprint planning and day-to-day tracking
- Release tags applied to `main` at the end of each sprint

---

## localStorage Schema

All data is stored in the browser's localStorage under three keys.

**`subtrack_users`** — Array of registered user objects:
```json
[
  { "username": "string", "password": "string" }
]
```

**`subtrack_current_user`** — String storing the username of the active session:
```json
"username"
```

**`subscriptions`** — Array of subscription objects:
```json
[
  {
    "id": "number (Date.now() timestamp)",
    "name": "string",
    "category": "Streaming | Music | Storage | Design | Productivity | Other",
    "cost": "number (RM, 2 decimal places)",
    "renewalDate": "string (YYYY-MM-DD)",
    "status": "active | cancelled",
    "notes": "string (optional)"
  }
]
```

On first load, `simple_CRUD.js` seeds four demo subscriptions (Netflix, Spotify, iCloud 200GB, Adobe CC) if the `subscriptions` key is empty.

---

## Technologies Used

- HTML5
- CSS3 (CSS Grid and Flexbox)
- JavaScript (ES6, no frameworks)
- Tabler Icons (v3.10.0, CDN)
- Google Fonts: Playfair Display, DM Sans
- localStorage (client-side data persistence)

---

## Project Structure

```
task-tracker-kwl/
├── css/
│   ├── base.css          # CSS variables, reset, global typography
│   ├── layout.css        # App shell, sidebar, topbar, content area
│   ├── components.css    # Stat cards, table, badges, buttons, toasts, dialogs
│   ├── modal.css         # Modal overlay, form fields, modal buttons
│   └── auth.css          # Login and register page styles
├── js/
│   ├── auth.js           # Registration and login logic
│   ├── session.js        # Session guard and user display
│   ├── simple_CRUD.js    # SubscriptionManager class (CRUD, render, filter)
│   ├── dropdown.js       # Three-dot menu: export, import, clear all
│   └── modal.js          # Basic modal open/close for static pages
├── pages/
│   ├── subscriptions.html
│   └── analytics.html
├── index.html            # Dashboard
├── login.html
├── register.html
└── README.md
```

---
*Developed for BAI21113 Software Engineering Assignment | Faculty of Computing*