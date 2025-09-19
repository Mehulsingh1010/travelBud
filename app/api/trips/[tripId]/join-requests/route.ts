
// app/api/trips/request-join/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { tripJoinRequests, tripMembers, trips } from "@/lib/db/schema"
import { and, eq, or } from "drizzle-orm"
import { verifySession } from "@/lib/auth/session"

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { tripId, message } = await req.json()

    if (!tripId || isNaN(Number(tripId))) {
      return NextResponse.json({ error: "Valid Trip ID is required" }, { status: 400 })
    }

    const numericTripId = Number(tripId)

    // Check if trip exists and is active
    const trip = await db
      .select()
      .from(trips)
      .where(eq(trips.id, numericTripId))
      .limit(1)

    if (trip.length === 0) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    if (!trip[0].isActive) {
      return NextResponse.json({ error: "This trip is no longer accepting members" }, { status: 400 })
    }

    // Check if user is already a member (active or inactive)
    const existingMember = await db
      .select()
      .from(tripMembers)
      .where(
        and(
          eq(tripMembers.tripId, numericTripId),
          eq(tripMembers.userId, session.userId)
        )
      )
      .limit(1)

    if (existingMember.length > 0) {
      const status = existingMember[0].status
      if (status === "active") {
        return NextResponse.json({ error: "You are already a member of this trip" }, { status: 400 })
      } else if (status === "left") {
        return NextResponse.json({ error: "You have previously left this trip. Contact an admin to rejoin." }, { status: 400 })
      }
    }

    // Check if user already has a pending request
    const existingRequest = await db
      .select()
      .from(tripJoinRequests)
      .where(
        and(
          eq(tripJoinRequests.tripId, numericTripId),
          eq(tripJoinRequests.userId, session.userId),
          eq(tripJoinRequests.status, "pending")
        )
      )
      .limit(1)

    if (existingRequest.length > 0) {
      return NextResponse.json({ error: "You already have a pending request for this trip" }, { status: 400 })
    }

    // Create join request
    const [joinRequest] = await db
      .insert(tripJoinRequests)
      .values({
        tripId: numericTripId,
        userId: session.userId,
        message: message || null,
        status: "pending"
      })
      .returning()

    return NextResponse.json({
      message: "Join request sent successfully",
      request: joinRequest
    })

  } catch (error) {
    console.error("Error creating join request:", error)
    return NextResponse.json(
      { error: "Failed to send join request" }, 
      { status: 500 }
    )
  }
}