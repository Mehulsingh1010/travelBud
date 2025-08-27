"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Compass, Map, Users, Plus, Settings, LogOut, ChevronUp, MapPin, Calendar, Bell, Home } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "My Trips",
    url: "/dashboard/trips",
    icon: Map,
  },
  {
    title: "Live Map",
    url: "/dashboard/map",
    icon: MapPin,
  },
  {
    title: "Create Trip",
    url: "/dashboard/create-trip",
    icon: Plus,
  },
  {
    title: "Join Trip",
    url: "/dashboard/join-trip",
    icon: Users,
  },
  {
    title: "History",
    url: "/dashboard/history",
    icon: Calendar,
  },
  {
    title: "Notifications",
    url: "/dashboard/notifications",
    icon: Bell,
  },
]

export function AppSidebar({ user }: AppSidebarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      localStorage.removeItem("travel_buddy_session")
      toast({
        title: "Signed out",
        description: "See you on your next adventure!",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Sidebar className="bg-white border-r border-slate-200">
      <SidebarHeader className="border-b border-slate-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">TravelBuddy</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:border-r-2 data-[active=true]:border-blue-600 rounded-lg h-10"
                  >
                    <a href={item.url} className="flex items-center space-x-3 px-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="text-slate-700 hover:bg-slate-100 data-[state=open]:bg-slate-100 h-12 px-3 rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-900 truncate">{user.name}</span>
                    <span className="text-xs text-slate-500 truncate">{user.email}</span>
                  </div>
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] bg-white shadow-lg border border-slate-200"
              >
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
