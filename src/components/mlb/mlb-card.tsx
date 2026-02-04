import * as React from "react"
import { cn } from "@/lib/utils"

type MlbCardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "muted" | "hero"
}

export function MlbCard({ className, variant = "default", ...props }: MlbCardProps) {
  return (
    <div
      className={cn(
        "mlb-card",
        variant === "muted" && "mlb-card-muted",
        variant === "hero" && "mlb-card-hero",
        className
      )}
      {...props}
    />
  )
}

export const MlbCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5", className)} {...props} />
))
MlbCardHeader.displayName = "MlbCardHeader"

export const MlbCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("leading-none tracking-tight", className)} {...props} />
))
MlbCardTitle.displayName = "MlbCardTitle"

export const MlbCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-muted-foreground", className)} {...props} />
))
MlbCardDescription.displayName = "MlbCardDescription"

export const MlbCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props} />
))
MlbCardContent.displayName = "MlbCardContent"

export const MlbCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
MlbCardFooter.displayName = "MlbCardFooter"
