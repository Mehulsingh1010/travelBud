"use client"

import { HeroBanner } from "@/components/trip/hero-banner"
import TripCard from "@/components/trip/trip-card"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Filter, X, Calendar, Users, MapPin, Menu, Send, AlertCircle, Plane } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const TRIP_IMAGES = [
  // "/trip/card-img-1.png",
  // "/trip/card-img-2.png", 
  // "/trip/card-img-3.png",
  // "/trip/card-img-4.png",
  "/trip/card-img-5.png"
]

type Trip = {
  id: number
  name: string
  description?: string | null
  status?: string | null
  startDate?: string | Date | null
  endDate?: string | Date | null
}

type TripsResponse = {
  userId: number
  created: Trip[]
  joined: Trip[]
  history: Trip[]
  demo?: boolean
}

type LocalFilters = {
  location?: string
  days?: number
  people?: number
  status?: "open" | "closed" | ""
  feeMin?: number
  feeMax?: number
  dateFrom?: string
  dateTo?: string
  eighteenPlus?: boolean
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Get current user ID - replace this with your actual auth logic
const getCurrentUserId = () => {
  return 1
}

// Function to get random image path
const getRandomTripImage = (seed: number) => {
  return TRIP_IMAGES[seed % TRIP_IMAGES.length]
}

export default function Page() {
  const userId = getCurrentUserId()
  const { data, isLoading, error } = useSWR<TripsResponse>(`/api/trips/my-trips?userId=${userId}`, fetcher)
  const { toast } = useToast()
  
  const [keyword, setKeyword] = useState("")
  const [appliedFilters, setAppliedFilters] = useState<LocalFilters>({})
  const [tempFilters, setTempFilters] = useState<LocalFilters>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  // Join Trip Modal States
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const [joinMessage, setJoinMessage] = useState("")
  const [isJoinLoading, setIsJoinLoading] = useState(false)
  const [foundTrip, setFoundTrip] = useState<any>(null)
  const [joinStep, setJoinStep] = useState<"code" | "details" | "success">("code")

  function filter(list: Trip[]) {
    let filtered = list

    // Apply keyword filter
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase()
      filtered = filtered.filter((t) => 
        [t.name, t.description].filter(Boolean).some((v) => 
          String(v).toLowerCase().includes(k)
        )
      )
    }

    // Apply other filters
    if (appliedFilters.status && appliedFilters.status !== "") {
      filtered = filtered.filter((t) => t.status === appliedFilters.status)
    }

    return filtered
  }

  const createdRaw = data?.created ?? []
  const joinedRaw = data?.joined ?? []
  const historyRaw = data?.history ?? []

  const allUnique = (() => {
    const map = new Map<number, Trip>()
    ;[...createdRaw, ...joinedRaw].forEach((t) => map.set(t.id, t))
    return Array.from(map.values())
  })()

  const created = filter(createdRaw)
  const joined = filter(joinedRaw)
  const history = filter(historyRaw)
  const allTrips = filter(allUnique)

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters)
    setIsFilterOpen(false)
  }

  const handleClearFilters = () => {
    setTempFilters({})
    setAppliedFilters({})
    setKeyword("")
  }

  // Join Trip Modal Functions
  const handleFindTrip = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid invite code",
        variant: "destructive",
      })
      return
    }

    setIsJoinLoading(true)
    try {
      const response = await fetch(`/api/trips/find?inviteCode=${inviteCode.toUpperCase()}`)
      const data = await response.json()

      if (response.ok && data.trip) {
        setFoundTrip(data.trip)
        setJoinStep("details")
      } else {
        toast({
          title: "Trip Not Found",
          description: "No trip found with this invite code",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsJoinLoading(false)
    }
  }

  const handleJoinTrip = async () => {
    setIsJoinLoading(true)
    try {
      const response = await fetch("/api/trips/request-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: foundTrip.id,
          message: joinMessage.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setJoinStep("success")
        toast({
          title: "Request Sent!",
          description: "The trip organizer will review your request",
        })
        // Refresh the trips data
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        toast({
          title: "Request Failed",
          description: data.error || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsJoinLoading(false)
    }
  }

  const resetJoinModal = () => {
    setInviteCode("")
    setJoinMessage("")
    setFoundTrip(null)
    setJoinStep("code")
    setIsJoinModalOpen(false)
  }

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

  const hasActiveFilters = keyword.trim() || Object.values(appliedFilters).some(v => v !== "" && v !== undefined && v !== false)

  const getCurrentTrips = () => {
    switch (activeTab) {
      case "created": return created
      case "joined": return joined
      case "history": return history
      default: return allTrips
    }
  }

  const currentTrips = getCurrentTrips()

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="px-4 pt-4 md:px-6 md:pt-6">
          <HeroBanner name="User" />
        </div>
       
        <div className="px-4 pb-4 md:px-6 md:pb-6 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Failed to load trips</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br rounded-lg from-blue-50 to-cyan-50">
      {/* Hero Section with reduced bottom padding */}
      <div className="px-4 pt-4 pb-2 md:px-6 md:pt-6 md:pb-3">
        <HeroBanner name="User" />
      </div>
      
      {/* Main Content with reduced top padding */}
      <div className="px-4 pb-4 md:px-6 md:pb-6 max-w-7xl mx-auto">
        <div className="flex gap-8">
          {/* Left Sidebar - Hidden on Mobile */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">My Trips</h2>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    activeTab === "all" 
                      ? "bg-blue-50 text-blue-700 border border-blue-200" 
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg grid place-items-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">All Trips</span>
                  </div>
                  <span className="text-sm bg-slate-100 px-2 py-1 rounded-full">
                    {allTrips.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("created")}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    activeTab === "created" 
                      ? "bg-blue-50 text-blue-700 border border-blue-200" 
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg grid place-items-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">Created by Me</span>
                  </div>
                  <span className="text-sm bg-slate-100 px-2 py-1 rounded-full">
                    {created.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("joined")}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    activeTab === "joined" 
                      ? "bg-blue-50 text-blue-700 border border-blue-200" 
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg grid place-items-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">Joined Trips</span>
                  </div>
                  <span className="text-sm bg-slate-100 px-2 py-1 rounded-full">
                    {joined.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("history")}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    activeTab === "history" 
                      ? "bg-blue-50 text-blue-700 border border-blue-200" 
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg grid place-items-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">Trip History</span>
                  </div>
                  <span className="text-sm bg-slate-100 px-2 py-1 rounded-full">
                    {history.length}
                  </span>
                </button>
              </nav>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button className="w-full justify-start" size="sm" onClick={() => window.location.href = '/dashboard/create-trip'}>
                    Create New Trip
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => setIsJoinModalOpen(true)}>
                    Join a Trip
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Mobile Trip Categories - Horizontal Scroll */}
            <div className="lg:hidden mb-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      activeTab === "all" 
                        ? "bg-blue-50 text-blue-700 border border-blue-200" 
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">All</span>
                    <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">{allTrips.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("created")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      activeTab === "created" 
                        ? "bg-blue-50 text-blue-700 border border-blue-200" 
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Created</span>
                    <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">{created.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("joined")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      activeTab === "joined" 
                        ? "bg-blue-50 text-blue-700 border border-blue-200" 
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Joined</span>
                    <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">{joined.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("history")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      activeTab === "history" 
                        ? "bg-blue-50 text-blue-700 border border-blue-200" 
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">History</span>
                    <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">{history.length}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 mb-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search trips..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="bg-slate-50 border-slate-200"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-slate-600">
                      <X className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Clear</span>
                    </Button>
                  )}
                  
                  <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">Filters</span>
                        {hasActiveFilters && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full ml-1">
                            Active
                          </span>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Filter Trips</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              placeholder="Greece, Tokyo..."
                              value={tempFilters.location || ""}
                              onChange={(e) => setTempFilters(prev => ({ ...prev, location: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                              id="status"
                              className="mt-2 block w-full rounded-md border border-slate-200 bg-white p-2 text-sm"
                              value={tempFilters.status || ""}
                              onChange={(e) => setTempFilters(prev => ({ ...prev, status: e.target.value as "open" | "closed" | "" }))}
                            >
                              <option value="">Any</option>
                              <option value="open">Open</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="days">Days</Label>
                            <Input
                              id="days"
                              type="number"
                              min={1}
                              placeholder="7"
                              value={tempFilters.days || ""}
                              onChange={(e) => setTempFilters(prev => ({ ...prev, days: Number(e.target.value) }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="people">People</Label>
                            <Input
                              id="people"
                              type="number"
                              min={1}
                              placeholder="4"
                              value={tempFilters.people || ""}
                              onChange={(e) => setTempFilters(prev => ({ ...prev, people: Number(e.target.value) }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="feeMin">Min Fee</Label>
                            <Input
                              id="feeMin"
                              type="number"
                              min={0}
                              placeholder="0"
                              value={tempFilters.feeMin || ""}
                              onChange={(e) => setTempFilters(prev => ({ ...prev, feeMin: Number(e.target.value) }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="feeMax">Max Fee</Label>
                            <Input
                              id="feeMax"
                              type="number"
                              min={0}
                              placeholder="5000"
                              value={tempFilters.feeMax || ""}
                              onChange={(e) => setTempFilters(prev => ({ ...prev, feeMax: Number(e.target.value) }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="dateFrom">From Date</Label>
                            <Input
                              id="dateFrom"
                              type="date"
                              value={tempFilters.dateFrom || ""}
                              onChange={(e) => setTempFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="dateTo">To Date</Label>
                            <Input
                              id="dateTo"
                              type="date"
                              value={tempFilters.dateTo || ""}
                              onChange={(e) => setTempFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Switch
                            id="eighteenPlus"
                            checked={tempFilters.eighteenPlus || false}
                            onCheckedChange={(checked) => setTempFilters(prev => ({ ...prev, eighteenPlus: checked }))}
                          />
                          <Label htmlFor="eighteenPlus">18+ only</Label>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={handleClearFilters}>
                          Clear All
                        </Button>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setIsFilterOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleApplyFilters}>
                            Apply Filters
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Trip Cards Area */}
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                    {activeTab === "all" && "All Trips"}
                    {activeTab === "created" && "Created by Me"}
                    {activeTab === "joined" && "Joined Trips"}
                    {activeTab === "history" && "Trip History"}
                  </h1>
                  <p className="text-slate-600 mt-1">{currentTrips.length} trips found</p>
                </div>

                {/* Mobile Quick Actions */}
                <div className="lg:hidden">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Menu className="w-4 h-4 mr-1" />
                        Actions
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Quick Actions</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 py-4">
                        <Button className="w-full justify-start" onClick={() => window.location.href = '/dashboard/create-trip'}>
                          Create New Trip
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => setIsJoinModalOpen(true)}>
                          Join a Trip
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading trips...</p>
                </div>
              ) : (
                <>
                  {/* Trip Cards Grid */}
                  {currentTrips.length > 0 ? (
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                      {currentTrips.map((trip, i) => (
                        <TripCard 
                          key={trip.id} 
                          trip={trip} 
                          seed={i}
                          imagePath={getRandomTripImage(trip.id + i)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 md:py-16 bg-white rounded-2xl border border-slate-200">
                      <div className="w-16 h-16 bg-slate-100 rounded-full grid place-items-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        {activeTab === "all" && "No trips found"}
                        {activeTab === "created" && "No created trips yet"}
                        {activeTab === "joined" && "No joined trips yet"}
                        {activeTab === "history" && "No trip history"}
                      </h3>
                      <p className="text-slate-600 mb-6 px-4">
                        {activeTab === "created" && "Start planning your first adventure"}
                        {activeTab === "joined" && "Join a trip to get started"}
                        {activeTab === "history" && "Your completed trips will appear here"}
                        {activeTab === "all" && "Create or join a trip to get started"}
                      </p>
                      {activeTab === "created" && (
                        <Button onClick={() => window.location.href = '/dashboard/create-trip'}>
                          Create Your First Trip
                        </Button>
                      )}
                      {activeTab === "joined" && (
                        <Button onClick={() => setIsJoinModalOpen(true)}>
                          Join a Trip
                        </Button>
                      )}
                      {activeTab === "all" && (
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button onClick={() => window.location.href = '/dashboard/create-trip'}>
                            Create Trip
                          </Button>
                          <Button variant="outline" onClick={() => setIsJoinModalOpen(true)}>
                            Join Trip
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Join Trip Modal */}
      <Dialog open={isJoinModalOpen} onOpenChange={(open) => {
        if (!open) resetJoinModal()
        setIsJoinModalOpen(open)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">Join a Trip</DialogTitle>
                <p className="text-slate-600 text-sm mt-1">
                  {joinStep === "code" && "Enter the invite code to find a trip"}
                  {joinStep === "details" && "Review trip details and send your request"}
                  {joinStep === "success" && "Your request has been sent successfully!"}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            {/* Step 1: Enter Invite Code */}
            {joinStep === "code" && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">How to Join a Trip</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Get the invite code from the trip organizer</li>
                        <li>• Enter the code below to find the trip</li>
                        <li>• Review details and send your join request</li>
                        <li>• Wait for the organizer to approve your request</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="inviteCode" className="text-slate-700 font-medium">
                    Trip Invite Code
                  </Label>
                  <Input
                    id="inviteCode"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="Enter invite code (e.g., ABC123)"
                    className="text-center text-lg font-mono tracking-wider"
                    maxLength={10}
                  />
                  <p className="text-sm text-slate-500 text-center">
                    Invite codes are usually 6-8 characters long
                  </p>
                </div>

                <Button
                  onClick={handleFindTrip}
                  disabled={!inviteCode.trim() || isJoinLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isJoinLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Finding Trip...
                    </>
                  ) : (
                    <>
                      Find Trip
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Trip Details and Join Request */}
            {joinStep === "details" && foundTrip && (
              <div className="space-y-6">
                {/* Trip Details Card */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-slate-900">{foundTrip.name}</h3>
                        <Badge className={`${getStatusColor(foundTrip.status)} flex items-center gap-1`}>
                          <MapPin className="w-3 h-3" />
                          {foundTrip.status || "planned"}
                        </Badge>
                      </div>
                      <p className="text-slate-600 mb-4">{foundTrip.description || "No description provided"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {foundTrip.startDate && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>Starts: {new Date(foundTrip.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {foundTrip.endDate && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>Ends: {new Date(foundTrip.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {foundTrip.maxMembers && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="w-4 h-4" />
                        <span>Max {foundTrip.maxMembers} members</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Join Request Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="joinMessage" className="text-slate-700 font-medium">
                      Message to Organizer (Optional)
                    </Label>
                    <Textarea
                      id="joinMessage"
                      value={joinMessage}
                      onChange={(e) => setJoinMessage(e.target.value)}
                      placeholder="Tell the organizer why you'd like to join this trip..."
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                      rows={4}
                    />
                    <p className="text-sm text-slate-500">
                      A brief message can help the organizer understand your interest in joining.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Send className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-green-900 mb-1">Ready to Send Request</h4>
                        <p className="text-sm text-green-800">
                          Your join request will be sent to the trip organizer for review. You'll be notified once they make a decision.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setJoinStep("code")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleJoinTrip}
                      disabled={isJoinLoading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {isJoinLoading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Request
                          <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Success Message */}
            {joinStep === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Send className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Request Sent Successfully!</h3>
                <p className="text-slate-600 mb-6 px-4">
                  Your join request has been sent to the trip organizer. You'll be notified once they review your request.
                </p>
                <div className="space-y-3">
                  <Button onClick={resetJoinModal} className="w-full">
                    Close
                  </Button>
                  <p className="text-sm text-slate-500">
                    Check your dashboard for updates on your join request.
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}