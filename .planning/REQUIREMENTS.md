# Requirements: "DO OR DIE" Personal Task Tracker PWA

## Functional Requirements
1. **Phase 1: Crunch Week Engine (Oct 26 - Nov 2, 2026)**
   - Specific non-recurring tasks scheduled across each day (Oct 26 to Nov 2).
   - Prominent "Crunch Week" banner alerting user of the Nov 2 Customer Churn Model deadline.
   - Alternating CS50 lectures/problem sets, Pwn.college modules, Cold-mail-bot, NLM + PyTorch, and LeetCode daily practice.

2. **Phase 2: Steady State Engine (Nov 3, 2026 onward)**
   - Weekday vs. Weekend recurring schedule templates.
   - Rotating 2.5-hour deep-work blocks.
   - LeetCode 9-topic rotational tracker with active topic display and advance controls.

3. **Sunday Rollover Engine & 2-Week Escalation Cap**
   - Uncompleted weekday tasks automatically roll over to Sunday's Catch-up section.
   - Tasks carry `roll_count` and `rolled_from_date`.
   - First roll: `roll_count = 1`.
   - Second roll (if missed on Sunday): moves to next Sunday with `roll_count = 2` and prominent 🚨 URGENT badge.
   - Third miss (`roll_count >= 2`): permanently marked `abandoned` and moved to Backlog / Graveyard view to prevent zombie backlog overwhelm.

4. **Snooze-to-Tomorrow Engine**
   - User-initiated intentional deferral.
   - Marks today's instance as `status = 'snoozed'` and creates tomorrow's instance with `status = 'pending'`.
   - Midnight rollover skips snoozed instances so they don't land in Sunday Catch-up prematurely.

5. **Web Push Notifications**
   - VAPID keypair generation and subscription storage in `push_subscriptions`.
   - Service Worker push listener with interactive system notifications.
   - Evening pending task check cron (21:30) and Sunday morning nudge (09:00).
   - In-app toggle on `/manage` or Settings.

6. **Views & UX**
   - `/` (Today): Hero progress indicator, task list sorted by priority, Crunch banner, LeetCode tracker, Sunday catch-up block, daily note reflection.
   - `/week`: 7-day horizontal calendar strip with daily completion rates and day selection.
   - `/backlog`: Paused, low-priority tasks and Abandoned Graveyard items with "Revive to Today" action.
   - `/stats`: Streak counts, category completion distribution, total hours logged, JSON data export.
   - `/manage`: Add task, edit task, archive task, toggle push notifications, idempotent database seed.
   - `/login`: Mobile-optimized PIN numeric keypad with secure session cookie.

## Non-Functional Requirements
- **Mobile Native Feel**: Safe area padding (`env(safe-area-inset-top)` / `bottom`), `100dvh`, no sticky hover, tap feedback (`:active scale(0.97)`), font sizes >= 16px to prevent iOS auto-zoom.
- **OLED Dark Aesthetic**: Deep blacks (`#000000`, `#09090b`), high contrast typography, crisp borders, purposeful status colors.
- **Reliability & Offline**: PWA service worker caching static assets, robust error boundaries, graceful DB fallback.
