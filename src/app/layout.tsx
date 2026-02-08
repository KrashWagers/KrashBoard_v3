import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SportsSelector } from "@/components/sports-selector"
import { MainContentArea } from "@/components/main-content-area"
import { PageTitle } from "@/components/page-title"
import { NavbarBackButton } from "@/components/navbar-back-button"
import { GlobalSearch } from "@/components/global-search"

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
    <html lang="en" suppressHydrationWarning className="dark">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
          <SidebarProvider className="h-full min-h-0 overflow-hidden">
            <AppSidebar />
            <main className="flex min-w-0 flex-1 flex-col min-h-0 overflow-hidden">
              <div
                data-mlb-topbar
                className="flex flex-shrink-0 items-center justify-between px-4 border-b border-sidebar-border bg-sidebar/95 surface-glass sticky top-0 z-40 transition-all duration-200"
                style={{ height: "var(--app-header-h)" }}
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
              <MainContentArea>{children}</MainContentArea>
            </main>
          </SidebarProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
