"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Code2, RotateCw, Check } from "lucide-react";
import { LEETCODE_TOPICS } from "@/lib/utils";

interface LeetCodeTrackerProps {
  onTopicChange?: (newIndex: number) => void;
}

export function LeetCodeTracker({ onTopicChange }: LeetCodeTrackerProps) {
  const [topicIndex, setTopicIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    async function loadTopicIndex() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          const savedIndex = parseInt(data.settings?.leetcode_current_topic_index || "0", 10);
          setTopicIndex(isNaN(savedIndex) ? 0 : savedIndex % LEETCODE_TOPICS.length);
        }
      } catch (err) {
        console.warn("Failed to load LeetCode topic setting:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTopicIndex();
  }, []);

  async function updateTopic(newIndex: number) {
    const validIndex = newIndex % LEETCODE_TOPICS.length;
    setTopicIndex(validIndex);
    setIsUpdating(true);

    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "leetcode_current_topic_index",
          value: validIndex.toString(),
        }),
      });
      if (onTopicChange) onTopicChange(validIndex);
    } catch (err) {
      console.error("Failed to persist topic index:", err);
    } finally {
      setIsUpdating(false);
    }
  }

  const currentTopic = LEETCODE_TOPICS[topicIndex];
  const nextTopic = LEETCODE_TOPICS[(topicIndex + 1) % LEETCODE_TOPICS.length];

  return (
    <div className="mx-4 mb-4 rounded-xl border border-zinc-800 bg-[#0c0c10] p-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            LeetCode Rotation
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-amber-400">
          TOPIC {topicIndex + 1} OF 9
        </span>
      </div>

      {/* Active Topic Banner */}
      <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-amber-950/20 via-zinc-900 to-zinc-900 border border-amber-500/20">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold block">
              Active Focus
            </span>
            <h4 className="text-sm font-bold text-white truncate mt-0.5">
              {loading ? "Loading..." : currentTopic}
            </h4>
          </div>

          <button
            onClick={() => updateTopic(topicIndex + 1)}
            disabled={isUpdating}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono text-xs font-semibold border border-amber-500/30 active:scale-95 transition-all"
            title="Advance to next rotation topic"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isUpdating ? "animate-spin" : ""}`} />
            Advance
          </button>
        </div>

        <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="truncate">Up Next: {nextTopic}</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-amber-400/90 hover:underline shrink-0 text-[11px] font-medium"
          >
            {isExpanded ? "Hide List" : "Change Topic"}
          </button>
        </div>
      </div>

      {/* Expandable Topic Selector */}
      {isExpanded && (
        <div className="mt-3 space-y-1 pt-2 border-t border-zinc-800/60 max-h-48 overflow-y-auto pr-1">
          {LEETCODE_TOPICS.map((topic, idx) => {
            const isSelected = idx === topicIndex;
            return (
              <button
                key={topic}
                onClick={() => {
                  updateTopic(idx);
                  setIsExpanded(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span className="truncate">
                  {idx + 1}. {topic}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
