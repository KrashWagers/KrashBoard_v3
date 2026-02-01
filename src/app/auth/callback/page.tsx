"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const finalizeSession = async () => {
      const supabase = createSupabaseBrowserClient()
      await supabase.auth.getSession()
      router.replace("/")
    }
    finalizeSession()
  }, [router])

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
      Finalizing sign-in...
    </div>
  )
}
