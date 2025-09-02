-- Add new columns to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS start_date TIMESTAMP;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'planned';
ALTER TABLE trips ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 10;
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15),
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS is_name_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_address_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS countryCode VARCHAR(10);

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

-- =========================================================
-- Trip expenses feature schema upgrade
-- =========================================================

-- Add base currency to trips if not already present
ALTER TABLE trips 
  ADD COLUMN IF NOT EXISTS base_currency VARCHAR(10) DEFAULT 'INR';

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount_original INTEGER NOT NULL,
  currency_original VARCHAR(10) NOT NULL,
  amount_converted INTEGER NOT NULL,
  base_currency VARCHAR(10) NOT NULL,
  expense_date TIMESTAMP NOT NULL,
  created_by INTEGER REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expense payers
CREATE TABLE IF NOT EXISTS expense_payers (
  id SERIAL PRIMARY KEY,
  expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  mode VARCHAR(20) NOT NULL DEFAULT 'absolute',
  share_value INTEGER
);

-- Expense splits
CREATE TABLE IF NOT EXISTS expense_splits (
  id SERIAL PRIMARY KEY,
  expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount_owed INTEGER NOT NULL,
  mode VARCHAR(20) NOT NULL DEFAULT 'equal',
  share_value INTEGER
);

-- Settlements
CREATE TABLE IF NOT EXISTS settlements (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  from_user_id INTEGER NOT NULL REFERENCES users(id),
  to_user_id INTEGER NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  currency VARCHAR(10) NOT NULL,
  note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expense comments
CREATE TABLE IF NOT EXISTS expense_comments (
  id SERIAL PRIMARY KEY,
  expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FX rates
CREATE TABLE IF NOT EXISTS fx_rates (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(100) NOT NULL,
  base VARCHAR(10) NOT NULL,
  rates JSONB NOT NULL,
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expense_payers_expense ON expense_payers(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_settlements_trip ON settlements(trip_id);
CREATE INDEX IF NOT EXISTS idx_expense_comments_expense ON expense_comments(expense_id);