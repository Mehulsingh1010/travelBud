// app/dashboard/trips/[tripId]/page.tsx
import { verifySession } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { trips, tripMembers, users, tripJoinRequests, tripPhotos } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"
import { TripManagement } from "@/components/trip/trip-management"
import { getBalances } from "@/lib/expenses/getBalance";

interface TripPageProps {
  params: {
    tripId: string
    currentUserId: number;
  }
}

export default async function TripPage({ params }: TripPageProps) {
  const session = await verifySession()

  if (!session) {
    redirect("/login")
  }

  const tripId = Number.parseInt(params.tripId)

  // Get balances
  const balances = await getBalances(tripId, session.userId)

  // Get trip details
  const trip = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1)

  if (trip.length === 0) {
    notFound()
  }

  // Check if user is a member of this trip
  const membership = await db
    .select()
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, session.userId)))
    .limit(1)

  if (membership.length === 0) {
    redirect("/dashboard")
  }

  // Get all trip members
  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: tripMembers.role,
      status: tripMembers.status,
      joinedAt: tripMembers.joinedAt,
    })
    .from(tripMembers)
    .leftJoin(users, eq(tripMembers.userId, users.id))
    .where(eq(tripMembers.tripId, tripId))
    .orderBy(desc(tripMembers.joinedAt))

 // fetch rows from DB
 const rows = await db.select().from(tripPhotos).where(eq(tripPhotos.tripId, tripId)).orderBy(tripPhotos.createdAt);
 
 // convert Date -> ISO string so it's serializable & meets client types
 const initialPhotos = rows.map((p) => ({
   id: p.id,
   tripId: p.tripId,
   userId: p.userId,
   url: p.url,
   caption: p.caption ?? null,
   // convert Date to ISO string (or null)
   createdAt: p.createdAt ? (p.createdAt as Date).toISOString() : null,
 }))

  // Get pending join requests (only for admins/creators)
  const isAdmin = membership[0].role === "creator" || membership[0].role === "admin"
  let joinRequests: any[] = []

  if (isAdmin) {
    joinRequests = await db
      .select({
        id: tripJoinRequests.id,
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        message: tripJoinRequests.message,
        requestedAt: tripJoinRequests.requestedAt,
      })
      .from(tripJoinRequests)
      .leftJoin(users, eq(tripJoinRequests.userId, users.id))
      .where(and(eq(tripJoinRequests.tripId, tripId), eq(tripJoinRequests.status, "pending")))
      .orderBy(desc(tripJoinRequests.requestedAt))
  }

  return (
    <TripManagement
      trip={trip[0]}
      members={members}
      joinRequests={joinRequests}
      currentUser={session}
      userRole={membership[0].role!}
      tripId={tripId}
      balances={balances}
      initialPhotos={initialPhotos}
      />
  )
}
