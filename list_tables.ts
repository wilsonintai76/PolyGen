import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').replace(/['"]/g, '');
  return acc;
}, {} as Record<string, string>);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || '';
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.rpc('get_tables');
  if (error) {
    console.error('Error fetching tables:', error);
    // Try another way
    const { data: tables, error: tablesError } = await supabase.from('pg_catalog.pg_tables').select('tablename').eq('schemaname', 'public');
    if (tablesError) {
      console.error('Error fetching tables from pg_catalog:', tablesError);
    } else {
      console.log('Tables in public schema:', tables.map(t => t.tablename));
    }
  } else {
    console.log('Tables:', data);
  }
}
run();
