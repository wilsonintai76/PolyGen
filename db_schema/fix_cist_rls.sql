
-- Helper to enable RLS and set permissive policy
CREATE OR REPLACE FUNCTION enable_permissive_rls(table_name TEXT) 
RETURNS void AS $$
BEGIN
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all access" ON %I', table_name);
    EXECUTE format('CREATE POLICY "Allow all access" ON %I FOR ALL USING (true) WITH CHECK (true)', table_name);
END;
$$ LANGUAGE plpgsql;

-- Enable RLS for CIST tables
SELECT enable_permissive_rls('learning_domains');
SELECT enable_permissive_rls('taxonomies');
SELECT enable_permissive_rls('item_types');
SELECT enable_permissive_rls('dublin_accords');
SELECT enable_permissive_rls('clos');
SELECT enable_permissive_rls('topics');
SELECT enable_permissive_rls('constructs');
SELECT enable_permissive_rls('cist_blueprints');
SELECT enable_permissive_rls('cist_rows');
SELECT enable_permissive_rls('cist_row_clos');
SELECT enable_permissive_rls('cist_row_item_types');
SELECT enable_permissive_rls('cist_row_taxonomies');
