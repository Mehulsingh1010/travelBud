import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { trips, tripMembers, notifications } from "@/lib/db/schema"
import { verifySession } from "@/lib/auth/session"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, startDate, endDate, maxMembers } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Trip name is required" }, { status: 400 })
    }

    // Generate unique invite code (uppercase for consistency)
    const inviteCode = nanoid(10).toUpperCase()

    // Create trip
    const newTrip = await db
      .insert(trips)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        creatorId: session.userId,
        inviteCode,
        status: "planned",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        maxMembers: maxMembers || 10,
        isActive: true,
      })
      .returning({
        id: trips.id,
        name: trips.name,
        description: trips.description,
        inviteCode: trips.inviteCode,
      })

    // Add creator as first member with creator role
    await db.insert(tripMembers).values({
      tripId: newTrip[0].id,
      userId: session.userId,
      role: "creator",
      status: "approved",
    })

    // Create notification for trip creation
    try {
      await db.insert(notifications).values({
        userId: session.userId,
        type: 'trip_enrollment',
        title: 'Trip Created',
        message: `You've successfully created "${newTrip[0].name}"`,
        tripId: newTrip[0].id,
        tripName: newTrip[0].name,
        isRead: false,
      })
    } catch (notificationError) {
      console.error("Failed to create trip creation notification:", notificationError)
      // Don't fail the trip creation if notification fails
    }

    return NextResponse.json({
      message: "Trip created successfully",
      trip: newTrip[0],
    })
  } catch (error) {
    console.error("Create trip error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
