import { db } from "@/lib/db"
import { trips } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { JoinTripForm } from "@/components/trip/join-trip-form"

interface JoinTripPageProps {
  params: {
    inviteCode: string
  }
}

export default async function JoinTripPage({ params }: JoinTripPageProps) {
  const { inviteCode } = params

  // Find trip by invite code
  const trip = await db.select().from(trips).where(eq(trips.inviteCode, inviteCode.toUpperCase())).limit(1)

  if (trip.length === 0) {
    notFound()
  }

  return <JoinTripForm trip={trip[0]} />
}
