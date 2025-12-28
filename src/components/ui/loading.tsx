import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

interface LoadingBarProps extends React.HTMLAttributes<HTMLDivElement> {
  progress?: number
  animated?: boolean
}

const LoadingBar = React.forwardRef<HTMLDivElement, LoadingBarProps>(
  ({ className, progress = 0, animated = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full h-2 bg-muted rounded-full overflow-hidden",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full bg-brand-gradient transition-all duration-300",
            animated && "animate-loading-bar"
          )}
          style={{ width: animated ? "100%" : `${progress}%` }}
        />
      </div>
    )
  }
)
LoadingBar.displayName = "LoadingBar"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, width, height, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-md bg-muted",
          className
        )}
        style={{ width, height }}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

interface GlobalLoadingProps {
  message?: string
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ 
  message = "Loading your dashboard..." 
}) => {
  return (
    <div className="fixed inset-0 bg-brand-gradient flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-24 h-24 mb-8 animate-pulse">
          <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">K</span>
          </div>
        </div>
        <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-white rounded-full animate-loading-bar" />
        </div>
        <p className="text-white text-sm">{message}</p>
      </div>
    </div>
  )
}

export { LoadingSpinner, LoadingBar, Skeleton, GlobalLoading }
