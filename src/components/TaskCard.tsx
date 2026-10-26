"use client";

import { useState } from "react";
import {
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  Timer,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { TaskInstanceRecord } from "@/lib/task-service";
import { getRelativeDateLabel, cn } from "@/lib/utils";

interface TaskCardProps {
  instance: TaskInstanceRecord;
  onToggle: (instanceId: number) => void;
  onSnooze: (instanceId: number) => void;
  onOpenTimeLogger: (instance: TaskInstanceRecord) => void;
}

export function TaskCard({
  instance,
  onToggle,
  onSnooze,
  onOpenTimeLogger,
}: TaskCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [snoozePending, setSnoozePending] = useState(false);

  const isDone = instance.status === "done";
  const isSnoozed = instance.status === "snoozed";
  const isUrgent = instance.roll_count >= 2;

  // Priority color accents
  const priorityColor =
    instance.priority === "high"
      ? "border-l-red-500 text-red-400 bg-red-500/10"
      : instance.priority === "medium"
      ? "border-l-amber-500 text-amber-400 bg-amber-500/10"
      : "border-l-blue-500 text-blue-400 bg-blue-500/10";

  async function handleSnooze() {
    setSnoozePending(true);
    try {
      await onSnooze(instance.id);
    } finally {
      setSnoozePending(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800/80 bg-[#0c0c10] border-l-4 transition-all duration-200 overflow-hidden shadow-sm",
        priorityColor.split(" ")[0], // Use the border-l class
        isDone && "opacity-60 bg-[#08080a] border-zinc-800",
        isUrgent && !isDone && "ring-1 ring-red-500/50 bg-red-950/10"
      )}
    >
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          {/* Checkbox + Title Area */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <button
              onClick={() => onToggle(instance.id)}
              className="mt-0.5 shrink-0 text-zinc-500 hover:text-white transition-colors active:scale-90"
              aria-label={isDone ? "Mark pending" : "Mark done"}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20 stroke-[2.5]" />
              ) : (
                <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400 stroke-[2]" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <h4
                className={cn(
                  "text-sm font-semibold leading-snug break-words transition-all",
                  isDone
                    ? "line-through text-zinc-500 font-normal"
                    : "text-zinc-100"
                )}
              >
                {instance.title}
              </h4>

              {/* Tags & Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {/* 2nd Roll Urgent Alert */}
                {isUrgent && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-red-600 text-white flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" />
                    2ND ROLL: URGENT
                  </span>
                )}

                {/* Rolled from source tag */}
                {instance.rolled_from_date && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800/90 text-amber-400 border border-zinc-700/50">
                    From {getRelativeDateLabel(instance.rolled_from_date)}
                  </span>
                )}

                {/* Category Pill */}
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide bg-zinc-800/60 text-zinc-400 border border-zinc-800">
                  {instance.category}
                </span>

                {/* Duration Badge */}
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400 flex items-center gap-1 bg-zinc-900 border border-zinc-800/80">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  {instance.default_duration_minutes || 30}m
                </span>

                {/* Logged actual duration */}
                {instance.actual_minutes ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {instance.actual_minutes}m logged
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            {/* Log Time Action */}
            <button
              onClick={() => onOpenTimeLogger(instance)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              title="Log focus time"
            >
              <Timer className="w-4 h-4" />
            </button>

            {/* Snooze Action */}
            {!isDone && (
              <button
                onClick={handleSnooze}
                disabled={snoozePending}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800/80 transition-colors disabled:opacity-50"
                title="Snooze to tomorrow"
              >
                <RotateCcw
                  className={cn(
                    "w-4 h-4",
                    snoozePending && "animate-spin text-indigo-400"
                  )}
                />
              </button>
            )}

            {/* Notes Toggle */}
            {instance.notes && (
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
                title="View notes"
              >
                {showNotes ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Expandable Notes Area */}
        {showNotes && instance.notes && (
          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 text-xs text-zinc-300 leading-relaxed font-sans bg-zinc-900/40 p-2.5 rounded-lg">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block mb-1">
              Field Notes
            </span>
            {instance.notes}
          </div>
        )}
      </div>
    </div>
  );
}
