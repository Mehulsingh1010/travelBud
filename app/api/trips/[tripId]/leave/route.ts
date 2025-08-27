import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { tripMembers } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { verifySession } from "@/lib/auth/session"

export async function POST(request: NextRequest, { params }: { params: { tripId: string } }) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tripId = Number.parseInt(params.tripId)

    // Check if user is a member and not the creator
    const membership = await db
      .select()
      .from(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, session.userId)))
      .limit(1)

    if (membership.length === 0) {
      return NextResponse.json({ error: "You are not a member of this trip" }, { status: 400 })
    }

    if (membership[0].role === "creator") {
      return NextResponse.json({ error: "Trip creators cannot leave their own trips" }, { status: 400 })
    }

    // Remove user from trip
    await db.delete(tripMembers).where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, session.userId)))

    return NextResponse.json({
      message: "Successfully left the trip",
    })
  } catch (error) {
    console.error("Leave trip error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
