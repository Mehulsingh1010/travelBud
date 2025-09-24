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

const staticNearbyMembers = [
  { id: 101, name: "Gateway of India", latitude: 18.9219, longitude: 72.8347, lastUpdate: new Date().toISOString() },
  { id: 102, name: "Marine Drive", latitude: 18.9409, longitude: 72.8252, lastUpdate: new Date().toISOString() },
  { id: 103, name: "Chhatrapati Shivaji Terminus", latitude: 18.9404, longitude: 72.8351, lastUpdate: new Date().toISOString() },
];

  // Initialize map
// Initialize map
useEffect(() => {
  if (typeof window !== "undefined" && mapRef.current && !map) {
    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      // Change this line to set the view to Mumbai's coordinates
      const mapInstance = L.map(mapRef.current!).setView([18.9404, 72.8351], 12);

      L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
        attribution: '© <a href="https://stadiamaps.com/">Stadia Maps</a>',
        maxZoom: 50,
      }).addTo(mapInstance);

      mapInstance.zoomControl.remove();
      mapInstance.attributionControl.setPrefix("");

      setMap(mapInstance);
    });
  }
}, [map]);

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
              html: `<div class="relative">
                       <div class="absolute inset-0 w-5 h-5 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                       <div class="relative w-5 h-5 bg-blue-500 rounded-full border-3 border-white shadow-xl"></div>
                     </div>`,
              className: "custom-div-icon",
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })

            L.marker([latitude, longitude], { icon: userIcon })
              .addTo(map)
              .bindPopup(`
              <div class="text-center p-2">
                <div class="font-semibold text-slate-800">You are here</div>
                <div class="text-xs text-slate-600 mt-1">Live location</div>
              </div>
            `)
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

  useEffect(() => {
    if (map) {
      import("leaflet").then((L) => {
        // Add static nearby members
        staticNearbyMembers.forEach((member, index) => {
          const colors = ["bg-emerald-500", "bg-violet-500", "bg-orange-500"]
          const memberIcon = L.divIcon({
            html: `<div class="relative group">
                     <div class="w-8 h-8 ${colors[index]} rounded-full border-3 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-110">
                       <span class="text-white text-sm font-bold">${member.name.charAt(0)}</span>
                     </div>
                     <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 ${colors[index]} rounded-full opacity-60"></div>
                   </div>`,
            className: "custom-div-icon",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })

          L.marker([member.latitude, member.longitude], { icon: memberIcon })
            .addTo(map)
            .bindPopup(`
              <div class="text-center p-3 min-w-[120px]">
                <div class="font-semibold text-slate-800">${member.name}</div>
                <div class="text-xs text-emerald-600 mt-1">● Online now</div>
                <div class="text-xs text-slate-500 mt-1">Nearby member</div>
              </div>
            `)
        })

        // Add existing members with updated styling
        members.forEach((member) => {
          if (member.latitude && member.longitude) {
            const memberIcon = L.divIcon({
              html: `<div class="relative group">
                       <div class="w-7 h-7 bg-slate-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-110">
                         <span class="text-white text-xs font-bold">${member.name.charAt(0)}</span>
                       </div>
                     </div>`,
              className: "custom-div-icon",
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            })

            L.marker([member.latitude, member.longitude], { icon: memberIcon })
              .addTo(map)
              .bindPopup(`
                <div class="text-center p-3">
                  <div class="font-semibold text-slate-800">${member.name}</div>
                  <div class="text-xs text-slate-600 mt-1">Last seen: ${member.lastUpdate ? new Date(member.lastUpdate).toLocaleTimeString() : "Unknown"}</div>
                </div>
              `)
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
      <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-semibold">{tripName}</div>
              <div className="text-sm text-slate-500 font-normal">Live Location Tracking</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={getCurrentLocation}
              disabled={isSharing}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all duration-200"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {isSharing ? "Sharing Location" : "Share Location"}
            </Button>

            {isSharing && (
              <Button
                onClick={stopLocationSharing}
                variant="outline"
                className="border-slate-300 hover:bg-slate-50 bg-transparent"
              >
                Stop Sharing
              </Button>
            )}

            <Button
              onClick={() => findNearbyPlaces("restaurant")}
              variant="outline"
              className="border-slate-300 hover:bg-slate-50"
            >
              <Utensils className="w-4 h-4 mr-2" />
              Restaurants
            </Button>

            <Button
              onClick={() => findNearbyPlaces("cafe")}
              variant="outline"
              className="border-slate-300 hover:bg-slate-50"
            >
              <Coffee className="w-4 h-4 mr-2" />
              Cafes
            </Button>

            <Button
              onClick={() => findNearbyPlaces("gas_station")}
              variant="outline"
              className="border-slate-300 hover:bg-slate-50"
            >
              <Car className="w-4 h-4 mr-2" />
              Gas Stations
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Users className="w-4 h-4" />
              Trip Members
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nearby Members */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Nearby Now</div>
                <div className="flex flex-wrap gap-2">
                  {staticNearbyMembers.map((member, index) => {
                    const colors = ["bg-emerald-500", "bg-violet-500", "bg-orange-500"]
                    return (
                      <Badge
                        key={member.id}
                        className={`${colors[index]} hover:${colors[index]}/90 text-white border-0`}
                      >
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                        {member.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              {/* Other Members */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Other Members</div>
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => (
                    <Badge
                      key={member.id}
                      variant={member.latitude && member.longitude ? "default" : "secondary"}
                      className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${member.latitude && member.longitude ? "bg-green-500" : "bg-slate-400"}`}
                      />
                      {member.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-2xl">
        <CardContent className="p-0">
          <div ref={mapRef} className="w-full h-[500px]" style={{ minHeight: "500px" }} />
        </CardContent>
      </Card>

      {nearbyPlaces.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-green-100 rounded-lg">
                <Coffee className="w-5 h-5 text-green-600" />
              </div>
              Nearby Places
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {nearbyPlaces.map((place, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div>
                    <h4 className="font-semibold text-slate-900">{place.name}</h4>
                    <p className="text-sm text-slate-600 capitalize">{place.type.replace("_", " ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{place.distance}</p>
                    <p className="text-xs text-amber-600 flex items-center justify-end gap-1">
                      <span>★</span> {place.rating}
                    </p>
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
