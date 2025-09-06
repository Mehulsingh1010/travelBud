import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { verifySession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { NotificationProviderWrapper } from "@/components/providers/NotificationProviderWrapper"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()

  if (!session) {
    redirect("/login")
  }

  return (
    <NotificationProviderWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-grid-slate-200/20 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"></div>

        <SidebarProvider>
          <AppSidebar user={session} />
          <SidebarInset>
            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
              <div className="flex items-center gap-4 p-4">
                <SidebarTrigger className="p-2 hover:bg-slate-100 rounded-lg transition-colors" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg grid place-items-center">
                    <span className="text-white text-sm font-bold">T</span>
                  </div>
                  <h1 className="text-lg font-bold text-slate-900">TravelBuddy</h1>
                </div>
              </div>
            </header>

            {/* Desktop Header */}
            <header className="hidden lg:flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4">
              <SidebarTrigger className="text-slate-600 hover:bg-slate-100" />
              <div className="h-6 w-px bg-slate-300" />
              <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative overflow-auto">
              <div className="p-4 lg:p-6">
                {children}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </NotificationProviderWrapper>
  )
}
