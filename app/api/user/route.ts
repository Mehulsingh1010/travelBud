import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session"

export async function GET(req: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (err: any) {
    console.error("GET /api/user error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
export async function PUT(req: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json();
    const { phoneNumber, countryCode, address, description, avatarUrl, isNameVerified, isPhoneVerified, isAddressVerified } = body;

    await db
      .update(users)
      .set({
        phoneNumber,
        countryCode,
        address,
        description,
        avatarUrl,
        isNameVerified,
        isPhoneVerified,
        isAddressVerified,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.userId))

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("PUT /api/user error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
