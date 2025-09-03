"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface Notification {
  id: string
  type: 'trip_enrollment' | 'trip_start' | 'trip_update' | 'trip_complete' | 'join_request'
  title: string
  message: string
  tripName?: string
  userId?: string
  timestamp: Date
  isRead: boolean
  icon: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<Notification> } }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'CLEAR_ERROR' }

const initialState: NotificationState = {
  notifications: [
    {
      id: '1',
      type: 'trip_enrollment',
      title: 'Trip Created',
      message: 'You\'ve successfully created "Mountain Hiking Adventure"',
      tripName: 'Mountain Hiking Adventure',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
      icon: '👥'
    },
    {
      id: '2',
      type: 'trip_update',
      title: 'Trip Update',
      message: 'Meeting time changed to 9:00 AM for "Mountain Hiking Adventure"',
      tripName: 'Mountain Hiking Adventure',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      isRead: true,
      icon: '🔄'
    }
  ],
  unreadCount: 1,
  loading: false,
  error: null,
}

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.isRead).length,
        error: null,
      }
    
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications]
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.isRead).length,
      }
    
    case 'UPDATE_NOTIFICATION':
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload.id ? { ...n, ...action.payload.updates } : n
      )
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.isRead).length,
      }
    
    case 'DELETE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload)
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.isRead).length,
      }
    
    case 'MARK_AS_READ':
      const markedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, isRead: true } : n
      )
      return {
        ...state,
        notifications: markedNotifications,
        unreadCount: markedNotifications.filter(n => !n.isRead).length,
      }
    
    case 'MARK_ALL_AS_READ':
      const allReadNotifications = state.notifications.map(n => ({ ...n, isRead: true }))
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0,
      }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    default:
      return state
  }
}

interface NotificationContextType {
  state: NotificationState
  fetchNotifications: (filter?: string, showRead?: boolean) => Promise<void>
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  clearError: () => void
}

// Create context with a default value to prevent undefined errors
const NotificationContext = createContext<NotificationContextType>({
  state: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  fetchNotifications: async () => {},
  addNotification: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  clearError: () => {},
})

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState)
  const { toast } = useToast()

  // Context initialized successfully

  const fetchNotifications = async (filter: string = 'all', showRead: boolean = true) => {
    // Simplified - no API calls for now
    console.log('Fetch notifications called with:', { filter, showRead })
    
    // Set empty notifications to avoid errors
    dispatch({ type: 'SET_NOTIFICATIONS', payload: [] })
    dispatch({ type: 'SET_LOADING', payload: false })
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    // Simplified - no API calls for now
    console.log('Add notification called with:', notificationData)
    
    // Create a mock notification
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false,
    }

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification })
    
    // Show toast for new notifications
    toast({
      title: newNotification.title,
      description: newNotification.message,
    })
  }

  const markAsRead = async (id: string) => {
    // Simplified - no API calls for now
    console.log('Mark as read called with:', id)
    
    dispatch({ type: 'MARK_AS_READ', payload: id })
    
    toast({
      title: "Success",
      description: "Notification marked as read",
    })
  }

  const markAllAsRead = async () => {
    // Simplified - no API calls for now
    console.log('Mark all as read called')
    
    dispatch({ type: 'MARK_ALL_AS_READ' })
    
    toast({
      title: "Success",
      description: "All notifications marked as read",
    })
  }

  const deleteNotification = async (id: string) => {
    // Simplified - no API calls for now
    console.log('Delete notification called with:', id)
    
    dispatch({ type: 'DELETE_NOTIFICATION', payload: id })
    
    toast({
      title: "Success",
      description: "Notification deleted",
    })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // No automatic fetch on mount - simplified for now
  // useEffect(() => {
  //   // Disabled automatic fetch to prevent errors
  // }, [])

  const value: NotificationContextType = {
    state,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  return context
}
