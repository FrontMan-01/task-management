"use client";

import { useState } from "react";
import { Clock, X, Check } from "lucide-react";
import { TaskInstanceRecord } from "@/lib/task-service";

interface TimeLoggerModalProps {
  instance: TaskInstanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveTime: (instanceId: number, minutes: number) => Promise<void>;
}

const PRESET_MINUTES = [15, 30, 45, 60, 90, 120];

export function TimeLoggerModal({
  instance,
  isOpen,
  onClose,
  onSaveTime,
}: TimeLoggerModalProps) {
  const [minutes, setMinutes] = useState<number>(instance?.actual_minutes || instance?.default_duration_minutes || 30);
  const [saving, setSaving] = useState<boolean>(false);

  if (!isOpen || !instance) return null;

  async function handleSave() {
    if (minutes <= 0) return;
    setSaving(true);
    try {
      await onSaveTime(instance!.id, minutes);
      onClose();
    } catch (err) {
      console.error("Failed to save time:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#0e0e12] p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Log Focus Time</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <p className="text-xs text-zinc-400 mb-1">Target Task:</p>
          <p className="text-sm font-semibold text-zinc-200 line-clamp-2">
            {instance.title}
          </p>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2">
            Quick Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_MINUTES.map((m) => (
              <button
                key={m}
                onClick={() => setMinutes(m)}
                type="button"
                className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                  minutes === m
                    ? "bg-amber-500 text-black border border-amber-400"
                    : "bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50"
                }`}
              >
                {m} mins
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
            Custom Duration (Minutes)
          </label>
          <input
            type="number"
            min={1}
            max={720}
            value={minutes || ""}
            onChange={(e) => setMinutes(parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Save button */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || minutes <= 0}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {saving ? "Saving..." : "Save Time"}
          </button>
        </div>
      </div>
    </div>
  );
}
