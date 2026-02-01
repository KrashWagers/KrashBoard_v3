import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/auth/callback",
]

const PUBLIC_PREFIXES = [
  "/_next",
  "/api",
  "/Images",
  "/favicon",
  "/robots.txt",
  "/sitemap.xml",
]

const isAdminPath = (pathname: string) => pathname.startsWith("/admin")

const isPublicPath = (pathname: string) => {
  if (PUBLIC_PATHS.includes(pathname)) return true
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const authCookie = request.cookies
    .getAll()
    .find((cookie) => cookie.name.includes("auth-token"))
  if (!authCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const response = NextResponse.next()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options })
      },
      remove(name, options) {
        response.cookies.set({ name, value: "", ...options })
      },
    },
  })

  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdminPath(pathname)) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
