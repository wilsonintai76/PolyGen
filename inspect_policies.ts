
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odzvkxzgoibxxybcocbr.supabase.co';
const supabaseKey = 'sb_publishable_ks7bePDTzSrm4yxylWDh9A_oR9zPcmc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectPolicies() {
  console.log('Inspecting policies...');
  
  // This is a common Supabase query to list policies
  const { data, error } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'users');
  
  if (error) {
    console.error('Error inspecting policies:', error);
  } else {
    console.log('Policies:', JSON.stringify(data, null, 2));
  }
}

inspectPolicies();
