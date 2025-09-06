import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { trips, users } from "@/lib/db/schema"
import { expenses, expensePayers, expenseSplits } from "@/lib/db/payments"

type RouteParams = {
  params: { tripId: string; expenseId: string }
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const tripId = Number(params.tripId)
    const expenseId = Number(params.expenseId)

    if (!Number.isFinite(tripId) || !Number.isFinite(expenseId)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 })
    }

    // Ensure trip exists (and acts as scope guard)
    const tripRow = await db.query.trips.findFirst({ where: eq(trips.id, tripId) })
    if (!tripRow) return NextResponse.json({ error: "Trip not found" }, { status: 404 })

    // Expense row (scoped to trip)
    const expenseRow = await db.query.expenses.findFirst({
      where: and(eq(expenses.id, expenseId), eq(expenses.tripId, tripId)),
    })
    if (!expenseRow) return NextResponse.json({ error: "Expense not found" }, { status: 404 })

    // Payers with user info
    const payers = await db
      .select({
        userId: expensePayers.userId,
        amount: expensePayers.amount, // smallest units in base currency
        mode: expensePayers.mode,
        shareValue: expensePayers.shareValue,
        name: users.name,
        avatarUrl: users.avatarUrl,
      })
      .from(expensePayers)
      .leftJoin(users, eq(users.id, expensePayers.userId))
      .where(eq(expensePayers.expenseId, expenseId))

    // Splits with user info
    const splits = await db
      .select({
        userId: expenseSplits.userId,
        amountOwed: expenseSplits.amountOwed, // smallest units in base currency
        mode: expenseSplits.mode,
        shareValue: expenseSplits.shareValue,
        name: users.name,
        avatarUrl: users.avatarUrl,
      })
      .from(expenseSplits)
      .leftJoin(users, eq(users.id, expenseSplits.userId))
      .where(eq(expenseSplits.expenseId, expenseId))

    // Assemble response
    return NextResponse.json({
      expense: {
        id: expenseRow.id,
        tripId: expenseRow.tripId,
        title: expenseRow.title,
        description: expenseRow.description,
        amountOriginal: expenseRow.amountOriginal,     // in smallest units of original currency
        currencyOriginal: expenseRow.currencyOriginal,
        amountConverted: expenseRow.amountConverted,   // in smallest units of base currency
        baseCurrency: expenseRow.baseCurrency,
        expenseDate: expenseRow.expenseDate,
        createdBy: expenseRow.createdBy,
        createdAt: expenseRow.createdAt,
        updatedAt: expenseRow.updatedAt,
      },
      payers,
      splits,
      // (Optional) comments can be added later here
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 })
  }
}