
-- 1. Helper to enable RLS and set permissive policy
CREATE OR REPLACE FUNCTION enable_permissive_rls(table_name TEXT) 
RETURNS void AS $$
BEGIN
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all access" ON %I', table_name);
    EXECUTE format('CREATE POLICY "Allow all access" ON %I FOR ALL USING (true) WITH CHECK (true)', table_name);
END;
$$ LANGUAGE plpgsql;

-- 2. Ensure all tables exist and are permissive
-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Administrator', 'Creator', 'Reviewer', 'Endorser')),
    position TEXT NOT NULL,
    department_id UUID,
    programme_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
SELECT enable_permissive_rls('users');

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL
);
SELECT enable_permissive_rls('departments');

-- Programmes
CREATE TABLE IF NOT EXISTS programmes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id),
    head_of_programme TEXT
);
SELECT enable_permissive_rls('programmes');

-- Institutional Branding
CREATE TABLE IF NOT EXISTS institutional_branding (
    id INT PRIMARY KEY DEFAULT 1,
    institution_name TEXT DEFAULT 'POLITEKNIK MALAYSIA KUCHING SARAWAK',
    department_name TEXT,
    logo_url TEXT
);
SELECT enable_permissive_rls('institutional_branding');

-- Academic Sessions
CREATE TABLE IF NOT EXISTS academic_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false
);
SELECT enable_permissive_rls('academic_sessions');

-- Courses
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    department_id UUID REFERENCES departments(id),
    programme_id UUID REFERENCES programmes(id),
    assessment_policies JSONB,
    jsu_template JSONB,
    mqfs JSONB DEFAULT '{}'::jsonb,
    mqf_mappings JSONB DEFAULT '{}'::jsonb,
    syllabus TEXT
);
SELECT enable_permissive_rls('courses');

-- 3. Seed initial data
INSERT INTO institutional_branding (id, institution_name)
VALUES (1, 'POLITEKNIK MALAYSIA KUCHING SARAWAK')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (username, full_name, role, position)
SELECT '1891', 'ADMIN 1891', 'Administrator', 'Head of IT'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = '1891');
