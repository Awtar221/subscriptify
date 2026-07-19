# Subscriptify

Subscriptify tracks recurring subscriptions in one place. You register, add your subscriptions, and the dashboard shows what you spend and when each subscription renews.

## Features

- Account registration and login through Supabase Auth
- Add, edit, and delete subscriptions
- Filter and search the subscription list
- Renewal warnings for subscriptions due soon
- Automatic renewal date updates for stale subscriptions
- Analytics dashboard: spend by category, active versus cancelled split, top-cost subscriptions, upcoming renewals
- Dark and light theme toggle
- Export, import, and clear-all for your data

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend and database: Supabase (Auth, Postgres, Row-Level Security)

## Setup Instructions

1. Clone the repository.
   ```
   git clone https://github.com/Awtar221/subscriptify.git
   cd subscriptify
   ```
2. Create a Supabase project at supabase.com.
3. Copy your Supabase project URL and anon key into the project config.
4. Run the schema migration for the subscriptions table and enable Row-Level Security policies so each user reads and writes only their own records.
5. Open the app in your browser, or serve it with a local static server.
6. Register a new account to start adding subscriptions.

## Team

| Name | Role | GitHub |
|---|---|---|
| Kelvin | Scrum Master, Developer | Awtar221 |
| Wei Liang | Product Owner, Developer | l1ang0524j |
| Li Xian | Developer | lawlixian |

## Branching Strategy

The repository uses `main` with feature branches. Each feature branch merges into `main` through a pull request, reviewed by Kelvin before merging.

## Iteration Summary

### Iteration 1 (`iteration-1.1`)
- Login and registration wired to the Supabase database
- Filtering moved from the dashboard to the subscription list
- First version of the analytics view
- Security fixes across input handling and protected routes

### Iteration 2 (`iteration-2`)
- Renewal detection for subscriptions due soon
- In-app registration confirmation, replacing the Google pop-up
- Sticky sidebar and search on the subscription list
- List view replaces grid selection, with an updated colour palette and animation
- Standalone analytics page

### Iteration 3 (`final-iteration`)
- Full migration from local storage to Supabase Auth and Postgres, with Row-Level Security
- Automatic renewal logic, including multi-month catch-up and month-end date handling
- Expanded analytics dashboard: spend by category, status split, top-cost ranking, upcoming renewals
- Dark and light theme toggle with a reduced-motion-aware transition
- Field-level form validation and modal accessibility improvements
- Native date-picker styling for the renewal-date field
- Export, import, and clear-all against Supabase
- File cleanup, dead code removal, and this README rewrite
- End-to-end manual testing against a live Supabase project

## Project Board and Tracking

Work items are tracked as Jira tickets (SCRUM-1 through SCRUM-41) and mirrored through GitHub issues, pull requests, and tagged releases for each iteration.
