# ⚡ DO OR DIE — Personal Task Tracker PWA

> **High-Stakes, Disciplined Personal Checklist & Habit Tracker PWA**  
> Mobile-first Progressive Web App built for iPhone and Android home screens with offline caching, Web Push notifications, automated Sunday rollover, and single-user PIN protection.

---

## 🎯 Architectural Overview

The application enforces strict operational discipline across two phases:
1. **Phase 1: "Crunch Week" (Oct 26 – Nov 2, 2026)**: Non-recurring, dated daily milestones with a hard deadline on Nov 2 for the **Customer Churn Model Ship**.
2. **Phase 2: "Steady State" (Nov 3, 2026 onward)**: Daily recurring weekday/weekend engines, 2.5-hour deep-work blocks, LeetCode 9-topic rotational tracker, and the **Sunday Rollover Engine** with a 2-week escalation cap.
3. **Continuous Deployment via GitHub**: Pushing to the `main` branch automatically triggers zero-downtime production deployment on Vercel.

---

## 🏛️ Key Features & Revisions

### 1. 🔔 Web Push Notifications (Evening & Sunday Reminders)
- **VAPID Keypair Management**: Automatically initialized in `app_settings` or configured via environment variables (`NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`).
- **Service Worker (`public/sw.js`)**: Background push event handler displaying interactive system notifications.
- **In-App Toggle**: 1-tap notification enable/disable switch located in `/manage`.
- **Scheduled Automated Crons**:
  - **Evening Pending Check (21:30)**: Alerts you if pending tasks remain for today: *"⚡ DO OR DIE: You have X tasks pending for today. Finish strong."*
  - **Sunday Catch-Up Nudge (09:00)**: Alerts you on Sunday morning if rolled-over tasks exist: *"🎯 Sunday Catch-up: X rolled-over tasks are waiting for you today."*

### 2. ⏰ Snooze-to-Tomorrow Engine (Intentional Deferral vs. Missed)
- **Distinction**:
  - **Missed**: The day ended without action → rolled automatically to Sunday.
  - **Snoozed**: Deliberately pushed to tomorrow ("not relevant today" / schedule shift).
- **Behavior**:
  - Current task instance is marked `status = 'snoozed'` with `snoozed_to_date = tomorrow`.
  - A new instance is created for tomorrow with `status = 'pending'`.
  - Midnight rollover ignores snoozed tasks, ensuring intentional deferrals never pollute the Sunday rollover queue.

### 3. 🧩 LeetCode 9-Topic Rotation Storage
- Persisted in the `app_settings` table under key `'leetcode_current_topic_index'`.
- Canonical 9-topic rotation:
  1. `Arrays & Hashing`
  2. `Two Pointers & Sliding Window`
  3. `Stack & Binary Search`
  4. `Linked List`
  5. `Trees`
  6. `Heap/Priority Queue & Backtracking`
  7. `Graphs`
  8. `DP (1D)`
  9. `DP (2D)/Intervals/Greedy`
- Tap **Advance** to move to the next topic, or pick any topic directly from the in-app selector.

### 4. 🔄 Rollover Policy: 2-Week Cap & Escalation to Avoid "Zombie Stack"
- Avoids infinite backlog paralysis:
  - **First Roll (Weekday → Sunday)**: Marked `status = 'missed'`, new instance created for Sunday with `roll_count = 1`.
  - **Second Roll (Missed Sunday → Next Sunday)**: Created with `roll_count = 2`, rendered with an **🚨 URGENT (2nd Roll)** badge and prioritized at the top of the queue.
  - **Terminal State (Missed on 2nd Sunday)**: Permanently marked `status = 'abandoned'` and moved to the **Graveyard (`/backlog`)**. It stops clogging daily routines but can be manually revived with 1 tap.

---

## 🗄️ Database Schema (`src/lib/schema.sql`)

- **`tasks`**: Master task definitions (title, category, priority, recurrence rules, default duration, notes, active).
- **`task_instances`**: Daily execution records (task_id, scheduled_date, status: pending/done/missed/snoozed/abandoned, completed_at, rolled_from_date, roll_count, snoozed_to_date, actual_minutes).
- **`daily_notes`**: End-of-day reflection notes.
- **`app_settings`**: Key-value store (LeetCode topic index, VAPID keys, app version).
- **`push_subscriptions`**: Web Push subscription endpoints and auth keys.

---

## 🗄️ Database Architecture (Pure PostgreSQL 16)

The application uses **100% pure PostgreSQL 16** across both local development and cloud production:
- **Cloud Deployment**: When `POSTGRES_URL` or `DATABASE_URL` is set, connects via `pg.Pool` (with SSL) to Vercel Postgres, Neon, or Supabase.
- **Local Development / Testing**: When running locally without a cloud connection string, automatically runs an embedded, zero-config real **PostgreSQL 16 WASM engine (`@electric-sql/pglite`)** in `.data/pglite`.
- **Zero Dialect Divergence**: All queries, data types (`BOOLEAN`, `DATE`, `TIMESTAMPTZ`, `SERIAL`), indices, and test suites run against the exact same PostgreSQL 16 SQL planner and syntax.

