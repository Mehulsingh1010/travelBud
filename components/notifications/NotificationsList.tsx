"use client"

import { NotificationItem } from "./NotificationItem"
import { Inbox } from "lucide-react"
import { useNotificationContext } from "@/contexts/NotificationContext"
import { Button } from "@/components/ui/button"

interface NotificationsListProps {
  filter: string
  showRead: boolean
}

export function NotificationsList({ filter, showRead }: NotificationsListProps) {
  // Use the context for notifications data
  const { state: { notifications, loading, error, unreadCount } } = useNotificationContext()

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.isRead) return false
    if (filter === 'trip_updates' && notification.type !== 'trip_update') return false
    if (filter === 'join_requests' && notification.type !== 'join_request') return false
    if (filter === 'trip_start' && notification.type !== 'trip_start') return false
    if (filter === 'trip_complete' && notification.type !== 'trip_complete') return false
    if (!showRead && notification.isRead) return false
    return true
  })

  // Use context functions for handlers
  const { markAsRead, markAllAsRead, deleteNotification } = useNotificationContext()

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleDeleteNotification = async (id: string) => {
    await deleteNotification(id)
  }

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  if (filteredNotifications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No notifications</h3>
        <p className="text-slate-600 mb-6">
          {filter === 'all' 
            ? "You're all caught up! No new notifications."
            : `No ${filter.replace('_', ' ')} notifications found.`
          }
        </p>
                 {filter !== 'all' && (
           <button 
             className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
             onClick={() => window.location.reload()}
           >
             View All Notifications
           </button>
         )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </span>
          <span className="text-sm text-slate-600">
            {unreadCount} unread
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDeleteNotification}
          />
        ))}
      </div>
    </div>
  )
}
