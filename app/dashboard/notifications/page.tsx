"use client"

import { useState } from "react"
import { NotificationsList } from "@/components/notifications/NotificationsList"
import { NotificationFilters } from "@/components/notifications/NotificationFilters"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Filter } from "lucide-react"

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all')
  const [showRead, setShowRead] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState('All Notifications')
  const [pageTitle, setPageTitle] = useState('All Notifications')

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    
    // Update the page title based on the filter
    const filterLabels: { [key: string]: string } = {
      'all': 'All Notifications',
      'unread': 'Unread Only',
      'trip_updates': 'Trip Updates',
      'join_requests': 'Join Requests',
      'trip_start': 'Trip Started',
      'trip_complete': 'Trip Completed'
    }
    
    setSelectedFilter(filterLabels[newFilter] || 'All Notifications')
    setPageTitle(filterLabels[newFilter] || 'All Notifications')
  }

  const handleShowReadChange = (show: boolean) => {
    setShowRead(show)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            Notifications
          </h1>
          <p className="text-slate-600 mt-2">Stay updated with your trip activities and requests</p>
        </div>
      </div>

      {/* Filters and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Filter className="w-5 h-5 text-blue-600" />
                Filters
              </CardTitle>
              <CardDescription>Filter your notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationFilters 
                currentFilter={filter}
                showRead={showRead}
                onFilterChange={handleFilterChange}
                onShowReadChange={handleShowReadChange}
              />
            </CardContent>
          </Card>
        </div>

                 {/* Notifications List */}
         <div className="lg:col-span-3">
           <Card className="shadow-lg border-0">
             <CardHeader>
               <CardTitle className="text-slate-900">{pageTitle}</CardTitle>
               <CardDescription>
                 {selectedFilter === 'Unread Only' 
                   ? 'Your unread updates and activities'
                   : selectedFilter === 'Trip Updates'
                   ? 'Updates about your trips'
                   : selectedFilter === 'Join Requests'
                   ? 'Requests to join your trips'
                   : selectedFilter === 'Trip Started'
                   ? 'Trips that have started'
                   : selectedFilter === 'Trip Completed'
                   ? 'Your completed trips'
                   : 'Your latest updates and activities'
                 }
               </CardDescription>
             </CardHeader>
            <CardContent>
              <NotificationsList 
                filter={filter}
                showRead={showRead}
              />
            </CardContent>
          </Card>
                 </div>
       </div>

       
     </div>
   )
 }
