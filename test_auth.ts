
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'] || env['VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  const email = '1891@example.com';
  const password = 'password123'; // Use a strong password or the PIN if allowed

  console.log(`Attempting to sign up ${email}...`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    console.log(`Sign up error: ${signUpError.message}`);
    // If user already exists, try signing in
    console.log(`Attempting to sign in...`);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (signInError) {
      console.log(`Sign in error: ${signInError.message}`);
    } else {
      console.log(`Sign in success! User ID: ${signInData.user.id}`);
      return signInData.session;
    }
  } else {
    console.log(`Sign up success! User ID: ${signUpData.user?.id}`);
    return signUpData.session;
  }
}

testAuth();
