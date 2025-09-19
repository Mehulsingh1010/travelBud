import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"

export interface CreateNotificationParams {
  userId: number
  type: 'trip_enrollment' | 'trip_start' | 'trip_update' | 'trip_complete' | 'join_request'
  title: string
  message: string
  tripId?: number
  tripName?: string
  relatedUserId?: number
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const newNotification = await db
      .insert(notifications)
      .values({
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        tripId: params.tripId,
        tripName: params.tripName,
        relatedUserId: params.relatedUserId,
        isRead: false,
      })
      .returning()

    return newNotification[0]
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

export async function createTripEnrollmentNotification(
  userId: number,
  tripId: number,
  tripName: string
) {
  return createNotification({
    userId,
    type: 'trip_enrollment',
    title: 'Trip Enrollment',
    message: `You've been added to ${tripName}`,
    tripId,
    tripName,
  })
}

export async function createTripStartNotification(
  userId: number,
  tripId: number,
  tripName: string
) {
  return createNotification({
    userId,
    type: 'trip_start',
    title: 'Trip Started',
    message: `${tripName} has started! Check the live map`,
    tripId,
    tripName,
  })
}

export async function createTripUpdateNotification(
  userId: number,
  tripId: number,
  tripName: string,
  updateMessage: string
) {
  return createNotification({
    userId,
    type: 'trip_update',
    title: 'Trip Update',
    message: `New update in ${tripName}: ${updateMessage}`,
    tripId,
    tripName,
  })
}

export async function createTripCompleteNotification(
  userId: number,
  tripId: number,
  tripName: string
) {
  return createNotification({
    userId,
    type: 'trip_complete',
    title: 'Trip Completed',
    message: `${tripName} has been completed successfully`,
    tripId,
    tripName,
  })
}

export async function createJoinRequestNotification(
  tripCreatorId: number,
  requestingUserId: number,
  requestingUserName: string,
  tripId: number,
  tripName: string
) {
  return createNotification({
    userId: tripCreatorId,
    type: 'join_request',
    title: 'Join Request',
    message: `${requestingUserName} wants to join your trip ${tripName}`,
    tripId,
    tripName,
    relatedUserId: requestingUserId,
  })
}

export async function createBulkNotifications(
  userIds: number[],
  params: Omit<CreateNotificationParams, 'userId'>
) {
  try {
    const notificationValues = userIds.map(userId => ({
      userId,
      type: params.type,
      title: params.title,
      message: params.message,
      tripId: params.tripId,
      tripName: params.tripName,
      relatedUserId: params.relatedUserId,
      isRead: false,
    }))

    const newNotifications = await db
      .insert(notifications)
      .values(notificationValues)
      .returning()

    return newNotifications
  } catch (error) {
    console.error("Error creating bulk notifications:", error)
    throw error
  }
}
