-- Run this in your Supabase SQL Editor to optimize the courses table
-- This converts the assessment_policies column to JSONB for better performance

-- 1. Convert assessment_policies to JSONB (if it's still TEXT)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'assessment_policies' 
        AND data_type = 'text'
    ) THEN
        ALTER TABLE public.courses 
        ALTER COLUMN assessment_policies TYPE JSONB USING assessment_policies::JSONB;
        
        RAISE NOTICE 'Converted assessment_policies to JSONB';
    END IF;
END $$;

-- 2. Ensure other JSONB columns exist with correct defaults
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS mqfs JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS mqf_mappings JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS jsu_template JSONB DEFAULT '[]'::jsonb;
