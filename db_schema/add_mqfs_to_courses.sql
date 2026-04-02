-- Run this in your Supabase SQL Editor to add the missing MQF columns to the courses table

ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS mqfs JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS mqf_mappings JSONB DEFAULT '{}'::jsonb;
