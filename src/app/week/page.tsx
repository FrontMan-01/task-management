"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import { TaskInstanceRecord } from "@/lib/task-service";
import {
  getTodayDateString,
  formatDateToYYYYMMDD,
  parseYYYYMMDD,
  cn,
} from "@/lib/utils";
import { TaskCard } from "@/components/TaskCard";
import { TimeLoggerModal } from "@/components/TimeLoggerModal";

export default function WeekPage() {
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [instances, setInstances] = useState<TaskInstanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLoggerInstance, setTimeLoggerInstance] = useState<TaskInstanceRecord | null>(null);

  // Generate 7-day calendar strip (Monday to Sunday around today)
  const todayDate = parseYYYYMMDD(todayStr);
  const currentDay = todayDate.getDay(); // 0 is Sun, 1 is Mon
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() + mondayOffset + i);
    const dateStr = formatDateToYYYYMMDD(d);
    return {
      dateStr,
      dayName: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()],
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
      isDeadline: dateStr === "2026-11-02",
    };
  });

  useEffect(() => {
    async function loadDateTasks() {
      setLoading(true);
      try {
        const res = await fetch(`/api/instances?date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          setInstances(data.instances || []);
        }
      } catch (err) {
        console.error("Failed to load instances:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDateTasks();
  }, [selectedDate]);

  async function handleToggle(instanceId: number) {
    setInstances((prev) =>
      prev.map((i) =>
        i.id === instanceId
          ? {
              ...i,
              status: i.status === "done" ? "pending" : "done",
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
      console.error("Failed to toggle:", err);
    }
  }

  async function handleSnooze(instanceId: number) {
    setInstances((prev) => prev.filter((i) => i.id !== instanceId));
    try {
      await fetch("/api/instances", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceId, action: "snooze" }),
      });
    } catch (err) {
      console.error("Failed to snooze:", err);
    }
  }

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

  const completed = instances.filter((i) => i.status === "done").length;
  const total = instances.length;

  return (
    <div className="flex-1 flex flex-col pt-safe">
      {/* Header */}
      <header className="px-5 pt-3 pb-3 border-b border-zinc-900 bg-black/60 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black tracking-tight text-white font-mono uppercase">
              WEEK VIEW
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              7-Day Cadence & Roadmap
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
            {completed}/{total} Done
          </span>
        </div>

        {/* 7-Day Calendar Strip */}
        <div className="grid grid-cols-7 gap-1.5 mt-3.5">
          {weekDays.map((wd) => {
            const isSelected = wd.dateStr === selectedDate;

            return (
              <button
                key={wd.dateStr}
                onClick={() => setSelectedDate(wd.dateStr)}
                className={cn(
                  "flex flex-col items-center py-2 px-1 rounded-xl transition-all active:scale-95 border",
                  isSelected
                    ? "bg-red-500 text-white border-red-400 shadow-md shadow-red-500/20"
                    : wd.isToday
                    ? "bg-zinc-900 text-zinc-200 border-red-500/40"
                    : "bg-[#0c0c10] text-zinc-400 border-zinc-800 hover:border-zinc-700"
                )}
              >
                <span className="text-[10px] font-mono uppercase font-semibold">
                  {wd.dayName}
                </span>
                <span
                  className={cn(
                    "text-sm font-black font-mono mt-0.5",
                    isSelected ? "text-white" : "text-zinc-200"
                  )}
                >
                  {wd.dayNumber}
                </span>
                {wd.isDeadline ? (
                  <Flame className="w-3 h-3 text-amber-300 mt-1" />
                ) : wd.isToday ? (
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1.5",
                      isSelected ? "bg-white" : "bg-red-500"
                    )}
                  />
                ) : (
                  <span className="w-1.5 h-1.5 mt-1.5" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Selected Day Task List */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Schedule for {selectedDate}
          </span>
          {selectedDate === "2026-11-02" && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 text-red-400" /> DEADLINE DAY
            </span>
          )}
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
        ) : instances.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-800 bg-[#0a0a0c]">
            <CheckCircle2 className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">No Tasks Scheduled</h4>
            <p className="text-xs text-zinc-500 mt-1">
              Zero scheduled tasks on this day.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {instances.map((inst) => (
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

      <TimeLoggerModal
        instance={timeLoggerInstance}
        isOpen={Boolean(timeLoggerInstance)}
        onClose={() => setTimeLoggerInstance(null)}
        onSaveTime={handleSaveTime}
      />
    </div>
  );
}
