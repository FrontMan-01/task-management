"use client";

import { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  RotateCw,
  Database,
  Lock,
  LogOut,
  Sparkles,
  Check,
} from "lucide-react";
import { PushNotificationPrompt } from "@/components/PushNotificationPrompt";

export default function ManagePage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string>("");

  // New task form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Projects");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState("weekday");
  const [scheduleToday, setScheduleToday] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks?active=true");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          priority,
          default_duration_minutes: duration,
          notes,
          is_recurring: isRecurring,
          recurrence_rule: isRecurring ? recurrenceRule : null,
          schedule_for_today: scheduleToday,
        }),
      });

      if (res.ok) {
        setTitle("");
        setNotes("");
        setShowAddForm(false);
        setActionMessage("Task created successfully!");
        setTimeout(() => setActionMessage(""), 4000);
        loadTasks();
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchiveTask(id: number) {
    if (!confirm("Are you sure you want to archive this task definition?")) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Failed to archive task:", err);
    }
  }

  async function handleTriggerRollover() {
    try {
      const res = await fetch("/api/cron/rollover", { method: "POST" });
      const data = await res.json();
      setActionMessage(
        `Midnight rollover executed: ${data.rolledCount} tasks rolled, ${data.abandonedCount} abandoned.`
      );
      setTimeout(() => setActionMessage(""), 5000);
    } catch (err) {
      console.error("Rollover trigger error:", err);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="flex-1 flex flex-col pt-safe px-4 pb-8">
      {/* Header */}
      <header className="pt-3 pb-3 border-b border-zinc-900 bg-black/60 sticky top-0 z-40 backdrop-blur-md -mx-4 px-5 flex items-center justify-between">
        <div>
          <h1 className="text-base font-black tracking-tight text-white font-mono uppercase">
            MANAGEMENT & CONFIG
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Tasks, Push Engine & System Actions
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-mono font-bold active:scale-95 transition-all shadow-md shadow-red-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddForm ? "Close" : "New Task"}
        </button>
      </header>

      {actionMessage && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Add Task Modal / Accordion */}
      {showAddForm && (
        <form
          onSubmit={handleCreateTask}
          className="mt-4 p-4 rounded-xl border border-zinc-800 bg-[#0c0c10] space-y-3.5 animate-fade-in"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
            Create Custom Task Definition
          </h3>

          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build Pwn challenge exploit"
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
              >
                <option value="LeetCode">LeetCode</option>
                <option value="CS50">CS50</option>
                <option value="Security">Security</option>
                <option value="Projects">Projects</option>
                <option value="ML/AI">ML/AI</option>
                <option value="Routine">Routine</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-2.5 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
              >
                <option value="high">High (Red)</option>
                <option value="medium">Medium (Amber)</option>
                <option value="low">Low (Blue)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                Duration (Mins)
              </label>
              <input
                type="number"
                min={5}
                max={480}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10) || 30)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-mono"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-red-500 w-4 h-4"
                />
                <span className="text-xs text-zinc-300">Recurring Rule</span>
              </label>
            </div>
          </div>

          {isRecurring && (
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                Recurrence Frequency
              </label>
              <select
                value={recurrenceRule}
                onChange={(e) => setRecurrenceRule(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-mono"
              >
                <option value="daily">Daily (Every day)</option>
                <option value="weekday">Weekdays (Mon-Fri)</option>
                <option value="weekend">Weekends (Sat-Sun)</option>
                <option value="saturday">Saturday Only</option>
                <option value="sunday">Sunday Only</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key specifications, problem references, etc."
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-sans resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={scheduleToday}
              onChange={(e) => setScheduleToday(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-700 text-red-500 w-4 h-4"
            />
            <span className="text-xs text-zinc-300">
              Immediately add to today&apos;s active checklist
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold font-mono active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Create Task"}
          </button>
        </form>
      )}

      {/* Web Push Notification Settings */}
      <div className="mt-5">
        <PushNotificationPrompt />
      </div>

      {/* Manual Controls & System Maintenance */}
      <div className="mt-6 p-4 rounded-xl border border-zinc-800 bg-[#0c0c10] space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          System Maintenance
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleTriggerRollover}
            className="p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-left active:scale-95 transition-all"
          >
            <div className="flex items-center gap-1.5 text-zinc-200 text-xs font-bold font-mono">
              <RotateCw className="w-3.5 h-3.5 text-amber-400" />
              Run Rollover
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Trigger midnight rollover cron now
            </p>
          </button>

          <button
            onClick={handleLogout}
            className="p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-left active:scale-95 transition-all"
          >
            <div className="flex items-center gap-1.5 text-zinc-200 text-xs font-bold font-mono">
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              Lock / Logout
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              End authenticated PIN session
            </p>
          </button>
        </div>
      </div>

      {/* Registered Task Definitions */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Active Task Definitions ({tasks.length})
          </h3>
          <span className="text-[11px] text-zinc-500 font-mono">
            Templates & Milestones
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-14 rounded-lg bg-zinc-900/40 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-lg border border-zinc-800/80 bg-[#0c0c10] flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-zinc-200 font-semibold truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-zinc-400">
                    <span className="uppercase text-amber-400">
                      {task.category}
                    </span>
                    <span>•</span>
                    <span>{task.default_duration_minutes}m</span>
                    {task.is_recurring ? (
                      <>
                        <span>•</span>
                        <span className="text-indigo-400">
                          {task.recurrence_rule}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                <button
                  onClick={() => handleArchiveTask(task.id)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                  title="Archive task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
