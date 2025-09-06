// app/api/trips/[tripId]/expenses/[expenseId]/comments/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expenseComments } from "@/lib/db/payments/expenseComments";
import { expenses } from "@/lib/db/payments/expenses";
import { users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";

type Params = { params: { tripId: string; expenseId: string } };

export async function GET(_req: Request, { params }: Params) {
  try {
    const tripId = Number(params.tripId);
    const expenseId = Number(params.expenseId);
    if (!Number.isFinite(tripId) || !Number.isFinite(expenseId)) {
      return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
    }

    // Ensure expense belongs to trip
    const exp = await db.query.expenses.findFirst({
      where: and(eq(expenses.id, expenseId), eq(expenses.tripId, tripId)),
    });
    if (!exp) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    // Select comments (join to users for name/avatar). Do NOT reference tripId on expenseComments.
    const rows = await db
      .select({
        id: expenseComments.id,
        userId: expenseComments.userId,
        body: expenseComments.body,
        createdAt: expenseComments.createdAt,
        updatedAt: expenseComments.updatedAt,
        isDeleted: expenseComments.isDeleted,
        userName: users.name,
        userAvatar: users.avatarUrl,
      })
      .from(expenseComments)
      .leftJoin(users, eq(users.id, expenseComments.userId))
      .where(and(eq(expenseComments.expenseId, expenseId), eq(expenseComments.isDeleted, false)))
      .orderBy(expenseComments.createdAt); // oldest first

    return NextResponse.json({ comments: rows }, { status: 200 });
  } catch (err: any) {
    console.error("[GET comments]", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await verifySession().catch(() => null);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tripId = Number(params.tripId);
    const expenseId = Number(params.expenseId);
    if (!Number.isFinite(tripId) || !Number.isFinite(expenseId)) {
      return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
    }

    const bodyJson = await req.json().catch(() => null);
    const text = (bodyJson?.body || "").trim();
    if (!text) return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });

    // Ensure expense belongs to trip
    const exp = await db.query.expenses.findFirst({
      where: and(eq(expenses.id, expenseId), eq(expenses.tripId, tripId)),
    });
    if (!exp) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    // Insert comment — insert only allowed columns on expenseComments table
    const [inserted] = await db.insert(expenseComments).values({
      expenseId,
      userId: session.userId,
      body: text,
      isDeleted: false,
    }).returning();

    return NextResponse.json({ comment: inserted }, { status: 201 });
  } catch (err: any) {
    console.error("[POST comment]", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}