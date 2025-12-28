"use client"

import * as React from "react"
import { 
  Home, 
  BarChart3, 
  Calculator, 
  Cloud, 
  Shield, 
  Target, 
  TrendingUp,
  Users,
  Settings,
  ChevronDown,
  Zap,
  Percent,
  Activity,
  DollarSign,
  PieChart,
  Circle
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// NFL submenu items
const nflItems = [
  {
    title: "Prop Lab",
    url: "/nfl/tools/prop-lab",
    icon: Calculator,
  },
  {
    title: "Prop Matrix",
    url: "/nfl/tools/prop-matrix",
    icon: Target,
  },
  {
    title: "Weather",
    url: "/nfl/tools/weather",
    icon: Cloud,
  },
  {
    title: "DVP",
    url: "/nfl/tools/dvp",
    icon: Shield,
  },
  {
    title: "End Zone",
    url: "/nfl/tools/endzone",
    icon: Target,
  },
  {
    title: "TD Report",
    url: "/nfl/tools/touchdown-report",
    icon: TrendingUp,
  },
  {
    title: "Correlation",
    url: "/nfl/tools/reverse-correlation",
    icon: BarChart3,
  },
  {
    title: "Parlay Builder",
    url: "/nfl/tools/parlay-builder",
    icon: Calculator,
  },
]

// NHL submenu items
const nhlItems = [
  {
    title: "Prop Lab",
    url: "/nhl/tools/prop-lab",
    icon: Calculator,
  },
  {
    title: "Goalie Report",
    url: "/nhl/tools/goalie-report",
    icon: Target,
  },
  {
    title: "The Market",
    url: "/nhl/tools/the-market",
    icon: TrendingUp,
  },
  {
    title: "Player vs Opp",
    url: "/nhl/tools/player-vs-opp",
    icon: BarChart3,
  },
]

// NBA submenu items (placeholder - coming soon)
const nbaItems = [
  {
    title: "Prop Lab",
    url: "/nba/tools/prop-lab",
    icon: Calculator,
  },
  {
    title: "Coming Soon",
    url: "#",
    icon: Activity,
  },
]

// MLB submenu items (placeholder - coming soon)
const mlbItems = [
  {
    title: "Prop Lab",
    url: "/mlb/tools/prop-lab",
    icon: Calculator,
  },
  {
    title: "Coming Soon",
    url: "#",
    icon: Circle,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <div className="size-4 font-bold">K</div>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">KrashBoard</span>
                  <span className="truncate text-xs">Sports Analytics</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Home - Simple button */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Home">
                  <Link href="/nfl">
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* NFL - Collapsible */}
              <Collapsible
                asChild
                defaultOpen={false}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="NFL">
                      <BarChart3 />
                      <span>NFL</span>
                      <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {nflItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.url}>
                              <subItem.icon />
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              
              {/* NHL - Collapsible */}
              <Collapsible
                asChild
                defaultOpen={false}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="NHL">
                      <Zap />
                      <span>NHL</span>
                      <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {nhlItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.url}>
                              <subItem.icon />
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              
              {/* NBA - Collapsible (Coming Soon) */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="NBA - Coming Soon" 
                  disabled
                  className="opacity-50 cursor-not-allowed"
                >
                  <Activity />
                  <span>NBA</span>
                  <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* MLB - Collapsible (Coming Soon) */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="MLB - Coming Soon" 
                  disabled
                  className="opacity-50 cursor-not-allowed"
                >
                  <Circle />
                  <span>MLB</span>
                  <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Calculators - Collapsible */}
              <Collapsible
                asChild
                defaultOpen={false}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Calculators">
                      <Calculator />
                      <span>Calculators</span>
                      <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/tools/calculators/vig">
                            <Calculator />
                            <span>Vig Calculator</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/tools/calculators/no-vig">
                            <Zap />
                            <span>No Vig Calculator</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/tools/calculators/expected-value">
                            <BarChart3 />
                            <span>Expected Value</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/tools/calculators/implied-probability">
                            <Percent />
                            <span>Implied Probability</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/tools/calculators/odds-converter">
                            <Calculator />
                            <span>Odds Converter</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/tools/calculators/arbitrage">
                            <TrendingUp />
                            <span>Arbitrage Calculator</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/tools/calculators/kelly">
                            <Target />
                            <span>Kelly Criterion</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/tools/calculators/parlay">
                            <Activity />
                            <span>Parlay Calculator</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/tools/calculators/point-spread">
                            <Target />
                            <span>Point Spread</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/tools/calculators/promo-converter">
                            <DollarSign />
                            <span>Promo Converter</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/tools/calculators/round-robin">
                            <PieChart />
                            <span>Round Robin</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
