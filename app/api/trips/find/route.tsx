// app/api/trips/find/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { trips } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getSession } from "@/lib/auth/session"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const inviteCode = searchParams.get("inviteCode")

    if (!inviteCode) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 })
    }

    const trip = await db
      .select()
      .from(trips)
      .where(eq(trips.inviteCode, inviteCode.toUpperCase()))
      .limit(1)

    if (trip.length === 0) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      trip: trip[0] 
    })

  } catch (error) {
    console.error("Error finding trip:", error)
    return NextResponse.json(
      { error: "Failed to find trip" }, 
      { status: 500 }
    )
  }
}