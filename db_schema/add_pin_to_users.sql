
-- Ensure uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Migration to add pin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin TEXT;

-- Update existing users with a default pin if needed (optional)
-- UPDATE users SET pin = '123456' WHERE pin IS NULL;
