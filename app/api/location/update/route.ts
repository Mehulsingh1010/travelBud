import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { userLocations } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { verifySession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { tripId, latitude, longitude, accuracy } = await request.json()

    if (!tripId || !latitude || !longitude) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update or insert user location
    const existingLocation = await db
      .select()
      .from(userLocations)
      .where(and(eq(userLocations.userId, session.userId), eq(userLocations.tripId, tripId)))
      .limit(1)

    if (existingLocation.length > 0) {
      // Update existing location
      await db
        .update(userLocations)
        .set({
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          accuracy: accuracy?.toString() || null,
          timestamp: new Date(),
        })
        .where(and(eq(userLocations.userId, session.userId), eq(userLocations.tripId, tripId)))
    } else {
      // Insert new location
      await db.insert(userLocations).values({
        userId: session.userId,
        tripId,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        accuracy: accuracy?.toString() || null,
      })
    }

    return NextResponse.json({
      message: "Location updated successfully",
    })
  } catch (error) {
    console.error("Update location error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
