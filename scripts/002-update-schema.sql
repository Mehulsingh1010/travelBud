-- Add new columns to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS start_date TIMESTAMP;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'planned';
ALTER TABLE trips ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 10;

-- Add admin role to trip_members
ALTER TABLE trip_members ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'member';
ALTER TABLE trip_members ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved';

-- Create join requests table
CREATE TABLE IF NOT EXISTS trip_join_requests (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    responded_by INTEGER REFERENCES users(id),
    UNIQUE(trip_id, user_id)
);

-- Create trip feedback table
CREATE TABLE IF NOT EXISTS trip_feedback (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trip_id, user_id)
);

-- Update existing trips to have proper status
UPDATE trips SET status = 'planned' WHERE status IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trip_join_requests_trip_id ON trip_join_requests(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_join_requests_status ON trip_join_requests(status);
CREATE INDEX IF NOT EXISTS idx_trip_feedback_trip_id ON trip_feedback(trip_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
