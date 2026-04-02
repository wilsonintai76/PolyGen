import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key] = value;
  return acc;
}, {} as Record<string, string>);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

async function check() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log(data, error);
}
check();
