"use client"

import { useNotificationContext } from "@/contexts/NotificationContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function NotificationTest() {
  const { 
    state: { notifications, unreadCount, loading, error },
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError
  } = useNotificationContext()

  const handleAddTestNotification = () => {
    addNotification({
      type: 'trip_update',
      title: 'Test Notification',
      message: 'This is a test notification to verify the context is working',
      tripName: 'Test Trip',
      icon: '🧪'
    })
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleClearError = () => {
    clearError()
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Notification Context Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            <strong>Status:</strong> {loading ? 'Loading...' : 'Ready'}
          </p>
          <p className="text-sm text-slate-600">
            <strong>Notifications:</strong> {notifications.length}
          </p>
          <p className="text-sm text-slate-600">
            <strong>Unread:</strong> {unreadCount}
          </p>
          {error && (
            <p className="text-sm text-red-600">
              <strong>Error:</strong> {error}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Button onClick={handleAddTestNotification} className="w-full">
            Add Test Notification
          </Button>
          <Button onClick={handleMarkAllAsRead} variant="outline" className="w-full">
            Mark All as Read
          </Button>
          {error && (
            <Button onClick={handleClearError} variant="outline" className="w-full">
              Clear Error
            </Button>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recent Notifications:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="text-xs p-2 bg-slate-100 rounded">
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-slate-600">{notification.message}</div>
                  <div className="text-slate-500">
                    {notification.isRead ? '✓ Read' : '○ Unread'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
