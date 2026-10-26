"use client";

interface ProgressRingProps {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({
  completed,
  total,
  size = 110,
  strokeWidth = 9,
}: ProgressRingProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Color changes dynamically based on completion rate
  let strokeColor = "#ef4444"; // red (low)
  let glowColor = "rgba(239, 68, 68, 0.3)";
  if (percentage >= 100) {
    strokeColor = "#10b981"; // emerald (100%)
    glowColor = "rgba(16, 185, 129, 0.4)";
  } else if (percentage >= 50) {
    strokeColor = "#f59e0b"; // amber (in progress)
    glowColor = "rgba(245, 158, 11, 0.3)";
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1a1a22"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress bar */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          style={{
            transition: "stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1), stroke 300ms ease",
            filter: `drop-shadow(0 0 6px ${glowColor})`,
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        <span className="text-2xl font-black tracking-tight text-white font-mono">
          {percentage}%
        </span>
        <span className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase">
          {completed}/{total} Done
        </span>
      </div>
    </div>
  );
}
