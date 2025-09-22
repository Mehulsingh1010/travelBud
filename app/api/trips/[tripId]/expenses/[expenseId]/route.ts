// app/api/trips/[tripId]/expenses/[expenseId]/route.ts
import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { trips, tripMembers, users } from "@/lib/db/schema"
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

// app/api/trips/[tripId]/expenses/[expenseId]/route.ts
import { verifySession } from "@/lib/auth/session";
// import { trips, tripMembers, expenses } from "@/lib/db/schema"; // adjust if your exports differ

export async function DELETE(_req: Request, { params }: { params: { tripId: string; expenseId: string } }) {
  try {
    const session = await verifySession().catch(() => null);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tripId = Number(params.tripId);
    const expenseId = Number(params.expenseId);
    if (!Number.isFinite(tripId) || !Number.isFinite(expenseId)) {
      return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
    }

    // Ensure trip exists
    const tripRow = await db.query.trips.findFirst({ where: eq(trips.id, tripId) });
    if (!tripRow) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    // Fetch expense to get createdBy
    const exp = await db.query.expenses.findFirst({ where: and(eq(expenses.id, expenseId), eq(expenses.tripId, tripId)) });
    if (!exp) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    // Check permission: owner (createdBy) OR trip admin/creator
    if (exp.createdBy === session.userId) {
      // owner -> allowed
    } else {
      // check membership role
      const membership = await db.query.tripMembers.findFirst({
        where: and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, session.userId)),
      });
      const role = membership?.role ?? null;
      if (!(role === "creator" || role === "admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Perform deletion. Use cascading delete in DB (if configured) or do transactional deletes.
    // Here we do a DELETE on expenses row — adjust if you want soft-delete: set isDeleted flag instead.
    await db.delete(expenses).where(eq(expenses.id, expenseId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("[DELETE expense]", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}