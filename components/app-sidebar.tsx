"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Compass, Map, Users, Plus, Settings, LogOut, ChevronRight, MapPin, Calendar, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface User {
  userId: number
  email: string
  name: string
  role: string
}

interface AppSidebarProps {
  user: User
}

const menuItems = [
  { title: "My Trips", url: "/dashboard", icon: Map, id: "dashboard" },
  { title: "Live Map", url: "/dashboard/map", icon: MapPin, id: "map" },
  { title: "Create Trip", url: "/dashboard/create-trip", icon: Plus, id: "create-trip" },
  { title: "Join Trip", url: "/dashboard/join-trip", icon: Users, id: "join-trip" },
  { title: "History", url: "/dashboard/history", icon: Calendar, id: "history" },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell, id: "notifications" },
]

export function AppSidebar({ user }: AppSidebarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showSOSDialog, setShowSOSDialog] = useState(false)
  const [notificationCount] = useState(3)
  const [cooldown, setCooldown] = useState(0) // 🚨 SOS cooldown timer
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setShowLogoutDialog(false)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      localStorage.removeItem("travel_buddy_session")
      toast({ title: "Signed out", description: "See you on your next adventure!" })
      router.push("/")
    } catch {
      toast({ title: "Error", description: "Failed to sign out. Please try again.", variant: "destructive" })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleQuickCreateTrip = () => {
    router.push("/dashboard/create-trip")
  }

  const handleSOS = () => {
    setShowSOSDialog(false)
    console.log("🚨 SOS Triggered! Send alerts here...")
    // TODO: integrate with backend (emails, SMS, calls, push notifications, etc.)
      toast({
    title: "🚨 SOS Activated",
    description: "Emergency alerts are being sent!",
    variant: "sos", // 🔴 makes it red
  })
    setCooldown(5) // start 5s cooldown
  }

  const getUserName = () => {
    return user.name || user.email.split("@")[0].charAt(0).toUpperCase() + user.email.split("@")[0].slice(1)
  }

  const getActiveTab = () => {
    if (pathname === "/dashboard") return "dashboard"
    if (pathname === "/dashboard/map") return "map"
    if (pathname === "/dashboard/create-trip") return "create-trip"
    if (pathname === "/dashboard/join-trip") return "join-trip"
    if (pathname === "/dashboard/history") return "history"
    if (pathname === "/dashboard/notifications") return "notifications"
    return "dashboard"
  }

  const activeTab = getActiveTab()

  return (
    <Sidebar
      variant="floating"
      className="border-r-0 backdrop-blur-sm rounded-xl m-4 h-[calc(100vh-2rem)] flex flex-col"
    >
      <SidebarHeader className="p-6 bg-gray-100 pb-4 flex-shrink-0">
        <Link href="/">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-[#00e2b7] to-teal-400 rounded-lg grid place-items-center">
                <Compass className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">TravelBuddy</h2>
              <p className="text-xs text-gray-500 font-medium">Explore Together</p>
            </div>
          </div>
        </Link>

        {/* User Profile Card */}
        <Link href="/profile">
          <div className="rounded-xl bg-gradient-to-br from-[#00e2b7] to-teal-600 p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white font-medium shadow-inner">
                {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{getUserName()}</p>
                <p className="text-xs text-teal-100/90 truncate">{user.role}</p>
              </div>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 flex-1 overflow-y-auto">
        {/* Quick Action Button */}
        <div className="mb-4 px-2">
          <Button
            onClick={handleQuickCreateTrip}
            className="w-full justify-between group bg-gradient-to-br from-[#00e2b7] to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-md rounded-lg"
            size="sm"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Trip</span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-80 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    "w-full justify-start px-3 py-2.5 rounded-lg relative",
                    "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    "data-[active=true]:bg-teal-50 data-[active=true]:text-teal-600",
                    "data-[active=true]:font-medium transition-colors duration-200",
                    isActive &&
                      "before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-2/3 before:w-1 before:bg-[#00e2b7] before:rounded-r-full"
                  )}
                >
                  <a href={item.url} className="flex items-center gap-3 w-full">
                    <div
                      className={cn(
                        "p-1.5 rounded-lg",
                        isActive ? "bg-teal-100 text-teal-600" : "bg-gray-100 text-gray-600"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 pt-2 flex-shrink-0">
        <SidebarSeparator className="my-4 bg-gray-200" />

        {/* 🚨 SOS Button with Confirmation + Cooldown */}
        <div className="mb-4">
          <AlertDialog open={showSOSDialog} onOpenChange={setShowSOSDialog}>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md rounded-lg font-semibold"
                size="sm"
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "🚨 SOS"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-red-600 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm SOS Activation</AlertDialogTitle>
                <AlertDialogDescription className="text-white">
                  Are you sure you want to trigger SOS?  
                  This will send <strong>emails, SMS, and calls</strong> to your emergency contacts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-black bg-white">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSOS}
                  className="bg-white text-red-600 hover:bg-gray-100 font-semibold"
                >
                  Trigger SOS
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#00e2b7] text-white text-xs flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#00e2b7] text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                <AlertDialogDescription className="text-white">
                  Are you sure you want to logout? You will need to sign in again to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-black">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoggingOut ? "Signing out..." : "Logout"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">© {new Date().getFullYear()} TravelBuddy System</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}