import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateToYYYYMMDD(dateInput: Date | string): string {
  if (typeof dateInput === "string") {
    // If it's already an ISO or date string, strip any time portion
    const clean = dateInput.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
    const parsed = new Date(dateInput);
    if (!isNaN(parsed.getTime())) {
      return formatDateToYYYYMMDD(parsed);
    }
    return dateInput;
  }
  const y = dateInput.getFullYear();
  const m = String(dateInput.getMonth() + 1).padStart(2, "0");
  const d = String(dateInput.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseYYYYMMDD(dateInput: string | Date): Date {
  if (dateInput instanceof Date) {
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
  }
  const cleanStr = String(dateInput).split("T")[0];
  const [y, m, d] = cleanStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function getTodayDateString(): string {
  return formatDateToYYYYMMDD(new Date());
}

export function getNextSunday(fromDateInput: string | Date): string {
  const date = parseYYYYMMDD(fromDateInput);
  const day = date.getDay(); // 0 is Sunday
  const daysUntilSunday = day === 0 ? 7 : (7 - day);
  date.setDate(date.getDate() + daysUntilSunday);
  return formatDateToYYYYMMDD(date);
}

export function getTomorrow(fromDateInput: string | Date): string {
  const date = parseYYYYMMDD(fromDateInput);
  date.setDate(date.getDate() + 1);
  return formatDateToYYYYMMDD(date);
}

export function getRelativeDateLabel(dateInput: string | Date): string {
  const today = getTodayDateString();
  const dateStr = formatDateToYYYYMMDD(dateInput);
  if (dateStr === today) return "Today";
  const tomorrow = getTomorrow(today);
  if (dateStr === tomorrow) return "Tomorrow";
  
  const target = parseYYYYMMDD(dateStr);
  const current = parseYYYYMMDD(today);
  const diffDays = Math.round((target.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === -1) return "Yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays < 7) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[target.getDay()];
  }
  return dateStr;
}

export const LEETCODE_TOPICS = [
  "Arrays & Hashing",
  "Two Pointers & Sliding Window",
  "Stack & Binary Search",
  "Linked List",
  "Trees",
  "Heap/Priority Queue & Backtracking",
  "Graphs",
  "DP (1D)",
  "DP (2D)/Intervals/Greedy"
] as const;

export type LeetCodeTopic = typeof LEETCODE_TOPICS[number];
