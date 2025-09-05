"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Locate, Map } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TripMember {
  id: number
  name: string
  latitude?: number
  longitude?: number
  lastUpdate?: string
}

interface MapLocation {
  id: number
  name: string
  latitude: number
  longitude: number
  type?: "primary" | "secondary" | "highlight"
}

interface LiveMapProps {
  tripId: number
  tripName: string
  members: TripMember[]
  locations?: MapLocation[]
}

export function LiveMap({ tripId, tripName, members, locations = [] }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()

  const defaultLocations: MapLocation[] = [
    { id: 1, name: "Central Park", latitude: 40.7829, longitude: -73.9654, type: "primary" },
    { id: 2, name: "Times Square", latitude: 40.758, longitude: -73.9855, type: "highlight" },
    { id: 3, name: "Brooklyn Bridge", latitude: 40.7061, longitude: -73.9969, type: "secondary" },
    { id: 4, name: "Statue of Liberty", latitude: 40.6892, longitude: -74.0445, type: "primary" },
    { id: 5, name: "Empire State Building", latitude: 40.7484, longitude: -73.9857, type: "highlight" },
  ]

  const mapLocations = locations.length > 0 ? locations : defaultLocations

  // Initialize map with minimal, modern styling
  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !map) {
      import("leaflet").then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        const mapInstance = L.map(mapRef.current!, {
          zoomControl: false,
          attributionControl: false,
        }).setView([40.7128, -74.006], 12)

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
          attribution: "",
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(mapInstance)

        L.control
          .zoom({
            position: "bottomright",
          })
          .addTo(mapInstance)

        setMap(mapInstance)
      })
    }
  }, [map])

  useEffect(() => {
    if (map && mapLocations.length > 0) {
      import("leaflet").then((L) => {
        mapLocations.forEach((location) => {
          const pinColor =
            location.type === "primary" ? "#3b82f6" : location.type === "highlight" ? "#ef4444" : "#6b7280"

          const locationIcon = L.divIcon({
            html: `
              <div class="relative">
                <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center" 
                     style="background-color: ${pinColor}">
                  <div class="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div class="absolute top-7 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap border">
                  ${location.name}
                </div>
              </div>
            `,
            className: "custom-location-icon",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })

          L.marker([location.latitude, location.longitude], { icon: locationIcon })
            .addTo(map)
            .bindPopup(`
              <div class="text-center">
                <h3 class="font-semibold text-gray-900">${location.name}</h3>
                <p class="text-sm text-gray-600 mt-1">${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</p>
              </div>
            `)
        })
      })
    }
  }, [map, mapLocations])

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

          import("leaflet").then((L) => {
            const userIcon = L.divIcon({
              html: `
                <div class="relative">
                  <div class="w-5 h-5 bg-blue-500 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
                  <div class="absolute inset-0 w-5 h-5 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                </div>
              `,
              className: "custom-user-icon",
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })

            L.marker([latitude, longitude], { icon: userIcon })
              .addTo(map)
              .bindPopup(`
                <div class="text-center">
                  <h3 class="font-semibold text-blue-600">Your Location</h3>
                  <p class="text-sm text-gray-600 mt-1">Live tracking active</p>
                </div>
              `)
          })
        }

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
              html: `
                <div class="relative">
                  <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold">
                    ${member.name.charAt(0)}
                  </div>
                  <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
                </div>
              `,
              className: "custom-member-icon",
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })

            L.marker([member.latitude, member.longitude], { icon: memberIcon })
              .addTo(map)
              .bindPopup(`
                <div class="text-center">
                  <h3 class="font-semibold text-purple-600">${member.name}</h3>
                  <p class="text-sm text-gray-600 mt-1">
                    Last seen: ${member.lastUpdate ? new Date(member.lastUpdate).toLocaleTimeString() : "Just now"}
                  </p>
                </div>
              `)
          }
        })
      })
    }
  }, [map, members])

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Map className="w-5 h-5 text-blue-500" />
            {tripName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={getCurrentLocation}
              disabled={isSharing}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm"
            >
              <Locate className="w-4 h-4 mr-2" />
              {isSharing ? "Sharing" : "Share Location"}
            </Button>

            {isSharing && (
              <Button
                onClick={stopLocationSharing}
                size="sm"
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
              >
                Stop Sharing
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">
              <Users className="w-3 h-3 mr-1" />
              {members.length}
            </Badge>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0">
              <MapPin className="w-3 h-3 mr-1" />
              {mapLocations.length} Locations
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div ref={mapRef} className="w-full h-[500px] bg-gray-50" style={{ minHeight: "500px" }} />
        </CardContent>
      </Card>
    </div>
  )
}
