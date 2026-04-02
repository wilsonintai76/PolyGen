
-- 1. Create the storage bucket for branding assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Branding Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Branding Allow Anon Upload" ON storage.objects;
DROP POLICY IF EXISTS "Branding Allow Anon Update" ON storage.objects;
DROP POLICY IF EXISTS "Branding Allow Anon Delete" ON storage.objects;

-- 3. Set up Row Level Security (RLS) for the storage bucket
-- Allow anyone to view the logo
CREATE POLICY "Branding Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'branding');

-- Allow authenticated users to upload/update/delete (or anon for this specific app setup)
CREATE POLICY "Branding Allow Anon Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'branding');

CREATE POLICY "Branding Allow Anon Update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'branding');

CREATE POLICY "Branding Allow Anon Delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'branding');
