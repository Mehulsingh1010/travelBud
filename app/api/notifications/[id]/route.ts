import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { isRead } = body

    // Update notification
    const updatedNotification = await db
      .update(notifications)
      .set({
        isRead: isRead,
      })
      .where(
        and(
          eq(notifications.id, parseInt(params.id)),
          eq(notifications.userId, session.userId)
        )
      )
      .returning()

    if (updatedNotification.length === 0) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      notification: updatedNotification[0],
      message: "Notification updated successfully",
    })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete notification
    const deletedNotification = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, parseInt(params.id)),
          eq(notifications.userId, session.userId)
        )
      )
      .returning()

    if (deletedNotification.length === 0) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Notification deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
