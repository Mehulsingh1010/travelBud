// app/api/trips/[tripId]/settlements/route.ts
import { NextResponse } from "next/server"
import { z } from "zod"
import { verifySession } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { trips } from "@/lib/db/schema"
import { settlements } from "@/lib/db/payments/settlements"
import { eq } from "drizzle-orm"

const createSettlementSchema = z.object({
  toUserId: z.number().int().positive(),
  amount: z.number().int().positive(),     // smallest units (e.g. paise)
  currency: z.string().min(1),
  note: z.string().max(255).optional(),
})

export async function POST(
  req: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tripId = Number(params.tripId)
    if (!Number.isFinite(tripId)) {
      return NextResponse.json({ error: "Invalid trip id" }, { status: 400 })
    }

    const body = await req.json()
    const data = createSettlementSchema.parse(body)

    // ensure trip exists (and optionally that the user is part of it)
    const tripRow = await db.query.trips.findFirst({ where: eq(trips.id, tripId) })
    if (!tripRow) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    const [row] = await db
      .insert(settlements)
      .values({
        tripId,
        fromUserId: session.userId,       // the current user is paying
        toUserId: data.toUserId,
        amount: data.amount,              // already in smallest units
        currency: data.currency,
        note: data.note,
      })
      .returning()

    return NextResponse.json({ success: true, settlement: row }, { status: 201 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || "Failed to create settlement" }, { status: 400 })
  }
}