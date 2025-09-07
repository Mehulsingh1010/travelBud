
// app/api/trips/[tripId]/requests/[requestId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { tripJoinRequests, tripMembers, trips } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { verifySession } from "@/lib/auth/session"

interface Params {
  tripId: string
  requestId: string
}

// Accept join request
export async function PUT(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await req.json() // "accept" or "reject"
    const tripId = Number.parseInt(params.tripId)
    const requestId = Number.parseInt(params.requestId)

    if (isNaN(tripId) || isNaN(requestId)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Check if current user is admin/creator of the trip
    const membership = await db
      .select()
      .from(tripMembers)
      .where(
        and(
          eq(tripMembers.tripId, tripId),
          eq(tripMembers.userId, session.userId),
          eq(tripMembers.status, "active")
        )
      )
      .limit(1)

    if (membership.length === 0) {
      return NextResponse.json({ error: "You are not a member of this trip" }, { status: 403 })
    }

    const userRole = membership[0].role
    if (userRole !== "creator" && userRole !== "admin") {
      return NextResponse.json({ error: "Only admins and creators can manage join requests" }, { status: 403 })
    }

    // Get the join request
    const joinRequest = await db
      .select()
      .from(tripJoinRequests)
      .where(
        and(
          eq(tripJoinRequests.id, requestId),
          eq(tripJoinRequests.tripId, tripId),
          eq(tripJoinRequests.status, "pending")
        )
      )
      .limit(1)

    if (joinRequest.length === 0) {
      return NextResponse.json({ error: "Join request not found or already processed" }, { status: 404 })
    }

    const request = joinRequest[0]

    if (action === "accept") {
      // Start transaction to ensure data consistency
      await db.transaction(async (tx) => {
        // Update join request status
        await tx
          .update(tripJoinRequests)
          .set({ 
            status: "approved",
            processedAt: new Date(),
            processedBy: session.userId
          })
          .where(eq(tripJoinRequests.id, requestId))

        // Add user as trip member
        await tx
          .insert(tripMembers)
          .values({
            tripId: tripId,
            userId: request.userId,
            role: "member",
            status: "active",
            joinedAt: new Date()
          })
      })

      return NextResponse.json({ message: "Join request accepted successfully" })
    } else {
      // Reject the request
      await db
        .update(tripJoinRequests)
        .set({ 
          status: "rejected",
          processedAt: new Date(),
          processedBy: session.userId
        })
        .where(eq(tripJoinRequests.id, requestId))

      return NextResponse.json({ message: "Join request rejected" })
    }

  } catch (error) {
    console.error("Error processing join request:", error)
    return NextResponse.json(
      { error: "Failed to process join request" }, 
      { status: 500 }
    )
  }
}

// Delete/cancel join request (for requesters to cancel their own requests)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tripId = Number.parseInt(params.tripId)
    const requestId = Number.parseInt(params.requestId)

    if (isNaN(tripId) || isNaN(requestId)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    // Check if the request belongs to the current user and is pending
    const joinRequest = await db
      .select()
      .from(tripJoinRequests)
      .where(
        and(
          eq(tripJoinRequests.id, requestId),
          eq(tripJoinRequests.tripId, tripId),
          eq(tripJoinRequests.userId, session.userId),
          eq(tripJoinRequests.status, "pending")
        )
      )
      .limit(1)

    if (joinRequest.length === 0) {
      return NextResponse.json({ error: "Join request not found or cannot be cancelled" }, { status: 404 })
    }

    // Delete the join request
    await db
      .delete(tripJoinRequests)
      .where(eq(tripJoinRequests.id, requestId))

    return NextResponse.json({ message: "Join request cancelled successfully" })

  } catch (error) {
    console.error("Error cancelling join request:", error)
    return NextResponse.json(
      { error: "Failed to cancel join request" }, 
      { status: 500 }
    )
  }
}