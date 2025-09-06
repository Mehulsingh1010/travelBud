#!/usr/bin/env node

/**
 * Demo script for TravelBuddy Notifications System
 * 
 * This script demonstrates how to create sample notifications
 * for testing and development purposes.
 * 
 * Usage:
 * 1. Make sure your database is running
 * 2. Update the database connection details if needed
 * 3. Run: node scripts/demo-notifications.js
 */

const { createNotification } = require('../lib/notifications');

// Sample user IDs (update these with actual user IDs from your database)
const SAMPLE_USER_ID = 1;
const SAMPLE_TRIP_ID = 1;
const SAMPLE_TRIP_NAME = "Mountain Hiking Adventure";

async function createSampleNotifications() {
  console.log('🚀 Creating sample notifications...\n');

  try {
    // 1. Trip Enrollment Notification
    console.log('📝 Creating trip enrollment notification...');
    await createNotification({
      userId: SAMPLE_USER_ID,
      type: 'trip_enrollment',
      title: 'Trip Enrollment',
      message: `You've been added to ${SAMPLE_TRIP_NAME}`,
      tripId: SAMPLE_TRIP_ID,
      tripName: SAMPLE_TRIP_NAME,
    });
    console.log('✅ Trip enrollment notification created\n');

    // 2. Trip Start Notification
    console.log('🚀 Creating trip start notification...');
    await createNotification({
      userId: SAMPLE_USER_ID,
      type: 'trip_start',
      title: 'Trip Started',
      message: `${SAMPLE_TRIP_NAME} has started! Check the live map`,
      tripId: SAMPLE_TRIP_ID,
      tripName: SAMPLE_TRIP_NAME,
    });
    console.log('✅ Trip start notification created\n');

    // 3. Trip Update Notification
    console.log('📢 Creating trip update notification...');
    await createNotification({
      userId: SAMPLE_USER_ID,
      type: 'trip_update',
      title: 'Trip Update',
      message: `New update in ${SAMPLE_TRIP_NAME}: Meeting time changed to 9:00 AM`,
      tripId: SAMPLE_TRIP_ID,
      tripName: SAMPLE_TRIP_NAME,
    });
    console.log('✅ Trip update notification created\n');

    // 4. Join Request Notification
    console.log('👤 Creating join request notification...');
    await createNotification({
      userId: SAMPLE_USER_ID,
      type: 'join_request',
      title: 'Join Request',
      message: 'John Doe wants to join your trip Mountain Hiking Adventure',
      tripId: SAMPLE_TRIP_ID,
      tripName: SAMPLE_TRIP_NAME,
      relatedUserId: 2, // Assuming user ID 2 is John Doe
    });
    console.log('✅ Join request notification created\n');

    // 5. Trip Complete Notification
    console.log('🏁 Creating trip complete notification...');
    await createNotification({
      userId: SAMPLE_USER_ID,
      type: 'trip_complete',
      title: 'Trip Completed',
      message: `${SAMPLE_TRIP_NAME} has been completed successfully`,
      tripId: SAMPLE_TRIP_ID,
      tripName: SAMPLE_TRIP_NAME,
    });
    console.log('✅ Trip complete notification created\n');

    console.log('🎉 All sample notifications created successfully!');
    console.log('\n📱 You can now view these notifications in the TravelBuddy app at:');
    console.log('   /dashboard/notifications');
    console.log('\n🔍 The notifications will show different types, icons, and styling');

  } catch (error) {
    console.error('❌ Error creating notifications:', error);
    process.exit(1);
  }
}

// Run the demo
if (require.main === module) {
  createSampleNotifications()
    .then(() => {
      console.log('\n✨ Demo completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Demo failed:', error);
      process.exit(1);
    });
}

module.exports = { createSampleNotifications };
