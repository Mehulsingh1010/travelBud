import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    // TODO: replace with real session/email
    const email = "test@example.com";

    const result = await db.select().from(users).where(eq(users.email, email));

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
export async function PUT(req: Request) {
  const email = "test@example.com"; 
  const body = await req.json();
  const { phoneNumber, address, description, avatarUrl } = body;

  await db
    .update(users)
    .set({
      phoneNumber,
      address,
      description,
      avatarUrl,
      updatedAt: new Date(),
    })
    .where(eq(users.email, email));

  return NextResponse.json({ success: true });
}