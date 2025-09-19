// app/api/trips/[tripId]/photos/[photoId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tripPhotos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";

export async function DELETE(_req: Request, { params }: { params: { tripId: string; photoId: string } }) {
  try {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tripId = Number(params.tripId);
    const photoId = Number(params.photoId);
    if (!Number.isFinite(tripId) || !Number.isFinite(photoId)) return NextResponse.json({ error: "Invalid ids" }, { status: 400 });

    const [photo] = await db.select().from(tripPhotos).where(eq(tripPhotos.id, photoId)).limit(1);
    if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    if (photo.tripId !== tripId) return NextResponse.json({ error: "Photo not part of trip" }, { status: 400 });

    // Optionally: verify the user is a trip member here (recommended)
    // // Attempt to call imgbb delete_url (imgbb returns a delete_url that can be fetched to delete)
    if (photo.deleteUrl) {
      try {
        // imgbb delete URL can be a simple GET — call it, ignore errors but log them
        await fetch(photo.deleteUrl, { method: "GET", redirect: "follow" }).catch(() => null);
      } catch (err) {
        console.warn("Failed to delete from imgbb:", err);
      }
    }

    // Delete DB row (hard delete). If you prefer soft delete: update isDeleted=true.
    await db.delete(tripPhotos).where(eq(tripPhotos.id, photoId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("[DELETE photo]", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}