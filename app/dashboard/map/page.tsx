"use client"

import { useEffect, useState } from "react"
import { LiveMap } from "@/components/map/live-map"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Users, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Trip {
  id: number
  name: string
  description: string
}

interface TripMember {
  id: number
  name: string
  latitude?: number
  longitude?: number
  lastUpdate?: string
}

export default function MapPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [tripMembers, setTripMembers] = useState<TripMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch user's trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("/api/trips/my-trips")
        const data = await response.json()

        if (response.ok) {
          setTrips(data.trips)
          if (data.trips.length > 0) {
            setSelectedTrip(data.trips[0])
          }
        } else {
          toast({
            title: "Failed to load trips",
            description: data.error || "Please try again",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load trips",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrips()
  }, [toast])

  // Fetch trip members when trip is selected
  useEffect(() => {
    if (selectedTrip) {
      const fetchTripMembers = async () => {
        try {
          const response = await fetch(`/api/trips/${selectedTrip.id}/members`)
          const data = await response.json()

          if (response.ok) {
            setTripMembers(data.members)
          }
        } catch (error) {
          console.error("Failed to fetch trip members:", error)
        }
      }

      fetchTripMembers()

      // Poll for location updates every 3 seconds
      const interval = setInterval(fetchTripMembers, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedTrip])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your trips...</p>
          </div>
        </div>
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="p-6">
        <Card className="shadow-lg border-0">
          <CardContent className="text-center py-12">
            <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Trips</h3>
            <p className="text-slate-600 mb-6">Create or join a trip to start sharing locations</p>
            <div className="space-x-4">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <a href="/dashboard/create-trip">Create Trip</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/dashboard/join-trip">Join Trip</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Trip Selection */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Live Location Map
          </CardTitle>
          <CardDescription>Share your location and see where your travel buddies are in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Select Trip</label>
              <Select
                value={selectedTrip?.id.toString()}
                onValueChange={(value) => {
                  const trip = trips.find((t) => t.id === Number.parseInt(value))
                  setSelectedTrip(trip || null)
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Choose a trip to view" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id.toString()}>
                      {trip.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTrip && (
              <div className="text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {tripMembers.length} member{tripMembers.length !== 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Permission Warning */}
      <Card className="shadow-lg border-0 bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-900 mb-1">Location Permission Required</h4>
              <p className="text-sm text-amber-800">
                To share your location with trip members, you'll need to allow location access when prompted. Your
                location will only be shared with members of the selected trip.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Map */}
      {selectedTrip && <LiveMap tripId={selectedTrip.id} tripName={selectedTrip.name} members={tripMembers} />}
    </div>
  )
}
