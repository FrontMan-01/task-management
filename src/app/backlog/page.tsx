"use client";

import { useState, useEffect } from "react";
import {
  Inbox,
  Skull,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Plus,
} from "lucide-react";
import { getTodayDateString } from "@/lib/utils";

interface AbandonedItem {
  id: number;
  task_id: number;
  title: string;
  category: string;
  priority: string;
  default_duration_minutes: number;
  notes: string | null;
  scheduled_date: string;
  roll_count: number;
}

interface LowPriorityTask {
  id: number;
  title: string;
  category: string;
  priority: string;
  default_duration_minutes: number;
  notes: string | null;
}

export default function BacklogPage() {
  const [abandoned, setAbandoned] = useState<AbandonedItem[]>([]);
  const [lowPriority, setLowPriority] = useState<LowPriorityTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string>("");

  useEffect(() => {
    loadBacklog();
  }, []);

  async function loadBacklog() {
    setLoading(true);
    try {
      const res = await fetch("/api/backlog");
      if (res.ok) {
        const data = await res.json();
        setAbandoned(data.abandonedInstances || []);
        setLowPriority(data.lowPriorityTasks || []);
      }
    } catch (err) {
      console.error("Failed to load backlog:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevive(instanceId: number) {
    try {
      const res = await fetch("/api/instances", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instanceId,
          action: "revive",
          targetDate: getTodayDateString(),
        }),
      });

      if (res.ok) {
        setAbandoned((prev) => prev.filter((i) => i.id !== instanceId));
        setActionMessage("Task revived and added to today's active checklist!");
        setTimeout(() => setActionMessage(""), 4000);
      }
    } catch (err) {
      console.error("Failed to revive task:", err);
    }
  }

  return (
    <div className="flex-1 flex flex-col pt-safe px-4 pb-6">
      {/* Header */}
      <header className="pt-3 pb-3 border-b border-zinc-900 bg-black/60 sticky top-0 z-40 backdrop-blur-md -mx-4 px-5">
        <h1 className="text-base font-black tracking-tight text-white font-mono uppercase">
          BACKLOG & GRAVEYARD
        </h1>
        <p className="text-xs text-zinc-400 font-mono mt-0.5">
          Low Priority Queue & 2-Week Escalations
        </p>
      </header>

      {actionMessage && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Section 1: The Graveyard (Abandoned Tasks) */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400">
              <Skull className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                The Graveyard ({abandoned.length})
              </h2>
              <span className="text-[11px] text-zinc-500 font-mono">
                Tasks abandoned after 2 missed Sundays
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-24 rounded-xl bg-zinc-900/40 border border-zinc-800 animate-pulse" />
        ) : abandoned.length === 0 ? (
          <div className="p-5 text-center rounded-xl border border-zinc-800 bg-[#0c0c10] text-xs text-zinc-500">
            No abandoned tasks in the graveyard. High discipline maintained!
          </div>
        ) : (
          <div className="space-y-2.5">
            {abandoned.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-zinc-800/80 bg-[#0c0c10] flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-zinc-200 leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-900/50">
                      Abandoned on {item.scheduled_date}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {item.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRevive(item.id)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  Revive
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Low Priority Backlog */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Inbox className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
              Low Priority Tasks ({lowPriority.length})
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono">
              Non-essential or parked items
            </span>
          </div>
        </div>

        {loading ? (
          <div className="h-24 rounded-xl bg-zinc-900/40 border border-zinc-800 animate-pulse" />
        ) : lowPriority.length === 0 ? (
          <div className="p-5 text-center rounded-xl border border-zinc-800 bg-[#0c0c10] text-xs text-zinc-500">
            No low-priority backlog items currently registered.
          </div>
        ) : (
          <div className="space-y-2.5">
            {lowPriority.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl border border-zinc-800/80 bg-[#0c0c10]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-200">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-zinc-400">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-blue-400">
                        {task.category}
                      </span>
                      <span>{task.default_duration_minutes}m duration</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
