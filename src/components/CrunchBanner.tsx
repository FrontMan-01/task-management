"use client";

import { AlertTriangle, Clock, Flame } from "lucide-react";
import { getTodayDateString, parseYYYYMMDD } from "@/lib/utils";

export function CrunchBanner() {
  const todayStr = getTodayDateString();
  const deadlineStr = "2026-11-02";

  // Check if we are in or past Crunch Week
  const today = parseYYYYMMDD(todayStr);
  const deadline = parseYYYYMMDD(deadlineStr);
  const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Past crunch week deadline
    return null;
  }

  const isDeadlineDay = diffDays === 0;

  return (
    <div className="mx-4 mb-4 rounded-xl border border-red-500/40 bg-gradient-to-r from-red-950/40 via-red-900/20 to-zinc-950 p-3.5 relative overflow-hidden shadow-lg shadow-red-950/20">
      <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-16 h-16 bg-red-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0 mt-0.5">
          {isDeadlineDay ? (
            <Flame className="w-5 h-5 animate-bounce text-red-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
              {isDeadlineDay ? "CRITICAL: DEADLINE TODAY" : "PHASE 1: CRUNCH WEEK"}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-semibold border border-red-500/30">
              {isDeadlineDay ? "FINAL HOURS" : `${diffDays}d REMAINING`}
            </span>
          </div>

          <h3 className="text-sm font-bold text-white mt-1 leading-snug">
            Customer Churn Model Ship Deadline
          </h3>

          <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
            {isDeadlineDay
              ? "All milestones culminate today. Finalize Streamlit app, model evaluation, and ship to production."
              : "Non-recurring daily milestones active. Complete daily targets to avoid rollover backlog before Nov 2."}
          </p>

          <div className="mt-2.5 flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              Target: Nov 2, 2026
            </span>
            <span>•</span>
            <span className="text-amber-400/90 font-medium">Zero Slop Allowed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
