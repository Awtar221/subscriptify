# Subscriptify - Extended Agile Development with GitHub

## Project Overview

Subscriptify is a subscription tracker web application developed for the BAI21113 Software Engineering "Extended Agile Development" project. The application supports user authentication, full subscription CRUD (add, edit, delete, status tracking), and three advanced enhancements: dashboard/analytics reporting, improved filtering & validation, and automatic renewal handling. Development follows Scrum across three iterations and uses GitHub for version control and collaboration.

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
   git clone https://github.com/Awtar221/subscriptify.git
   ```

2. **Set up Supabase**
   - Create a Supabase project, then run `supabase_schema.sql` (SQL Editor) to create the `subscriptions` table with RLS policies.
   - Create `js/config.js` (gitignored, not committed):
     ```js
     window.SUPABASE_CONFIG = {
       url: 'https://your-project.supabase.co',
       anonKey: 'your-publishable-anon-key'
     }
     ```

3. **Open the project**
   - Open the folder in VS Code
   - Or double-click `index.html` to open directly in a browser

4. **Start the application**
   - Open `index.html` in your browser
   - If not logged in, the app redirects you to `pages/login.html`
   - Create a new account via `pages/register.html`
   - Log in to access the Dashboard

### Using Live Server (Recommended)
In VS Code, right-click `index.html` → "Open with Live Server"

---

## Agile SDLC Approach: Scrum with 3 Iterations

### Justification

Scrum was chosen because it organises work into fixed-length iterations, each ending with a working, reviewable increment of the product. Three factors made Scrum the right fit.

- The assignment requires three defined iterations showing meaningful evolution. Scrum's sprint model maps directly to this structure, with each iteration producing a tagged, deployable version of the application.
- Scrum defines clear roles. With three team members, assigning a Product Owner and Scrum Master kept decision-making and process management explicit.
- Scrum ceremonies, specifically sprint planning and sprint review, gave the team formal moments to commit to scope before starting and evaluate output before moving on — important across three iterations where scope (auth model, data layer) changed materially between them.

### Task Tracking

Day-to-day task tracking and sprint management was done in Jira. Each iteration had its own Jira board with columns for To Do, In Progress, and Done. GitHub holds all commits, branches, and pull requests as the primary collaboration record.

---

## User Stories (Backlog)

15 user stories across three iterations.

| ID | User Story | Acceptance Criteria | Priority | Size | Iteration |
| --- | --- | --- | --- | --- | --- |
| US-01 | As a user, I want to register an account so I can access the tracker. | Account created with email + password; duplicate email rejected; redirected to login on success. | High | Medium | 1 |
| US-02 | As a user, I want to log in so I can view my subscriptions. | Valid credentials redirect to Dashboard; invalid credentials show an error; session persists across page loads. | High | Medium | 1 |
| US-03 | As a user, I want to add a subscription with a name, cost, category, and renewal date. | Modal form validates required fields; new subscription appears in the list immediately after save. | High | Large | 1 |
| US-04 | As a user, I want to edit an existing subscription so I can update its details. | Edit modal pre-fills current values; save persists changes and updates the list without a reload. | High | Medium | 1 |
| US-05 | As a user, I want to delete a subscription so I can remove services I no longer track. | Delete requires confirmation; removed subscription disappears from the list and stat totals update. | High | Small | 1 |
| US-06 | As a user, I want to filter subscriptions by status so I can view only active or cancelled ones. | Filter tabs (All/Active/Cancelled/Renewing Soon) update the list correctly and repeatably. | Medium | Medium | 1 |
| US-07 | As a user, I want to see a summary of my total monthly cost so I can understand my spending. | Dashboard stat card shows the correct sum of active subscription costs, formatted as currency. | Medium | Small | 1 |
| US-08 | As a user, I want to see which subscriptions renew within 7 days so I can prepare. | "Renewing Soon" list/stat only includes active subscriptions with a renewal date 0–7 days out. | Medium | Small | 1 |
| US-09 | As a user, I want to search my subscriptions by name or category so I can find one quickly. | Search input filters the visible list in real time (debounced), case-insensitive, on name and category. | Medium | Small | 2 |
| US-10 | As a user, I want clear validation errors when I submit an invalid subscription form. | Each missing/invalid field shows a specific toast (not a generic error); submission is blocked until fixed. | Medium | Medium | 2 |
| US-11 | As a user, I want to export, import, and clear all my subscription data so I can back it up or reset. | Export downloads a JSON file of current data; import restores from a valid file; clear-all requires confirmation. | Low | Medium | 2 |
| US-12 | As a user, I want a spend-by-category breakdown and top-cost ranking so I understand where my money goes. | Analytics page renders an animated donut chart by category and a ranked top-5 costliest list from real data. | Medium | Large | 2 |
| US-13 | As a user, I want my data stored securely per-account so my subscriptions are private and persist across devices. | Auth and subscriptions run on Supabase (Postgres + Row Level Security); one user cannot read/write another's rows. | High | Large | 3 |
| US-14 | As a user, I want a subscription to automatically roll to its next renewal date instead of just going stale, until I cancel it. | An active subscription past its renewal date advances a month at a time (multi-month catch-up handled) and persists; cancelled subscriptions are left untouched. | Medium | Medium | 3 |
| US-15 | As a user, I want a dark/light theme toggle so I can use the app comfortably in different lighting. | Toggle switches the whole app's theme instantly, persists across reloads, and defaults to system preference on first visit. | Low | Small | 3 |

---

## Iteration Breakdown

| Iteration | Stories Addressed | Focus | Tag |
| --- | --- | --- | --- |
| Iteration 1 | US-01 to US-08 | Core foundation — minimum viable product | `iteration-1` (+ `iteration-1.1` fix-up) |
| Iteration 2 | US-09 to US-12 | Refinement — search, validation, data portability, analytics | `iteration-2` |
| Iteration 3 | US-13 to US-15 | Advanced — Supabase auth/persistence, auto-renewal, theming, quality pass | *pending* |

### Iteration 1 — Core Foundation

- **Objective**: Ship a working, authenticated subscription tracker with full CRUD.
- **Task breakdown**: Kelvin — dashboard UI shell, sidebar, stat cards, CSS system; Wei Liang — registration, login, session guard; Li Xian — SubscriptionManager CRUD, data layer, stat card logic.
- **Expected increment**: A user can register, log in, and add/edit/delete/filter subscriptions, with dashboard totals reflecting real data.

### Iteration 2 — Refinement and Reporting

- **Objective**: Round out the MVP with search, stronger validation, data portability, and the first advanced enhancement (dashboard analytics).
- **Task breakdown**: Li Xian — field-level validation toasts, search/filter fixes; Kelvin — analytics page (donut charts, rankings), UI polish; Wei Liang — export/import/clear-all data actions.
- **Expected increment**: Analytics page with real charts, working search, per-field validation, and a data export/import/reset flow.

### Iteration 3 — Advanced Persistence and Quality

- **Objective**: Replace localStorage with a real per-user backend, add automatic renewal handling as a reporting/reliability enhancement, and finish with a design/quality pass.
- **Task breakdown**: Kelvin — Supabase auth + `subscriptions` table migration (RLS-scoped), auto-renewal logic, dark/light theming, calendar/date-picker polish, README and process documentation.
- **Expected increment**: Data persists per-account on Supabase instead of the browser; active subscriptions self-correct past-due renewal dates instead of going stale; app supports dark/light themes.

### What Was Delivered in Each Sprint

**Sprint 1 (iteration1) - Core Foundation**

- Base UI with sidebar navigation, stat cards, and subscription table (`index.html`, `css/layout.css`, `css/components.css`)
- User registration with localStorage-based credential storage — `subtrack_users` key (`register.html`, `js/auth.js`)
- User login with session management and page guard — `subtrack_current_user` key (`login.html`, `js/auth.js`, `js/session.js`)
- Subscription CRUD: add, edit, and delete via modal form (`js/subscriptions.js`)
- Filter subscriptions by active or cancelled status via tabs and sidebar links
- Dashboard stat cards: total monthly cost, active count, renewing soon count, cancelled count
- Subscriptions stored under `subscriptions` key in localStorage
- Codebase restructured: inline scripts extracted into `auth.js`, `session.js`, `dropdown.js`, `modal.js`
- CSS split into five focused files: `base.css`, `layout.css`, `components.css`, `modal.css`, `auth.css`

**Sprint 2 (iteration2) - Refinement and Bug Fixes**

- Improved form validation with field-level error toasts for each missing input (`validateForm` in `subscriptions.js`)

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

```text
main (stable, tagged at the end of each iteration)
  │
  └── dev (integration branch — all feature branches merge here first)
        │
        ├── user-reg               (login, registration, session guard)
        ├── subscription-list      (CRUD, dashboard UI, stat cards, filters)
        ├── subscription-list-update (follow-up fixes to the CRUD/dashboard branch)
        ├── analytics              (analytics page: charts, rankings)
        └── database               (Supabase auth + data persistence, replacing localStorage)
