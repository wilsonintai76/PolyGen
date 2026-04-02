
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odzvkxzgoibxxybcocbr.supabase.co';
const supabaseKey = 'sb_publishable_ks7bePDTzSrm4yxylWDh9A_oR9zPcmc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectUsersTable() {
  console.log('Inspecting users table...');
  
  // Try to select from users to check read access
  const { data, error } = await supabase.from('users').select('*').limit(1);
  
  if (error) {
    console.error('Error selecting from users:', error);
  } else {
    console.log('Successfully selected from users. Count:', data?.length);
  }

  // Try to insert a dummy user to check write access
  const dummyUser = {
    username: 'test_insert_' + Date.now(),
    full_name: 'Test Insert',
    role: 'Creator',
    position: 'Lecturer'
  };

  const { data: insertData, error: insertError } = await supabase.from('users').insert([dummyUser]).select();

  if (insertError) {
    console.error('Error inserting into users:', insertError);
  } else {
    console.log('Successfully inserted into users:', insertData);
    // Cleanup
    await supabase.from('users').delete().eq('username', dummyUser.username);
  }
}

inspectUsersTable();
