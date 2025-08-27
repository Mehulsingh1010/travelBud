import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { trips, tripMembers } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { verifySession } from "@/lib/auth/session"

export async function POST(request: NextRequest, { params }: { params: { tripId: string } }) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tripId = Number.parseInt(params.tripId)

    // Check if user is creator or admin of the trip
    const membership = await db
      .select()
      .from(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, session.userId)))
      .limit(1)

    if (membership.length === 0 || (membership[0].role !== "creator" && membership[0].role !== "admin")) {
      return NextResponse.json({ error: "Only trip creators and admins can end trips" }, { status: 403 })
    }

    // Update trip status to completed
    await db
      .update(trips)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId))

    return NextResponse.json({
      message: "Trip ended successfully",
    })
  } catch (error) {
    console.error("End trip error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
