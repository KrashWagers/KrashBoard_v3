"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Camera, 
  Settings as SettingsIcon, 
  LogOut, 
  Trash2,
  Check
} from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"

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

type UserProfile = {
  display_name: string | null
  avatar_url: string | null
  role: string | null
}

type UserPreferences = {
  sportsbooks: string[]
  odds_format: string
  theme: string
  unit_size: number
}

const defaultPreferences: UserPreferences = {
  sportsbooks: ["draftkings", "fanduel"],
  odds_format: "american",
  theme: "system",
  unit_size: 0,
}

export default function SettingsPage() {
  const supabase = createSupabaseBrowserClient()
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = React.useState<UserProfile>({
    display_name: null,
    avatar_url: null,
    role: null,
  })
  const [email, setEmail] = React.useState<string | null>(null)
  const [preferences, setPreferences] = React.useState<UserPreferences>(defaultPreferences)
  const [savingProfile, setSavingProfile] = React.useState(false)
  const [savingPrefs, setSavingPrefs] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) return
      setEmail(user.email ?? null)

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("display_name, avatar_url, role")
        .eq("user_id", user.id)
        .single()

      if (profileData) {
        setProfile({
          display_name: profileData.display_name ?? null,
          avatar_url: profileData.avatar_url ?? null,
          role: profileData.role ?? null,
        })
      }

      const { data: prefData } = await supabase
        .from("user_preferences")
        .select("sportsbooks, odds_format, theme, unit_size")
        .eq("user_id", user.id)
        .single()

      if (prefData) {
        const nextPrefs = {
          sportsbooks: Array.isArray(prefData.sportsbooks) ? prefData.sportsbooks : defaultPreferences.sportsbooks,
          odds_format: prefData.odds_format ?? defaultPreferences.odds_format,
          theme: prefData.theme ?? defaultPreferences.theme,
          unit_size: prefData.unit_size != null ? Number(prefData.unit_size) : defaultPreferences.unit_size,
        }
        setPreferences(nextPrefs)
        setTheme(nextPrefs.theme)
      } else {
        setTheme(defaultPreferences.theme)
      }
    }

    loadProfile()
  }, [setTheme, supabase])

  const toggleSportsbook = (sportsbookId: string) => {
    setPreferences((prev) => ({
      ...prev,
      sportsbooks: prev.sportsbooks.includes(sportsbookId)
        ? prev.sportsbooks.filter((id) => id !== sportsbookId)
        : [...prev.sportsbooks, sportsbookId],
    }))
  }

  const handleProfileSave = async () => {
    setSavingProfile(true)
    setStatusMessage(null)
    try {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) {
        setStatusMessage("You must be signed in to update your profile.")
        return
      }

      const { error } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: user.id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          role: profile.role ?? "user",
          updated_at: new Date().toISOString(),
        })

      if (error) {
        throw error
      }
      setStatusMessage("Profile updated.")
    } catch (err) {
      const supabaseMessage =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message ?? "")
          : ""
      setStatusMessage(
        supabaseMessage.trim().length > 0
          ? supabaseMessage
          : "Profile update failed."
      )
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePreferencesSave = async () => {
    setSavingPrefs(true)
    setStatusMessage(null)
    try {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) return

      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          sportsbooks: preferences.sportsbooks,
          odds_format: preferences.odds_format,
          theme: preferences.theme,
          unit_size: preferences.unit_size,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      setStatusMessage("Preferences saved.")
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Preferences update failed.")
    } finally {
      setSavingPrefs(false)
    }
  }

  const handleAvatarUpload = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    setStatusMessage(null)
    try {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) return

      const fileExt = file.name.split(".").pop() || "png"
      const filePath = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)

      const publicUrl = publicData.publicUrl
      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }))
      setStatusMessage("Avatar updated.")
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Avatar upload failed.")
    } finally {
      setUploading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  const clearCache = () => {
    if (typeof window !== "undefined") {
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name)
          })
        })
      }
      localStorage.clear()
      sessionStorage.clear()
    }
    setStatusMessage("Cache cleared.")
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-10 lg:max-w-[70%]">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, preferences, and sportsbook selections.
        </p>
      </div>

      {statusMessage ? (
        <Card>
          <CardContent className="py-3 text-sm text-muted-foreground">{statusMessage}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Update your name, avatar, and account access.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-gray-700 bg-black/40">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.display_name || "Avatar"} className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar-upload">Profile image</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleAvatarUpload(event.target.files?.[0] ?? null)}
                  disabled={uploading}
                />
                <Button variant="outline" size="sm" disabled={uploading}>
                  <Camera className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Recommended: square PNG or JPG.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                value={profile.display_name ?? ""}
                onChange={(event) => setProfile((prev) => ({ ...prev, display_name: event.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email ?? ""} disabled />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{profile.role ?? "user"}</Badge>
            <Button onClick={handleProfileSave} disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save Profile"}
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>Control display formats and sportsbook sources.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-medium">Odds Display Format</h4>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {oddsFormats.map((format) => (
                <Button
                  key={format.id}
                  variant={preferences.odds_format === format.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreferences((prev) => ({ ...prev, odds_format: format.id }))}
                  className="flex h-auto flex-col py-3"
                >
                  <span className="font-medium">{format.name}</span>
                  <span className="text-xs text-muted-foreground">{format.description}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Unit Size</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="unit-size">Unit Size ($)</Label>
                <Input
                  id="unit-size"
                  type="number"
                  value={preferences.unit_size}
                  onChange={(event) =>
                    setPreferences((prev) => ({
                      ...prev,
                      unit_size: Number(event.target.value || 0),
                    }))
                  }
                  placeholder="100"
                />
                <p className="text-xs text-muted-foreground">
                  Used to auto-calculate dollar stakes when you enter units in Tracker.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Sportsbook Selection</h4>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {sportsbooks.map((sportsbook) => {
                const isSelected = preferences.sportsbooks.includes(sportsbook.id)
                return (
                  <Card
                    key={sportsbook.id}
                    className={`cursor-pointer transition-none ${isSelected ? "border-emerald-500/60 bg-emerald-500/10" : ""}`}
                    onClick={() => toggleSportsbook(sportsbook.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center gap-2">
                        <Image
                          src={sportsbook.logo}
                          alt={sportsbook.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 object-contain"
                        />
                        <span className="text-sm font-medium text-center">{sportsbook.name}</span>
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                            <Check className="h-3 w-3" />
                            Selected
                          </span>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <div className="text-sm text-muted-foreground">
              {preferences.sportsbooks.length} sportsbook{preferences.sportsbooks.length !== 1 ? "s" : ""} selected
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Cache Management</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={clearCache}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Website Cache
              </Button>
              <span className="text-sm text-muted-foreground">
                Clears stored data to refresh the application.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handlePreferencesSave} disabled={savingPrefs}>
              {savingPrefs ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
