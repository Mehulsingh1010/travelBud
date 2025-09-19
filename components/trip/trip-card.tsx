"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Eye } from "lucide-react"
import { useMemo } from "react"
import { useRouter } from "next/navigation"

// Trip type
export type ApiTrip = {
  id: number
  name: string
  description?: string | null
  status?: string | null
  startDate?: string | Date | null
  endDate?: string | Date | null
  maxMembers?: number | null
}

// Array of available card images
const CARD_IMAGES = [
  "/card/card-img-1.png",
  "/card/card-img-2.png",
  "/card/card-img-3.png",
  "/card/card-img-4.png",
  "/card/card-img-5.png",
]

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case "planned":
      return "bg-cyan-50 text-cyan-700 border-cyan-200"
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "completed":
      return "bg-gray-100 text-gray-700 border-gray-200"
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

// Date formatter
const formatDate = (date: string | Date | null) => {
  if (!date) return null
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function TripCard({ trip }: { trip: ApiTrip }) {
  const router = useRouter()

  // Pick a random image for each card (memoized to not change on re-render)
  const randomImageSrc = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * CARD_IMAGES.length)
    return CARD_IMAGES[randomIndex]
  }, [])

  // Extract up to 3 short tags from description
  const tags =
    trip.description
      ?.split(/[,|]/)
      .map((s) => s.trim())
      .filter((s) => !!s && s.length < 20)
      .slice(0, 3) ?? []

  const handleViewTrip = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log(`Navigating to trip ${trip.id}`) // Debug log
    
    // Based on your file structure: app/trips/[tripId]/page.tsx
    router.push(`/dashboard/trips/${trip.id}`)
  }

  // Make the entire card clickable
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return
    }
    handleViewTrip(e)
  }

  return (
    <article 
      className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image + Status */}
      <div className="relative">
        <img
          src={randomImageSrc}
          alt={`${trip.name} photo`}
          className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback to a solid color if image fails to load
            e.currentTarget.style.display = 'none'
            e.currentTarget.parentElement!.style.backgroundColor = '#f1f5f9'
          }}
        />
        <div className="absolute top-3 right-3">
          <Badge
            className={`${getStatusColor(trip.status || "planned")} shadow-sm`}
          >
            {trip.status || "planned"}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <h3 className="text-slate-900 font-medium line-clamp-1">
          {trip.name}
        </h3>

        {/* Location (static for now) */}
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <MapPin className="h-4 w-4" />
          <span>Somewhere beautiful</span>
        </div>

        {/* Dates */}
        {trip.startDate && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(trip.startDate)}
              {trip.endDate && ` - ${formatDate(trip.endDate)}`}
            </span>
          </div>
        )}

        {/* Members */}
        {trip.maxMembers && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="w-4 h-4" />
            <span>Max {trip.maxMembers} members</span>
          </div>
        )}

        {/* Tags */}
        {!!tags.length && (
          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
              >
                {t}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">Trip #{trip.id}</div>
          <Button
            onClick={handleViewTrip}
            className="bg-gradient-to-r from-[#00e2b7] to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white border-0 shadow-sm"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </div>
      </div>
    </article>
  )
}

export default TripCard