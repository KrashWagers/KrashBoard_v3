"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  CreditCard, 
  Settings as SettingsIcon, 
  LogOut, 
  Trash2,
  Check
} from "lucide-react"
import Image from "next/image"

const sportsbooks = [
  { id: "draftkings", name: "DraftKings", logo: "/Images/Sportsbook_Logos/DraftKingsLogo.png", available: true },
  { id: "fanduel", name: "FanDuel", logo: "/Images/Sportsbook_Logos/FanDuelLogo.png", available: true },
  { id: "fanatics", name: "Fanatics", logo: "/Images/Sportsbook_Logos/Fanatics.jpeg", available: true },
  { id: "bet365", name: "Bet365", logo: "/Images/Sportsbook_Logos/bet365.png", available: true },
  { id: "betrivers", name: "BetRivers", logo: "/Images/Sportsbook_Logos/betriverslogo.png", available: true },
  { id: "caesars", name: "Caesars Sportsbook", logo: "/Images/Sportsbook_Logos/caesars-logo.png", available: true },
  { id: "betmgm", name: "BetMGM", logo: "/Images/Sportsbook_Logos/betmgm.png", available: true },
  { id: "betonline", name: "BetOnline", logo: "/Images/Sportsbook_Logos/betonline.jpg", available: true },
  { id: "bally", name: "Bally Bet", logo: "/Images/Sportsbook_Logos/bally_bet.jpg", available: true },
  { id: "espn", name: "ESPN Bet", logo: "/Images/Sportsbook_Logos/ESPN-BET-Logo-Secondary.jpg", available: true },
  { id: "fliff", name: "Fliff", logo: "/Images/Sportsbook_Logos/fliff.png", available: true },
  { id: "hardrock", name: "Hard Rock", logo: "/Images/Sportsbook_Logos/hardrock.jpg", available: true },
  { id: "novig", name: "Novig", logo: "/Images/Sportsbook_Logos/novig.webp", available: true },
  { id: "pinnacle", name: "Pinnacle", logo: "/Images/Sportsbook_Logos/pinnacle_sports_logo.jpg", available: true },
  { id: "prizepicks", name: "PrizePicks", logo: "/Images/Sportsbook_Logos/Prizepicks.png", available: true },
  { id: "underdog", name: "Underdog", logo: "/Images/Sportsbook_Logos/underdogfantasy.webp", available: true },
  { id: "sleeper", name: "Sleeper", logo: "/Images/Sportsbook_Logos/sleeper.jpg", available: true },
  { id: "prophetx", name: "ProphetX", logo: "/Images/Sportsbook_Logos/prophetx.png", available: true },
]

const oddsFormats = [
  { id: "american", name: "American", description: "-110, +150" },
  { id: "decimal", name: "Decimal", description: "1.91, 2.50" },
  { id: "fractional", name: "Fractional", description: "10/11, 3/2" },
  { id: "implied", name: "Implied", description: "52.4%, 40.0%" },
]

export default function SettingsPage() {
  const [selectedSportsbooks, setSelectedSportsbooks] = React.useState<string[]>(["draftkings", "fanduel"])
  const [selectedOddsFormat, setSelectedOddsFormat] = React.useState("american")

  const toggleSportsbook = (sportsbookId: string) => {
    setSelectedSportsbooks(prev => 
      prev.includes(sportsbookId) 
        ? prev.filter(id => id !== sportsbookId)
        : [...prev, sportsbookId]
    )
  }

  const clearCache = () => {
    // Clear browser cache
    if (typeof window !== 'undefined') {
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name)
          })
        })
      }
      localStorage.clear()
      sessionStorage.clear()
    }
    alert("Cache cleared successfully!")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, preferences, and sportsbook selections
        </p>
      </div>

      {/* User Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </CardTitle>
          <CardDescription>
            Manage your account information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Guest User</h3>
              <p className="text-sm text-muted-foreground">Not signed in</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Subscription
            </Button>
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sportsbook Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Sportsbook Selection
          </CardTitle>
          <CardDescription>
            Choose which sportsbooks to display odds and data from
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sportsbooks.map((sportsbook) => (
              <div
                key={sportsbook.id}
                className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedSportsbooks.includes(sportsbook.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => toggleSportsbook(sportsbook.id)}
              >
                {selectedSportsbooks.includes(sportsbook.id) && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>
                )}
                <div className="flex flex-col items-center space-y-2">
                  <Image
                    src={sportsbook.logo}
                    alt={sportsbook.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                  />
                  <span className="text-sm font-medium text-center">{sportsbook.name}</span>
                  {!sportsbook.available && (
                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            {selectedSportsbooks.length} sportsbook{selectedSportsbooks.length !== 1 ? 's' : ''} selected
          </div>
        </CardContent>
      </Card>

      {/* Webapp Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Webapp Settings
          </CardTitle>
          <CardDescription>
            Customize your KrashBoard experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Settings */}
          <div className="space-y-3">
            <h4 className="font-medium">Theme</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Light Mode
              </Button>
              <Button variant="outline" size="sm">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Dark Mode
              </Button>
              <Button variant="outline" size="sm">
                <SettingsIcon className="h-4 w-4 mr-2" />
                System
              </Button>
            </div>
          </div>

          <Separator />

          {/* Odds Display */}
          <div className="space-y-3">
            <h4 className="font-medium">Odds Display Format</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {oddsFormats.map((format) => (
                <Button
                  key={format.id}
                  variant={selectedOddsFormat === format.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedOddsFormat(format.id)}
                  className="flex flex-col h-auto py-3"
                >
                  <span className="font-medium">{format.name}</span>
                  <span className="text-xs text-muted-foreground">{format.description}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Cache Management */}
          <div className="space-y-3">
            <h4 className="font-medium">Cache Management</h4>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={clearCache}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Website Cache
              </Button>
              <span className="text-sm text-muted-foreground">
                Clear stored data to refresh the application
              </span>
            </div>
          </div>

          <Separator />

          {/* Account Actions */}
          <div className="space-y-3">
            <h4 className="font-medium">Account</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
