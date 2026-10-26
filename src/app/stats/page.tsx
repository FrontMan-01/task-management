"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Flame,
  CheckCircle2,
  Clock,
  Download,
  Award,
  AlertTriangle,
} from "lucide-react";

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totals = stats?.totals || {};
  const categories = stats?.categories || [];
  const recentDays = stats?.recentDays || [];

  const doneCount = parseInt(totals.done_count || "0", 10);
  const totalCount = parseInt(totals.total || "0", 10);
  const totalMinutes = parseInt(totals.total_minutes || "0", 10);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const completionRate = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return (
    <div className="flex-1 flex flex-col pt-safe px-4 pb-6">
      {/* Header */}
      <header className="pt-3 pb-3 border-b border-zinc-900 bg-black/60 sticky top-0 z-40 backdrop-blur-md -mx-4 px-5 flex items-center justify-between">
        <div>
          <h1 className="text-base font-black tracking-tight text-white font-mono uppercase">
            STATS & REVIEW
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Discipline Metrics & Analytics
          </p>
        </div>

        <a
          href="/api/export"
          download
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono font-semibold border border-zinc-800 active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          Export JSON
        </a>
      </header>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="p-4 rounded-xl border border-zinc-800 bg-[#0c0c10]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400">
              Completion Rate
            </span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {completionRate}%
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {doneCount} of {totalCount} tasks completed
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-[#0c0c10]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-400">
              Focus Time Logged
            </span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {totalHours}h
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {totalMinutes} total minutes in flow
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-3">
          Category Execution
        </h3>

        <div className="space-y-2.5">
          {categories.map((cat: any) => {
            const count = parseInt(cat.count || "0", 10);
            const done = parseInt(cat.done_count || "0", 10);
            const pct = count === 0 ? 0 : Math.round((done / count) * 100);

            return (
              <div
                key={cat.category}
                className="p-3 rounded-xl border border-zinc-800/80 bg-[#0c0c10]"
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-zinc-200">{cat.category}</span>
                  <span className="font-mono text-zinc-400">
                    {done}/{count} ({pct}%)
                  </span>
                </div>
                {/* Visual Progress Track */}
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 14-Day Velocity History */}
      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-3">
          Daily History
        </h3>

        {recentDays.length === 0 ? (
          <div className="p-4 rounded-xl border border-zinc-800 bg-[#0c0c10] text-center text-xs text-zinc-500">
            No history recorded yet. Complete tasks to see velocity metrics.
          </div>
        ) : (
          <div className="space-y-2">
            {recentDays.map((d: any) => {
              const dTotal = parseInt(d.total || "0", 10);
              const dDone = parseInt(d.done_count || "0", 10);
              const dPct = dTotal === 0 ? 0 : Math.round((dDone / dTotal) * 100);

              return (
                <div
                  key={d.scheduled_date}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/60 bg-[#0c0c10] text-xs font-mono"
                >
                  <span className="text-zinc-300 font-medium">
                    {d.scheduled_date}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">
                      {dDone}/{dTotal}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        dPct === 100
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                          : dPct >= 50
                          ? "bg-amber-950 text-amber-400 border border-amber-800/40"
                          : "bg-red-950 text-red-400 border border-red-800/40"
                      }`}
                    >
                      {dPct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
