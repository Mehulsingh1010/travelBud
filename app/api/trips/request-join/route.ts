import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { trips, tripMembers, tripJoinRequests } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { verifySession } from "@/lib/auth/session"
import { createJoinRequestNotification } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ error: "Please sign in to join trips" }, { status: 401 })
    }

    const { tripId, message } = await request.json()

    if (!tripId) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 })
    }

    // Check if trip exists and is not completed
    const trip = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1)

    if (trip.length === 0) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    if (trip[0].status === "completed") {
      return NextResponse.json({ error: "This trip has already ended" }, { status: 400 })
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, session.userId)))
      .limit(1)

    if (existingMember.length > 0) {
      return NextResponse.json({ error: "You are already a member of this trip" }, { status: 400 })
    }

    // Check if user already has a pending request
    const existingRequest = await db
      .select()
      .from(tripJoinRequests)
      .where(and(eq(tripJoinRequests.tripId, tripId), eq(tripJoinRequests.userId, session.userId)))
      .limit(1)

    if (existingRequest.length > 0) {
      if (existingRequest[0].status === "pending") {
        return NextResponse.json({ error: "You already have a pending request for this trip" }, { status: 400 })
      }
      if (existingRequest[0].status === "rejected") {
        return NextResponse.json({ error: "Your previous request was rejected" }, { status: 400 })
      }
    }

    // Create join request
    await db.insert(tripJoinRequests).values({
      tripId,
      userId: session.userId,
      message: message?.trim() || null,
      status: "pending",
    })

    // Create notification for trip creator
    try {
      await createJoinRequestNotification(
        trip[0].creatorId!,
        session.userId,
        session.name,
        tripId,
        trip[0].name
      )
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError)
      // Don't fail the request if notification creation fails
    }

    return NextResponse.json({
      message: "Join request sent successfully",
    })
  } catch (error) {
    console.error("Request join error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
