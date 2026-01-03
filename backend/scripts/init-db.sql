-- Mafqood Database Initialization Script
-- This runs automatically when the PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text similarity search
CREATE EXTENSION IF NOT EXISTS "cube";     -- For vector operations

-- Create indexes for performance (will be created by Alembic migrations)
-- These are here as documentation

-- Users table indexes
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Items table indexes  
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_user_id ON items(user_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_type ON items(type);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_category ON items(category);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_status ON items(status);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_created_at ON items(created_at);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_location ON items USING GIST(point(longitude, latitude));

-- Matches table indexes
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_user_item_id ON matches(user_item_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_matched_item_id ON matches(matched_item_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_status ON matches(status);

-- Notifications table indexes
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read ON notifications(is_read);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE mafqood TO mafqood;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Mafqood database initialized successfully';
END
$$;
