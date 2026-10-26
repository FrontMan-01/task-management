import { query, initDatabase } from "./db";
import {
  PHASE_1_MILESTONES,
  PHASE_2_STEADY_STATE_RULES,
  SeedTask,
} from "./seed-data";
import {
  getTodayDateString,
  getTomorrow,
  getNextSunday,
  parseYYYYMMDD,
  formatDateToYYYYMMDD,
} from "./utils";

export interface TaskRecord {
  id: number;
  title: string;
  category: string;
  priority: "high" | "medium" | "low";
  is_recurring: boolean;
  recurrence_rule: string | null;
  default_duration_minutes: number;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export interface TaskInstanceRecord {
  id: number;
  task_id: number;
  scheduled_date: string;
  status: "pending" | "done" | "missed" | "snoozed" | "abandoned";
  completed_at: string | null;
  rolled_from_date: string | null;
  roll_count: number;
  snoozed_to_date: string | null;
  actual_minutes: number | null;
  created_at: string;
  // Joined task fields
  title?: string;
  category?: string;
  priority?: "high" | "medium" | "low";
  default_duration_minutes?: number;
  notes?: string | null;
  is_recurring?: boolean;
}

export function normalizeInstance(row: any): TaskInstanceRecord {
  return {
    ...row,
    scheduled_date: formatDateToYYYYMMDD(row.scheduled_date),
    rolled_from_date: row.rolled_from_date ? formatDateToYYYYMMDD(row.rolled_from_date) : null,
    snoozed_to_date: row.snoozed_to_date ? formatDateToYYYYMMDD(row.snoozed_to_date) : null,
    is_recurring: Boolean(row.is_recurring),
  };
}

export async function runSeeder(): Promise<{ seeded: boolean; message: string }> {
  await initDatabase();

  // Check if already seeded
  const existingCountRes = await query("SELECT COUNT(*) as count FROM tasks");
  const count = parseInt(existingCountRes.rows[0]?.count || "0", 10);

  if (count > 0) {
    // Already seeded, ensure settings exist
    await ensureDefaultSettings();
    return { seeded: false, message: `Database already seeded with ${count} tasks.` };
  }

  await ensureDefaultSettings();

  // 1. Seed Phase 1 Milestones
  for (const task of PHASE_1_MILESTONES) {
    const insertTaskRes = await query(
      `INSERT INTO tasks (title, category, priority, is_recurring, recurrence_rule, default_duration_minutes, notes, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING id`,
      [
        task.title,
        task.category,
        task.priority,
        Boolean(task.is_recurring),
        task.recurrence_rule || null,
        task.default_duration_minutes,
        task.notes || null,
      ]
    );

    const taskId = insertTaskRes.rows[0].id;

    if (task.scheduled_date) {
      await query(
        `INSERT INTO task_instances (task_id, scheduled_date, status, roll_count)
         VALUES ($1, $2, 'pending', 0)`,
        [taskId, task.scheduled_date]
      );
    }
  }

  // 2. Seed Phase 2 Steady State Recurring Rules
  for (const task of PHASE_2_STEADY_STATE_RULES) {
    await query(
      `INSERT INTO tasks (title, category, priority, is_recurring, recurrence_rule, default_duration_minutes, notes, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
      [
        task.title,
        task.category,
        task.priority,
        Boolean(task.is_recurring),
        task.recurrence_rule || null,
        task.default_duration_minutes,
        task.notes || null,
      ]
    );
  }

  return { seeded: true, message: "Successfully seeded Phase 1 milestones and Phase 2 recurring rules." };
}

async function ensureDefaultSettings() {
  await query(
    `INSERT INTO app_settings (key, value)
     VALUES ('leetcode_current_topic_index', '0')
     ON CONFLICT (key) DO NOTHING`
  );
  await query(
    `INSERT INTO app_settings (key, value)
     VALUES ('app_version', '2.0.0')
     ON CONFLICT (key) DO NOTHING`
  );
  await query(
    `INSERT INTO app_settings (key, value)
     VALUES ('phase1_end_date', '2026-11-02')
     ON CONFLICT (key) DO NOTHING`
  );
}

export async function getInstancesForDate(dateStr: string): Promise<TaskInstanceRecord[]> {
  await initDatabase();

  // If recurring tasks exist and we're looking at a date, populate recurring instances if none exist
  await maybeGenerateRecurringInstances(dateStr);

  const res = await query<TaskInstanceRecord>(
    `SELECT ti.*, t.title, t.category, t.priority, t.default_duration_minutes, t.notes, t.is_recurring
     FROM task_instances ti
     JOIN tasks t ON ti.task_id = t.id
     WHERE ti.scheduled_date = $1::DATE AND ti.status != 'abandoned'
     ORDER BY 
       CASE 
         WHEN ti.roll_count >= 2 THEN 0
         WHEN t.priority = 'high' THEN 1
         WHEN t.priority = 'medium' THEN 2
         ELSE 3
       END,
       ti.id ASC`,
    [dateStr]
  );

  return res.rows.map(normalizeInstance);
}

async function maybeGenerateRecurringInstances(dateStr: string): Promise<void> {
  // If instances already exist for this date, do nothing
  const countRes = await query(
    `SELECT COUNT(*) as count FROM task_instances WHERE scheduled_date = $1::DATE`,
    [dateStr]
  );
  if (parseInt(countRes.rows[0]?.count || "0", 10) > 0) {
    return;
  }

  // Determine day of week
  const dateObj = parseYYYYMMDD(dateStr);
  const day = dateObj.getDay(); // 0 = Sun, 6 = Sat
  const isWeekend = day === 0 || day === 6;
  const isSaturday = day === 6;
  const isSunday = day === 0;
  const isWeekday = !isWeekend;

  // Find matching recurring tasks
  const tasksRes = await query<TaskRecord>(
    `SELECT * FROM tasks WHERE active = true AND is_recurring = true`
  );

  for (const task of tasksRes.rows) {
    let matches = false;
    if (task.recurrence_rule === "daily") matches = true;
    else if (task.recurrence_rule === "weekday" && isWeekday) matches = true;
    else if (task.recurrence_rule === "weekend" && isWeekend) matches = true;
    else if (task.recurrence_rule === "saturday" && isSaturday) matches = true;
    else if (task.recurrence_rule === "sunday" && isSunday) matches = true;

    if (matches) {
      await query(
        `INSERT INTO task_instances (task_id, scheduled_date, status, roll_count)
         VALUES ($1, $2, 'pending', 0)`,
        [task.id, dateStr]
      );
    }
  }
}

export async function toggleInstanceCompletion(
  instanceId: number
): Promise<TaskInstanceRecord | null> {
  const currentRes = await query<TaskInstanceRecord>(
    `SELECT * FROM task_instances WHERE id = $1`,
    [instanceId]
  );
  if (currentRes.rows.length === 0) return null;

  const current = currentRes.rows[0];
  const newStatus = current.status === "done" ? "pending" : "done";
  const completedAt = newStatus === "done" ? new Date().toISOString() : null;

  const updateRes = await query<TaskInstanceRecord>(
    `UPDATE task_instances
     SET status = $1, completed_at = $2
     WHERE id = $3
     RETURNING *`,
    [newStatus, completedAt, instanceId]
  );

  return updateRes.rows[0] ? normalizeInstance(updateRes.rows[0]) : null;
}

export async function snoozeInstanceToTomorrow(
  instanceId: number
): Promise<{ original: TaskInstanceRecord; tomorrow: TaskInstanceRecord }> {
  const currentRes = await query<TaskInstanceRecord>(
    `SELECT * FROM task_instances WHERE id = $1`,
    [instanceId]
  );
  if (currentRes.rows.length === 0) throw new Error("Instance not found");

  const original = normalizeInstance(currentRes.rows[0]);
  const tomorrow = getTomorrow(original.scheduled_date);

  // 1. Mark original instance as snoozed
  const updateRes = await query<TaskInstanceRecord>(
    `UPDATE task_instances
     SET status = 'snoozed', snoozed_to_date = $1
     WHERE id = $2
     RETURNING *`,
    [tomorrow, instanceId]
  );

  // 2. Create tomorrow's pending instance with preserved roll_count and original source date
  const insertRes = await query<TaskInstanceRecord>(
    `INSERT INTO task_instances (task_id, scheduled_date, status, rolled_from_date, roll_count)
     VALUES ($1, $2, 'pending', $3, $4)
     RETURNING *`,
    [
      original.task_id,
      tomorrow,
      original.rolled_from_date || original.scheduled_date,
      original.roll_count,
    ]
  );

  return {
    original: normalizeInstance(updateRes.rows[0]),
    tomorrow: normalizeInstance(insertRes.rows[0]),
  };
}

export async function updateInstanceActualMinutes(
  instanceId: number,
  minutes: number
): Promise<TaskInstanceRecord> {
  const updateRes = await query<TaskInstanceRecord>(
    `UPDATE task_instances
     SET actual_minutes = $1
     WHERE id = $2
     RETURNING *`,
    [minutes, instanceId]
  );
  return normalizeInstance(updateRes.rows[0]);
}

/**
 * Midnight Rollover Engine
 * - Finds all instances before today with status = 'pending' (skips 'snoozed')
 * - If roll_count >= 2: marks as 'abandoned' (moved to Graveyard/Backlog, stops rolling)
 * - If roll_count < 2:
 *   - marks current instance as 'missed'
 *   - creates new instance on next Sunday with roll_count = roll_count + 1
 */
export async function executeMidnightRollover(todayStr?: string): Promise<{
  rolledCount: number;
  abandonedCount: number;
  details: any[];
}> {
  const today = todayStr || getTodayDateString();
  const nextSunday = getNextSunday(today);

  // Select all overdue pending instances
  const overdueRes = await query<TaskInstanceRecord>(
    `SELECT ti.*, t.title
     FROM task_instances ti
     JOIN tasks t ON ti.task_id = t.id
     WHERE ti.scheduled_date < $1::DATE AND ti.status = 'pending'`,
    [today]
  );

  let rolledCount = 0;
  let abandonedCount = 0;
  const details = [];

  for (const inst of overdueRes.rows) {
    if (inst.roll_count >= 2) {
      // 3rd miss -> terminal state: ABANDONED (graveyard)
      await query(
        `UPDATE task_instances SET status = 'abandoned' WHERE id = $1`,
        [inst.id]
      );
      abandonedCount++;
      details.push({
        id: inst.id,
        title: inst.title,
        action: "abandoned",
        reason: "Exceeded 2-week rollover cap",
      });
    } else {
      // Mark current as missed
      await query(
        `UPDATE task_instances SET status = 'missed' WHERE id = $1`,
        [inst.id]
      );

      // Create new instance for next Sunday
      const newRollCount = inst.roll_count + 1;
      const originalSource = formatDateToYYYYMMDD(inst.rolled_from_date || inst.scheduled_date);

      await query(
        `INSERT INTO task_instances (task_id, scheduled_date, status, rolled_from_date, roll_count)
         VALUES ($1, $2::DATE, 'pending', $3::DATE, $4)`,
        [inst.task_id, nextSunday, originalSource, newRollCount]
      );

      rolledCount++;
      details.push({
        id: inst.id,
        title: inst.title,
        action: "rolled_to_sunday",
        targetDate: nextSunday,
        rollCount: newRollCount,
      });
    }
  }

  return { rolledCount, abandonedCount, details };
}

export async function getBacklogTasks(): Promise<{
  lowPriorityTasks: any[];
  abandonedInstances: any[];
}> {
  await initDatabase();

  const lowPriorityRes = await query(
    `SELECT t.* FROM tasks t
     WHERE t.active = true AND t.priority = 'low'
     ORDER BY t.id DESC`
  );

  const abandonedRes = await query(
    `SELECT ti.*, t.title, t.category, t.priority, t.default_duration_minutes, t.notes
     FROM task_instances ti
     JOIN tasks t ON ti.task_id = t.id
     WHERE ti.status = 'abandoned'
     ORDER BY ti.scheduled_date DESC`
  );

  return {
    lowPriorityTasks: lowPriorityRes.rows,
    abandonedInstances: abandonedRes.rows.map(normalizeInstance),
  };
}

export async function reviveAbandonedInstance(instanceId: number, targetDate?: string) {
  const target = targetDate || getTodayDateString();
  const currentRes = await query<TaskInstanceRecord>(
    `SELECT * FROM task_instances WHERE id = $1`,
    [instanceId]
  );
  if (currentRes.rows.length === 0) throw new Error("Instance not found");

  const current = currentRes.rows[0];

  // Create fresh instance for target date with reset roll_count
  const insertRes = await query(
    `INSERT INTO task_instances (task_id, scheduled_date, status, roll_count)
     VALUES ($1, $2, 'pending', 0)
     RETURNING *`,
    [current.task_id, target]
  );

  return normalizeInstance(insertRes.rows[0]);
}

export async function getStatsSummary() {
  await initDatabase();

  const totalInstancesRes = await query(
    `SELECT 
       COUNT(*) as total,
       SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done_count,
       SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missed_count,
       SUM(CASE WHEN status = 'snoozed' THEN 1 ELSE 0 END) as snoozed_count,
       SUM(CASE WHEN status = 'abandoned' THEN 1 ELSE 0 END) as abandoned_count,
       SUM(COALESCE(actual_minutes, 0)) as total_minutes
     FROM task_instances`
  );

  const categoryBreakdownRes = await query(
    `SELECT t.category, COUNT(*) as count,
       SUM(CASE WHEN ti.status = 'done' THEN 1 ELSE 0 END) as done_count
     FROM task_instances ti
     JOIN tasks t ON ti.task_id = t.id
     GROUP BY t.category`
  );

  const recentDaysRes = await query(
    `SELECT scheduled_date,
       COUNT(*) as total,
       SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done_count
     FROM task_instances
     GROUP BY scheduled_date
     ORDER BY scheduled_date DESC
     LIMIT 14`
  );

  return {
    totals: totalInstancesRes.rows[0] || {},
    categories: categoryBreakdownRes.rows || [],
    recentDays: recentDaysRes.rows || [],
  };
}
