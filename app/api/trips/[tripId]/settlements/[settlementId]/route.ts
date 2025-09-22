// app/api/trips/[tripId]/settlements/[settlementId]/route.ts
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { settlements } from "@/lib/db/payments/settlements";
import { trips, tripMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

type Params = { params: { tripId: string; settlementId: string } };

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await verifySession().catch(() => null);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tripId = Number(params.tripId);
    const settlementId = Number(params.settlementId);

    if (!Number.isFinite(tripId) || !Number.isFinite(settlementId)) {
      return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
    }

    // ensure trip exists
    const tripRow = await db.query.trips.findFirst({ where: eq(trips.id, tripId) });
    if (!tripRow) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    // ensure settlement exists & belongs to trip
    const settlementRow = await db.query.settlements.findFirst({
      where: and(eq(settlements.id, settlementId), eq(settlements.tripId, tripId)),
    });
    if (!settlementRow) return NextResponse.json({ error: "Settlement not found" }, { status: 404 });

    // permission check:
    // allowed if current user is payer (fromUserId) OR receiver (toUserId)
    // OR if user is admin/creator of the trip
    const isPayer = session.userId === settlementRow.fromUserId;
    const isReceiver = session.userId === settlementRow.toUserId;

    // check membership to detect admin/creator
    const membership = await db.query.tripMembers.findFirst({
      where: and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, session.userId)),
    });

    const isAdmin = membership && (membership.role === "creator" || membership.role === "admin");

    if (!isPayer && !isReceiver && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the settlement (hard delete). If you prefer soft-delete, update row instead.
    await db
      .delete(settlements)
      .where(eq(settlements.id, settlementId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("[DELETE settlement]", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}