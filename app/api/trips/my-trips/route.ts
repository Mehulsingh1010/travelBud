// app/api/trips/my-trips/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { and, desc, eq, inArray, isNotNull, or, sql } from "drizzle-orm"
import { trips, tripMembers } from "@/lib/db/schema"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth/session"

export async function GET(req: NextRequest) {
  try {
    // Get user from session
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.userId

    // Get trips created by user
    const created = await db
      .select()
      .from(trips)
      .where(eq(trips.creatorId, userId))
      .orderBy(desc(trips.createdAt))

    // Get trips user has joined (but not created)
    const joined = await db
      .select({
        id: trips.id,
        name: trips.name,
        description: trips.description,
        creatorId: trips.creatorId,
        inviteCode: trips.inviteCode,
        status: trips.status,
        startDate: trips.startDate,
        endDate: trips.endDate,
        maxMembers: trips.maxMembers,
        isActive: trips.isActive,
        baseCurrency: trips.baseCurrency,
        createdAt: trips.createdAt,
        updatedAt: trips.updatedAt,
      })
      .from(tripMembers)
      .innerJoin(trips, eq(tripMembers.tripId, trips.id))
      .where(
        and(
          eq(tripMembers.userId, userId),
          eq(tripMembers.status, "approved"),
          // Don't include trips created by this user (they're already in 'created')
          sql`${trips.creatorId} != ${userId}`
        )
      )
      .orderBy(desc(trips.createdAt))

    // Get completed/cancelled trips (both created and joined)
    const history = await db
      .selectDistinct({
        id: trips.id,
        name: trips.name,
        description: trips.description,
        creatorId: trips.creatorId,
        inviteCode: trips.inviteCode,
        status: trips.status,
        startDate: trips.startDate,
        endDate: trips.endDate,
        maxMembers: trips.maxMembers,
        isActive: trips.isActive,
        baseCurrency: trips.baseCurrency,
        createdAt: trips.createdAt,
        updatedAt: trips.updatedAt,
      })
      .from(trips)
      .leftJoin(tripMembers, eq(tripMembers.tripId, trips.id))
      .where(
        and(
          // User is either creator or approved member
          or(
            eq(trips.creatorId, userId),
            and(eq(tripMembers.userId, userId), eq(tripMembers.status, "approved"))
          ),
          // Trip is completed/cancelled or past end date
          or(
            inArray(trips.status, ["completed", "cancelled"]),
            and(isNotNull(trips.endDate), sql`${trips.endDate} < now()`)
          )
        )
      )
      .orderBy(desc(trips.endDate), desc(trips.createdAt))

    return NextResponse.json({ 
      userId, 
      created, 
      joined, 
      history 
    })

  } catch (error) {
    console.error("Error fetching user trips:", error)
    return NextResponse.json(
      { error: "Failed to fetch trips" }, 
      { status: 500 }
    )
  }
}