```

A main-and-develop model with one feature branch per area of the system.

- `main` holds stable, tagged code. Nothing merges directly into `main` except `dev` at the end of an iteration.
- `dev` is the shared integration branch. Feature branches are merged into `dev` and tested together before `dev` is merged into `main`.
- `user-reg` covers authentication: registration, login, session guard, and the auth pages.
- `subscription-list` (+ `subscription-list-update`) covers subscription CRUD, dashboard UI, stat cards, filters, and related CSS/JS.
- `analytics` covers the analytics page: category breakdown, status split, top-cost ranking.
- `database` covers the move from localStorage to Supabase: authentication, the `subscriptions` table, and Row Level Security.

This model kept in-progress work off `main` at all times and gave the team a stable integration point in `dev` to catch conflicts before each iteration review.

### Release Tags

| Tag | Iteration | Description |
| --- | --- | --- |
| `iteration-1` | 1 | Core subscription tracker with full CRUD and localStorage-based authentication |
| `iteration-1.1` | 1 | Fix-up tag addressing issues found after the iteration 1 review |
| `iteration-2` | 2 | Search, field-level validation, data export/import/reset, analytics page |
| *(pending)* | 3 | Supabase auth/persistence, auto-renewal, dark/light theming, quality pass |

---

## Data & Auth

Auth and data persistence run on Supabase (Postgres + Auth), not localStorage.

- **Auth**: Supabase's built-in `auth.users` — no custom user table. Sessions are managed by the Supabase JS client (`js/supabase.js`, `js/session.js`); "remember me" unchecked stores the session in `sessionStorage` instead of `localStorage` so it dies with the tab.
- **`subscriptions` table** (schema in `supabase_schema.sql`, run once in the Supabase SQL Editor) — one row per subscription, owned by the user who created it:

```sql
id            bigint primary key
user_id       uuid references auth.users(id)
name          text
category      text  -- Streaming | Music | Storage | Design | Productivity | Other
cost          numeric
renewal_date  date
status        text  -- active | cancelled
notes         text
created_at    timestamptz
```

Row Level Security is on, with owner-only policies (`auth.uid() = user_id`) for select/insert/update/delete, so one user can never read or write another's rows.

Theme preference (dark/light) is the one thing still kept client-side, in `localStorage['subtrack_theme']`.

---

## Technologies Used

- HTML5
- CSS3 (CSS Grid and Flexbox, CSS custom properties for theming)
- JavaScript (ES6, no frameworks)
- Supabase (Postgres + Auth) for data persistence and authentication
- anime.js v4 for motion (toasts, dialogs, dropdowns, chart reveals, auth page entrance)
- Tabler Icons (v3.10.0, CDN)
- Google Fonts: Bricolage Grotesque (display), Inter (body)

---

## Project Structure

```text
subscriptify/
├── css/
│   ├── base.css          # CSS variables (incl. dark theme), reset, global typography
│   ├── layout.css        # App shell, sidebar, topbar, content area
│   ├── components.css    # Stat cards, table, badges, buttons, toasts, dialogs
│   ├── modal.css         # Modal overlay, form fields, modal buttons
│   └── auth.css          # Login and register page styles
├── js/
│   ├── config.js          # Supabase URL/anon key (gitignored, not committed)
│   ├── supabase.js        # Supabase client factory
│   ├── session.js         # Auth guard, logout, user display — protected pages
│   ├── login.js / register.js
│   ├── password-toggle.js  # Password-visibility toggle (login/register)
│   ├── auth-fx.js          # Login/register entrance motion, particle field
│   ├── shared-data.js      # fetchSubscriptions, date helpers, Supabase row mapping
│   ├── subscriptions.js    # SubscriptionManager class (CRUD, render, filter)
│   ├── charts.js           # Shared donut chart renderer + dashboard side panels
│   ├── analytics.js        # Analytics page charts and rankings
│   ├── dropdown.js         # Three-dot menu: export, import, clear all
│   ├── animate-value.js    # Animated stat-card number transitions
│   └── theme.js            # Dark/light toggle
├── pages/
│   ├── login.html
│   ├── register.html
│   ├── subscriptions.html
│   └── analytics.html
├── index.html             # Dashboard
├── supabase_schema.sql    # DB schema + RLS policies, run once per Supabase project
├── package.json
└── README.md
```

---
*Developed for BAI21113 Software Engineering — Extended Agile Development Project | May 2026 Semester*
