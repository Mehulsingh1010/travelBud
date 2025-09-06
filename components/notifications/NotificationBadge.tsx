"use client"

import { useNotificationContext } from "@/contexts/NotificationContext"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"

interface NotificationBadgeProps {
  className?: string
}

export function NotificationBadge({ className }: NotificationBadgeProps) {
  const { state: { unreadCount } } = useNotificationContext()

  if (unreadCount === 0) {
    return null
  }

  return (
    <Badge 
      variant="destructive" 
      className={`ml-auto h-5 w-5 rounded-full p-0 text-xs font-bold ${className}`}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  )
}
