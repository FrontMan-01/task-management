# Roadmap: "DO OR DIE" Personal Task Tracker PWA

## Phase Overview
- [ ] **Phase 1: Project Setup & Durability Foundation**
  - Scaffold Next.js 14 App Router project with TypeScript and Tailwind CSS.
  - Setup PWA assets (`manifest.webmanifest`, `sw.js`, icons).
  - Configure Tailwind with OLED dark theme and mobile-native CSS tokens.
- [ ] **Phase 2: Database Layer, Seed Data & API Engine**
  - Define PostgreSQL schema (`src/lib/schema.sql`).
  - Implement unified database connector (`src/lib/db.ts`) with zero-config local fallback.
  - Populate Phase 1 & Phase 2 seed data (`src/lib/seed-data.ts`).
  - Implement API endpoints: `/api/tasks`, `/api/instances`, `/api/settings`, `/api/seed`, `/api/export`, `/api/auth/login`, `/api/auth/logout`.
- [ ] **Phase 3: Core UI Components & Mobile Shell**
  - Build Root layout with safe-area insets and dark theme.
  - Implement `BottomNav`, `ProgressRing`, `TaskCard`, `LeetCodeTracker`, `CrunchBanner`, `SundayCatchup`, `PushNotificationPrompt`, `TimeLoggerModal`.
  - Implement PIN pad on `/login`.
- [ ] **Phase 4: Views & Application Flow**
  - Implement Today View (`/`).
  - Implement Week View (`/week`).
  - Implement Backlog & Graveyard View (`/backlog`).
  - Implement Stats & Analytics View (`/stats`).
  - Implement Task & Settings Management View (`/manage`).
  - Wire single-user session authentication in `middleware.ts`.
- [ ] **Phase 5: Crons, Web Push, Automated Testing & Verification**
  - Implement `/api/cron/rollover` (with 2-week cap & graveyard escalation).
  - Implement `/api/cron/reminder` and Web Push subscriptions.
  - Configure `vercel.json` cron schedules.
  - Run verification test suite, type-check, and build verification.
  - Generate comprehensive README.md with Vercel and GitHub CI/CD documentation.
  - Commit all changes cleanly to Git.
