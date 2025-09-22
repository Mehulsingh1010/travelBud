// app/api/trips/[tripId]/photos/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tripPhotos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";

const IMGBB_API_KEY = "17268bc13f3a0569440a3f8445248b3a";
const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

export async function GET(_req: Request, { params }: { params: { tripId: string } }) {
  try {
    const tripId = Number(params.tripId);
    if (!Number.isFinite(tripId)) return NextResponse.json({ error: "Invalid trip id" }, { status: 400 });

    const rows = await db.select().from(tripPhotos).where(eq(tripPhotos.tripId, tripId)).orderBy(tripPhotos.createdAt);
    return NextResponse.json({ photos: rows }, { status: 200 });
  } catch (err: any) {
    console.error("[GET photos]", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { tripId: string } }) {
  try {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tripId = Number(params.tripId);
    if (!Number.isFinite(tripId)) return NextResponse.json({ error: "Invalid trip id" }, { status: 400 });

    if (!IMGBB_API_KEY) return NextResponse.json({ error: "IMGBB not configured" }, { status: 500 });

    const form = await req.formData();
    const file = form.get("image") as File | null;
    const caption = String(form.get("caption") ?? "").trim();

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Convert file to base64
    const ab = await file.arrayBuffer();
    const base64 = Buffer.from(ab).toString("base64");

    // imgbb expects either multipart form or url-encoded body with image=<base64>
    const body = new URLSearchParams();
    body.append("key", IMGBB_API_KEY);
    body.append("image", base64);
    if (caption) body.append("name", caption);

    const res = await fetch(IMGBB_UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.data) {
      console.error("imgbb upload failed", json);
      throw new Error(json?.error?.message || json?.data?.error || res.statusText || "imgbb upload failed");
    }

    // imgbb returns data.display_url (or data.url) and data.delete_url
    const imageUrl = json.data.display_url ?? json.data.url;
    const deleteUrl = json.data.delete_url;

    const [inserted] = await db.insert(tripPhotos).values({
      tripId,
      userId: session.userId,
      url: imageUrl,
      deleteUrl: deleteUrl,
      caption: caption || "",
    }).returning();

    return NextResponse.json({ photo: inserted }, { status: 201 });
  } catch (err: any) {
    console.error("[POST photos]", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}