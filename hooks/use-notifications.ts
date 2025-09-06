"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "./use-toast"

export interface Notification {
  id: string
  type: 'trip_enrollment' | 'trip_start' | 'trip_update' | 'trip_complete' | 'join_request'
  title: string
  message: string
  tripName?: string
  userId?: string
  timestamp: string | Date
  isRead: boolean
  icon: string
}

interface UseNotificationsReturn {
  notifications: Notification[]
  loading: boolean
  error: string | null
  unreadCount: number
  fetchNotifications: (filter?: string, showRead?: boolean) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  refreshNotifications: () => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const unreadCount = notifications.filter(n => !n.isRead).length

  const fetchNotifications = useCallback(async (filter: string = 'all', showRead: boolean = true) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('type', filter)
      }
      if (!showRead) {
        params.append('isRead', 'false')
      }
      
      const response = await fetch(`/api/notifications?${params.toString()}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view notifications')
        } else if (response.status === 404) {
          throw new Error('Notifications endpoint not found')
        } else {
          throw new Error(`Failed to fetch notifications (${response.status})`)
        }
      }
      
      const data = await response.json()
      
      // Ensure we have the expected data structure
      if (data.notifications && Array.isArray(data.notifications)) {
        // Transform timestamps to Date objects if they're strings
        const transformedNotifications = data.notifications.map((notification: any) => ({
          ...notification,
          timestamp: typeof notification.timestamp === 'string' 
            ? new Date(notification.timestamp) 
            : notification.timestamp
        }))
        setNotifications(transformedNotifications)
      } else {
        setNotifications([])
        console.warn('Unexpected notifications data format:', data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications'
      setError(errorMessage)
      console.error('Fetch notifications error:', err)
      
      // Only show toast for non-401 errors (authentication errors are handled by layout)
      if (!err.message?.includes('log in')) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }, [toast])

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
      
      toast({
        title: "Success",
        description: "Notification marked as read",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [toast])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read')
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all notifications as read'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [toast])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete notification')
      }
      
      setNotifications(prev => prev.filter(n => n.id !== id))
      
      toast({
        title: "Success",
        description: "Notification deleted",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [toast])

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications()
  }, [fetchNotifications])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  }
}
