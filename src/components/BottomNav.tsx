"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crosshair,
  CalendarDays,
  Inbox,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Today", href: "/", icon: Crosshair },
  { label: "Week", href: "/week", icon: CalendarDays },
  { label: "Backlog", href: "/backlog", icon: Inbox },
  { label: "Stats", href: "/stats", icon: BarChart3 },
  { label: "Manage", href: "/manage", icon: SlidersHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide on login screen
  if (pathname === "/login") {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#09090b]/95 backdrop-blur-md border-t border-[#23232c] select-none"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-2 h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all duration-150 active:scale-95",
                isActive
                  ? "text-red-500 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-colors",
                  isActive && "bg-red-500/10"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform",
                    isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"
                  )}
                />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
