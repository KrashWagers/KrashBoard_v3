"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, Square, CheckSquare } from "lucide-react"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  allLabel?: string
  allValue?: string
  className?: string
  inputClassName?: string
  /** When true, show active state (e.g. border/ring for active filter) */
  active?: boolean
  /** Min width of the dropdown content (default 220px). Use e.g. 280 for wider. */
  contentMinWidth?: string | number
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Search…",
  allLabel = "All",
  allValue = "all",
  className,
  inputClassName,
  active = false,
  contentMinWidth = "220px",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const displayLabel =
    value === allValue || !value
      ? allLabel
      : options.find((o) => o.value === value)?.label ?? value

  const filtered = React.useMemo(() => {
    if (!search.trim()) return options
    const q = search.trim().toLowerCase()
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    )
  }, [options, search])

  const handleSelect = (v: string) => {
    onValueChange(v)
    setOpen(false)
    setSearch("")
  }

  const contentWidth = typeof contentMinWidth === "number" ? `${contentMinWidth}px` : contentMinWidth

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-8 w-full min-w-[140px] items-center justify-between rounded-md border bg-[#0a0a0a] px-3 py-1.5 text-sm text-left focus:outline-none focus:ring-1 focus:ring-ring border-gray-600",
            active && "ring-1 ring-emerald-500/60 border-emerald-700/50",
            className
          )}
        >
          <span className="truncate">{displayLabel}</span>
          <span className="text-muted-foreground ml-1 shrink-0">▼</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="rounded-md border-gray-700 bg-[#171717] p-0"
        style={{ minWidth: contentWidth, width: "max-content" }}
      >
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false)
          }}
          className={cn("h-8 rounded-b-none border-0 border-b border-gray-700 rounded-t-md", inputClassName)}
          autoFocus
        />
        <div className="max-h-60 overflow-y-auto">
          <button
            type="button"
            className="flex w-full items-center gap-2 border-b border-gray-700/50 px-3 py-2.5 text-sm hover:bg-[#1f1f1f]"
            onClick={() => handleSelect(allValue)}
          >
            {value === allValue ? (
              <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden />
            ) : (
              <Square className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
            )}
            {allLabel}
          </button>
          {filtered.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="flex w-full items-center gap-2 border-b border-gray-700/50 px-3 py-2.5 text-sm last:border-b-0 hover:bg-[#1f1f1f]"
              onClick={() => handleSelect(opt.value)}
            >
              {value === opt.value ? (
                <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden />
              ) : (
                <Square className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
              )}
              {opt.label}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="border-b border-gray-700/50 px-3 py-4 text-center text-sm text-muted-foreground">
              No matches
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
