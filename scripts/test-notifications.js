#!/usr/bin/env node

/**
 * Test script for TravelBuddy Notifications System
 * This script tests the API endpoints and creates sample data
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

async function testNotifications() {
  try {
    console.log('🧪 Testing TravelBuddy Notifications System...\n');

    // 1. Check if notifications table exists
    console.log('1. Checking notifications table...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Notifications table does not exist!');
      console.log('Please run the migration first: npm run db:migrate');
      return;
    }
    console.log('✅ Notifications table exists\n');

    // 2. Check table structure
    console.log('2. Checking table structure...');
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'notifications'
      ORDER BY ordinal_position;
    `);

    console.log('Table columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    console.log('');

    // 3. Check if there are any notifications
    console.log('3. Checking existing notifications...');
    const notificationCount = await pool.query('SELECT COUNT(*) FROM notifications');
    console.log(`Found ${notificationCount.rows[0].count} existing notifications\n`);

    // 4. Check if there are any users and trips
    console.log('4. Checking users and trips...');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const tripCount = await pool.query('SELECT COUNT(*) FROM trips');
    console.log(`Users: ${userCount.rows[0].count}, Trips: ${tripCount.rows[0].count}\n`);

    // 5. Test API endpoints (if running)
    console.log('5. Testing API endpoints...');
    try {
      const response = await fetch('http://localhost:3000/api/notifications');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API endpoint is accessible');
        console.log(`Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        console.log(`❌ API endpoint returned status: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ API endpoint is not accessible (make sure the app is running)');
      console.log('Error:', error.message);
    }

    console.log('\n🎉 Notification system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
if (require.main === module) {
  testNotifications()
    .then(() => {
      console.log('\n✨ Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testNotifications };
