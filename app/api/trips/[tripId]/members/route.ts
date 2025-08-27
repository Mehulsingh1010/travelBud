import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, tripMembers, userLocations } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { verifySession } from "@/lib/auth/session"

export async function GET(request: NextRequest, { params }: { params: { tripId: string } }) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tripId = Number.parseInt(params.tripId)

    // Get trip members with their latest locations
    const members = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        latitude: userLocations.latitude,
        longitude: userLocations.longitude,
        lastUpdate: userLocations.timestamp,
      })
      .from(tripMembers)
      .leftJoin(users, eq(tripMembers.userId, users.id))
      .leftJoin(userLocations, eq(users.id, userLocations.userId))
      .where(eq(tripMembers.tripId, tripId))

    return NextResponse.json({
      members: members.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        latitude: member.latitude ? Number.parseFloat(member.latitude) : null,
        longitude: member.longitude ? Number.parseFloat(member.longitude) : null,
        lastUpdate: member.lastUpdate,
      })),
    })
  } catch (error) {
    console.error("Get trip members error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
