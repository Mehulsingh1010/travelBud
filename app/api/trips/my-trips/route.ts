import { type NextRequest, NextResponse } from "next/server"
import { and, desc, eq, inArray, isNotNull, or, sql } from "drizzle-orm"
import { trips, tripMembers } from "@/lib/db/schema"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const headerUserId = req.headers.get("x-user-id")
  const userIdParam = searchParams.get("userId")
  const userId = Number(headerUserId || userIdParam || 1) // temporary fallback for demo

  try {
    

    const created = await db.select().from(trips).where(eq(trips.creatorId, userId)).orderBy(desc(trips.createdAt))

    const joined = await db
      .select({
        id: trips.id,
        name: trips.name,
        description: trips.description,
        creatorId: trips.creatorId,
        status: trips.status,
        startDate: trips.startDate,
        endDate: trips.endDate,
        createdAt: trips.createdAt,
      })
      .from(tripMembers)
      .innerJoin(trips, eq(tripMembers.tripId, trips.id))
      .where(and(eq(tripMembers.userId, userId), eq(tripMembers.status, "approved")))
      .orderBy(desc(trips.createdAt))

    const history = await db
      .selectDistinct({
        id: trips.id,
        name: trips.name,
        description: trips.description,
        creatorId: trips.creatorId,
        status: trips.status,
        startDate: trips.startDate,
        endDate: trips.endDate,
        createdAt: trips.createdAt,
      })
      .from(trips)
      .leftJoin(tripMembers, eq(tripMembers.tripId, trips.id))
      .where(
        and(
          or(eq(trips.creatorId, userId), eq(tripMembers.userId, userId)),
          or(
            inArray(trips.status, ["completed", "cancelled"]),
            and(isNotNull(trips.endDate), sql`(${trips.endDate}) < now()`),
          ),
        ),
      )
      .orderBy(desc(trips.endDate), desc(trips.createdAt))

    return NextResponse.json({ userId, created, joined, history })
  } catch (err: any) {
    // Graceful fallback so the UI renders without the DB configured
    return err;
  }
}
