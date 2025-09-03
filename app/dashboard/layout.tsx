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
      <SidebarProvider>
        <AppSidebar user={session} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="text-slate-600 hover:bg-slate-100" />
              <div className="h-6 w-px bg-slate-300" />
              <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-slate-50">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </NotificationProviderWrapper>
  )
}
