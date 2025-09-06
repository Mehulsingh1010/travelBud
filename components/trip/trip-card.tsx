import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

export type ApiTrip = {
  id: number
  name: string
  description?: string | null
  status?: string | null
  startDate?: string | Date | null
  endDate?: string | Date | null
}

// Array of available card images
const CARD_IMAGES = [
  "/card/card-img-1.png",
  "/card/card-img-2.png", 
  "/card/card-img-3.png",
  "/card/card-img-4.png",
  "/card/card-img-5.png"
]

function getRandomImage() {
  const randomIndex = Math.floor(Math.random() * CARD_IMAGES.length)
  return CARD_IMAGES[randomIndex]
}

function BluePlaceholder({ seed = 7 }: { seed?: number }) {
  const base = 205 + (seed % 20)
  const c1 = `hsl(${base} 90% 55%)`
  const c2 = `hsl(${base + 12} 85% 45%)`
  return (
    <div
      aria-hidden="true"
      className="h-40 w-full rounded-xl"
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
    />
  )
}

export function TripCard({ trip, seed = 1 }: { trip: ApiTrip; seed?: number }) {
  const randomImageSrc = getRandomImage()
  const tags =
    trip.description
      ?.split(/[,|]/)
      .map((s) => s.trim())
      .filter((s) => !!s && s.length < 20)
      .slice(0, 3) ?? []

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="relative">
        {randomImageSrc ? (
          <img src={randomImageSrc} alt={`${trip.name} photo`} className="h-40 w-full object-cover" />
        ) : (
          <BluePlaceholder seed={seed} />
        )}
        <div className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-medium shadow">
          {trip.status ?? "Trip"}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-slate-900 font-medium">{trip.name}</h3>
        <div className="mt-1 flex items-center gap-2 text-slate-500 text-sm">
          <MapPin className="h-4 w-4" />
          <span>Somewhere beautiful</span>
        </div>
        {!!tags.length && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export default TripCard