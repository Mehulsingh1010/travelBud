import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { trips, tripMembers } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { verifySession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's active trips
    const userTrips = await db
      .select({
        id: trips.id,
        name: trips.name,
        description: trips.description,
        createdAt: trips.createdAt,
        isActive: trips.isActive,
      })
      .from(trips)
      .leftJoin(tripMembers, eq(trips.id, tripMembers.tripId))
      .where(eq(tripMembers.userId, session.userId))
      .orderBy(desc(trips.createdAt))

    // Filter only active trips
    const activeTrips = userTrips.filter((trip) => trip.isActive)

    return NextResponse.json({
      trips: activeTrips,
    })
  } catch (error) {
    console.error("Get trips error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
