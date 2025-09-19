import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mark all user's notifications as read
    const updatedNotifications = await db
      .update(notifications)
      .set({
        isRead: true,
      })
      .where(eq(notifications.userId, session.userId))
      .returning()

    return NextResponse.json({
      message: `Marked ${updatedNotifications.length} notifications as read`,
      count: updatedNotifications.length,
    })
  } catch (error) {
    console.error("Error marking notifications as read:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
