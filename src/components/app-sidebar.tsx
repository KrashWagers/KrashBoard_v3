"use client"

import * as React from "react"
import { 
  BarChart3, 
  Calculator, 
  Cloud, 
  Shield, 
  Target, 
  TrendingUp,
  Users,
  Settings,
  LogIn,
  LogOut,
  ChevronDown,
  Zap,
  Percent,
  Activity,
  DollarSign,
  PieChart
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { SportsSelector } from "@/components/sports-selector"
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
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type NavIcon = React.ComponentType<{ className?: string }> | string

type NavItem = {
  title: string
  url: string
  icon: NavIcon
}

type SportNav = {
  id: string
  name: string
  root: string
  homeIcon: NavIcon
  items: NavItem[]
  tools?: NavItem[]
  stats?: NavItem[]
  team?: NavItem[]
  player?: NavItem[]
}

const navIconClassName = "h-5 w-5"
const navIconSize = 20
const isIconPath = (icon: NavIcon): icon is string => typeof icon === "string"

// NFL submenu items
const nflItems: NavItem[] = [
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

// NHL main items
const nhlItems: NavItem[] = [
  {
    title: "Scores",
    url: "/nhl/scores",
    icon: "/Images/Icons/NHL_scoreboard.svg",
  },
  {
    title: "Lineups",
    url: "/lineups",
    icon: "/Images/Icons/lineups.svg",
  },
  {
    title: "Prop Lab",
    url: "/nhl/tools/prop-lab",
    icon: "/Images/Icons/prop_lab.svg",
  },
  {
    title: "Market",
    url: "/nhl/tools/the-market",
    icon: "/Images/Icons/market.svg",
  },
]

// NHL tools
const nhlTools: NavItem[] = [
  {
    title: "Player vs Opp",
    url: "/nhl/tools/player-vs-opp",
    icon: "/Images/Icons/NHL_vs.svg",
  },
  {
    title: "High Danger Shooters",
    url: "/nhl/tools/high-danger-shooters",
    icon: "/Images/Icons/NHL_high_danger.svg",
  },
  {
    title: "Goalie Report",
    url: "/nhl/tools/goalie-report",
    icon: "/Images/Icons/NHL_goalies.svg",
  },
]

// NHL stats
const nhlStats: NavItem[] = [
  {
    title: "Team Gamelogs",
    url: "/nhl/tools/team-gamelogs",
    icon: "/Images/Icons/NHL_team_gamelogs.svg",
  },
  {
    title: "Team Rankings",
    url: "/nhl/tools/team-rankings",
    icon: "/Images/Icons/NHL_team_rankings.svg",
  },
]

// MLB main items
const mlbItems: NavItem[] = [
  {
    title: "Scores",
    url: "/mlb/scores",
    icon: Activity,
  },
  {
    title: "Lineups",
    url: "/mlb/lineups",
    icon: Users,
  },
  {
    title: "Weather Report",
    url: "/mlb/weather-report",
    icon: Cloud,
  },
  {
    title: "Prop Lab",
    url: "/mlb/prop-lab",
    icon: Calculator,
  },
  {
    title: "Market",
    url: "/mlb/market",
    icon: TrendingUp,
  },
]

const mlbTools: NavItem[] = [
  {
    title: "Player vs Opp",
    url: "/mlb/tools/player-vs-opp",
    icon: Target,
  },
  {
    title: "Barrel Boys",
    url: "/mlb/tools/barrel-boys",
    icon: BarChart3,
  },
  {
    title: "Pitcher Report",
    url: "/mlb/tools/pitcher-report",
    icon: Shield,
  },
  {
    title: "Calculators",
    url: "/mlb/tools/calculators",
    icon: Calculator,
  },
]

const mlbTeam: NavItem[] = [
  {
    title: "Team Gamelogs",
    url: "/mlb/team/gamelogs",
    icon: BarChart3,
  },
  {
    title: "Team Rankings",
    url: "/mlb/team/rankings",
    icon: TrendingUp,
  },
]

const mlbPlayer: NavItem[] = [
  {
    title: "Player Gamelogs",
    url: "/mlb/player/gamelogs",
    icon: Users,
  },
  {
    title: "Player Rankings",
    url: "/mlb/player/rankings",
    icon: TrendingUp,
  },
  {
    title: "Player Percentiles",
    url: "/mlb/player/percentiles",
    icon: Percent,
  },
]

const sports: SportNav[] = [
  {
    id: "nfl",
    name: "NFL",
    root: "/nfl",
    homeIcon: "/Images/Icons/football.svg",
    items: nflItems,
  },
  {
    id: "nhl",
    name: "NHL",
    root: "/nhl",
    homeIcon: "/Images/Icons/hockey.svg",
    items: nhlItems,
    tools: nhlTools,
    stats: nhlStats,
  },
  {
    id: "nba",
    name: "NBA",
    root: "/nba",
    homeIcon: "/Images/Icons/basketball.svg",
    items: [],
  },
  {
    id: "mlb",
    name: "MLB",
    root: "/mlb",
    homeIcon: "/Images/Icons/baseball.svg",
    items: mlbItems,
    tools: mlbTools,
    team: mlbTeam,
    player: mlbPlayer,
  },
] as const

export function AppSidebar() {
  const pathname = usePathname()
  const [userEmail, setUserEmail] = React.useState<string | null>(null)
  const [authLoading, setAuthLoading] = React.useState(false)
  const activeSport =
    sports.find((sport) => pathname.startsWith(sport.root)) ?? sports[0]
  const isActivePath = (url: string, exact = false) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(`${url}/`)

  React.useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    setAuthLoading(true)
    try {
      const supabase = createSupabaseBrowserClient()
      await supabase.auth.signOut()
      setUserEmail(null)
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border/60 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/Images/Brand/KW Logo PNG.png"
                  alt="KrashBoard"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="font-bold text-lg">KrashBoard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-4 pb-4 pt-2 lg:hidden">
          <SportsSelector />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Home - Global */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Home"
                  isActive={isActivePath(activeSport.root, true)}
                >
                  <Link href={activeSport.root}>
                    {isIconPath(activeSport.homeIcon) ? (
                      <Image
                        src={activeSport.homeIcon}
                        alt={`${activeSport.name} home icon`}
                        width={navIconSize}
                        height={navIconSize}
                        className={navIconClassName}
                      />
                    ) : (
                      <activeSport.homeIcon className={navIconClassName} />
                    )}
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Active Sport Pages */}
              {activeSport.items.map((subItem) => (
                <SidebarMenuItem key={subItem.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={subItem.title}
                    isActive={isActivePath(subItem.url)}
                  >
                    <Link href={subItem.url}>
                      {isIconPath(subItem.icon) ? (
                        <Image
                          src={subItem.icon}
                          alt={`${subItem.title} icon`}
                          width={navIconSize}
                          height={navIconSize}
                          className={navIconClassName}
                        />
                      ) : (
                        <subItem.icon className={navIconClassName} />
                      )}
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {activeSport.tools && activeSport.tools.length > 0 && (
                <>
                  <SidebarGroupLabel className="mt-3">Tools</SidebarGroupLabel>
                  {activeSport.tools.map((toolItem) => (
                    <SidebarMenuItem key={toolItem.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={toolItem.title}
                        isActive={isActivePath(toolItem.url)}
                      >
                        <Link href={toolItem.url}>
                          {isIconPath(toolItem.icon) ? (
                            <Image
                              src={toolItem.icon}
                              alt={`${toolItem.title} icon`}
                              width={navIconSize}
                              height={navIconSize}
                              className={navIconClassName}
                            />
                          ) : (
                            <toolItem.icon className={navIconClassName} />
                          )}
                          <span>{toolItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}

              {activeSport.team && activeSport.team.length > 0 && (
                <>
                  <SidebarGroupLabel className="mt-3">Team</SidebarGroupLabel>
                  {activeSport.team.map((teamItem) => (
                    <SidebarMenuItem key={teamItem.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={teamItem.title}
                        isActive={isActivePath(teamItem.url)}
                      >
                        <Link href={teamItem.url}>
                          {isIconPath(teamItem.icon) ? (
                            <Image
                              src={teamItem.icon}
                              alt={`${teamItem.title} icon`}
                              width={navIconSize}
                              height={navIconSize}
                              className={navIconClassName}
                            />
                          ) : (
                            <teamItem.icon className={navIconClassName} />
                          )}
                          <span>{teamItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}

              {activeSport.player && activeSport.player.length > 0 && (
                <>
                  <SidebarGroupLabel className="mt-3">Player</SidebarGroupLabel>
                  {activeSport.player.map((playerItem) => (
                    <SidebarMenuItem key={playerItem.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={playerItem.title}
                        isActive={isActivePath(playerItem.url)}
                      >
                        <Link href={playerItem.url}>
                          {isIconPath(playerItem.icon) ? (
                            <Image
                              src={playerItem.icon}
                              alt={`${playerItem.title} icon`}
                              width={navIconSize}
                              height={navIconSize}
                              className={navIconClassName}
                            />
                          ) : (
                            <playerItem.icon className={navIconClassName} />
                          )}
                          <span>{playerItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}

              {activeSport.stats && activeSport.stats.length > 0 && (
                <>
                  <SidebarGroupLabel className="mt-3">Stats</SidebarGroupLabel>
                  {activeSport.stats.map((statItem) => (
                    <SidebarMenuItem key={statItem.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={statItem.title}
                        isActive={isActivePath(statItem.url)}
                      >
                        <Link href={statItem.url}>
                          {isIconPath(statItem.icon) ? (
                            <Image
                              src={statItem.icon}
                              alt={`${statItem.title} icon`}
                              width={navIconSize}
                              height={navIconSize}
                              className={navIconClassName}
                            />
                          ) : (
                            <statItem.icon className={navIconClassName} />
                          )}
                          <span>{statItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
              
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
                        <SidebarMenuSubButton asChild isActive={isActivePath("/tools/calculators/vig")}>
                          <Link href="/tools/calculators/vig">
                            <Calculator />
                            <span>Vig Calculator</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isActivePath("/tools/calculators/no-vig")}>
                          <Link href="/tools/calculators/no-vig">
                            <Zap />
                            <span>No Vig Calculator</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActivePath("/tools/calculators/expected-value")}
                        >
                          <Link href="/tools/calculators/expected-value">
                            <BarChart3 />
                            <span>Expected Value</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActivePath("/tools/calculators/implied-probability")}
                        >
                          <Link href="/tools/calculators/implied-probability">
                            <Percent />
                            <span>Implied Probability</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActivePath("/tools/calculators/odds-converter")}
                        >
                          <Link href="/tools/calculators/odds-converter">
                            <Calculator />
                            <span>Odds Converter</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isActivePath("/tools/calculators/arbitrage")}>
                          <Link href="/tools/calculators/arbitrage">
                            <TrendingUp />
                            <span>Arbitrage Calculator</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isActivePath("/tools/calculators/kelly")}>
                          <Link href="/tools/calculators/kelly">
                            <Target />
                            <span>Kelly Criterion</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isActivePath("/tools/calculators/parlay")}>
                          <Link href="/tools/calculators/parlay">
                            <Activity />
                            <span>Parlay Calculator</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isActivePath("/tools/calculators/point-spread")}>
                          <Link href="/tools/calculators/point-spread">
                            <Target />
                            <span>Point Spread</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActivePath("/tools/calculators/promo-converter")}
                        >
                          <Link href="/tools/calculators/promo-converter">
                            <DollarSign />
                            <span>Promo Converter</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActivePath("/tools/calculators/round-robin")}
                        >
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
          <SidebarMenuItem>
            {userEmail ? (
              <SidebarMenuButton onClick={handleSignOut} disabled={authLoading}>
                <LogOut />
                <span>{authLoading ? "Signing out..." : "Sign out"}</span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton asChild>
                <Link href="/login">
                  <LogIn />
                  <span>Sign in</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
