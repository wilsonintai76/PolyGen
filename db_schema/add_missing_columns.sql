
-- Add missing column to programmes table
ALTER TABLE programmes 
ADD COLUMN IF NOT EXISTS head_of_programme TEXT;

-- Verify RLS is still permissive
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON programmes;
CREATE POLICY "Allow all access" ON programmes FOR ALL USING (true) WITH CHECK (true);
