-- DO OR DIE PostgreSQL Database Schema

-- Tasks definition table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    recurrence_rule VARCHAR(100),
    default_duration_minutes INTEGER NOT NULL DEFAULT 30,
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task instances table with snooze & rollover tracking
CREATE TABLE IF NOT EXISTS task_instances (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'done', 'missed', 'snoozed', 'abandoned')),
    completed_at TIMESTAMPTZ,
    rolled_from_date DATE,
    roll_count INTEGER NOT NULL DEFAULT 0,
    snoozed_to_date DATE,
    actual_minutes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily notes for end-of-day reflection
CREATE TABLE IF NOT EXISTS daily_notes (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Key-value settings for LeetCode topic & user preferences
CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_instances_date ON task_instances(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_instances_status ON task_instances(status);
CREATE INDEX IF NOT EXISTS idx_instances_task ON task_instances(task_id);
