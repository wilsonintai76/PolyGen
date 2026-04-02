
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odzvkxzgoibxxybcocbr.supabase.co';
const supabaseKey = 'sb_publishable_ks7bePDTzSrm4yxylWDh9A_oR9zPcmc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertUser() {
  console.log('Inserting admin user...');
  
  const adminUser = {
    username: '1891',
    full_name: 'ADMIN 1891',
    role: 'Administrator',
    position: 'Head of IT'
  };

  const { data, error } = await supabase.from('users').insert([adminUser]).select();

  if (error) {
    console.error('Error inserting user:', JSON.stringify(error, null, 2));
  } else {
    console.log('Successfully inserted user:', data);
  }
}

insertUser();
