"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Bell, Users, AlertCircle, CheckCircle, MapPin } from "lucide-react"

interface NotificationFiltersProps {
  currentFilter: string
  showRead: boolean
  onFilterChange: (filter: string) => void
  onShowReadChange: (show: boolean) => void
}

export function NotificationFilters({ 
  currentFilter, 
  showRead, 
  onFilterChange, 
  onShowReadChange 
}: NotificationFiltersProps) {
  const [activeFilter, setActiveFilter] = useState(currentFilter)
  const [localShowRead, setLocalShowRead] = useState(showRead)

  const filters = [
    {
      id: 'all',
      label: 'All Notifications',
      icon: Bell,
      color: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      activeColor: 'bg-slate-700 text-white hover:bg-slate-800'
    },
    {
      id: 'unread',
      label: 'Unread Only',
      icon: Bell,
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      activeColor: 'bg-blue-700 text-white hover:bg-blue-800'
    },
    {
      id: 'trip_updates',
      label: 'Trip Updates',
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
      activeColor: 'bg-orange-700 text-white hover:bg-orange-800'
    },
    {
      id: 'join_requests',
      label: 'Join Requests',
      icon: Users,
      color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
      activeColor: 'bg-indigo-700 text-white hover:bg-indigo-800'
    },
    {
      id: 'trip_start',
      label: 'Trip Started',
      icon: MapPin,
      color: 'bg-green-100 text-green-700 hover:bg-green-200',
      activeColor: 'bg-green-700 text-white hover:bg-green-800'
    },
    {
      id: 'trip_complete',
      label: 'Trip Completed',
      icon: CheckCircle,
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      activeColor: 'bg-purple-700 text-white hover:bg-purple-800'
    }
  ]

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId)
    onFilterChange(filterId)
  }

  const handleShowReadChange = (checked: boolean) => {
    setLocalShowRead(checked)
    onShowReadChange(checked)
  }

  // Sync local state with props when they change
  useEffect(() => {
    setActiveFilter(currentFilter)
  }, [currentFilter])

  useEffect(() => {
    setLocalShowRead(showRead)
  }, [showRead])

  return (
    <div className="space-y-6">
      {/* Filter Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-900">Filter by Type</h3>
        <div className="space-y-2">
          {filters.map((filter) => {
            const Icon = filter.icon
            const isActive = activeFilter === filter.id
            return (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`w-full flex items-center justify-start h-10 px-3 rounded-lg transition-all duration-200 ${
                  isActive ? filter.activeColor : filter.color
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Display Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-900">Display Options</h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-read" className="text-sm text-slate-700">
            Show read notifications
          </Label>
          <Switch
            id="show-read"
            checked={localShowRead}
            onCheckedChange={handleShowReadChange}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
      </div>

      <Separator />

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-900">Quick Actions</h3>
        <div className="space-y-2">
          <button
            className="w-full h-10 p-3 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            onClick={() => handleFilterChange('unread')}
          >
            View Unread Only
          </button>
          <button
            className="w-full h-10 p-3 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
            onClick={() => handleFilterChange('trip_updates')}
          >
            Trip Updates
          </button>
          <button
            className="w-full h-10 p-3 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
            onClick={() => handleFilterChange('join_requests')}
          >
            Join Requests
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="pt-4 border-t border-slate-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">5</div>
          <div className="text-sm text-slate-600">Total Notifications</div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3 text-center">
          <div>
            <div className="text-lg font-semibold text-blue-600">2</div>
            <div className="text-xs text-slate-500">Unread</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">3</div>
            <div className="text-xs text-slate-500">Read</div>
          </div>
        </div>
      </div>
    </div>
  )
}
