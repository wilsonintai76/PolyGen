
-- 1. Ensure tables exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Administrator', 'Creator', 'Reviewer', 'Endorser')),
    position TEXT NOT NULL,
    department_id UUID,
    programme_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT username_domain_check CHECK (username LIKE '%@poliku.edu.my')
);

-- 2. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow all access" ON users;

-- 4. Create permissive policy for testing
CREATE POLICY "Allow all access" ON users FOR ALL USING (true) WITH CHECK (true);

-- 5. Seed admin user
INSERT INTO users (username, full_name, role, position)
SELECT '1891', 'ADMIN 1891', 'Administrator', 'Head of IT'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = '1891');
