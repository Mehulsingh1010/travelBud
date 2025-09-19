

import { verifySession } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { trips, tripMembers, tripJoinRequests } from "@/lib/db/schema"
import { eq, desc, and, count } from "drizzle-orm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Calendar, Clock, MapPin, Bell, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await verifySession()

  if (!session) {
    return null
  }

  try {
    // Get user's trips where they are a member (including created trips)
    const userTripsData = await db
      .select({
        id: trips.id,
        name: trips.name,
        description: trips.description,
        status: trips.status,
        startDate: trips.startDate,
        endDate: trips.endDate,
        createdAt: trips.createdAt,
        creatorId: trips.creatorId,
        maxMembers: trips.maxMembers,
      })
      .from(trips)
      .innerJoin(tripMembers, eq(trips.id, tripMembers.tripId))
      .where(and(eq(tripMembers.userId, session.userId), eq(tripMembers.status, "approved")))
      .orderBy(desc(trips.createdAt))

    // Get pending join requests count for trips the user created
    let pendingRequestCount = 0
    try {
      const pendingRequests = await db
        .select({
          count: count(tripJoinRequests.id),
        })
        .from(tripJoinRequests)
        .innerJoin(trips, eq(tripJoinRequests.tripId, trips.id))
        .where(and(eq(trips.creatorId, session.userId), eq(tripJoinRequests.status, "pending")))

      pendingRequestCount = pendingRequests[0]?.count || 0
    } catch (error) {
      console.error("Error fetching pending requests:", error)
    }

    // Categorize trips
    const plannedTrips = userTripsData.filter((trip) => trip.status === "planned")
    const activeTrips = userTripsData.filter((trip) => trip.status === "active")
    const completedTrips = userTripsData.filter((trip) => trip.status === "completed")

    const getStatusColor = (status: string) => {
      switch (status) {
        case "planned":
          return "bg-blue-100 text-blue-700 border-blue-200"
        case "active":
          return "bg-green-100 text-green-700 border-green-200"
        case "completed":
          return "bg-gray-100 text-gray-700 border-gray-200"
        default:
          return "bg-gray-100 text-gray-700 border-gray-200"
      }
    }

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "planned":
          return <Calendar className="w-3 h-3" />
        case "active":
          return <MapPin className="w-3 h-3" />
        case "completed":
          return <Clock className="w-3 h-3" />
        default:
          return <Clock className="w-3 h-3" />
      }
    }

    return (
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {session.name}!</h1>
          <p className="text-blue-100 text-lg mb-6">
            {activeTrips.length > 0
              ? `You have ${activeTrips.length} active trip${activeTrips.length > 1 ? "s" : ""} ongoing!`
              : "Ready to plan your next adventure?"}
          </p>
          <div className="flex gap-4">
            <Link href="/dashboard/create-trip">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg font-medium">
                Create New Trip
                <Plus className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            {pendingRequestCount > 0 && (
              <Link href="/dashboard/manage-requests">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <Bell className="w-4 h-4 mr-2" />
                  {pendingRequestCount} Pending Request{pendingRequestCount > 1 ? "s" : ""}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{plannedTrips.length}</h3>
              <p className="text-sm text-slate-600">Planned Trips</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{activeTrips.length}</h3>
              <p className="text-sm text-slate-600">Active Trips</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{completedTrips.length}</h3>
              <p className="text-sm text-slate-600">Completed</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{pendingRequestCount}</h3>
              <p className="text-sm text-slate-600">Pending Requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Trips - Priority Section */}
        {activeTrips.length > 0 && (
          <Card className="shadow-lg border-0 border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <MapPin className="w-5 h-5 text-green-600" />
                Active Trips - Live Now!
              </CardTitle>
              <CardDescription>Your ongoing adventures with live location sharing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {activeTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-slate-900">{trip.name}</h4>
                        <Badge className={`${getStatusColor(trip.status!)} flex items-center gap-1`}>
                          {getStatusIcon(trip.status!)}
                          {trip.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{trip.description || "No description"}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Max {trip.maxMembers} members
                        </span>
                        {trip.startDate && <span>Started: {new Date(trip.startDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <Link href={`/dashboard/trips/${trip.id}`}>
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        View Live Map
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Trips Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Planned Trips */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Calendar className="w-5 h-5 text-blue-600" />
                Upcoming Trips
              </CardTitle>
              <CardDescription>Trips you're planning to go on</CardDescription>
            </CardHeader>
            <CardContent>
              {plannedTrips.length > 0 ? (
                <div className="space-y-4">
                  {plannedTrips.slice(0, 3).map((trip) => (
                    <div
                      key={trip.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-slate-900">{trip.name}</h4>
                          <Badge className={`${getStatusColor(trip.status!)} flex items-center gap-1`}>
                            {getStatusIcon(trip.status!)}
                            {trip.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{trip.description || "No description"}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Max {trip.maxMembers} members
                          </span>
                          {trip.startDate && <span>Starts: {new Date(trip.startDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <Link href={`/dashboard/trips/${trip.id}`}>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  ))}
                  <Link href="/dashboard/trips">
                    <Button variant="outline" className="w-full">
                      View All Trips
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No upcoming trips</p>
                  <Link href="/dashboard/create-trip">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Plan Your First Trip
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Clock className="w-5 h-5 text-purple-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest trip activities</CardDescription>
            </CardHeader>
            <CardContent>
              {completedTrips.length > 0 ? (
                <div className="space-y-4">
                  {completedTrips.slice(0, 3).map((trip) => (
                    <div
                      key={trip.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-slate-900">{trip.name}</h4>
                          <Badge className={`${getStatusColor(trip.status!)} flex items-center gap-1`}>
                            {getStatusIcon(trip.status!)}
                            {trip.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{trip.description || "No description"}</p>
                        <p className="text-xs text-slate-500">
                          Completed: {new Date(trip.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/dashboard/trips/${trip.id}/feedback`}>
                        <Button variant="outline" size="sm">
                          Feedback
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No completed trips yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    return (
      <div className="p-6">
        <Card className="shadow-lg border-0">
          <CardContent className="text-center py-12">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Unable to load dashboard</h3>
            <p className="text-slate-600 mb-6">There was an error loading your trips. Please try again.</p>
            <div className="space-x-4">
              <Link href="/dashboard/create-trip">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Create New Trip
                </Button>
              </Link>
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
