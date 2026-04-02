
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odzvkxzgoibxxybcocbr.supabase.co';
const supabaseKey = 'sb_publishable_ks7bePDTzSrm4yxylWDh9A_oR9zPcmc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
  console.log('Listing all users...');
  
  const { data, error } = await supabase.from('users').select('*');
  
  if (error) {
    console.error('Error listing users:', error);
  } else {
    console.log('Users found:', JSON.stringify(data, null, 2));
  }
}

listUsers();
