"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Flame,
  CheckCircle,
  Calendar,
  Sparkles,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { TaskInstanceRecord } from "@/lib/task-service";
import { getTodayDateString } from "@/lib/utils";
import { ProgressRing } from "@/components/ProgressRing";
import { TaskCard } from "@/components/TaskCard";
import { CrunchBanner } from "@/components/CrunchBanner";
import { LeetCodeTracker } from "@/components/LeetCodeTracker";
import { SundayCatchup } from "@/components/SundayCatchup";
import { TimeLoggerModal } from "@/components/TimeLoggerModal";

export default function TodayPage() {
  const [instances, setInstances] = useState<TaskInstanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyNote, setDailyNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [timeLoggerInstance, setTimeLoggerInstance] = useState<TaskInstanceRecord | null>(null);

  const todayStr = getTodayDateString();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [instRes, noteRes] = await Promise.all([
        fetch(`/api/instances?date=${todayStr}`),
        fetch(`/api/notes?date=${todayStr}`),
      ]);

      if (instRes.ok) {
        const data = await instRes.json();
        setInstances(data.instances || []);
      }
      if (noteRes.ok) {
        const noteData = await noteRes.json();
        setDailyNote(noteData.content || "");
      }
    } catch (err) {
      console.error("Failed to load today data:", err);
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle task check/uncheck
  async function handleToggle(instanceId: number) {
    // Optimistic UI update
    setInstances((prev) =>
      prev.map((i) =>
        i.id === instanceId
          ? {
              ...i,
              status: i.status === "done" ? "pending" : "done",
              completed_at: i.status === "done" ? null : new Date().toISOString(),
            }
          : i
      )
    );

    try {
      await fetch("/api/instances", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceId, action: "toggle" }),
      });
    } catch (err) {
      console.error("Failed to toggle instance:", err);
      loadData();
    }
  }

  // Handle Snooze to Tomorrow
  async function handleSnooze(instanceId: number) {
    // Remove from today's list optimistically
    setInstances((prev) => prev.filter((i) => i.id !== instanceId));

    try {
      const res = await fetch("/api/instances", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceId, action: "snooze" }),
      });
      if (!res.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Failed to snooze instance:", err);
      loadData();
    }
  }

  // Handle Save Time Logged
  async function handleSaveTime(instanceId: number, minutes: number) {
    setInstances((prev) =>
      prev.map((i) => (i.id === instanceId ? { ...i, actual_minutes: minutes } : i))
    );

    await fetch("/api/instances", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instanceId, action: "log_time", minutes }),
    });
  }

  // Handle Daily Note save
  async function handleSaveNote() {
    setNoteSaving(true);
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayStr, content: dailyNote }),
      });
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setNoteSaving(false);
    }
  }

  // Filter tasks into regular today vs rolled-over tasks
  const rolledTasks = instances.filter((i) => Boolean(i.rolled_from_date));
  const regularTasks = instances.filter((i) => !i.rolled_from_date);

  const completedCount = instances.filter((i) => i.status === "done").length;
  const totalCount = instances.length;
  const allClear = totalCount > 0 && completedCount === totalCount;

  // Format header date string
  const todayDate = new Date();
  const dateFormatted = todayDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex-1 flex flex-col pt-safe">
      {/* Top Header */}
      <header className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-zinc-900 bg-black/60 sticky top-0 z-40 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h1 className="text-base font-black tracking-tight text-white font-mono uppercase">
              DO OR DIE
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">{dateFormatted}</p>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 active:scale-95 transition-all"
          title="Refresh tasks"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>

      {/* Hero Progress Summary */}
      <div className="p-5 flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase text-zinc-500 font-semibold tracking-wider">
            Daily Target
          </span>
          <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">
            {allClear ? "All Clear! Zero Debt" : "Execute & Close"}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-[210px] leading-relaxed">
            {allClear
              ? "Every mission accomplished for today. Log reflection and recharge."
              : `${totalCount - completedCount} tasks remaining. No slop, finish strong.`}
          </p>
        </div>

        <ProgressRing completed={completedCount} total={totalCount} />
      </div>

      {/* Phase 1 Crunch Week Alert */}
      <CrunchBanner />

      {/* LeetCode Topic Rotational Focus */}
      <LeetCodeTracker />

      {/* Sunday Catch-up Rollover Queue (if debt items exist) */}
      <SundayCatchup
        rolledTasks={rolledTasks}
        onToggle={handleToggle}
        onSnooze={handleSnooze}
        onOpenTimeLogger={(inst) => setTimeLoggerInstance(inst)}
      />

      {/* Today Main Task List */}
      <div className="px-4 mb-5 flex-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Today&apos;s Checklist ({regularTasks.length})
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            {completedCount}/{totalCount} Completed
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-20 rounded-xl bg-zinc-900/40 border border-zinc-800/50 animate-pulse"
              />
            ))}
          </div>
        ) : regularTasks.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-800 bg-[#0a0a0c]">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">Deck Is Completely Clear</h4>
            <p className="text-xs text-zinc-500 mt-1">
              No tasks scheduled for today. Add custom tasks in the Manage tab.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {regularTasks.map((inst) => (
              <TaskCard
                key={inst.id}
                instance={inst}
                onToggle={handleToggle}
                onSnooze={handleSnooze}
                onOpenTimeLogger={(inst) => setTimeLoggerInstance(inst)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Daily Reflection Note */}
      <div className="mx-4 mb-6 rounded-xl border border-zinc-800 bg-[#0c0c10] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
              Daily Reflection Note
            </h3>
          </div>
          <button
            onClick={handleSaveNote}
            disabled={noteSaving}
            className="text-[11px] font-mono text-red-400 hover:text-red-300 font-bold active:scale-95 transition-all"
          >
            {noteSaving ? "Saving..." : "Save Note"}
          </button>
        </div>
        <textarea
          rows={3}
          value={dailyNote}
          onChange={(e) => setDailyNote(e.target.value)}
          placeholder="Briefly log what went well, bottlenecks encountered, and tomorrow's main priority..."
          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 resize-none font-sans leading-relaxed"
        />
      </div>

      {/* Time Logger Modal */}
      <TimeLoggerModal
        instance={timeLoggerInstance}
        isOpen={Boolean(timeLoggerInstance)}
        onClose={() => setTimeLoggerInstance(null)}
        onSaveTime={handleSaveTime}
      />
    </div>
  );
}
