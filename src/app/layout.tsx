import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { SportsSelector } from "@/components/sports-selector"
import { ErrorBoundary } from "@/components/error-boundary"
import Link from "next/link"
import Image from "next/image"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KrashBoard V3 - Sports Analytics & Betting Dashboard",
  description: "Modern sports analytics and betting dashboard with real-time data and insights",
  keywords: ["sports", "betting", "analytics", "nfl", "mlb", "nba", "nhl"],
  authors: [{ name: "KrashBoard Team" }],
  creator: "KrashBoard",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://krashboard.com",
    title: "KrashBoard V3 - Sports Analytics & Betting Dashboard",
    description: "Modern sports analytics and betting dashboard with real-time data and insights",
    siteName: "KrashBoard",
  },
  twitter: {
    card: "summary_large_image",
    title: "KrashBoard V3 - Sports Analytics & Betting Dashboard",
    description: "Modern sports analytics and betting dashboard with real-time data and insights",
    creator: "@krashboard",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 flex flex-col">
              <div className="flex h-12 items-center justify-between px-4 border-b bg-background">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <Link href="/" className="flex items-center gap-2">
                    <Image
                      src="/Images/Brand/KW Logo PNG.png"
                      alt="KrashBoard"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                    <span className="font-bold text-lg hidden sm:block">KrashBoard</span>
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  <SportsSelector />
                  <ThemeToggle />
                </div>
              </div>
              <div className="flex-1 p-6">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
