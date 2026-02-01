"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"

type AuthMode = "sign-in" | "sign-up"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [mode, setMode] = useState<AuthMode>("sign-in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleEmailAuth = async () => {
    setLoading(true)
    setMessage(null)
    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.replace("/")
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage("Check your email to confirm your account.")
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Authentication failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const origin = window.location.origin
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Google sign-in failed.")
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">{mode === "sign-in" ? "Sign in" : "Create account"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Access full dashboards and tools once you’re signed in.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <Button
            type="button"
            className="w-full"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-gray-800" />
            or
            <div className="h-px flex-1 bg-gray-800" />
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>

          {message ? (
            <div className="rounded-md border border-gray-700 bg-[#171717] px-3 py-2 text-xs text-muted-foreground">
              {message}
            </div>
          ) : null}

          <Button
            type="button"
            className="w-full"
            onClick={handleEmailAuth}
            disabled={loading || !email || !password}
          >
            {loading ? "Working..." : mode === "sign-in" ? "Sign in" : "Create account"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm"
            onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          >
            {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
