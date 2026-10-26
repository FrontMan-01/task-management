"use client";

import { AlertOctagon, RotateCcw, Clock } from "lucide-react";
import { TaskInstanceRecord } from "@/lib/task-service";
import { getRelativeDateLabel } from "@/lib/utils";

interface SundayCatchupProps {
  rolledTasks: TaskInstanceRecord[];
  onToggle: (instanceId: number) => void;
  onSnooze: (instanceId: number) => void;
  onOpenTimeLogger: (instance: TaskInstanceRecord) => void;
}

export function SundayCatchup({
  rolledTasks,
  onToggle,
  onSnooze,
  onOpenTimeLogger,
}: SundayCatchupProps) {
  if (rolledTasks.length === 0) return null;

  return (
    <div className="mx-4 mb-5 rounded-xl border border-red-900/60 bg-gradient-to-b from-[#140a0a] to-[#0c0c10] p-3.5 shadow-md">
      <div className="flex items-center justify-between pb-2 border-b border-red-950/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">
              Sunday Catch-Up Queue
            </h3>
            <span className="text-[11px] text-zinc-400">
              {rolledTasks.length} rolled debt item{rolledTasks.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/40">
          CLEAR DEBT
        </span>
      </div>

      <div className="mt-3 space-y-2.5">
        {rolledTasks.map((inst) => {
          const isDone = inst.status === "done";
          const isUrgent = inst.roll_count >= 2;

          return (
            <div
              key={inst.id}
              className={`p-3 rounded-lg border transition-all ${
                isUrgent
                  ? "border-red-500/80 bg-red-950/20 shadow-sm shadow-red-950/40"
                  : "border-zinc-800 bg-zinc-900/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <button
                    onClick={() => onToggle(inst.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? "bg-emerald-500 border-emerald-400 text-black font-bold"
                        : "border-zinc-700 hover:border-zinc-500 bg-zinc-800/60"
                    }`}
                  >
                    {isDone && <span className="text-xs">✓</span>}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold leading-snug break-words ${
                        isDone ? "line-through text-zinc-500" : "text-white"
                      }`}
                    >
                      {inst.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] font-mono">
                      {isUrgent && (
                        <span className="px-1.5 py-0.5 rounded bg-red-500 text-white font-black uppercase tracking-wider flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" />
                          FINAL ROLL (ABANDON RISK)
                        </span>
                      )}
                      {inst.rolled_from_date && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400/90 border border-zinc-700/50">
                          From: {getRelativeDateLabel(inst.rolled_from_date)}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400">
                        {inst.default_duration_minutes || 30}m
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onOpenTimeLogger(inst)}
                    className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    title="Log time spent"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSnooze(inst.id)}
                    className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-indigo-400"
                    title="Snooze to tomorrow"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
