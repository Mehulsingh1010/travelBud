"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Navigation, Coffee, Utensils, Car } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TripMember {
  id: number
  name: string
  latitude?: number
  longitude?: number
  lastUpdate?: string
}

interface LiveMapProps {
  tripId: number
  tripName: string
  members: TripMember[]
}

export function LiveMap({ tripId, tripName, members }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([])
  const { toast } = useToast()

  // Initialize map
  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !map) {
      // Dynamically import Leaflet
      import("leaflet").then((L) => {
        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        const mapInstance = L.map(mapRef.current!).setView([40.7128, -74.006], 13)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance)

        setMap(mapInstance)
      })
    }
  }, [map])

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location sharing",
        variant: "destructive",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })

        if (map) {
          map.setView([latitude, longitude], 15)

          // Add user marker
          import("leaflet").then((L) => {
            const userIcon = L.divIcon({
              html: '<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>',
              className: "custom-div-icon",
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })

            L.marker([latitude, longitude], { icon: userIcon }).addTo(map).bindPopup("You are here")
          })
        }

        // Start sharing location
        startLocationSharing(latitude, longitude)
      },
      (error) => {
        toast({
          title: "Location access denied",
          description: "Please allow location access to share your position",
          variant: "destructive",
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  // Start sharing location with trip members
  const startLocationSharing = async (lat: number, lng: number) => {
    setIsSharing(true)

    try {
      await fetch("/api/location/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          latitude: lat,
          longitude: lng,
          accuracy: 10,
        }),
      })

      toast({
        title: "Location sharing started",
        description: "Your location is now visible to trip members",
      })

      // Update location every 2 seconds
      const locationInterval = setInterval(async () => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude, accuracy } = position.coords

            await fetch("/api/location/update", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tripId,
                latitude,
                longitude,
                accuracy,
              }),
            })
          },
          null,
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 },
        )
      }, 2000)

      // Store interval ID for cleanup
      ;(window as any).locationInterval = locationInterval
    } catch (error) {
      toast({
        title: "Failed to start location sharing",
        description: "Please try again",
        variant: "destructive",
      })
      setIsSharing(false)
    }
  }

  // Stop location sharing
  const stopLocationSharing = () => {
    if ((window as any).locationInterval) {
      clearInterval((window as any).locationInterval)
      ;(window as any).locationInterval = null
    }
    setIsSharing(false)
    toast({
      title: "Location sharing stopped",
      description: "Your location is no longer being shared",
    })
  }

  // Add member markers to map
  useEffect(() => {
    if (map && members.length > 0) {
      import("leaflet").then((L) => {
        members.forEach((member) => {
          if (member.latitude && member.longitude) {
            const memberIcon = L.divIcon({
              html: `<div class="w-6 h-6 bg-purple-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">${member.name.charAt(0)}</div>`,
              className: "custom-div-icon",
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })

            L.marker([member.latitude, member.longitude], { icon: memberIcon })
              .addTo(map)
              .bindPopup(
                `${member.name}<br/>Last seen: ${member.lastUpdate ? new Date(member.lastUpdate).toLocaleTimeString() : "Unknown"}`,
              )
          }
        })
      })
    }
  }, [map, members])

  // Find nearby places
  const findNearbyPlaces = async (type: string) => {
    if (!userLocation) {
      toast({
        title: "Location required",
        description: "Please share your location first",
        variant: "destructive",
      })
      return
    }

    try {
      // This would integrate with a places API like Google Places
      // For now, we'll show mock data
      const mockPlaces = [
        { name: "Starbucks Coffee", type: "cafe", distance: "0.2 km", rating: 4.5 },
        { name: "McDonald's", type: "restaurant", distance: "0.3 km", rating: 4.0 },
        { name: "Shell Gas Station", type: "gas_station", distance: "0.5 km", rating: 4.2 },
      ]

      setNearbyPlaces(mockPlaces)
      toast({
        title: "Nearby places found",
        description: `Found ${mockPlaces.length} ${type} nearby`,
      })
    } catch (error) {
      toast({
        title: "Failed to find places",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            {tripName} - Live Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={getCurrentLocation}
              disabled={isSharing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {isSharing ? "Sharing Location" : "Share Location"}
            </Button>

            {isSharing && (
              <Button onClick={stopLocationSharing} variant="outline">
                Stop Sharing
              </Button>
            )}

            <Button onClick={() => findNearbyPlaces("restaurant")} variant="outline">
              <Utensils className="w-4 h-4 mr-2" />
              Restaurants
            </Button>

            <Button onClick={() => findNearbyPlaces("cafe")} variant="outline">
              <Coffee className="w-4 h-4 mr-2" />
              Cafes
            </Button>

            <Button onClick={() => findNearbyPlaces("gas_station")} variant="outline">
              <Car className="w-4 h-4 mr-2" />
              Gas Stations
            </Button>
          </div>

          {/* Trip Members Status */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {members.length} Members
            </Badge>
            {members.map((member) => (
              <Badge
                key={member.id}
                variant={member.latitude && member.longitude ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                <div
                  className={`w-2 h-2 rounded-full ${member.latitude && member.longitude ? "bg-green-500" : "bg-gray-400"}`}
                />
                {member.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          <div ref={mapRef} className="w-full h-96 rounded-lg" style={{ minHeight: "400px" }} />
        </CardContent>
      </Card>

      {/* Nearby Places */}
      {nearbyPlaces.length > 0 && (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-green-600" />
              Nearby Places
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nearbyPlaces.map((place, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">{place.name}</h4>
                    <p className="text-sm text-slate-600 capitalize">{place.type.replace("_", " ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{place.distance}</p>
                    <p className="text-xs text-slate-500">★ {place.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
