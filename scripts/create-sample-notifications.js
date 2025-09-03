#!/usr/bin/env node

/**
 * Create sample notifications for testing the notifications system
 * Run this script to populate your database with test data
 */

const { Pool } = require('pg');

// Database configuration - update these values
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'travelbud',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const sampleNotifications = [
  {
    user_id: 1, // Update this with an actual user ID from your database
    type: 'trip_enrollment',
    title: 'Trip Enrollment',
    message: 'You\'ve been added to Mountain Hiking Adventure',
    trip_id: 1, // Update this with an actual trip ID
    trip_name: 'Mountain Hiking Adventure',
    is_read: false,
  },
  {
    user_id: 1,
    type: 'trip_start',
    title: 'Trip Started',
    message: 'Mountain Hiking Adventure has started! Check the live map',
    trip_id: 1,
    trip_name: 'Mountain Hiking Adventure',
    is_read: false,
  },
  {
    user_id: 1,
    type: 'trip_update',
    title: 'Trip Update',
    message: 'New update in Mountain Hiking Adventure: Meeting time changed to 9:00 AM',
    trip_id: 1,
    trip_name: 'Mountain Hiking Adventure',
    is_read: false,
  },
  {
    user_id: 1,
    type: 'join_request',
    title: 'Join Request',
    message: 'John Doe wants to join your trip Mountain Hiking Adventure',
    trip_id: 1,
    trip_name: 'Mountain Hiking Adventure',
    related_user_id: 2, // Update this with an actual user ID
    is_read: false,
  },
  {
    user_id: 1,
    type: 'trip_complete',
    title: 'Trip Completed',
    message: 'Mountain Hiking Adventure has been completed successfully',
    trip_id: 1,
    trip_name: 'Mountain Hiking Adventure',
    is_read: false,
  }
];

async function createSampleNotifications() {
  try {
    console.log('🚀 Creating sample notifications...\n');

    // First, check if the notifications table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Notifications table does not exist. Please run the migration first.');
      console.log('Run: npm run db:migrate or check your database setup.');
      process.exit(1);
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [1]);
    if (userCheck.rows.length === 0) {
      console.log('❌ User with ID 1 does not exist. Please update the script with a valid user ID.');
      process.exit(1);
    }

    // Check if trip exists
    const tripCheck = await pool.query('SELECT id FROM trips WHERE id = $1', [1]);
    if (tripCheck.rows.length === 0) {
      console.log('❌ Trip with ID 1 does not exist. Please update the script with a valid trip ID.');
      process.exit(1);
    }

    // Insert sample notifications
    for (const notification of sampleNotifications) {
      const result = await pool.query(`
        INSERT INTO notifications (user_id, type, title, message, trip_id, trip_name, related_user_id, is_read, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING id
      `, [
        notification.user_id,
        notification.type,
        notification.title,
        notification.message,
        notification.trip_id,
        notification.trip_name,
        notification.related_user_id || null,
        notification.is_read
      ]);

      console.log(`✅ Created notification: ${notification.title} (ID: ${result.rows[0].id})`);
    }

    console.log('\n🎉 All sample notifications created successfully!');
    console.log('\n📱 You can now view these notifications in the TravelBuddy app at:');
    console.log('   /dashboard/notifications');

  } catch (error) {
    console.error('❌ Error creating notifications:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  createSampleNotifications()
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createSampleNotifications };
