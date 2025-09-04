// app/api/trips/[tripId]/expenses/route.ts
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { expenses, expensePayers, expenseSplits, fxRates } from "@/lib/db/payments"
import { trips } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { verifySession } from "@/lib/auth/session"

// ----------------------
// Validation schema
// ----------------------

const createExpenseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().positive(), // original amount (float, e.g. 123.45)
  currency: z.string().min(1),   // e.g. "USD"
  expenseDate: z.string().datetime(), // ISO string
  payers: z.array(
    z.object({
      userId: z.number().int(),
      mode: z.enum(["absolute", "percentage", "shares","equal"]).default("equal"),
      value: z.number().positive().optional(),
    })
  ),
  splits: z.array(
    z.object({
      userId: z.number().int(),
      mode: z.enum(["equal", "absolute", "percentage", "shares"]).default("equal"),
      value: z.number().positive().optional(),
    })
  ),
})

// ----------------------
// Helpers
// ----------------------

// Fair rounding distribution
function distributeRemainder(total: number, shares: number[], userIds: number[], seed: string) {
  const sumShares = shares.reduce((s, x) => s + x, 0)
  let allocations = shares.map(s => Math.floor((s * total) / sumShares))
  let allocated = allocations.reduce((s, x) => s + x, 0)
  let remainder = total - allocated

  // deterministic order: sort userIds by hash(seed+userId)
  const order = [...userIds].sort((a, b) => {
    const ha = (seed + a).split("").reduce((h, c) => h + c.charCodeAt(0), 0)
    const hb = (seed + b).split("").reduce((h, c) => h + c.charCodeAt(0), 0)
    return ha - hb
  })

  let i = 0
  while (remainder > 0) {
    const idx = userIds.indexOf(order[i % order.length])
    allocations[idx]++
    remainder--
    i++
  }

  return allocations
}

// Currency conversion
async function convertToBase(amount: number, from: string, base: string) {
  if (from === base) return Math.round(amount * 100) // already in base

  const rateRow = await db.query.fxRates.findFirst({
    where: eq(fxRates.base, base),
    orderBy: (t, { desc }) => desc(t.fetchedAt),
  })
  if (!rateRow) throw new Error("FX rates not available")
  const rate = (rateRow.rates as Record<string, number>)[from]
  if (!rate) throw new Error(`FX rate not available for ${from}`)
  return Math.round(amount * rate * 100) // store in smallest units
}

// ----------------------
// POST handler
// ----------------------

export async function POST(
  req: Request,
  { params }: { params: { tripId: string } }
) {
  const session = await verifySession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const tripId = Number(params.tripId)
    const body = await req.json()
    const data = createExpenseSchema.parse(body)

    // fetch trip (to get base currency)
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    })
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 })

    const baseCurrency = trip.baseCurrency || "INR"

    // convert original -> base
    const amountConverted = await convertToBase(data.amount, data.currency, baseCurrency)

    // ----------------------
    // Handle payers
    // ----------------------
    const payerMode = data.payers[0].mode
    if (!data.payers.every(p => p.mode === payerMode)) {
      throw new Error("All payers must use the same mode")
    }

    let payerShares: number[]
    if (payerMode === "equal") {
      payerShares = data.payers.map(() => 1)
    } else if (payerMode === "absolute") {
      const total = data.payers.reduce((s, p) => s + (p.value ?? 0), 0)
      if (Math.round(total * 100) !== Math.round(data.amount * 100)) {
        throw new Error("Sum of absolute payer amounts must equal expense amount")
      }
      payerShares = data.payers.map(p => Math.round((p.value ?? 0) * 100))
    } else if (payerMode === "percentage") {
      const total = data.payers.reduce((s, p) => s + (p.value ?? 0), 0)
      if (Math.round(total) !== 100) {
        throw new Error("Sum of payer percentages must equal 100")
      }
      payerShares = data.payers.map(p => ((p.value ?? 0) / 100) * amountConverted)
    } else { // shares
      const totalShares = data.payers.reduce((s, p) => s + (p.value ?? 0), 0)
      payerShares = data.payers.map(p => ((p.value ?? 0) / totalShares) * amountConverted)
    }

    const payerAlloc = distributeRemainder(
      amountConverted,
      payerShares,
      data.payers.map(p => p.userId),
      "payers"
    )

    // ----------------------
    // Handle splits
    // ----------------------
    const splitMode = data.splits[0].mode
    if (!data.splits.every(s => s.mode === splitMode)) {
      throw new Error("All splits must use the same mode")
    }

    let splitShares: number[]
    if (splitMode === "equal") {
      splitShares = data.splits.map(() => 1)
    } else if (splitMode === "absolute") {
      const total = data.splits.reduce((s, sp) => s + (sp.value ?? 0), 0)
      if (Math.round(total * 100) !== Math.round(data.amount * 100)) {
        throw new Error("Sum of split absolutes must equal expense amount")
      }
      splitShares = data.splits.map(sp => Math.round((sp.value ?? 0) * 100))
    } else if (splitMode === "percentage") {
      const total = data.splits.reduce((s, sp) => s + (sp.value ?? 0), 0)
      if (Math.round(total) !== 100) {
        throw new Error("Sum of split percentages must equal 100")
      }
      splitShares = data.splits.map(sp => ((sp.value ?? 0) / 100) * amountConverted)
    } else { // shares
      const totalShares = data.splits.reduce((s, sp) => s + (sp.value ?? 0), 0)
      splitShares = data.splits.map(sp => ((sp.value ?? 0) / totalShares) * amountConverted)
    }

    const splitAlloc = distributeRemainder(
      amountConverted,
      splitShares,
      data.splits.map(s => s.userId),
      "splits"
    )

    // ----------------------
    // DB transaction
    // ----------------------
    const result = await db.transaction(async (tx) => {
      // insert expense
      const [expense] = await tx.insert(expenses).values({
        tripId,
        title: data.title,
        description: data.description,
        amountOriginal: Math.round(data.amount * 100),
        currencyOriginal: data.currency,
        amountConverted,
        baseCurrency,
        expenseDate: new Date(data.expenseDate),
        createdBy: session.userId,
      }).returning()

      // insert payers
      for (let i = 0; i < data.payers.length; i++) {
        await tx.insert(expensePayers).values({
          expenseId: expense.id,
          userId: data.payers[i].userId,
          amount: payerAlloc[i],
          mode: payerMode,
          shareValue: data.payers[i].value,
        })
      }

      // insert splits
      for (let i = 0; i < data.splits.length; i++) {
        await tx.insert(expenseSplits).values({
          expenseId: expense.id,
          userId: data.splits[i].userId,
          amountOwed: splitAlloc[i],
          mode: splitMode,
          shareValue: data.splits[i].value,
        })
      }

      return expense
    })

    return NextResponse.json({ success: true, expense: result }, { status: 201 })

  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}