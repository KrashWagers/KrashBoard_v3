"use client"

import * as React from "react"
import {
  Activity,
  BarChart3,
  Calculator,
  ChevronDown,
  Cloud,
  DollarSign,
  Percent,
  PieChart,
  Shield,
  Target,
  TrendingUp,
  UserCircle,
  Users,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { SportsSelector } from "@/components/sports-selector"
import { useActiveSportId } from "@/hooks/use-active-sport"
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
  tools?: NavItem[]
  stats?: NavItem[]
}

const navIconClassName = "h-5 w-5"
const navIconSize = 20
const isIconPath = (icon: NavIcon): icon is string => typeof icon === "string"

// NFL tools
const nflTools: NavItem[] = [
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

const navigationBySport: Record<string, NavItem[]> = {
  nfl: [
    { title: "Scores", url: "/nfl/scores", icon: Activity },
    { title: "Lineups", url: "/nfl/lineups", icon: Users },
    { title: "Prop Lab", url: "/nfl/tools/prop-lab", icon: Calculator },
    { title: "Market", url: "/nfl/market", icon: TrendingUp },
  ],
  nhl: [
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
  ],
  nba: [
    { title: "Scores", url: "/nba/scores", icon: Activity },
    { title: "Lineups", url: "/nba/lineups", icon: Users },
    { title: "Prop Lab", url: "/nba/prop-lab", icon: Calculator },
    { title: "Market", url: "/nba/market", icon: TrendingUp },
  ],
  mlb: [
    { title: "Scores", url: "/mlb/scores", icon: Activity },
    { title: "Lineups", url: "/mlb/lineups", icon: Users },
    { title: "Prop Lab", url: "/mlb/prop-lab", icon: Calculator },
    { title: "Market", url: "/mlb/market", icon: TrendingUp },
  ],
}

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

const mlbTools: NavItem[] = [
  {
    title: "Weather Report",
    url: "/mlb/weather-report",
    icon: Cloud,
  },
  {
    title: "Pitch Matrix",
    url: "/mlb/tools/pitch-matrix",
    icon: Target,
  },
  {
    title: "Pitcher Report",
    url: "/mlb/tools/pitcher-report",
    icon: Shield,
  },
  {
    title: "Batter vs Pitcher",
    url: "/mlb/tools/player-vs-opp",
    icon: Target,
  },
  {
    title: "Batter vs Opp",
    url: "/mlb/tools/batter-vs-opp",
    icon: Users,
  },
  {
    title: "Batter Stats",
    url: "/mlb/tools/batter-stats",
    icon: BarChart3,
  },
  {
    title: "Pitcher Stats",
    url: "/mlb/tools/pitcher-stats",
    icon: Activity,
  },
  {
    title: "Team Stats",
    url: "/mlb/tools/team-stats",
    icon: TrendingUp,
  },
]

const sports: SportNav[] = [
  {
    id: "nfl",
    name: "NFL",
    root: "/nfl",
    homeIcon: "/Images/Icons/football.svg",
    tools: nflTools,
  },
  {
    id: "nhl",
    name: "NHL",
    root: "/nhl",
    homeIcon: "/Images/Icons/hockey.svg",
    tools: nhlTools,
    stats: nhlStats,
  },
  {
    id: "nba",
    name: "NBA",
    root: "/nba",
    homeIcon: "/Images/Icons/basketball.svg",
  },
  {
    id: "mlb",
    name: "MLB",
    root: "/mlb",
    homeIcon: "/Images/Icons/baseball.svg",
    tools: mlbTools,
  },
] as const

export function AppSidebar() {
  const pathname = usePathname()
  const { activeSportId } = useActiveSportId(pathname)
  const [userEmail, setUserEmail] = React.useState<string | null>(null)
  const [displayName, setDisplayName] = React.useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null)
  const activeSport =
    sports.find((sport) => sport.id === (activeSportId ?? "nfl")) ?? sports[0]
  const isActivePath = (url: string, exact = false) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(`${url}/`)
  const navigationItems = navigationBySport[activeSport.id] ?? []

  React.useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    const loadProfile = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      setUserEmail(user?.email ?? null)

      if (!user) {
        setDisplayName(null)
        setAvatarUrl(null)
        return
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single()

      setDisplayName(profile?.display_name ?? null)
      setAvatarUrl(profile?.avatar_url ?? null)
    }

    loadProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      setUserEmail(nextUser?.email ?? null)
      if (!nextUser) {
        setDisplayName(null)
        setAvatarUrl(null)
        return
      }
      supabase
        .from("user_profiles")
        .select("display_name, avatar_url")
        .eq("user_id", nextUser.id)
        .single()
        .then(({ data: profile }) => {
          setDisplayName(profile?.display_name ?? null)
          setAvatarUrl(profile?.avatar_url ?? null)
        })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <Sidebar collapsible="icon">
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
                <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">
                  KrashBoard
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sport</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 group-data-[collapsible=icon]:px-0">
              <SportsSelector />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
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
                    <span className="group-data-[collapsible=icon]:hidden">Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Active Sport Navigation */}
              {navigationItems.map((subItem) => (
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
                      <span className="group-data-[collapsible=icon]:hidden">
                        {subItem.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Tracker"
                  isActive={isActivePath("/tracker")}
                >
                  <Link href="/tracker">
                    <BarChart3 className={navIconClassName} />
                    <span className="group-data-[collapsible=icon]:hidden">Tracker</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

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
                          <span className="group-data-[collapsible=icon]:hidden">
                            {toolItem.title}
                          </span>
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
                          <span className="group-data-[collapsible=icon]:hidden">
                            {statItem.title}
                          </span>
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
                className="group/collapsible mt-2"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Calculators">
                      <Calculator />
                      <span className="group-data-[collapsible=icon]:hidden">
                        Calculators
                      </span>
                      <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
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
              <Link href={userEmail ? "/settings" : "/login"}>
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-700 bg-black/40">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={displayName || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </span>
                <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                  {userEmail ? displayName || "Profile" : "Sign in"}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
