
-- 1. Safely rename roles to role if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'roles'
    ) THEN
        ALTER TABLE public.users RENAME COLUMN roles TO role;
    END IF;
END $$;

-- 2. Convert role to text if it's currently an array
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'role' 
        AND data_type = 'ARRAY'
    ) THEN
        ALTER TABLE public.users ALTER COLUMN role TYPE TEXT USING (role[1]);
    END IF;
END $$;

-- 3. Drop all existing role-related check constraints to avoid conflicts
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.users'::regclass 
        AND contype = 'c' 
        AND (conname LIKE '%role%' OR conname LIKE '%roles%')
    ) LOOP
        EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname) || ' CASCADE';
    END LOOP;
END $$;

-- 4. Clean up data: ensure all roles are valid before adding the constraint
UPDATE public.users 
SET role = 'Creator' 
WHERE role NOT IN ('Administrator', 'Creator', 'Reviewer', 'Endorser', 'Contributor') 
   OR role IS NULL;

-- 5. Add the new, expanded check constraint
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('Administrator', 'Creator', 'Reviewer', 'Endorser', 'Contributor'));
