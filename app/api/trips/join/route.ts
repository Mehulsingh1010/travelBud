import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { trips, tripMembers } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { verifySession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { inviteCode } = await request.json()

    if (!inviteCode || inviteCode.trim().length === 0) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 })
    }

    // Find trip by invite code (case-insensitive)
    const trip = await db.select().from(trips).where(eq(trips.inviteCode, inviteCode.trim().toUpperCase())).limit(1)

    if (trip.length === 0) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 })
    }

    if (!trip[0].isActive) {
      return NextResponse.json({ error: "This trip is no longer active" }, { status: 400 })
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(tripMembers)
      .where(and(eq(tripMembers.tripId, trip[0].id), eq(tripMembers.userId, session.userId)))
      .limit(1)

    if (existingMember.length > 0) {
      return NextResponse.json({ error: "You are already a member of this trip" }, { status: 400 })
    }

    // Add user to trip
    await db.insert(tripMembers).values({
      tripId: trip[0].id,
      userId: session.userId,
    })

    return NextResponse.json({
      message: "Successfully joined trip",
      trip: {
        id: trip[0].id,
        name: trip[0].name,
        description: trip[0].description,
      },
    })
  } catch (error) {
    console.error("Join trip error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
