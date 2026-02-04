import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SportsSelector } from "@/components/sports-selector"
import { ErrorBoundary } from "@/components/error-boundary"
import { PageTitle } from "@/components/page-title"
import { NavbarBackButton } from "@/components/navbar-back-button"
import { GlobalSearch } from "@/components/global-search"

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
              <div
                data-mlb-topbar
                className="flex h-12 items-center justify-between px-4 border-b bg-sidebar dark:bg-sidebar border-sidebar-border sticky top-0 z-50 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <NavbarBackButton />
                </div>
                <div className="flex-1 flex justify-center">
                  <PageTitle />
                </div>
                <div className="flex items-center gap-4">
                  <GlobalSearch />
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
