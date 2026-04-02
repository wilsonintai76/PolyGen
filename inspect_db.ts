import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key] = val.join('=').replace(/['"]/g, '');
  return acc;
}, {} as Record<string, string>);

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('--- Checking topics table columns ---');
  const { data, error } = await supabase.from('topics').select('*').limit(1);
  if (error) {
    console.error('Error fetching from topics:', error.message);
  } else if (data && data.length > 0) {
    console.log('Columns found in topics:', Object.keys(data[0]));
  } else {
    console.log('Topics table is empty.');
  }
}
run();
