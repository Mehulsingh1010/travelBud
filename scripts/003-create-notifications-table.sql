-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    trip_name VARCHAR(255),
    related_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_trip_id ON notifications(trip_id);

-- Add comments for documentation
COMMENT ON TABLE notifications IS 'Stores user notifications for trip events and updates';
COMMENT ON COLUMN notifications.type IS 'Type of notification: trip_enrollment, trip_start, trip_update, trip_complete, join_request';
COMMENT ON COLUMN notifications.trip_id IS 'Reference to the trip this notification is about';
COMMENT ON COLUMN notifications.trip_name IS 'Name of the trip for display purposes';
COMMENT ON COLUMN notifications.related_user_id IS 'Reference to another user involved in this notification';
COMMENT ON COLUMN notifications.is_read IS 'Whether the user has read this notification';
