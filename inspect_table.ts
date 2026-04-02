
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odzvkxzgoibxxybcocbr.supabase.co';
const supabaseKey = 'sb_publishable_ks7bePDTzSrm4yxylWDh9A_oR9zPcmc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
  console.log('Inspecting users table structure...');
  
  // Try to select 5 rows to see the columns returned
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(5);
  
  if (error) {
    console.error('Error inspecting table:', error);
  } else {
    console.log('Data:', JSON.stringify(data, null, 2));
  }
}

inspectTable();
