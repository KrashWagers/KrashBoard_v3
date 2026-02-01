"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Home, 
  BarChart3, 
  Calculator, 
  Cloud, 
  Shield, 
  Target, 
  TrendingUp,
  Users,
  Activity,
  Settings,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "NFL",
    href: "/nfl",
    icon: BarChart3,
    children: [
      { title: "Prop Lab", href: "/nfl/tools/prop-lab", icon: Calculator },
      { title: "Prop Matrix", href: "/nfl/tools/prop-matrix", icon: Target },
      { title: "Weather", href: "/nfl/tools/weather", icon: Cloud },
      { title: "DVP", href: "/nfl/tools/dvp", icon: Shield },
      { title: "End Zone", href: "/nfl/tools/endzone", icon: Target },
      { title: "TD Report", href: "/nfl/tools/touchdown-report", icon: TrendingUp },
      { title: "Correlation", href: "/nfl/tools/reverse-correlation", icon: BarChart3 },
      { title: "Parlay Builder", href: "/nfl/tools/parlay-builder", icon: Calculator },
    ],
  },
  {
    title: "NHL",
    href: "/nhl",
    icon: Activity,
    children: [
      { title: "Scores", href: "/nhl/scores", icon: Activity },
      { title: "Prop Lab", href: "/nhl/tools/prop-lab", icon: Calculator },
    ],
  },
  {
    title: "Stats",
    href: "/nfl/stats",
    icon: BarChart3,
    children: [
      { title: "Players", href: "/nfl/stats/players", icon: Users },
      { title: "Teams", href: "/nfl/stats/teams", icon: BarChart3 },
      { title: "Standings", href: "/nfl/stats/standings", icon: TrendingUp },
      { title: "Depth Charts", href: "/nfl/stats/depth-charts", icon: Users },
      { title: "Lineups", href: "/nfl/stats/lineups", icon: Users },
    ],
  },
  {
    title: "Tools",
    href: "/tools",
    icon: Calculator,
    children: [
      { title: "Calculators", href: "/tools/calculators", icon: Calculator },
      { title: "Roster", href: "/tools/roster", icon: Users },
    ],
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const NavItem = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const isActive = pathname === item.href
    const hasChildren = item.children && item.children.length > 0
    const [isExpanded, setIsExpanded] = React.useState(false)

    return (
      <div className="space-y-1">
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            level > 0 && "ml-4",
            isActive
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent",
            level === 0 && "text-base"
          )}
          onClick={() => {
            if (!hasChildren) {
              onClose()
            }
          }}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{item.title}</span>
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={(e) => {
                e.preventDefault()
                setIsExpanded(!isExpanded)
              }}
            >
              <span className="sr-only">Toggle</span>
              {isExpanded ? "−" : "+"}
            </Button>
          )}
        </Link>
        {hasChildren && isExpanded && item.children && (
          <div className="space-y-1">
            {item.children.map((child) => (
              <NavItem key={child.href} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sidebar-primary rounded-md flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-lg text-sidebar-foreground">KrashBoard</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4 overflow-y-auto scrollbar-thin">
            {navigation.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
