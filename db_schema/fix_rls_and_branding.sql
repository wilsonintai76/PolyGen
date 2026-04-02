
-- 1. Create institutional_branding table
CREATE TABLE IF NOT EXISTS institutional_branding (
    id SERIAL PRIMARY KEY,
    logo_url TEXT,
    institution_name TEXT DEFAULT 'POLITEKNIK MALAYSIA KUCHING SARAWAK',
    department_name TEXT DEFAULT 'JABATAN KEJURUTERAAN MEKANIKAL',
    primary_color TEXT DEFAULT '#2563eb',
    secondary_color TEXT DEFAULT '#1e40af',
    accent_color TEXT DEFAULT '#3b82f6'
);

-- Enable RLS on institutional_branding
ALTER TABLE institutional_branding ENABLE ROW LEVEL SECURITY;

-- Allow anon access to institutional_branding
CREATE POLICY "Allow anon select on institutional_branding" ON institutional_branding FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on institutional_branding" ON institutional_branding FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on institutional_branding" ON institutional_branding FOR UPDATE USING (true);

-- 2. Fix users table RLS
-- Enable RLS on users (if not already)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anon access to users (for Mock Auth setup)
CREATE POLICY "Allow anon select on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on users" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on users" ON users FOR DELETE USING (true);

-- 3. Fix departments table RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon select on departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on departments" ON departments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on departments" ON departments FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on departments" ON departments FOR DELETE USING (true);

-- 4. Fix programmes table RLS
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon select on programmes" ON programmes FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on programmes" ON programmes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on programmes" ON programmes FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on programmes" ON programmes FOR DELETE USING (true);

-- 5. Fix academic_sessions table RLS
CREATE TABLE IF NOT EXISTS academic_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE academic_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon select on academic_sessions" ON academic_sessions FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on academic_sessions" ON academic_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on academic_sessions" ON academic_sessions FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on academic_sessions" ON academic_sessions FOR DELETE USING (true);

-- 6. Insert initial branding if empty
INSERT INTO institutional_branding (id, institution_name)
SELECT 1, 'POLITEKNIK MALAYSIA KUCHING SARAWAK'
WHERE NOT EXISTS (SELECT 1 FROM institutional_branding WHERE id = 1);

-- 7. Insert initial admin user if empty
INSERT INTO users (username, full_name, role, position, department_id, programme_id)
SELECT '1891', 'ADMIN 1891', 'Administrator', 'Head of IT', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = '1891');
