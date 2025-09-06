"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Trash2, Eye, EyeOff, Clock, MapPin, Users, AlertCircle, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
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

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trip_enrollment':
        return <Users className="w-5 h-5 text-blue-600" />
      case 'trip_start':
        return <MapPin className="w-5 h-5 text-green-600" />
      case 'trip_update':
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      case 'trip_complete':
        return <CheckCircle className="w-5 h-5 text-purple-600" />
      case 'join_request':
        return <Users className="w-5 h-5 text-indigo-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trip_enrollment':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'trip_start':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'trip_update':
        return 'bg-orange-50 border-orange-200 text-orange-700'
      case 'trip_complete':
        return 'bg-purple-50 border-purple-200 text-purple-700'
      case 'join_request':
        return 'bg-indigo-50 border-indigo-200 text-indigo-700'
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'trip_enrollment':
        return 'Enrollment'
      case 'trip_start':
        return 'Started'
      case 'trip_update':
        return 'Update'
      case 'trip_complete':
        return 'Completed'
      case 'join_request':
        return 'Request'
      default:
        return 'Notification'
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      onDelete(notification.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id)
  }

  return (
    <div className={`
      flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md
      ${notification.isRead 
        ? 'bg-slate-50 border-slate-200' 
        : 'bg-white border-slate-300 shadow-sm'
      }
    `}>
      {/* Icon */}
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
        ${notification.isRead ? 'bg-slate-100' : 'bg-white shadow-sm'}
      `}>
        <span className="text-2xl">{notification.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <h4 className={`font-semibold ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
              {notification.title}
            </h4>
            <Badge className={`${getTypeColor(notification.type)} text-xs font-medium`}>
              {getTypeIcon(notification.type)}
              {getTypeLabel(notification.type)}
            </Badge>
          </div>
          {!notification.isRead && (
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
          )}
        </div>

        <p className={`text-sm mb-2 ${notification.isRead ? 'text-slate-600' : 'text-slate-700'}`}>
          {notification.message}
        </p>

        {/* Trip and User Info */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          {notification.tripName && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {notification.tripName}
            </span>
          )}
          {notification.userId && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {notification.userId}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 flex-shrink-0">
        {!notification.isRead && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAsRead}
            className="w-20 h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Check className="w-3 h-3 mr-1" />
            Read
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-20 h-8 text-red-600 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          {isDeleting ? '...' : 'Delete'}
        </Button>
      </div>
    </div>
  )
}
