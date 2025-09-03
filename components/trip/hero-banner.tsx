"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function HeroBanner({ name = "Traveler" }: { name?: string }) {
  return (
    <section className="mb-6 rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className={cn("grid gap-6 p-6 md:p-8 md:grid-cols-2 items-center")}>
        <div>
          <p className="text-xs uppercase tracking-widest text-blue-600 font-medium">TravelBuddy</p>
          <h1
            className={cn(
              "font-sans text-3xl md:text-5xl font-semibold text-balance",
              "text-slate-900 dark:text-slate-100",
            )}
          >
            Welcome {name}. Plan, explore and go.
          </h1>
          <p className="mt-2 text-muted-foreground text-pretty">
            Track adventures, find inspiration, and coordinate with your crew — all in one place.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Create Trip</Button>
            <Button variant="outline">Explore Ideas</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs">Hiking</span>
            <span className="rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-xs">Beaches</span>
            <span className="rounded-full bg-rose-50 text-rose-700 px-3 py-1 text-xs">Culture</span>
          </div>
        </div>
        <div className="relative">
          <img
            src="/card/hero.webp"
            alt="Travel collage"
            className="w-full h-56 md:h-72 object-cover rounded-xl shadow-md"
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
        </div>
      </div>
    </section>
  )
}