---

## 🔒 Security Architecture

### 1. Cryptographic Salted-Hash PIN & Constant-Time Verification
- **Zero Plaintext Comparison**: PIN checks use native cryptographic scrypt hashing (`crypto.scryptSync(pin, salt, 64)`) combined with `crypto.timingSafeEqual` to eliminate timing side-channel attacks.
- **Production Fail-Secure Lockout**: If deployed to production (`NODE_ENV === 'production'`) without a custom PIN, the application **strictly rejects the default `1234`** and locks the endpoint until a secure PIN is configured.
- **Generate Salted Hash for Vercel**:
  ```bash
  npm run hash-pin <your-secure-pin>
  # Example output: APP_PIN_HASH="4f82a...:9b2c1..."
  ```
- **Tamper-Proof Session Tokens**: User sessions are authenticated via HMAC-SHA256 signed tokens containing a 30-day expiration timestamp, verified by edge middleware.

### 2. Fixed, Locked VAPID Keypair for Web Push
- Push notification subscriptions rely on a consistent VAPID public/private keypair.
- Dynamic key generation has been removed. The locked keypair is stored permanently in environment variables, ensuring that mobile subscriptions are never invalidated across git pushes or deployments.

---

## 🚀 Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Run the real PostgreSQL 16 verification suite
npm run test:engine

# 3. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser. (In local development, default PIN is `1234`).

---

## 📱 Mobile Installation (PWA)

### iOS (Safari):
1. Open the deployed application URL in Safari.
2. Tap the **Share** button (box with upward arrow).
3. Scroll down and tap **Add to Home Screen**.
4. Launch from your home screen for full-screen standalone mode with safe area insets.

### Android (Chrome):
1. Open the deployed URL in Chrome.
2. Tap the menu (three dots) or the **Install App** prompt.
3. Tap **Install**.

---

## ☁️ Production Deployment on Vercel

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "feat: complete DO OR DIE task tracker PWA v2"
git push origin main
```

### Step 2: Import into Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your repository: `FrontMan-01/task-management`.
3. Framework Preset: **Next.js**.

### Step 3: Provision PostgreSQL on Vercel
1. In your Vercel project dashboard, navigate to the **Storage** tab.
2. Click **Create Database** → **Postgres** (or connect your Neon / Supabase database).
3. Connect the database to your project. This automatically sets `POSTGRES_URL` in your environment variables.

### Step 4: Configure Mandatory Environment Variables in Vercel
| Variable | Description | Recommended Value |
|---|---|---|
| `POSTGRES_URL` | PostgreSQL connection string | *Injected automatically by Vercel Postgres* |
| `APP_PIN_HASH` | Salted scrypt hash for master PIN | Generated via `npm run hash-pin <pin>` |
| `APP_PIN` | Alternative: Plain PIN (hashed dynamically with constant-time check) | Your custom 4-to-6 digit PIN (never leave on 1234) |
| `SESSION_SECRET` | HMAC secret for tamper-proof session tokens | Random 32+ character string |
| `CRON_SECRET` | Secret token to authorize Vercel cron endpoints | Random 32+ character string |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Fixed VAPID public key for Web Push | Generated via `npm run generate-vapid` |
| `VAPID_PRIVATE_KEY` | Fixed VAPID private key for Web Push | Generated via `npm run generate-vapid` |

> [!IMPORTANT]
> **Production Lockout**: In production (`NODE_ENV === 'production'`), the app will strictly block `1234`. You must set either `APP_PIN_HASH` or a custom `APP_PIN`.

### Step 5: Initialize the Production Database
Once deployed, trigger the seed endpoint once to initialize PostgreSQL schema, Phase 1 dated milestones, and Phase 2 steady-state routines:
```bash
curl -X POST https://your-deployment.vercel.app/api/seed
```

---

## ⏰ Automated Cron Jobs (`vercel.json`)

Vercel automatically triggers:
1. `POST /api/cron/rollover` at `00:00 UTC` daily.
2. `POST /api/cron/reminder?type=evening` at `21:30 UTC` daily.
3. `POST /api/cron/reminder?type=sunday` at `09:00 UTC` every Sunday.

---

## 🧪 Verification & Testing

Run the automated engine test suite on the real PostgreSQL 16 engine:
```bash
npm run test:engine
```
Verifies:
- Seeder execution and schema initialization on pure PostgreSQL.
- Today's instance retrieval and date normalization (`YYYY-MM-DD`).
- Snooze engine (original marked `snoozed`, pending created for tomorrow).
- 2-Week Rollover Policy (Roll 1 to Sunday, Roll 2 to Next Sunday URGENT, Roll 3 terminal escalation to ABANDONED in Graveyard).
- Cryptographic PIN security (salted scrypt hash verification, constant-time checks, production default-PIN lockout).
- HMAC-SHA256 session token generation and tamper detection.
