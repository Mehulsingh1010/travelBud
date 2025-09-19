import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"

// Helper function to get notification icon based on type
function getNotificationIcon(type: string): string {
  switch (type) {
    case 'trip_enrollment':
      return '👥'
    case 'trip_start':
      return '📍'
    case 'trip_update':
      return '🔄'
    case 'trip_complete':
      return '✅'
    case 'join_request':
      return '🙋'
    default:
      return '🔔'
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const isRead = searchParams.get("isRead")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Build where conditions
    let whereConditions = [eq(notifications.userId, session.userId)]
    
    if (type && type !== "all") {
      whereConditions.push(eq(notifications.type, type))
    }
    
    if (isRead !== null) {
      whereConditions.push(eq(notifications.isRead, isRead === "true"))
    }

    const userNotifications = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        tripId: notifications.tripId,
        tripName: notifications.tripName,
        relatedUserId: notifications.relatedUserId,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(and(...whereConditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset)

    // Transform the data to match frontend expectations
    const transformedNotifications = userNotifications.map(notification => ({
      id: notification.id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      tripName: notification.tripName,
      userId: notification.relatedUserId?.toString(),
      timestamp: notification.createdAt,
      isRead: notification.isRead,
      icon: getNotificationIcon(notification.type), // Add icon based on type
    }))

    // Get total count for pagination
    const totalCount = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(and(...whereConditions))

    return NextResponse.json({
      notifications: transformedNotifications,
      pagination: {
        total: totalCount.length,
        limit,
        offset,
        hasMore: offset + limit < totalCount.length,
      },
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, message, tripId, tripName, relatedUserId } = body

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create notification
    const newNotification = await db
      .insert(notifications)
      .values({
        userId: session.userId,
        type,
        title,
        message,
        tripId,
        tripName,
        relatedUserId,
        isRead: false,
      })
      .returning()

    return NextResponse.json({
      notification: newNotification[0],
      message: "Notification created successfully",
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
