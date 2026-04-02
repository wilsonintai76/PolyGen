
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odzvkxzgoibxxybcocbr.supabase.co';
const supabaseKey = 'sb_publishable_ks7bePDTzSrm4yxylWDh9A_oR9zPcmc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectOtherTables() {
  console.log('Inspecting departments...');
  const { error: deptError } = await supabase.from('departments').select('*').limit(1);
  if (deptError) console.error('Error selecting from departments:', deptError);
  else console.log('departments table exists');

  console.log('Inspecting programmes...');
  const { error: progError } = await supabase.from('programmes').select('*').limit(1);
  if (progError) console.error('Error selecting from programmes:', progError);
  else console.log('programmes table exists');
}

inspectOtherTables();
