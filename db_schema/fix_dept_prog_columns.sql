-- Migration to fix the departments and programmes tables
-- This ensures the columns match what the frontend expects (name and code)

-- 1. Fix departments table
DO $$ 
BEGIN
    -- Rename department_name to name if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'department_name') THEN
        ALTER TABLE departments RENAME COLUMN department_name TO name;
    END IF;

    -- Rename abbr to code if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'abbr') THEN
        ALTER TABLE departments RENAME COLUMN abbr TO code;
    END IF;

    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'name') THEN
        ALTER TABLE departments ADD COLUMN name TEXT NOT NULL DEFAULT 'Unknown Department';
    END IF;

    -- Add code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'code') THEN
        ALTER TABLE departments ADD COLUMN code TEXT UNIQUE NOT NULL DEFAULT 'DEPT-' || uuid_generate_v4();
    END IF;
END $$;

-- 2. Fix programmes table
DO $$ 
BEGIN
    -- Rename programme_name to name if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programmes' AND column_name = 'programme_name') THEN
        ALTER TABLE programmes RENAME COLUMN programme_name TO name;
    END IF;

    -- Rename programme_code to code if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programmes' AND column_name = 'programme_code') THEN
        ALTER TABLE programmes RENAME COLUMN programme_code TO code;
    END IF;

    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programmes' AND column_name = 'name') THEN
        ALTER TABLE programmes ADD COLUMN name TEXT NOT NULL DEFAULT 'Unknown Programme';
    END IF;

    -- Add code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programmes' AND column_name = 'code') THEN
        ALTER TABLE programmes ADD COLUMN code TEXT UNIQUE NOT NULL DEFAULT 'PROG-' || uuid_generate_v4();
    END IF;
END $$;
