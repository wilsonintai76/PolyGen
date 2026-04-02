import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
  return acc;
}, {} as Record<string, string>);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = [
    'academic_sessions',
    'courses',
    'questions',
    'assessment_papers',
    'departments',
    'programmes',
    'learning_domains',
    'taxonomies',
    'item_types',
    'dublin_accord_standards',
    'assessment_templates',
    'users'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table}: ERROR - ${error.message}`);
    } else {
      console.log(`Table ${table}: OK`);
    }
  }
}

checkTables();
