"use client"

interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
}

export function CircularProgress({ 
  percentage, 
  size = 120, 
  strokeWidth = 8,
  color 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  // Determine color based on percentage if not provided
  const progressColor = color || (
    percentage >= 60 ? '#22c55e' : 
    percentage >= 40 ? '#3b82f6' : 
    '#ef4444'
  )

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: progressColor }}>
          {percentage}%
        </span>
        <span className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
          Hit Rate
        </span>
      </div>
    </div>
  )
}

